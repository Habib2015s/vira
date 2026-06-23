import { useState } from 'react'
import { useRouter } from 'next/navigation'

export const useNonOwnedCompanyWaybillForm = () => {
    const router = useRouter()

    // Section 1: اطلاعات پایه (Basic Info)
    const [cargoBase, setCargoBase] = useState({
        date: '',
        waybillNumber: '',
        serialNumber: '',
        statusConfirm: 'ثبت و تایید راهبری',
        sender: null,
        senderTitle: '',
        senderAddress: '',
        receiver: null,
        receiverTitle: '',
        receiverEconomicCode: '',
        receiverNationalCode: '',
        receiverPostalCode: '',
        receiverAddress: '',
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
        companyCommission: '',
        penalty: '',
        driverPayment: '',
        commissionScale: '17.50',
        commission: '',
        insurance: '',
        addedValue: '',
        commissionReceipt: '',
        waybillCommission: ''
    })

    // Section 4: اطلاعات حساب (Account Info)
    const [accountInfo, setAccountInfo] = useState({
        shabaNumber: '',
        bankName: null,
        accountHolder: ''
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