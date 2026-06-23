import { useState } from 'react'
import { useRouter } from 'next/navigation'

export const useWaybillForm = (initialData = null, isEditMode = false) => {
    const router = useRouter()

    // Section 1: اطلاعات پایه (Basic Info)
    const [cargoBase, setCargoBase] = useState(
        initialData?.cargo_base || {
            date: '',
            waybillNumber: '',
            waybillCompany: '',
            serialNumber: '',
            statusConfirm: '',
            sender: null,
            senderTitle: '',
            senderAddress: '',
            receiver: null,
            receiverEconomicCode: '',
            receiverNationalCode: '',
            receiverPostalCode: '',
            receiverAddress: '',
            expenseCost: null,
            machineSmartCard: '',
            plate: '',
            driverType: null,
            driverName: '',
            driverId: null,
            firstDriverCard: '',
            firstDriverName: '',
            firstDriverNationalId: '',
            fatherName: '',
            mobile: '',
            certificateNumber: '',
            certificateIssuePlace: null
        }
    )

    // Section 2: جزئیات محموله (Cargo Details)
    const [cargoDetails, setCargoDetails] = useState(
        initialData?.cargo_details || {
            cargoType: null,
            cargoDescription: '',
            packaging: null,
            count: '',
            originWeight: '',
            destinationWeight: '',
            permitNumber: '',
            realCargoValue: '',
            exitNumber: '',
            weightDiff: '',
            permitWeightScale: '',
            permitValueScale: '',
            origin: null,
            destination: null,
            outOrigin: '',
            outDestination: ''
        }
    )

    // Section 3: درآمدها (Financial Income)
    const [financialIncome, setFinancialIncome] = useState(
        initialData?.financial_income || {
            payablePrice: '',
            priceAdvance: '',
            outPriceAdvance: '',
            cargoTypeRevenue: '',
            commissionScale: '12.50',
            insurance: '',
            cargo: '',
            addedValue: '',
            commissionReceipt: '',
            waybillCommission: ''
        }
    )

    // Section 4: هزینه‌ها (Financial Expense)
    const [financialExpense, setFinancialExpense] = useState(
        initialData?.financial_expense || {
            servicesFee: '',
            oilFee: '',
            repairFee: '',
            periodicRepairFee: '',
            fuelFee: '',
            excessFuelFee: '',
            phoneFee: '',
            loadingFee: '',
            inspectionFee: '',
            commission: '',
            tollFee: '',
            waybillFee: '',
            sleepFee: '',
            miscExpense1Title: '',
            miscExpense1Amount: '',
            miscExpense2Title: '',
            miscExpense2Amount: '',
            miscExpense3Title: '',
            miscExpense3Amount: '',
            totalExpenses: '',
            tripNote: '',
            shabaNumber: '',
            bankName: null,
            accountHolder: '',
            invoiceNumber: '',
            invoiceAmount: '',
            totalInvoice: ''
        }
    )

    // Update Functions
    const updateCargoBase = (field, value) => {
        setCargoBase(prev => ({ ...prev, [field]: value }))
    }

    const updateCargoDetails = (field, value) => {
        setCargoDetails(prev => ({ ...prev, [field]: value }))
    }

    const updateFinancialIncome = (field, value) => {
        setFinancialIncome(prev => ({ ...prev, [field]: value }))
    }

    const updateFinancialExpense = (field, value) => {
        setFinancialExpense(prev => ({ ...prev, [field]: value }))
    }

    // Submit Handler
    const handleSubmit = (e) => {
        e.preventDefault()

        const waybillData = {
            cargo_base: cargoBase,
            cargo_details: cargoDetails,
            financial_income: financialIncome,
            financial_expense: financialExpense
        }

        console.log('=== JSON برای ارسال به بک‌اند ===')
        console.log(JSON.stringify(waybillData, null, 2))

        const message = isEditMode
            ? 'بارنامه با موفقیت ویرایش شد!\nداده‌ها در Console لاگ شد'
            : 'بارنامه با موفقیت ثبت شد!\nداده‌ها در Console لاگ شد'

        alert(message)

        // ارسال به بک‌اند
        const endpoint = isEditMode
            ? `/api/waybills/${cargoBase.waybillNumber}`
            : '/api/waybills'

        const method = isEditMode ? 'PUT' : 'POST'

        // fetch(endpoint, {
        //     method: method,
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(waybillData)
        // }).then(res => res.json()).then(data => {
        //     console.log('Response:', data)
        //     router.push('/waybills')
        // })

        router.push('/waybills')
    }

    return {
        // States
        cargoBase,
        cargoDetails,
        financialIncome,
        financialExpense,

        // Update Functions
        updateCargoBase,
        updateCargoDetails,
        updateFinancialIncome,
        updateFinancialExpense,

        // Handlers
        handleSubmit,
        router,
        isEditMode
    }
}