// app/config/nonOwnedNonCompanyWaybillFormConfig.js
// کانفیگ فرم غیرملکی-غیرشرکتی

import {
    faInfoCircle, faPaperPlane, faBoxOpen, faTruck, faUser,
    faBoxes, faRoute, faMoneyBillWave, faFileInvoice, faPaperclip
} from '@fortawesome/free-solid-svg-icons'

export const nonOwnedNonCompanyWaybillFormConfig = {
    tabs: [
        { id: 'basic', label: 'اطلاعات اولیه', icon: faInfoCircle, required: true, section: 'cargoBase' },
        { id: 'sender', label: 'فرستنده', icon: faPaperPlane, required: false, section: 'cargoBase' },
        { id: 'receiver', label: 'گیرنده', icon: faBoxOpen, required: false, section: 'cargoBase' },
        { id: 'vehicle', label: 'خودرو', icon: faTruck, required: true, section: 'cargoBase' },
        { id: 'driver', label: 'راننده', icon: faUser, required: false, section: 'cargoBase' },
        { id: 'cargo', label: 'محموله', icon: faBoxes, required: true, section: 'cargoDetails' },
        { id: 'route', label: 'مسیر', icon: faRoute, required: true, section: 'cargoDetails' },
        { id: 'income', label: 'درآمدها', icon: faMoneyBillWave, required: true, section: 'financialIncome' },
        { id: 'account', label: 'حساب بانکی', icon: faFileInvoice, required: false, section: 'accountInfo' },
        { id: 'documents', label: 'مدارک', icon: faPaperclip, required: false, section: 'cargoBase' }
    ],

    fields: {
        // تب اطلاعات اولیه
        basic: [
            { name: 'date', label: 'تاریخ', type: 'date', required: true },

            {
                name: 'waybillNumber',
                label: 'شماره بارنامه',
                type: 'text',
                required: true,
                section: 'cargoBase',
                gridCols: 1
            },
            {
                name: 'serialNumber',
                label: 'سری بارنامه',
                type: 'text',
                required: true,
                section: 'cargoBase',
                gridCols: 1
            },
            {
                name: 'statusConfirm',
                label: 'وضعیت ثبت',
                type: 'select',
                required: false,
                section: 'cargoBase',
                gridCols: 1,
                options: [
                    { value: 'ثبت و تایید راهبری', label: 'ثبت و تایید راهبری' }
                ]
            }
        ],

        // تب فرستنده
        sender: [
            {
                name: 'sender',
                label: 'فرستنده',
                type: 'select2',
                required: false,
                section: 'cargoBase',
                gridCols: 1,
                loadOptions: 'loadSenders'
            },
            {
                name: 'senderTitle',
                label: 'عنوان فرستنده',
                type: 'text',
                required: false,
                section: 'cargoBase',
                gridCols: 1
            },
            {
                name: 'senderAddress',
                label: 'آدرس فرستنده',
                type: 'text',
                required: false,
                section: 'cargoBase',
                gridCols: 2,
                fullWidth: true
            }
        ],

        // تب گیرنده
        receiver: [
            {
                name: 'receiver',
                label: 'گیرنده',
                type: 'select2',
                required: false,
                section: 'cargoBase',
                gridCols: 1,
                loadOptions: 'loadReceivers'
            },
            {
                name: 'receiverTitle',
                label: 'عنوان گیرنده',
                type: 'text',
                required: false,
                section: 'cargoBase',
                gridCols: 1
            },
            {
                name: 'receiverEconomicCode',
                label: 'کد اقتصادی گیرنده',
                type: 'text',
                required: false,
                section: 'cargoBase',
                gridCols: 1
            },
            {
                name: 'receiverNationalCode',
                label: 'کد ملی گیرنده',
                type: 'text',
                required: false,
                section: 'cargoBase',
                gridCols: 1
            },
            {
                name: 'receiverPostalCode',
                label: 'کدپستی گیرنده',
                type: 'text',
                required: false,
                section: 'cargoBase',
                gridCols: 1
            },
            {
                name: 'receiverAddress',
                label: 'آدرس گیرنده',
                type: 'text',
                required: false,
                section: 'cargoBase',
                gridCols: 2,
                fullWidth: true
            }
        ],

        // تب خودرو
        vehicle: [
            {
                name: 'expenseCost',
                label: 'مرکز هزینه',
                type: 'select2',
                required: false,
                section: 'cargoBase',
                gridCols: 1,
                loadOptions: 'loadExpenseCenters'
            },
            {
                name: 'machineSmartCard',
                label: 'کارت هوشمند ماشین',
                type: 'text',
                required: false,
                section: 'cargoBase',
                gridCols: 1
            },
            {
                name: 'plate',
                label: 'شماره پلاک',
                type: 'text',
                required: false,
                section: 'cargoBase',
                gridCols: 1
            },
            {
                name: 'driverType',
                label: 'نوع بارگیر',
                type: 'select2',
                required: true,
                section: 'cargoBase',
                gridCols: 1,
                loadOptions: 'loadDriverTypes'
            },
            {
                name: 'driverName',
                label: 'نام کامیون',
                type: 'text',
                required: false,
                section: 'cargoBase',
                gridCols: 1
            }
        ],

        // تب راننده
        driver: [
            {
                name: 'driverId',
                label: 'راننده',
                type: 'select2',
                required: false,
                section: 'cargoBase',
                gridCols: 2,
                fullWidth: true,
                loadOptions: 'loadDrivers'
            }
        ],

        // تب محموله
        cargo: [
            {
                name: 'cargoDescription',
                label: 'شرح محموله',
                type: 'text',
                required: false,
                section: 'cargoDetails',
                gridCols: 1
            },
            {
                name: 'packaging',
                label: 'بسته‌بندی',
                type: 'select2',
                required: false,
                section: 'cargoDetails',
                gridCols: 1,
                loadOptions: 'loadPackaging'
            },
            {
                name: 'count',
                label: 'تعداد',
                type: 'text',
                required: false,
                section: 'cargoDetails',
                gridCols: 1
            },
            {
                name: 'originWeight',
                label: 'وزن مبدا',
                type: 'text',
                required: false,
                section: 'cargoDetails',
                gridCols: 1
            },
            {
                name: 'destinationWeight',
                label: 'وزن مقصد',
                type: 'text',
                required: false,
                section: 'cargoDetails',
                gridCols: 1
            },
            {
                name: 'weightDiff',
                label: 'اختلاف وزن',
                type: 'text',
                required: false,
                section: 'cargoDetails',
                gridCols: 1
            },
            {
                name: 'permitWeightScale',
                label: 'وزن مجاز کسری',
                type: 'text',
                required: false,
                section: 'cargoDetails',
                gridCols: 1
            },
            {
                name: 'permitValueScale',
                label: 'نرخ هر کیلو بار',
                type: 'text',
                required: false,
                section: 'cargoDetails',
                gridCols: 1
            },
            {
                name: 'permitNumber',
                label: 'مقدار ریالی کسر بار',
                type: 'text',
                required: false,
                section: 'cargoDetails',
                gridCols: 1
            },
            {
                name: 'realCargoValue',
                label: 'ارزش محموله',
                type: 'text',
                required: true,
                section: 'cargoDetails',
                gridCols: 1
            },
            {
                name: 'exitNumber',
                label: 'شماره خروجی',
                type: 'text',
                required: false,
                section: 'cargoDetails',
                gridCols: 1
            }
        ],

        // تب مسیر
        route: [
            {
                name: 'origin',
                label: 'مبدا',
                type: 'select2',
                required: true,
                section: 'cargoDetails',
                gridCols: 1,
                loadOptions: 'loadCities'
            },
            {
                name: 'destination',
                label: 'مقصد',
                type: 'select2',
                required: true,
                section: 'cargoDetails',
                gridCols: 1,
                loadOptions: 'loadCities'
            },
            {
                name: 'fullDistance',
                label: 'مسافت پر',
                type: 'text',
                required: false,
                section: 'cargoDetails',
                gridCols: 1
            },
            {
                name: 'emptyDistance',
                label: 'مسافت خالی',
                type: 'text',
                required: false,
                section: 'cargoDetails',
                gridCols: 1
            }
        ],

        // تب درآمدها
        income: [
            {
                name: 'payablePrice',
                label: 'کرایه پایه',
                type: 'text',
                required: true,
                section: 'financialIncome',
                gridCols: 1,
                showZeroText: true
            },
            {
                name: 'priceAdvance',
                label: 'پیش کرایه',
                type: 'text',
                required: false,
                section: 'financialIncome',
                gridCols: 1,
                showZeroText: true
            },
            {
                name: 'priceRemaining',
                label: 'کرایه باقیمانده',
                type: 'text',
                required: true,
                section: 'financialIncome',
                gridCols: 1,
                showZeroText: true
            },
            {
                name: 'outPriceAdvance',
                label: 'کرایه پرداختی',
                type: 'text',
                required: true,
                section: 'financialIncome',
                gridCols: 1,
                showZeroText: true
            },
            {
                name: 'cargoTypeRevenue',
                label: 'نوع کرایه',
                type: 'select',
                required: false,
                section: 'financialIncome',
                gridCols: 1,
                options: [
                    { value: 'کرایه در مبدا', label: 'کرایه در مبدا' },
                    { value: 'کرایه در مقصد', label: 'کرایه در مقصد' }
                ]
            },
            {
                name: 'penalty',
                label: 'جریمه',
                type: 'text',
                required: false,
                section: 'financialIncome',
                gridCols: 1,
                showZeroText: true
            },
            {
                name: 'driverPayment',
                label: 'پرداختی به راننده',
                type: 'text',
                required: false,
                section: 'financialIncome',
                gridCols: 1,
                showZeroText: true
            },
            {
                name: 'commissionScale',
                label: 'میزان کمیسیون',
                type: 'select',
                required: false,
                section: 'financialIncome',
                gridCols: 1,
                options: [
                    { value: '12.50', label: '۱۲.۵۰' },
                    { value: '15.00', label: '۱۵.۰۰' },
                    { value: '17.50', label: '۱۷.۵۰' }
                ]
            },
            {
                name: 'commission',
                label: 'کمیسیون',
                type: 'text',
                required: false,
                section: 'financialIncome',
                gridCols: 1,
                showZeroText: true
            },
            {
                name: 'insurance',
                label: 'بیمه بار',
                type: 'text',
                required: false,
                section: 'financialIncome',
                gridCols: 1,
                showZeroText: true
            },
            {
                name: 'addedValue',
                label: 'ارزش افزوده',
                type: 'text',
                required: false,
                section: 'financialIncome',
                gridCols: 1,
                showZeroText: true
            },
            {
                name: 'commissionReceipt',
                label: 'کمیسیون دریافتی',
                type: 'text',
                required: false,
                section: 'financialIncome',
                gridCols: 1,
                showZeroText: true
            },
            {
                name: 'waybillCommission',
                label: 'مازاد بارنامه‌نویسی',
                type: 'text',
                required: false,
                section: 'financialIncome',
                gridCols: 1,
                showZeroText: true
            }
        ],

        // تب حساب بانکی
        account: [
            {
                name: 'shabaNumber',
                label: 'شماره شبا',
                type: 'text',
                placeholder: 'IR...',
                required: false,
                section: 'accountInfo',
                gridCols: 1
            },
            {
                name: 'bankName',
                label: 'نام بانک',
                type: 'select2',
                required: false,
                section: 'accountInfo',
                gridCols: 1,
                loadOptions: 'loadBanks'
            },
            {
                name: 'accountHolder',
                label: 'نام صاحب حساب',
                type: 'text',
                required: false,
                section: 'accountInfo',
                gridCols: 1
            }
        ],

        // تب مدارک
        documents: [
            // فعلا خالی - بعدا آپلود فایل اضافه میشه
        ]
    }
}