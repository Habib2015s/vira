'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faSpinner, faEdit, faFileLines } from '@fortawesome/free-solid-svg-icons'
// ── کامپوننت‌های کمکی ─────────────────────────────────

// یه فیلد اطلاعاتی — label بالا، value پایین
const InfoItem = ({ label, value }) => (
    <div className="rounded-xl p-4" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
        <p className="text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
        <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{value || '—'}</p>
    </div>
)

// سرفصل بخش — با رنگ از CSS variable
const SectionTitle = ({ title, colorVar = 'var(--primary)', bgVar = 'var(--primary-light)' }) => (
    <div className="flex items-center gap-3 mb-5">
        <div className="w-1 h-6 rounded-full flex-shrink-0" style={{ background: colorVar }} />
        <h2 className="text-base font-black" style={{ color: 'var(--text)' }}>{title}</h2>
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
    </div>
)

// خط جداکننده بخش‌ها
const Divider = () => <div className="my-8 h-px" style={{ background: 'var(--border)' }} />

// ──────────────────────────────────────────────────────
export default function WaybillShowPage() {
    const params  = useParams()
    const router  = useRouter()
    const [waybill,  setWaybill]  = useState(null)
    const [loading,  setLoading]  = useState(true)

    const mockData = {
        cargo_base: {
            date: '۱۴۰۴/۱۱/۲۰', waybillNumber: params?.id || '۱۳۹۵',
            waybillCompany: 'WB-2024-001', serialNumber: '001',
            statusConfirm: 'ثبت و تایید راهبری',
            sender: { label: 'شرکت الف' }, senderTitle: 'تولیدی الف',
            senderAddress: 'تهران، خیابان ولیعصر، پلاک ۱۰',
            receiver: { label: 'شرکت ب' }, receiverEconomicCode: '۰۹۸۷۶۵۴۳۲۱',
            receiverNationalCode: '۲۰۰۰۰۰۰۰۰۰', receiverPostalCode: '۰۹۸۷۶۵۴۳۲۱',
            receiverAddress: 'اصفهان، خیابان چهارباغ، پلاک ۲۰',
            expenseCost: { label: 'مرکز ۱' }, machineSmartCard: 'VC-12345', plate: '۱۲ب۳۴۵۶۷',
            driverType: { label: 'کامیون ۱۸ تن' }, driverName: 'کامیون اسکانیا',
            driverId: { label: 'علی رضایی' }, firstDriverCard: 'DC-54321',
            firstDriverName: 'علی رضایی', firstDriverNationalId: '۰۱۲۳۴۵۶۷۸۹',
            fatherName: 'محمد', mobile: '۰۹۱۲۳۴۵۶۷۸۹', certificateNumber: 'C-789',
            certificateIssuePlace: { label: 'تهران' }
        },
        cargo_details: {
            cargoType: { label: 'مواد غذایی' }, cargoDescription: 'کنسرو ماهی',
            packaging: { label: 'جعبه' }, count: '۱۰۰', originWeight: '۵۰۰۰',
            destinationWeight: '۴۹۵۰', realCargoValue: '۱۵۰,۰۰۰,۰۰۰',
            weightDiff: '-۵۰', origin: { label: 'تهران' }, destination: { label: 'اصفهان' }
        },
        financial_income: {
            payablePrice: '۱۰,۰۰۰,۰۰۰', priceAdvance: '۳,۰۰۰,۰۰۰',
            outPriceAdvance: '۷,۰۰۰,۰۰۰', cargoTypeRevenue: 'کرایه مبدا',
            commissionScale: '۱۲.۵۰', insurance: '۵۰۰,۰۰۰', cargo: '۲۰۰,۰۰۰',
            addedValue: '۱,۰۰۰,۰۰۰', commissionReceipt: '۳۰۰,۰۰۰', waybillCommission: '۱۰۰,۰۰۰'
        },
        financial_expense: {
            servicesFee: '۵۰۰,۰۰۰', oilFee: '۱۰۰,۰۰۰', repairFee: '۲۰۰,۰۰۰',
            periodicRepairFee: '۱۵۰,۰۰۰', fuelFee: '۳,۰۰۰,۰۰۰', excessFuelFee: '۵۰۰,۰۰۰',
            phoneFee: '۵۰,۰۰۰', loadingFee: '۳۰۰,۰۰۰', inspectionFee: '۱۵۰,۰۰۰',
            commission: '۴۰۰,۰۰۰', tollFee: '۳۰۰,۰۰۰', waybillFee: '۱۰۰,۰۰۰',
            sleepFee: '۲۰۰,۰۰۰', miscExpense1Title: 'هزینه باربری', miscExpense1Amount: '۵۰,۰۰۰',
            miscExpense2Title: 'هزینه انبار', miscExpense2Amount: '۳۰,۰۰۰',
            miscExpense3Title: 'سایر', miscExpense3Amount: '۲۰,۰۰۰',
            totalExpenses: '۵,۵۰۰,۰۰۰', tripNote: 'سفر انجام شد',
            shabaNumber: 'IR123456789012345678901234', bankName: { label: 'ملی' },
            accountHolder: 'علی رضایی', invoiceNumber: 'INV-1395',
            invoiceAmount: '۶,۵۰۰,۰۰۰', totalInvoice: '۶,۵۰۰,۰۰۰'
        }
    }

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true)
                await new Promise(r => setTimeout(r, 600))
                setWaybill(mockData)
            } finally { setLoading(false) }
        }
        load()
    }, [params?.id])

    if (loading) return (
            <div className="w-full min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card text-center p-12">
                    <FontAwesomeIcon icon={faSpinner} className="w-14 h-14 animate-spin mb-5" style={{ color: 'var(--primary)' }} />
                    <p className="text-xl font-black mb-1" style={{ color: 'var(--text)' }}>در حال بارگذاری...</p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>بارنامه #{params?.id}</p>
                </motion.div>
            </div>
    )

    if (!waybill) return null

    return (
            <div className="w-full min-h-screen" style={{ background: 'var(--bg)' }}>

                {/* ── هدر ── */}
                <div className="page-header-bar">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                 style={{ background: 'rgba(255,255,255,0.2)' }}>
                                <FontAwesomeIcon icon={faFileLines} className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-white leading-none">
                                    بارنامه شماره {waybill.cargo_base.waybillNumber}
                                </h1>
                                <p className="text-xs mt-1 flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                                    <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#34d399' }} />
                                    جزئیات کامل بارنامه
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => router.push(`/waybills/edit/${params?.id}`)} className="btn btn-warning btn-sm">
                                <FontAwesomeIcon icon={faEdit} className="w-3.5 h-3.5" />
                                ویرایش
                            </button>
                            <button onClick={() => router.back()} className="btn btn-back btn-sm">
                                <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" />
                                بازگشت
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── محتوا ── */}
                <div className="page-content max-w-7xl">
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card">
                        <div className="card-body" style={{ padding: '28px' }}>

                            {/* اطلاعات اولیه */}
                            <SectionTitle title="اطلاعات اولیه بارنامه" colorVar="var(--primary)" />
                            <div className="grid grid-cols-5 gap-4 mb-2">
                                <InfoItem label="تاریخ"                  value={waybill.cargo_base.date} />
                                <InfoItem label="شماره بارنامه"          value={waybill.cargo_base.waybillNumber} />
                                <InfoItem label="شماره بارنامه شرکت"     value={waybill.cargo_base.waybillCompany} />
                                <InfoItem label="سری بارنامه"            value={waybill.cargo_base.serialNumber} />
                                <InfoItem label="وضعیت ثبت"              value={waybill.cargo_base.statusConfirm} />
                            </div>

                            <Divider />

                            {/* فرستنده */}
                            <SectionTitle title="اطلاعات فرستنده" colorVar="var(--info)" />
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <InfoItem label="فرستنده"      value={waybill.cargo_base.sender?.label} />
                                <InfoItem label="عنوان فرستنده" value={waybill.cargo_base.senderTitle} />
                            </div>
                            <div className="mb-2">
                                <InfoItem label="آدرس فرستنده" value={waybill.cargo_base.senderAddress} />
                            </div>

                            <Divider />

                            {/* گیرنده */}
                            <SectionTitle title="اطلاعات گیرنده" colorVar="var(--success)" />
                            <div className="grid grid-cols-4 gap-4 mb-4">
                                <InfoItem label="گیرنده"      value={waybill.cargo_base.receiver?.label} />
                                <InfoItem label="کد اقتصادی"  value={waybill.cargo_base.receiverEconomicCode} />
                                <InfoItem label="کد ملی"       value={waybill.cargo_base.receiverNationalCode} />
                                <InfoItem label="کدپستی"       value={waybill.cargo_base.receiverPostalCode} />
                            </div>
                            <div className="mb-2">
                                <InfoItem label="آدرس گیرنده" value={waybill.cargo_base.receiverAddress} />
                            </div>

                            <Divider />

                            {/* خودرو و راننده */}
                            <SectionTitle title="اطلاعات خودرو و راننده" colorVar="var(--warning)" />
                            <div className="grid grid-cols-5 gap-4 mb-4">
                                <InfoItem label="مرکز هزینه"    value={waybill.cargo_base.expenseCost?.label} />
                                <InfoItem label="کارت هوشمند"   value={waybill.cargo_base.machineSmartCard} />
                                <InfoItem label="پلاک"           value={waybill.cargo_base.plate} />
                                <InfoItem label="نوع بارگیر"     value={waybill.cargo_base.driverType?.label} />
                                <InfoItem label="نام کامیون"     value={waybill.cargo_base.driverName} />
                            </div>
                            <div className="grid grid-cols-4 gap-4 mb-4">
                                <InfoItem label="راننده"                  value={waybill.cargo_base.driverId?.label} />
                                <InfoItem label="کارت هوشمند راننده"      value={waybill.cargo_base.firstDriverCard} />
                                <InfoItem label="نام راننده"              value={waybill.cargo_base.firstDriverName} />
                                <InfoItem label="کدملی راننده"            value={waybill.cargo_base.firstDriverNationalId} />
                            </div>
                            <div className="grid grid-cols-4 gap-4 mb-2">
                                <InfoItem label="نام پدر"         value={waybill.cargo_base.fatherName} />
                                <InfoItem label="موبایل"          value={waybill.cargo_base.mobile} />
                                <InfoItem label="شماره گواهینامه" value={waybill.cargo_base.certificateNumber} />
                                <InfoItem label="محل صدور"        value={waybill.cargo_base.certificateIssuePlace?.label} />
                            </div>

                            <Divider />

                            {/* محموله */}
                            <SectionTitle title="اطلاعات محموله" colorVar="var(--danger)" />
                            <div className="grid grid-cols-6 gap-4 mb-4">
                                <InfoItem label="نوع محموله"   value={waybill.cargo_details.cargoType?.label} />
                                <InfoItem label="شرح محموله"   value={waybill.cargo_details.cargoDescription} />
                                <InfoItem label="بسته‌بندی"    value={waybill.cargo_details.packaging?.label} />
                                <InfoItem label="تعداد"         value={waybill.cargo_details.count} />
                                <InfoItem label="وزن مبدا"     value={waybill.cargo_details.originWeight} />
                                <InfoItem label="وزن مقصد"     value={waybill.cargo_details.destinationWeight} />
                            </div>
                            <div className="grid grid-cols-4 gap-4 mb-2">
                                <InfoItem label="ارزش محموله"  value={waybill.cargo_details.realCargoValue + ' ریال'} />
                                <InfoItem label="اختلاف وزن"   value={waybill.cargo_details.weightDiff} />
                                <InfoItem label="مبدا"          value={waybill.cargo_details.origin?.label} />
                                <InfoItem label="مقصد"          value={waybill.cargo_details.destination?.label} />
                            </div>

                            <Divider />

                            {/* درآمدها */}
                            <SectionTitle title="درآمدها (ریال)" colorVar="var(--success)" />
                            <div className="grid grid-cols-5 gap-4 mb-4">
                                <InfoItem label="کرایه پایه"      value={waybill.financial_income.payablePrice} />
                                <InfoItem label="کرایه باقیمانده" value={waybill.financial_income.priceAdvance} />
                                <InfoItem label="کرایه پرداختی"   value={waybill.financial_income.outPriceAdvance} />
                                <InfoItem label="نوع کرایه"        value={waybill.financial_income.cargoTypeRevenue} />
                                <InfoItem label="میزان کمیسیون"    value={waybill.financial_income.commissionScale + '%'} />
                            </div>
                            <div className="grid grid-cols-5 gap-4 mb-2">
                                <InfoItem label="کمیسیون"          value={waybill.financial_income.insurance} />
                                <InfoItem label="بیمه بار"          value={waybill.financial_income.cargo} />
                                <InfoItem label="ارزش افزوده"       value={waybill.financial_income.addedValue} />
                                <InfoItem label="کمیسیون دریافتی"   value={waybill.financial_income.commissionReceipt} />
                                <InfoItem label="مازاد بارنامه‌نویسی" value={waybill.financial_income.waybillCommission} />
                            </div>

                            <Divider />

                            {/* هزینه‌ها */}
                            <SectionTitle title="هزینه‌ها (ریال)" colorVar="var(--danger)" />
                            <div className="grid grid-cols-5 gap-4 mb-4">
                                <InfoItem label="هزینه خدمات"    value={waybill.financial_expense.servicesFee} />
                                <InfoItem label="حق ناسکول"       value={waybill.financial_expense.oilFee} />
                                <InfoItem label="هزینه ثبوت"      value={waybill.financial_expense.repairFee} />
                                <InfoItem label="تعمیرات دوره"    value={waybill.financial_expense.periodicRepairFee} />
                                <InfoItem label="هزینه سوخت"      value={waybill.financial_expense.fuelFee} />
                            </div>
                            <div className="grid grid-cols-4 gap-4 mb-4">
                                <InfoItem label="مازاد سوخت"     value={waybill.financial_expense.excessFuelFee} />
                                <InfoItem label="هزینه تلفن"     value={waybill.financial_expense.phoneFee} />
                                <InfoItem label="هزینه بارگیری"  value={waybill.financial_expense.loadingFee} />
                                <InfoItem label="هزینه معاینه"   value={waybill.financial_expense.inspectionFee} />
                            </div>
                            <div className="grid grid-cols-4 gap-4 mb-4">
                                <InfoItem label="کمیسیون"         value={waybill.financial_expense.commission} />
                                <InfoItem label="عوارض"           value={waybill.financial_expense.tollFee} />
                                <InfoItem label="بارنامه‌نویسی"  value={waybill.financial_expense.waybillFee} />
                                <InfoItem label="حق خواب"         value={waybill.financial_expense.sleepFee} />
                            </div>

                            {/* هزینه‌های متفرقه */}
                            {(waybill.financial_expense.miscExpense1Title || waybill.financial_expense.miscExpense2Title) && (
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    {waybill.financial_expense.miscExpense1Title && <InfoItem label={waybill.financial_expense.miscExpense1Title} value={waybill.financial_expense.miscExpense1Amount} />}
                                    {waybill.financial_expense.miscExpense2Title && <InfoItem label={waybill.financial_expense.miscExpense2Title} value={waybill.financial_expense.miscExpense2Amount} />}
                                    {waybill.financial_expense.miscExpense3Title && <InfoItem label={waybill.financial_expense.miscExpense3Title} value={waybill.financial_expense.miscExpense3Amount} />}
                                </div>
                            )}

                            {/* جمع هزینه‌ها — هایلایت */}
                            <div className="p-4 rounded-xl mb-2"
                                 style={{ background: 'var(--danger-light)', border: '1.5px solid var(--danger)' }}>
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-sm" style={{ color: 'var(--danger)' }}>جمع کل هزینه‌ها</span>
                                    <span className="font-black text-lg" style={{ color: 'var(--danger)' }}>
                                        {waybill.financial_expense.totalExpenses} ریال
                                    </span>
                                </div>
                            </div>

                            <Divider />

                            {/* اطلاعات حساب */}
                            <SectionTitle title="اطلاعات حساب" colorVar="var(--info)" />
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <InfoItem label="شماره شبا"        value={waybill.financial_expense.shabaNumber} />
                                <InfoItem label="نام بانک"          value={waybill.financial_expense.bankName?.label} />
                                <InfoItem label="نام صاحب حساب"    value={waybill.financial_expense.accountHolder} />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <InfoItem label="شماره صورت‌حساب"  value={waybill.financial_expense.invoiceNumber} />
                                <InfoItem label="مبلغ صورت‌وضعیت" value={waybill.financial_expense.invoiceAmount} />
                                <InfoItem label="جمع صورت‌حساب"    value={waybill.financial_expense.totalInvoice} />
                            </div>

                        </div>
                    </motion.div>
                </div>
            </div>
    )
}