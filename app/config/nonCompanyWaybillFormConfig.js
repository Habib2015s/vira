// app/config/nonCompanyWaybillFormConfig.js
// کانفیگ فرم ملکی-غیرشرکتی

import {
    faInfoCircle, faPaperPlane, faBoxOpen, faTruck, faUser,
    faBoxes, faRoute, faMoneyBillWave, faReceipt, faFileInvoice, faPaperclip
} from '@fortawesome/free-solid-svg-icons'

export const nonCompanyWaybillFormConfig = {
    tabs: [
        { id: 'basic', label: 'اطلاعات اولیه', icon: faInfoCircle, required: true, section: 'cargoBase' },
        { id: 'sender', label: 'فرستنده', icon: faPaperPlane, required: false, section: 'cargoBase' },
        { id: 'receiver', label: 'گیرنده', icon: faBoxOpen, required: false, section: 'cargoBase' },
        { id: 'vehicle', label: 'خودرو', icon: faTruck, required: true, section: 'cargoBase' },
        { id: 'driver', label: 'راننده', icon: faUser, required: true, section: 'cargoBase' },
        { id: 'cargo', label: 'محموله', icon: faBoxes, required: true, section: 'cargoDetails' },
        { id: 'route', label: 'مسیر', icon: faRoute, required: true, section: 'cargoDetails' },
        { id: 'income', label: 'درآمدها', icon: faMoneyBillWave, required: true, section: 'financialIncome' },
        { id: 'expense', label: 'هزینه‌ها', icon: faReceipt, required: false, section: 'financialExpense' },
        { id: 'account', label: 'حساب بانکی', icon: faFileInvoice, required: false, section: 'financialExpense' },
        { id: 'documents', label: 'مدارک', icon: faPaperclip, required: false, section: 'cargoBase' }
    ],

    fields: {
        basic: [
            { name: 'date', label: 'تاریخ', type: 'date', required: true },
            { name: 'waybillNumber', label: 'شماره بارنامه', type: 'text', required: true, section: 'cargoBase', gridCols: 1 },
            { name: 'serialNumber', label: 'سری بارنامه', type: 'text', required: true, section: 'cargoBase', gridCols: 1 },
            { name: 'refineryWaybillNumber', label: 'شماره بارنامه پالایشگاهی', type: 'text', required: false, section: 'cargoBase', gridCols: 1 }
        ],

        sender: [
            { name: 'sender', label: 'فرستنده', type: 'select2', required: false, section: 'cargoBase', gridCols: 1, loadOptions: 'loadSenders' },
            { name: 'senderTitle', label: 'عنوان فرستنده', type: 'text', required: false, section: 'cargoBase', gridCols: 1 },
            { name: 'senderAddress', label: 'آدرس فرستنده', type: 'text', required: false, section: 'cargoBase', gridCols: 2, fullWidth: true }
        ],

        receiver: [
            { name: 'receiver', label: 'گیرنده', type: 'select2', required: false, section: 'cargoBase', gridCols: 1, loadOptions: 'loadReceivers' },
            { name: 'receiverTitle', label: 'عنوان گیرنده', type: 'text', required: false, section: 'cargoBase', gridCols: 1 },
            { name: 'receiverEconomicCode', label: 'کد اقتصادی', type: 'text', required: false, section: 'cargoBase', gridCols: 1 },
            { name: 'receiverNationalCode', label: 'کد ملی', type: 'text', required: false, section: 'cargoBase', gridCols: 1 },
            { name: 'receiverPostalCode', label: 'کدپستی', type: 'text', required: false, section: 'cargoBase', gridCols: 1 },
            { name: 'receiverAddress', label: 'آدرس گیرنده', type: 'text', required: false, section: 'cargoBase', gridCols: 2, fullWidth: true }
        ],

        vehicle: [
            { name: 'expenseCost', label: 'مرکز هزینه', type: 'select2', required: false, section: 'cargoBase', gridCols: 1, loadOptions: 'loadExpenseCenters' },
            { name: 'machineSmartCard', label: 'کارت هوشمند ماشین', type: 'text', required: false, section: 'cargoBase', gridCols: 1 },
            { name: 'plate', label: 'شماره پلاک', type: 'text', required: false, section: 'cargoBase', gridCols: 1 },
            { name: 'driverType', label: 'نوع بارگیر', type: 'select2', required: true, section: 'cargoBase', gridCols: 1, loadOptions: 'loadDriverTypes' },
            { name: 'driverName', label: 'نام کامیون', type: 'text', required: false, section: 'cargoBase', gridCols: 1 }
        ],

        driver: [
            { name: 'driverId', label: 'راننده', type: 'select2', required: false, section: 'cargoBase', gridCols: 1, loadOptions: 'loadDrivers' },
            { name: 'firstDriverCard', label: 'کارت هوشمند راننده اول', type: 'text', required: true, section: 'cargoBase', gridCols: 1 },
            { name: 'firstDriverNationalId', label: 'کدملی راننده اول', type: 'text', required: false, section: 'cargoBase', gridCols: 1 },
            { name: 'firstDriverName', label: 'نام راننده اول', type: 'text', required: true, section: 'cargoBase', gridCols: 1 },
            { name: 'firstDriverLastName', label: 'نام خانوادگی راننده اول', type: 'text', required: true, section: 'cargoBase', gridCols: 1 },
            { name: 'fatherName', label: 'نام پدر راننده اول', type: 'text', required: false, section: 'cargoBase', gridCols: 1 },
            { name: 'mobile', label: 'موبایل راننده اول', type: 'text', required: false, section: 'cargoBase', gridCols: 1 },
            { name: 'certificateNumber', label: 'شماره گواهینامه راننده اول', type: 'text', required: false, section: 'cargoBase', gridCols: 1 },
            { name: 'certificateIssuePlace', label: 'محل صدور گواهینامه', type: 'select2', required: false, section: 'cargoBase', gridCols: 1, loadOptions: 'loadCertificatePlaces' }
        ],

        cargo: [
            { name: 'cargoType', label: 'نوع محموله', type: 'select2', required: false, section: 'cargoDetails', gridCols: 1, loadOptions: 'loadCargoTypes' },
            { name: 'cargoDescription', label: 'شرح محموله', type: 'text', required: false, section: 'cargoDetails', gridCols: 1 },
            { name: 'packaging', label: 'بسته‌بندی', type: 'select2', required: false, section: 'cargoDetails', gridCols: 1, loadOptions: 'loadPackaging' },
            { name: 'count', label: 'تعداد', type: 'text', required: false, section: 'cargoDetails', gridCols: 1 },
            { name: 'originWeight', label: 'وزن مبدا', type: 'text', required: false, section: 'cargoDetails', gridCols: 1 },
            { name: 'destinationWeight', label: 'وزن مقصد', type: 'text', required: false, section: 'cargoDetails', gridCols: 1 },
            { name: 'weightDiff', label: 'اختلاف وزن', type: 'text', required: false, section: 'cargoDetails', gridCols: 1 },
            { name: 'permitWeightScale', label: 'وزن مجاز کسری', type: 'text', required: false, section: 'cargoDetails', gridCols: 1 },
            { name: 'permitValueScale', label: 'نرخ هر کیلو بار', type: 'text', required: false, section: 'cargoDetails', gridCols: 1 },
            { name: 'permitNumber', label: 'مقدار ریالی کسر بار', type: 'text', required: false, section: 'cargoDetails', gridCols: 1 },
            { name: 'realCargoValue', label: 'ارزش محموله', type: 'text', required: true, section: 'cargoDetails', gridCols: 1 },
            { name: 'exitNumber', label: 'شماره خروجی', type: 'text', required: false, section: 'cargoDetails', gridCols: 1 }
        ],

        route: [
            { name: 'origin', label: 'مبدا', type: 'select2', required: true, section: 'cargoDetails', gridCols: 1, loadOptions: 'loadCities' },
            { name: 'destination', label: 'مقصد', type: 'select2', required: true, section: 'cargoDetails', gridCols: 1, loadOptions: 'loadCities' },
            { name: 'fullDistance', label: 'مسافت پر', type: 'text', required: false, section: 'cargoDetails', gridCols: 1 },
            { name: 'emptyDistance', label: 'مسافت خالی', type: 'text', required: false, section: 'cargoDetails', gridCols: 1 }
        ],

        income: [
            { name: 'payablePrice', label: 'کرایه پایه', type: 'text', required: true, section: 'financialIncome', gridCols: 1, showZeroText: true },
            { name: 'priceAdvance', label: 'پیش کرایه', type: 'text', required: false, section: 'financialIncome', gridCols: 1, showZeroText: true },
            { name: 'priceRemaining', label: 'کرایه باقیمانده', type: 'text', required: true, section: 'financialIncome', gridCols: 1, showZeroText: true },
            { name: 'outPriceAdvance', label: 'کرایه پرداختی', type: 'text', required: true, section: 'financialIncome', gridCols: 1, showZeroText: true },
            { name: 'cargoTypeRevenue', label: 'نوع کرایه', type: 'select', required: false, section: 'financialIncome', gridCols: 1, options: [
                    { value: 'کرایه در مبدا', label: 'کرایه در مبدا' },
                    { value: 'کرایه در مقصد', label: 'کرایه در مقصد' }
                ]},
            { name: 'commission', label: 'کمیسیون', type: 'text', required: false, section: 'financialIncome', gridCols: 1, showZeroText: true },
            { name: 'insurance', label: 'بیمه بار', type: 'text', required: false, section: 'financialIncome', gridCols: 1, showZeroText: true },
            { name: 'addedValue', label: 'ارزش افزوده', type: 'text', required: false, section: 'financialIncome', gridCols: 1, showZeroText: true },
            { name: 'commissionReceipt', label: 'کمیسیون دریافتی', type: 'text', required: false, section: 'financialIncome', gridCols: 1, showZeroText: true },
            { name: 'waybillCommission', label: 'مازاد بارنامه‌نویسی', type: 'text', required: false, section: 'financialIncome', gridCols: 1, showZeroText: true }
        ],

        expense: [
            { name: 'loadingFee', label: 'هزینه بارگیری/خدمات', type: 'text', required: false, section: 'financialExpense', gridCols: 1, showZeroText: true },
            { name: 'scalesFee', label: 'حق باسکول', type: 'text', required: false, section: 'financialExpense', gridCols: 1, showZeroText: true },
            { name: 'queueFee', label: 'هزینه نوبت', type: 'text', required: false, section: 'financialExpense', gridCols: 1, showZeroText: true },
            { name: 'periodicRepairFee', label: 'هزینه تعمیرات دوره', type: 'text', required: false, section: 'financialExpense', gridCols: 1, showZeroText: true },
            { name: 'fuelFee', label: 'هزینه سوخت', type: 'text', required: false, section: 'financialExpense', gridCols: 1, showZeroText: true },
            { name: 'excessFuelFee', label: 'مازاد هزینه سوخت', type: 'text', required: false, section: 'financialExpense', gridCols: 1, showZeroText: true },
            { name: 'taxiFee', label: 'هزینه تاکسی', type: 'text', required: false, section: 'financialExpense', gridCols: 1, showZeroText: true },
            { name: 'phoneFee', label: 'هزینه تلفن', type: 'text', required: false, section: 'financialExpense', gridCols: 1, showZeroText: true },
            { name: 'parkingFee', label: 'هزینه پارکینگ', type: 'text', required: false, section: 'financialExpense', gridCols: 1, showZeroText: true },
            { name: 'inspectionFee', label: 'هزینه معاینه', type: 'text', required: false, section: 'financialExpense', gridCols: 1, showZeroText: true },
            { name: 'commissionFee', label: 'کمیسیون', type: 'text', required: false, section: 'financialExpense', gridCols: 1, showZeroText: true },
            { name: 'tollFee', label: 'عوارض بزرگراه', type: 'text', required: false, section: 'financialExpense', gridCols: 1, showZeroText: true },
            { name: 'waybillFee', label: 'بارنامه‌نویسی', type: 'text', required: false, section: 'financialExpense', gridCols: 1, showZeroText: true },
            { name: 'sleepFee', label: 'حق خواب', type: 'text', required: false, section: 'financialExpense', gridCols: 1, showZeroText: true },
            { name: 'tonKilometer', label: 'تن بر کیلومتر', type: 'text', required: false, section: 'financialExpense', gridCols: 1, showZeroText: true },
            { name: 'miscExpense1Title', label: 'عنوان هزینه متفرقه ۱', type: 'text', required: false, section: 'financialExpense', gridCols: 1 },
            { name: 'miscExpense1Amount', label: 'میزان هزینه متفرقه ۱', type: 'text', required: false, section: 'financialExpense', gridCols: 1, showZeroText: true },
            { name: 'miscExpense2Title', label: 'عنوان هزینه متفرقه ۲', type: 'text', required: false, section: 'financialExpense', gridCols: 1 },
            { name: 'miscExpense2Amount', label: 'میزان هزینه متفرقه ۲', type: 'text', required: false, section: 'financialExpense', gridCols: 1, showZeroText: true },
            { name: 'miscExpense3Title', label: 'عنوان هزینه متفرقه ۳', type: 'text', required: false, section: 'financialExpense', gridCols: 1 },
            { name: 'miscExpense3Amount', label: 'میزان هزینه متفرقه ۳', type: 'text', required: false, section: 'financialExpense', gridCols: 1, showZeroText: true },
            { name: 'totalExpenses', label: 'جمع همه هزینه‌ها', type: 'text', required: false, section: 'financialExpense', gridCols: 1, showZeroText: true },
            { name: 'tripBonus', label: 'پاداش سفر', type: 'text', required: false, section: 'financialExpense', gridCols: 1, showZeroText: true }
        ],

        account: [
            { name: 'shabaNumber', label: 'شماره شبا', type: 'text', placeholder: 'IR...', required: false, section: 'financialExpense', gridCols: 1 },
            { name: 'bankName', label: 'نام بانک', type: 'select2', required: false, section: 'financialExpense', gridCols: 1, loadOptions: 'loadBanks' },
            { name: 'accountHolder', label: 'نام صاحب حساب', type: 'text', required: false, section: 'financialExpense', gridCols: 1 },
            { name: 'invoiceNumber', label: 'شماره صورت‌حساب', type: 'text', required: false, section: 'financialExpense', gridCols: 1 },
            { name: 'invoiceAmount', label: 'مبلغ صورت‌وضعیت', type: 'text', required: false, section: 'financialExpense', gridCols: 1, showZeroText: true },
            { name: 'totalInvoice', label: 'جمع صورت‌حساب', type: 'text', required: false, section: 'financialExpense', gridCols: 1, showZeroText: true }
        ],

        documents: []
    }
}