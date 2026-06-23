'use client'

import { motion, AnimatePresence } from 'framer-motion'

const persianLabels = {
    // اطلاعات پایه
    date: 'تاریخ',
    waybillNumber: 'شماره بارنامه',
    serialNumber: 'سری بارنامه',
    waybillCompany: 'شماره بارنامه والابلاشکالی',
    statusConfirm: 'وضعیت ثبت',
    refineryWaybillNumber: 'شماره بارنامه پالایشگاهی',
    issuingCompany: 'شرکت صدور بارنامه',

    // فرستنده
    sender: 'فرستنده',
    senderTitle: 'عنوان فرستنده',
    senderAddress: 'آدرس فرستنده',

    // گیرنده
    receiver: 'گیرنده',
    receiverTitle: 'عنوان گیرنده',
    receiverEconomicCode: 'کد اقتصادی گیرنده',
    receiverNationalCode: 'کد ملی گیرنده',
    receiverPostalCode: 'کدپستی گیرنده',
    receiverAddress: 'آدرس گیرنده',

    // خودرو
    expenseCost: 'مرکز هزینه',
    machineSmartCard: 'کارت هوشمند ماشین',
    plate: 'شماره پلاک',
    driverType: 'نوع بارگیر',
    driverName: 'نام کامیون',
    truckName: 'نام کامیون',

    // راننده
    driverId: 'راننده',
    firstDriverCard: 'کارت هوشمند راننده',
    driverSmartCard: 'کارت هوشمند راننده اول',
    firstDriverName: 'نام راننده',
    driverFirstName: 'نام راننده اول',
    firstDriverLastName: 'نام خانوادگی راننده',
    driverLastName: 'نام خانوادگی راننده اول',
    firstDriverNationalId: 'کدملی راننده',
    driverNationalCode: 'کد ملی راننده اول',
    fatherName: 'نام پدر',
    driverFatherName: 'نام پدر راننده اول',
    mobile: 'موبایل',
    driverMobile: 'موبایل راننده اول',
    certificateNumber: 'شماره گواهینامه',
    driverLicenseNumber: 'شماره گواهینامه راننده اول',
    certificateIssuePlace: 'محل صدور گواهینامه',
    driverLicenseIssuePlace: 'محل صدور گواهینامه',

    // محموله
    cargoType: 'نوع محموله',
    cargoDescription: 'شرح محموله',
    packaging: 'بسته‌بندی',
    count: 'تعداد',
    quantity: 'تعداد',
    originWeight: 'وزن مبدا',
    destinationWeight: 'وزن مقصد',
    weightDiff: 'اختلاف وزن',
    weightDifference: 'اختلاف وزن',
    allowableDeficit: 'وزن مجاز کسری',
    ratePerKg: 'نرخ هر کیلو بار',
    deficitAmount: 'مقدار ریالی کسر بار',
    cargoValue: 'ارزش محموله',
    realCargoValue: 'ارزش محموله',
    exitNumber: 'شماره خروجی',
    permitWeightScale: 'وزن مجاز کسری',
    permitValueScale: 'مقدار ریالی کسر بار',
    permitNumber: 'شماره مجوز',

    // مسیر
    origin: 'مبدا',
    destination: 'مقصد',
    loadedDistance: 'مسافت پر',
    emptyDistance: 'مسافت خالی',
    fullDistance: 'مسافت پر',

    // درآمدها
    payablePrice: 'کرایه پایه',
    baseFare: 'کرایه پایه',
    priceAdvance: 'پیش کرایه',
    advanceFare: 'پیش کرایه',
    priceRemaining: 'کرایه باقیمانده',
    remainingFare: 'کرایه باقیمانده',
    paidFare: 'کرایه پرداختی',
    outPriceAdvance: 'کرایه پرداختی',
    fareType: 'نوع کرایه',
    cargoTypeRevenue: 'نوع کرایه',
    commissionRate: 'میزان کمیسیون',
    commissionScale: 'میزان کمیسیون',
    commission: 'کمیسیون',
    insurance: 'بیمه بار',
    cargoInsurance: 'بیمه بار',
    addedValue: 'ارزش افزوده',
    valueAdded: 'ارزش افزوده',
    commissionReceipt: 'کمیسیون دریافتی',
    receivedCommission: 'کمیسیون دریافتی',
    waybillCommission: 'مازاد بارنامه نویسی',
    waybillExcess: 'مازاد بارنامه نویسی',
    penalty: 'جریمه',
    driverPayment: 'پرداختی به راننده',

    // هزینه‌ها
    servicesFee: 'هزینه باربری',
    loadingCost: 'هزینه بارگیری/خدمات',
    weighingFee: 'حق باسکول',
    queueCost: 'هزینه نوبت',
    maintenanceCost: 'هزینه تعمیرات دوره',
    fuelCost: 'هزینه سوخت',
    excessFuelCost: 'مازاد هزینه سوخت',
    taxiCost: 'هزینه تاکسی',
    phoneCost: 'هزینه تلفن',
    parkingCost: 'هزینه پارکینگ',
    inspectionCost: 'هزینه معاینه',
    expenseCommission: 'کمیسیون',
    highwayToll: 'عوارض بزرگراه',
    waybillFee: 'بارنامه نویسی',
    sleepingFee: 'حق خواب',
    tonKm: 'تن بر کیلومتر',
    miscExpense1Title: 'عنوان هزینه متفرقه یک',
    miscExpense1Amount: 'میزان هزینه متفرقه یک',
    miscExpense2Title: 'عنوان هزینه متفرقه دو',
    miscExpense2Amount: 'میزان هزینه متفرقه دو',
    miscExpense3Title: 'عنوان هزینه متفرقه سه',
    miscExpense3Amount: 'میزان هزینه متفرقه سه',
    totalExpenses: 'جمع همه هزینه‌ها',
    tripBonus: 'پاداش سفر',

    // حساب بانکی
    shabaNumber: 'شماره شبا',
    iban: 'شماره شبا',
    bankName: 'نام بانک',
    accountHolder: 'نام صاحب حساب',
    accountOwner: 'نام صاحب حساب',
    statementNumber: 'شماره صورت حساب',
    statementAmount: 'مبلغ صورت وضعیت',
    totalAccount: 'جمع صورت حساب'
}

const sectionConfig = {
    cargoBase: { label: 'پایه', color: 'var(--info)', bg: 'var(--info-light)' },
    cargoDetails: { label: 'محموله', color: 'var(--primary)', bg: 'var(--primary-light)' },
    financialIncome: { label: 'درآمد', color: 'var(--success)', bg: 'var(--success-light)' },
    financialExpense: { label: 'هزینه', color: 'var(--danger)', bg: 'var(--danger-light)' },
    accountInfo: { label: 'حساب', color: 'var(--warning)', bg: 'var(--warning-light)' }
}

export default function DataDisplayList({ allData }) {
    const getFilledData = () => {
        const filled = []
        Object.entries(allData).forEach(([section, data]) => {
            if (!data) return

            Object.entries(data).forEach(([key, value]) => {
                // فیلتر کردن مقادیر خالی
                if (value === null || value === undefined || value === '') return

                // ⭐ نمایش تاریخ
                let displayValue = value
                if (typeof value === 'object' && value?.jDate) {
                    // اگه یه object تاریخ بود، فقط jDate رو نشون بده
                    displayValue = value.jDate
                } else if (typeof value === 'object' && value?.label) {
                    // اگه یه object با label بود (مثل select2)
                    displayValue = value.label
                }

                filled.push({
                    key: `${section}-${key}`,
                    label: persianLabels[key] || key,
                    value: displayValue,
                    section
                })
            })
        })
        return filled
    }

    const filledData = getFilledData()

    if (filledData.length === 0) {
        return (
            <div className="rounded-xl p-6" style={{ border: '2px dashed var(--border)' }}>
                <div className="text-center py-8">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
                         style={{ background: 'var(--surface-2)' }}>
                        <svg className="w-7 h-7" style={{ color: 'var(--muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>هنوز اطلاعاتی وارد نشده</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>فیلدهای پر شده اینجا نمایش داده می‌شوند</p>
                </div>
            </div>
        )
    }

    return (
        <div className="card">
            <div className="card-header">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-6 rounded-full" style={{ background: 'var(--primary)' }} />
                    <h3 className="card-title">اطلاعات ثبت شده</h3>
                </div>
                <span className="badge badge-primary">{filledData.length}</span>
            </div>

            <div className="max-h-[600px] overflow-y-auto">
                <AnimatePresence>
                    {filledData.map((item, index) => {
                        const sec = sectionConfig[item.section]
                        return (
                            <motion.div key={item.key}
                                        initial={{ opacity: 0, x: -16 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 16 }}
                                        transition={{ delay: index * 0.025 }}
                                        className="px-5 py-3 flex items-start justify-between gap-3 transition-colors"
                                        style={{ borderBottom: '1px solid var(--border)' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold mb-0.5" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
                                    <p className="text-sm font-bold break-words" style={{ color: 'var(--text)' }}>{item.value}</p>
                                </div>
                                {sec && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                                          style={{ color: sec.color, background: sec.bg }}>
                                        {sec.label}
                                    </span>
                                )}
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
            </div>

            <div className="card-footer flex items-center justify-between">
                <span className="text-xs font-medium" style={{ color: 'var(--text-soft)' }}>مجموع فیلدهای پر شده</span>
                <span className="text-xs font-bold" style={{ color: 'var(--text)' }}>{filledData.length} مورد</span>
            </div>
        </div>
    )
}