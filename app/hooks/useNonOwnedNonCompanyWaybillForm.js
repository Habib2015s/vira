// app/hooks/useNonOwnedNonCompanyWaybillForm.js
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export const useNonOwnedNonCompanyWaybillForm = (initialData = null, isEditMode = false) => {
    const router = useRouter()

    // Section 1: اطلاعات پایه
    const [cargoBase, setCargoBase] = useState(
        initialData?.cargoBase || {
            date: '',
            waybillNumber: '',
            serialNumber: '',
            statusConfirm: 'ثبت راهبری',
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
            driverId: null
        }
    )

    // Section 2: جزئیات محموله
    const [cargoDetails, setCargoDetails] = useState(
        initialData?.cargoDetails || {
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
        }
    )

    // Section 3: درآمدها
    const [financialIncome, setFinancialIncome] = useState(
        initialData?.financialIncome || {
            payablePrice: '',
            priceAdvance: '',
            priceRemaining: '',
            outPriceAdvance: '',
            cargoTypeRevenue: 'کرایه در مبدا',
            penalty: '',
            driverPayment: '',
            commissionScale: '12.50',
            commission: '',
            insurance: '',
            addedValue: '',
            commissionReceipt: '',
            waybillCommission: ''
        }
    )

    // Section 4: اطلاعات حساب
    const [accountInfo, setAccountInfo] = useState(
        initialData?.accountInfo || {
            shabaNumber: '',
            bankName: null,
            accountHolder: ''
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

    const updateAccountInfo = (field, value) => {
        setAccountInfo(prev => ({ ...prev, [field]: value }))
    }

    return {
        // States
        cargoBase,
        cargoDetails,
        financialIncome,
        accountInfo,

        // ⭐ Setters (این‌ها اضافه شدن!)
        setCargoBase,
        setCargoDetails,
        setFinancialIncome,
        setAccountInfo,

        // Update Functions
        updateCargoBase,
        updateCargoDetails,
        updateFinancialIncome,
        updateAccountInfo,

        // Router
        router
    }
}