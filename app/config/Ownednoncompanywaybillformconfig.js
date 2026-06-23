// app/config/ownedNonCompanyWaybillFormConfig.js
// کانفیگ فرم ملکی - بدون بارنامه (با بار)

import {
    faInfoCircle, faPaperPlane, faBoxOpen, faTruck, faUser,
    faBoxes, faRoute, faMoneyBillWave, faReceipt, faFileInvoice, faPaperclip
} from '@fortawesome/free-solid-svg-icons'

export const ownedNonCompanyWaybillFormConfig = {
    tabs: [
        { id: 'basic', label: 'اطلاعات اولیه', icon: faInfoCircle, required: true },
        { id: 'sender', label: 'فرستنده', icon: faPaperPlane, required: false },
        { id: 'receiver', label: 'گیرنده', icon: faBoxOpen, required: false },
        { id: 'vehicle', label: 'خودرو', icon: faTruck, required: true },
        { id: 'driver', label: 'راننده', icon: faUser, required: true },
        { id: 'cargo', label: 'محموله', icon: faBoxes, required: true },
        { id: 'route', label: 'مسیر', icon: faRoute, required: true },
        { id: 'income', label: 'درآمدها', icon: faMoneyBillWave, required: true },
        { id: 'expenses', label: 'هزینه‌ها', icon: faReceipt, required: false },
        { id: 'account', label: 'اطلاعات حساب', icon: faFileInvoice, required: false },
        { id: 'documents', label: 'آپلود مدارک', icon: faPaperclip, required: false }
    ],

    fields: {
        // ⭐ تب اطلاعات اولیه
        basic: [
            { name: 'date', label: 'تاریخ', type: 'date', required: true },
            { name: 'waybillNumber', label: 'شماره بارنامه', type: 'text', required: true },
            { name: 'serialNumber', label: 'سری بارنامه', type: 'text', required: true },
            { name: 'statusConfirm', label: 'وضعیت ثبت', type: 'select', required: false, options: [
                    { value: '', label: 'انتخاب کنید' },
                    { value: 'ثبت', label: 'ثبت' },
                    { value: 'تایید', label: 'تایید' }
                ]}
        ],

        // ⭐ تب فرستنده
        sender: [
            { name: 'sender', label: 'فرستنده', type: 'select2', loadOptions: 'loadSenders' },
            { name: 'senderTitle', label: 'عنوان فرستنده', type: 'text' },
            { name: 'senderAddress', label: 'آدرس فرستنده', type: 'textarea', fullWidth: true, rows: 2 }
        ],

        // ⭐ تب گیرنده
        receiver: [
            { name: 'receiver', label: 'گیرنده', type: 'select2', loadOptions: 'loadReceivers' },
            { name: 'receiverTitle', label: 'عنوان گیرنده', type: 'text' },
            { name: 'receiverEconomicCode', label: 'کد اقتصادی گیرنده', type: 'text' },
            { name: 'receiverNationalCode', label: 'کد ملی گیرنده', type: 'text' },
            { name: 'receiverPostalCode', label: 'کدپستی گیرنده', type: 'text' },
            { name: 'receiverAddress', label: 'آدرس گیرنده', type: 'textarea', fullWidth: true, rows: 2 }
        ],

        // ⭐ تب خودرو
        vehicle: [
            { name: 'expenseCost', label: 'مرکز هزینه', type: 'select2', loadOptions: 'loadExpenseCenters' },
            { name: 'machineSmartCard', label: 'کارت هوشمند ماشین', type: 'text' },
            { name: 'plate', label: 'شماره پلاک', type: 'text' },
            { name: 'driverType', label: 'نوع بارگیر', type: 'select2', required: true, loadOptions: 'loadDriverTypes' },
            { name: 'truckName', label: 'نام کامیون', type: 'text' }
        ],

        // ⭐ تب راننده
        driver: [
            { name: 'driverId', label: 'راننده', type: 'select2', loadOptions: 'loadDrivers' },
            { name: 'driverSmartCard', label: 'کارت هوشمند راننده اول', type: 'text', required: true },
            { name: 'driverNationalCode', label: 'کد ملی راننده اول', type: 'text' },
            { name: 'driverFirstName', label: 'نام راننده اول', type: 'text', required: true },
            { name: 'driverLastName', label: 'نام خانوادگی راننده اول', type: 'text', required: true },
            { name: 'driverFatherName', label: 'نام پدر راننده اول', type: 'text' },
            { name: 'driverMobile', label: 'موبایل راننده اول', type: 'text' },
            { name: 'driverLicenseNumber', label: 'شماره گواهینامه راننده اول', type: 'text' },
            { name: 'driverLicenseIssuePlace', label: 'محل صدور گواهینامه', type: 'text' }
        ],

        // ⭐ تب محموله
        cargo: [
            { name: 'cargoType', label: 'نوع محموله', type: 'select2', loadOptions: 'loadCargoTypes' },
            { name: 'cargoDescription', label: 'شرح محموله', type: 'textarea', fullWidth: true, rows: 2 },
            { name: 'packaging', label: 'بسته بندی', type: 'text' },
            { name: 'quantity', label: 'تعداد', type: 'text' },
            { name: 'originWeight', label: 'وزن مبدا', type: 'text' },
            { name: 'destinationWeight', label: 'وزن مقصد', type: 'text' },
            { name: 'weightDifference', label: 'اختلاف وزن', type: 'text' },
            { name: 'allowableDeficit', label: 'وزن مجاز کسری', type: 'text' },
            { name: 'ratePerKg', label: 'نرخ هر کیلو بار', type: 'text' },
            { name: 'deficitAmount', label: 'مقدار ریالی کسر بار', type: 'text', showZeroText: true },
            { name: 'cargoValue', label: 'ارزش محموله', type: 'text', required: true },
            { name: 'exitNumber', label: 'شماره خروجی', type: 'text' }
        ],

        // ⭐ تب مسیر
        route: [
            { name: 'origin', label: 'مبدا', type: 'select2', required: true, loadOptions: 'loadCities' },
            { name: 'destination', label: 'مقصد', type: 'select2', required: true, loadOptions: 'loadCities' },
            { name: 'loadedDistance', label: 'مسافت پر', type: 'text' },
            { name: 'emptyDistance', label: 'مسافت خالی', type: 'text' }
        ],

        // ⭐ تب درآمدها
        income: [
            { name: 'baseFare', label: 'کرایه پایه', type: 'text', required: true, showZeroText: true },
            { name: 'advanceFare', label: 'پیش کرایه', type: 'text', showZeroText: true },
            { name: 'remainingFare', label: 'کرایه باقیمانده', type: 'text', required: true, showZeroText: true },
            { name: 'paidFare', label: 'کرایه پرداختی', type: 'text', required: true, showZeroText: true },
            { name: 'fareType', label: 'نوع کرایه', type: 'select', options: [
                    { value: '', label: 'انتخاب کنید' },
                    { value: 'origin', label: 'کرایه در مبدا' },
                    { value: 'destination', label: 'کرایه در مقصد' }
                ]},
            { name: 'commissionRate', label: 'میزان کمیسیون', type: 'text' },
            { name: 'commission', label: 'کمیسیون', type: 'text', showZeroText: true },
            { name: 'cargoInsurance', label: 'بیمه بار', type: 'text', showZeroText: true },
            { name: 'valueAdded', label: 'ارزش افزوده', type: 'text', showZeroText: true },
            { name: 'receivedCommission', label: 'کمیسیون دریافتی', type: 'text', showZeroText: true },
            { name: 'waybillExcess', label: 'مازاد بارنامه نویسی', type: 'text', showZeroText: true }
        ],

        // ⭐ تب هزینه‌ها
        expenses: [
            { name: 'loadingCost', label: 'هزینه بارگیری/خدمات', type: 'text', showZeroText: true },
            { name: 'weighingFee', label: 'حق باسکول', type: 'text', showZeroText: true },
            { name: 'queueCost', label: 'هزینه نوبت', type: 'text', showZeroText: true },
            { name: 'maintenanceCost', label: 'هزینه تعمیرات دوره', type: 'text', showZeroText: true },
            { name: 'fuelCost', label: 'هزینه سوخت', type: 'text', showZeroText: true },
            { name: 'excessFuelCost', label: 'مازاد هزینه سوخت', type: 'text', showZeroText: true },
            { name: 'taxiCost', label: 'هزینه تاکسی', type: 'text', showZeroText: true },
            { name: 'phoneCost', label: 'هزینه تلفن', type: 'text', showZeroText: true },
            { name: 'parkingCost', label: 'هزینه پارکینگ', type: 'text', showZeroText: true },
            { name: 'inspectionCost', label: 'هزینه معاینه', type: 'text', showZeroText: true },
            { name: 'expenseCommission', label: 'کمیسیون', type: 'text', showZeroText: true },
            { name: 'highwayToll', label: 'عوارض بزرگراه', type: 'text', showZeroText: true },
            { name: 'waybillFee', label: 'بارنامه نویسی', type: 'text', showZeroText: true },
            { name: 'sleepingFee', label: 'حق خواب', type: 'text', showZeroText: true },
            { name: 'tonKm', label: 'تن بر کیلومتر', type: 'text' },
            { name: 'miscExpense1Title', label: 'عنوان هزینه متفرقه یک', type: 'text' },
            { name: 'miscExpense1Amount', label: 'میزان هزینه متفرقه یک', type: 'text', showZeroText: true },
            { name: 'miscExpense2Title', label: 'عنوان هزینه متفرقه دو', type: 'text' },
            { name: 'miscExpense2Amount', label: 'میزان هزینه متفرقه دو', type: 'text', showZeroText: true },
            { name: 'miscExpense3Title', label: 'عنوان هزینه متفرقه سه', type: 'text' },
            { name: 'miscExpense3Amount', label: 'میزان هزینه متفرقه سه', type: 'text', showZeroText: true },
            { name: 'totalExpenses', label: 'جمع همه هزینه ها', type: 'text', showZeroText: true, disabled: true },
            { name: 'tripBonus', label: 'پاداش سفر', type: 'text', showZeroText: true }
        ],

        // ⭐ تب اطلاعات حساب
        account: [
            { name: 'iban', label: 'شماره شبا', type: 'text' },
            { name: 'bankName', label: 'نام بانک', type: 'text' },
            { name: 'accountOwner', label: 'نام صاحب حساب', type: 'text' },
            { name: 'statementNumber', label: 'شماره صورت حساب', type: 'text' },
            { name: 'statementAmount', label: 'مبلغ صورت وضعیت', type: 'text', showZeroText: true },
            { name: 'totalAccount', label: 'جمع صورت حساب', type: 'text', showZeroText: true, disabled: true }
        ],

        // ⭐ تب آپلود مدارک
        documents: [
            {
                name: 'uploadedFiles',
                label: 'لیست مدارک آپلود شده',
                type: 'file-upload',
                fullWidth: true
            }
        ]
    }
}