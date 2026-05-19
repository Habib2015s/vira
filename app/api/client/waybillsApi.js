// app/api/client/waybillsApi.js
// مستقیم از مرورگر به API خارجی — مثل shopsApi.js
import { ENV, getHeaders } from '@/app/config/env'

const BASE    = ENV.API_WAYBILLS
// headers از getHeaders() میاد

const req = (url, options = {}) =>
    fetch(url, { headers: getHeaders(), ...options })
        .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })

// ── تبدیل {id, name} → {value, label} برای react-select ──
const mapField = (val) => {
    if (val && typeof val === 'object' && 'id' in val && 'name' in val)
        return { value: val.id, label: val.name }
    return val ?? ''
}
const mapSection = (obj) => {
    if (!obj || typeof obj !== 'object') return {}
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, mapField(v)]))
}

// ── تبدیل response API به ساختار sections (camelCase) ──
export const parseWaybillResponse = (result) => {
    const raw = result?.data?.waybill || result?.data || result

    // اگه API sections داده
    if (raw?.cargo_base || raw?.cargoBase) {
        return {
            cargoBase:        mapSection(raw.cargoBase        || raw.cargo_base        || {}),
            cargoDetails:     mapSection(raw.cargoDetails     || raw.cargo_details     || {}),
            financialIncome:  mapSection(raw.financialIncome  || raw.financial_income  || {}),
            financialExpense: mapSection(raw.financialExpense || raw.financial_expense || {}),
            accountInfo:      mapSection(raw.accountInfo      || raw.account_info      || {}),
        }
    }

    // اگه API flat داد
    return {
        cargoBase: mapSection({
            date:                  raw.date               || raw.issueDate,
            waybillNumber:         raw.waybillNumber      || raw.bolNr  || raw.id,
            waybillCompany:        raw.waybillCompany,
            serialNumber:          raw.serialNumber,
            statusConfirm:         raw.statusConfirm      || raw.status,
            sender:                raw.sender             || (raw.senderId   ? { id: raw.senderId,   name: raw.senderName   } : null),
            senderTitle:           raw.senderTitle,
            senderAddress:         raw.senderAddress,
            receiver:              raw.receiver           || (raw.receiverId ? { id: raw.receiverId, name: raw.receiverName } : null),
            receiverEconomicCode:  raw.receiverEconomicCode,
            receiverNationalCode:  raw.receiverNationalCode,
            receiverPostalCode:    raw.receiverPostalCode,
            receiverAddress:       raw.receiverAddress,
            expenseCost:           raw.expenseCost        || (raw.expenseCostId   ? { id: raw.expenseCostId,   name: raw.expenseCostName   } : null),
            machineSmartCard:      raw.machineSmartCard,
            plate:                 raw.plate,
            driverType:            raw.driverType         || (raw.driverTypeId   ? { id: raw.driverTypeId,   name: raw.driverTypeName   } : null),
            driverName:            raw.driverName,
            driverId:              raw.driverId           || (raw.driverPersonId ? { id: raw.driverPersonId, name: raw.driverPersonName } : null),
            firstDriverCard:       raw.firstDriverCard,
            firstDriverName:       raw.firstDriverName,
            firstDriverNationalId: raw.firstDriverNationalId,
            fatherName:            raw.fatherName,
            mobile:                raw.mobile,
            certificateNumber:     raw.certificateNumber,
            certificateIssuePlace: raw.certificateIssuePlace || (raw.certificateIssuePlaceId ? { id: raw.certificateIssuePlaceId, name: raw.certificateIssuePlaceName } : null),
        }),
        cargoDetails: mapSection({
            cargoType:         raw.cargoType         || (raw.cargoTypeId   ? { id: raw.cargoTypeId,   name: raw.cargoTypeName   } : null),
            cargoDescription:  raw.cargoDescription,
            packaging:         raw.packaging         || (raw.packagingId   ? { id: raw.packagingId,   name: raw.packagingName   } : null),
            count:             raw.count,
            originWeight:      raw.originWeight,
            destinationWeight: raw.destinationWeight,
            permitNumber:      raw.permitNumber,
            realCargoValue:    raw.realCargoValue,
            exitNumber:        raw.exitNumber,
            weightDiff:        raw.weightDiff,
            origin:            raw.origin            || (raw.originId      ? { id: raw.originId,      name: raw.originName      } : null),
            destination:       raw.destination       || (raw.destinationId ? { id: raw.destinationId, name: raw.destinationName } : null),
            outOrigin:         raw.outOrigin,
            outDestination:    raw.outDestination,
        }),
        financialIncome: mapSection({
            payablePrice:      raw.payablePrice,
            priceAdvance:      raw.priceAdvance,
            outPriceAdvance:   raw.outPriceAdvance,
            cargoTypeRevenue:  raw.cargoTypeRevenue,
            commissionScale:   raw.commissionScale,
            insurance:         raw.insurance,
            cargo:             raw.cargo,
            addedValue:        raw.addedValue,
            commissionReceipt: raw.commissionReceipt,
            waybillCommission: raw.waybillCommission,
        }),
        financialExpense: mapSection({
            servicesFee:        raw.servicesFee,
            oilFee:             raw.oilFee,
            repairFee:          raw.repairFee,
            periodicRepairFee:  raw.periodicRepairFee,
            fuelFee:            raw.fuelFee,
            excessFuelFee:      raw.excessFuelFee,
            phoneFee:           raw.phoneFee,
            loadingFee:         raw.loadingFee,
            inspectionFee:      raw.inspectionFee,
            commission:         raw.commission,
            tollFee:            raw.tollFee,
            waybillFee:         raw.waybillFee,
            sleepFee:           raw.sleepFee,
            miscExpense1Title:  raw.miscExpense1Title,
            miscExpense1Amount: raw.miscExpense1Amount,
            miscExpense2Title:  raw.miscExpense2Title,
            miscExpense2Amount: raw.miscExpense2Amount,
            miscExpense3Title:  raw.miscExpense3Title,
            miscExpense3Amount: raw.miscExpense3Amount,
            totalExpenses:      raw.totalExpenses,
            tripNote:           raw.tripNote,
            shabaNumber:        raw.shabaNumber,
            bankName:           raw.bankName || (raw.bankId ? { id: raw.bankId, name: raw.bankNameText } : null),
            accountHolder:      raw.accountHolder,
            invoiceNumber:      raw.invoiceNumber,
            invoiceAmount:      raw.invoiceAmount,
            totalInvoice:       raw.totalInvoice,
        }),
        accountInfo: mapSection({
            shabaNumber:   raw.shabaNumber,
            bankName:      raw.bankName,
            accountHolder: raw.accountHolder,
            invoiceNumber: raw.invoiceNumber,
            invoiceAmount: raw.invoiceAmount,
            totalInvoice:  raw.totalInvoice,
        }),
    }
}

// ── flat کردن sections برای ارسال به API ──
const flattenSections = (sections) => {
    const payload = {}
    const sectionKeys = ['cargoBase', 'cargoDetails', 'financialIncome', 'financialExpense', 'accountInfo']
    sectionKeys.forEach(section => {
        if (sections[section] && typeof sections[section] === 'object') {
            Object.entries(sections[section]).forEach(([key, val]) => {
                if (val && typeof val === 'object' && 'value' in val)
                    payload[key] = val.value   // react-select → id
                else if (val !== '' && val !== null && val !== undefined)
                    payload[key] = val
            })
        }
    })
    return payload
}

export const waybillsApi = {
    // دریافت یک بارنامه + تبدیل به sections
    getOne: async (id) => {
        const result = await req(`${BASE}/${id}`)
        return parseWaybillResponse(result)
    },

    // ثبت بارنامه جدید
    create: (sectionsData) =>
        req(BASE, { method: 'POST', body: JSON.stringify(flattenSections(sectionsData)) }),

    // ویرایش بارنامه
    update: (id, sectionsData) =>
        req(`${BASE}/${id}`, { method: 'PUT', body: JSON.stringify(flattenSections(sectionsData)) }),

    // حذف
    remove: (id) => req(`${BASE}/${id}`, { method: 'DELETE' }),
}