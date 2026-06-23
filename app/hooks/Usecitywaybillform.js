// app/hooks/useCityWaybillForm.js
import { useState } from 'react'

export function useCityWaybillForm(initialData = null, isEditMode = false) {
    // ⭐ Section 1: cargoBase
    const [cargoBase, setCargoBase] = useState(initialData?.cargoBase || {
        date: '',
        waybillNumber: '',
        serialNumber: '',
        statusConfirm: '',
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
        truckName: '',
        driverId: null,
        driverSmartCard: '',
        driverNationalCode: '',
        driverFirstName: '',
        driverLastName: '',
        driverFatherName: '',
        driverMobile: '',
        driverLicenseNumber: '',
        driverLicenseIssuePlace: ''
    })

    // ⭐ Section 2: cargoDetails
    const [cargoDetails, setCargoDetails] = useState(initialData?.cargoDetails || {
        cargoType: null,
        cargoDescription: '',
        packaging: '',
        quantity: '',
        originWeight: '',
        destinationWeight: '',
        weightDifference: '',
        allowableDeficit: '',
        ratePerKg: '',
        deficitAmount: '',
        cargoValue: '',
        exitNumber: '',
        origin: null,
        destination: null,
        loadedDistance: '',
        emptyDistance: ''
    })

    // ⭐ Section 3: financialIncome
    const [financialIncome, setFinancialIncome] = useState(initialData?.financialIncome || {
        baseFare: '',
        advanceFare: '',
        remainingFare: '',
        paidFare: '',
        fareType: '',
        commissionRate: '',
        commission: '',
        cargoInsurance: '',
        valueAdded: '',
        receivedCommission: '',
        waybillExcess: ''
    })

    // ⭐ Section 4: financialExpense
    const [financialExpense, setFinancialExpense] = useState(initialData?.financialExpense || {
        loadingCost: '',
        weighingFee: '',
        queueCost: '',
        maintenanceCost: '',
        fuelCost: '',
        excessFuelCost: '',
        taxiCost: '',
        phoneCost: '',
        parkingCost: '',
        inspectionCost: '',
        expenseCommission: '',
        highwayToll: '',
        waybillFee: '',
        sleepingFee: '',
        tonKm: '',
        miscExpense1Title: '',
        miscExpense1Amount: '',
        miscExpense2Title: '',
        miscExpense2Amount: '',
        miscExpense3Title: '',
        miscExpense3Amount: '',
        totalExpenses: '',
        tripBonus: ''
    })

    // ⭐ Section 5: accountInfo
    const [accountInfo, setAccountInfo] = useState(initialData?.accountInfo || {
        iban: '',
        bankName: '',
        accountOwner: '',
        statementNumber: '',
        statementAmount: '',
        totalAccount: ''
    })

    // ⭐ Update functions
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

    const updateAccountInfo = (field, value) => {
        setAccountInfo(prev => ({ ...prev, [field]: value }))
    }

    // ⭐ Return all states and setters
    return {
        cargoBase,
        setCargoBase,
        updateCargoBase,

        cargoDetails,
        setCargoDetails,
        updateCargoDetails,

        financialIncome,
        setFinancialIncome,
        updateFinancialIncome,

        financialExpense,
        setFinancialExpense,
        updateFinancialExpense,

        accountInfo,
        setAccountInfo,
        updateAccountInfo
    }
}