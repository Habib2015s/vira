import { useState } from 'react'
import { useRouter } from 'next/navigation'

export const useNonCompanyWaybillForm = () => {
    const router = useRouter()

    // Section 1: اطلاعات پایه (Basic Info)
    const [cargoBase, setCargoBase] = useState({
        date: '',
        waybillNumber: '',
        serialNumber: '',
        refineryWaybillNumber: '',
        sender: null,
        senderTitle: '',
        senderAddress: '',
        receiver: null,
        receiverTitle: '',
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
        firstDriverNationalId: '',
        firstDriverName: '',
        firstDriverLastName: '',
        fatherName: '',
        mobile: '',
        certificateNumber: '',
        certificateIssuePlace: null
    })

    // Section 2: جزئیات محموله (Cargo Details)
    const [cargoDetails, setCargoDetails] = useState({
        cargoType: null,
        cargoDescription: '',
        packaging: null,
        count: '',
        originWeight: '',
        destinationWeight: '',
        weightDiff: '',
        permitWeightScale: '',
        permitValueScale: '',
        permitNumber: '',
        realCargoValue: '',
        exitNumber: '',
        origin: null,
        destination: null,
        fullDistance: '',
        emptyDistance: ''
    })

    // Section 3: درآمدها (Financial Income)
    const [financialIncome, setFinancialIncome] = useState({
        payablePrice: '',
        priceAdvance: '',
        priceRemaining: '',
        outPriceAdvance: '',
        cargoTypeRevenue: 'کرایه در مبدا',
        commission: '',
        insurance: '',
        addedValue: '',
        commissionReceipt: '',
        waybillCommission: ''
    })

    // Section 4: هزینه‌ها (Financial Expense)
    const [financialExpense, setFinancialExpense] = useState({
        loadingFee: '',
        scalesFee: '',
        queueFee: '',
        periodicRepairFee: '',
        fuelFee: '',
        excessFuelFee: '',
        taxiFee: '',
        phoneFee: '',
        parkingFee: '',
        inspectionFee: '',
        commissionFee: '',
        tollFee: '',
        waybillFee: '',
        sleepFee: '',
        tonKilometer: '',
        miscExpense1Title: '',
        miscExpense1Amount: '',
        miscExpense2Title: '',
        miscExpense2Amount: '',
        miscExpense3Title: '',
        miscExpense3Amount: '',
        totalExpenses: '',
        tripBonus: '',
        shabaNumber: '',
        bankName: null,
        accountHolder: '',
        invoiceNumber: '',
        invoiceAmount: '',
        totalInvoice: ''
    })

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

    return {
        // States
        cargoBase,
        cargoDetails,
        financialIncome,
        financialExpense,

        // ⭐ Setters (این‌ها اضافه شدن!)
        setCargoBase,
        setCargoDetails,
        setFinancialIncome,
        setFinancialExpense,

        // Update Functions
        updateCargoBase,
        updateCargoDetails,
        updateFinancialIncome,
        updateFinancialExpense,

        // Router
        router
    }
}