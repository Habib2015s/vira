// app/api/waybills/[id]/route.js
import { NextResponse } from 'next/server'

const BASE         = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://viratest2.ir'
const WAYBILLS_URL = `${BASE}/api/v1/waybills`


// ── تبدیل {id, name} → {value, label} ──
const mapField = (val) => {
    if (val && typeof val === 'object' && 'id' in val && 'name' in val)
        return { value: val.id, label: val.name }
    return val ?? ''
}
const mapSection = (obj) => {
    if (!obj || typeof obj !== 'object') return {}
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, mapField(v)]))
}

// ── GET /api/waybills/[id] ──────────────────────────────
export async function GET(request, { params }) {
    const { id } = await params   // در Next 15 باید await بشه
    const externalUrl = `${WAYBILLS_URL}/${id}`

    console.log(`[waybills/${id}] → GET ${externalUrl}`)

    let res, text, result
    try {
        res  = await fetch(externalUrl, { headers: HEADERS })
        text = await res.text()   // اول text بگیر تا اگه JSON نبود کرش نکنه
    } catch (fetchErr) {
        console.error(`[waybills/${id}] fetch failed:`, fetchErr.message)
        return NextResponse.json(
            { error: `اتصال به سرور ممکن نیست: ${fetchErr.message}` },
            { status: 503 }
        )
    }

    // parse JSON
    try {
        result = JSON.parse(text)
    } catch {
        console.error(`[waybills/${id}] invalid JSON from external API:`, text.slice(0, 200))
        return NextResponse.json(
            { error: 'پاسخ نامعتبر از سرور خارجی', raw: text.slice(0, 200) },
            { status: 502 }
        )
    }

    if (!res.ok) {
        console.error(`[waybills/${id}] external API ${res.status}:`, result)
        return NextResponse.json(
            { error: result?.message || `خطا ${res.status} از سرور` },
            { status: res.status }
        )
    }

    console.log(`[waybills/${id}] external API ok, keys:`, Object.keys(result))

    // ── ساختار response را تشخیص بده ──
    const raw = result?.data?.waybill || result?.data || result

    // اگه API sections داده
    if (raw?.cargo_base || raw?.cargoBase) {
        return NextResponse.json({
            cargoBase:        mapSection(raw.cargoBase        || raw.cargo_base        || {}),
            cargoDetails:     mapSection(raw.cargoDetails     || raw.cargo_details     || {}),
            financialIncome:  mapSection(raw.financialIncome  || raw.financial_income  || {}),
            financialExpense: mapSection(raw.financialExpense || raw.financial_expense || {}),
            accountInfo:      mapSection(raw.accountInfo      || raw.account_info      || {}),
        })
    }

    // اگه API flat داد
    return NextResponse.json({
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
            expenseCost:           raw.expenseCost        || (raw.expenseCostId  ? { id: raw.expenseCostId,  name: raw.expenseCostName  } : null),
            machineSmartCard:      raw.machineSmartCard,
            plate:                 raw.plate,
            driverType:            raw.driverType         || (raw.driverTypeId  ? { id: raw.driverTypeId,  name: raw.driverTypeName  } : null),
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
    })
}

// ── PUT /api/waybills/[id] ──────────────────────────────
export async function PUT(request, { params }) {
    const { id } = await params
    const externalUrl = `${WAYBILLS_URL}/${id}`

    let body
    try { body = await request.json() }
    catch { return NextResponse.json({ error: 'بدنه درخواست نامعتبر' }, { status: 400 }) }

    // flat کردن sections
    const payload = {}
    const sections = ['cargoBase', 'cargoDetails', 'financialIncome', 'financialExpense', 'accountInfo']
    sections.forEach(section => {
        if (body[section] && typeof body[section] === 'object') {
            Object.entries(body[section]).forEach(([key, val]) => {
                if (val && typeof val === 'object' && 'value' in val)
                    payload[key] = val.value
                else if (val !== '' && val !== null && val !== undefined)
                    payload[key] = val
            })
        }
    })

    let res, text, result
    try {
        res  = await fetch(externalUrl, { method: 'PUT', headers: HEADERS, body: JSON.stringify(payload) })
        text = await res.text()
    } catch (fetchErr) {
        return NextResponse.json({ error: `اتصال ناموفق: ${fetchErr.message}` }, { status: 503 })
    }

    try { result = JSON.parse(text) }
    catch { return NextResponse.json({ error: 'پاسخ نامعتبر از سرور' }, { status: 502 }) }

    if (!res.ok)
        return NextResponse.json({ error: result?.message || 'خطا در ویرایش' }, { status: res.status })

    return NextResponse.json(result)
}