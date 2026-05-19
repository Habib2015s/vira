'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileInvoiceDollar, faArrowLeft, faSpinner, faCheck, faBan,
    faCreditCard, faBox, faUser, faHashtag, faCalendar,
    faTrash, faRotateLeft, faPen } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import DashboardLayout from "@/app/dashboard/Dashboardlayout"
import Swal from 'sweetalert2'
import { ENV } from '@/app/config/env'

const BASE    = ENV.API_WAREHOUSE_FACTORS
const HEADERS = { 'Content-Type': 'application/json', 'Accept': 'application/json' }

const STATUS_MAP = {
    'pre-invoice': { label: 'پیش‌فاکتور', badge: 'badge-warning',  bg: 'var(--warning-light)',  color: 'var(--warning)'  },
    'invoice':     { label: 'فاکتور',     badge: 'badge-primary',  bg: 'var(--primary-light)',  color: 'var(--primary)'  },
    'confirmed':   { label: 'تأیید شده',  badge: 'badge-success',  bg: 'var(--success-light)',  color: 'var(--success)'  },
    'canceled':    { label: 'لغو شده',    badge: 'badge-danger',   bg: 'var(--danger-light)',   color: 'var(--danger)'   },
}

const MoneyRow = ({ label, value, color = 'var(--text)', bold = false, last = false }) => (
    <div className="flex items-center justify-between py-2.5"
         style={{ borderBottom: last ? 'none' : '1px solid var(--border)' }}>
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}</span>
        <span className={`text-sm font-mono ${bold ? 'font-black text-base' : 'font-bold'}`} style={{ color }}>
            {Number(value).toLocaleString('fa-IR')} ﷼
        </span>
    </div>
)

export default function FactorShowPage() {
    const router = useRouter()
    const { id } = useParams()
    const [data,    setData]    = useState(null)
    const [loading, setLoading] = useState(true)

    const load = () => {
        setLoading(true)
        fetch(`${BASE}/${id}`, { headers: HEADERS })
            .then(r => r.json())
            .then(res => { setData(res.data?.factor || null); setLoading(false) })
            .catch(() => { Swal.fire({ icon: 'error', title: 'خطا', text: 'دریافت ناموفق' }); setLoading(false) })
    }
    useEffect(() => { load() }, [id])

    const confirmMutation = useMutation({
        mutationFn: () => fetch(`${BASE}/${id}/confirm`, { method: 'POST', headers: HEADERS }).then(r => r.json()),
        onSuccess: (res) => {
            if (res.data || res.message) { Swal.fire({ title: 'تأیید شد!', icon: 'success', timer: 1800, showConfirmButton: false }); load() }
            else Swal.fire('خطا!', res.message || 'عملیات انجام نشد', 'error')
        },
        onError: () => Swal.fire('خطا!', 'عملیات انجام نشد', 'error'),
    })
    const cancelMutation = useMutation({
        mutationFn: () => fetch(`${BASE}/${id}/cancel`, { method: 'POST', headers: HEADERS }).then(r => r.json()),
        onSuccess: (res) => {
            if (res.data || res.message) { Swal.fire({ title: 'لغو شد!', icon: 'warning', timer: 1800, showConfirmButton: false }); load() }
            else Swal.fire('خطا!', res.message || 'عملیات انجام نشد', 'error')
        },
        onError: () => Swal.fire('خطا!', 'عملیات انجام نشد', 'error'),
    })
    const deleteItemMutation = useMutation({
        mutationFn: (itemId) => fetch(`${BASE}/${id}/items/${itemId}`, { method: 'DELETE', headers: HEADERS }).then(r => r.json()),
        onSuccess: () => { Swal.fire({ title: 'آیتم حذف شد!', icon: 'success', timer: 1800, showConfirmButton: false }); load() },
        onError: () => Swal.fire('خطا!', 'حذف ناموفق', 'error'),
    })
    const returnItemMutation = useMutation({
        mutationFn: (itemId) => fetch(`${BASE}/${id}/items/${itemId}/return`, { method: 'POST', headers: HEADERS }).then(r => r.json()),
        onSuccess: () => { Swal.fire({ title: 'مرجوع شد!', icon: 'info', timer: 1800, showConfirmButton: false }); load() },
        onError: () => Swal.fire('خطا!', 'مرجوع ناموفق', 'error'),
    })

    const handleConfirm = () =>
        Swal.fire({ title: 'تأیید فاکتور؟', icon: 'question', showCancelButton: true,
            confirmButtonColor: 'var(--success)', confirmButtonText: 'بله، تأیید', cancelButtonText: 'انصراف' })
            .then(r => { if (r.isConfirmed) confirmMutation.mutate() })

    const handleCancel = () =>
        Swal.fire({ title: 'لغو فاکتور؟', icon: 'warning', showCancelButton: true,
            confirmButtonColor: 'var(--danger)', confirmButtonText: 'بله، لغو شود', cancelButtonText: 'انصراف' })
            .then(r => { if (r.isConfirmed) cancelMutation.mutate() })

    if (loading) return (
        <DashboardLayout>
            <div className="w-full min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card text-center p-12">
                    <FontAwesomeIcon icon={faSpinner} className="w-14 h-14 animate-spin mb-5" style={{ color: 'var(--primary)' }} />
                    <p className="font-bold" style={{ color: 'var(--text)' }}>در حال بارگذاری...</p>
                </motion.div>
            </div>
        </DashboardLayout>
    )

    if (!data) return (
        <DashboardLayout>
            <div className="w-full min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
                <div className="card text-center p-12">
                    <p className="font-bold mb-4" style={{ color: 'var(--text)' }}>فاکتور یافت نشد</p>
                    <button onClick={() => router.back()} className="btn btn-back">
                        <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" /> بازگشت
                    </button>
                </div>
            </div>
        </DashboardLayout>
    )

    const statusInfo = STATUS_MAP[data.status] || { label: data.status, badge: 'badge-muted', bg: 'var(--surface-2)', color: 'var(--text-muted)' }
    const canConfirm = !data.is_canceled && data.status !== 'confirmed'
    const canCancel  = !data.is_canceled && data.status !== 'canceled'

    return (
        <DashboardLayout>
            <div className="w-full min-h-screen" style={{ background: 'var(--bg)' }}>

                <div className="page-header-bar">
                    <div className="max-w-5xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                 style={{ background: 'rgba(255,255,255,0.2)' }}>
                                <FontAwesomeIcon icon={faFileInvoiceDollar} className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-xl font-black text-white leading-none">
                                        فاکتور #{data.factor_number}
                                    </h1>
                                    <span className={`badge text-xs ${statusInfo.badge}`}>{statusInfo.label}</span>
                                    {data.is_canceled && <span className="badge badge-danger text-xs">لغو شده</span>}
                                </div>
                                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
                                    {new Date(data.created_at).toLocaleDateString('fa-IR')} —
                                    مشتری: {data.customer?.name} {data.customer?.family || ''}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap justify-end">
                            {/* ویرایش */}
                            <Link href={`/warehouse/factors/${id}/edit`}>
                                <button className="btn btn-warning btn-sm">
                                    <FontAwesomeIcon icon={faPen} className="w-3.5 h-3.5" />ویرایش
                                </button>
                            </Link>
                            {/* پرداخت */}
                            <Link href={`/warehouse/factors/${id}/payment`}>
                                <button className="btn btn-sm" style={{ background: 'var(--info)', color: '#fff' }}>
                                    <FontAwesomeIcon icon={faCreditCard} className="w-3.5 h-3.5" />پرداخت
                                </button>
                            </Link>
                            {/* تأیید */}
                            {canConfirm && (
                                <button onClick={handleConfirm} disabled={confirmMutation.isPending}
                                        className="btn btn-success btn-sm">
                                    <FontAwesomeIcon icon={confirmMutation.isPending ? faSpinner : faCheck}
                                                     className={`w-3.5 h-3.5 ${confirmMutation.isPending ? 'animate-spin' : ''}`} />
                                    تأیید
                                </button>
                            )}
                            {/* لغو */}
                            {canCancel && (
                                <button onClick={handleCancel} disabled={cancelMutation.isPending}
                                        className="btn btn-danger btn-sm">
                                    <FontAwesomeIcon icon={cancelMutation.isPending ? faSpinner : faBan}
                                                     className={`w-3.5 h-3.5 ${cancelMutation.isPending ? 'animate-spin' : ''}`} />
                                    لغو
                                </button>
                            )}
                            <button onClick={() => router.back()} className="btn btn-back btn-sm">
                                <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" />بازگشت
                            </button>
                        </div>
                    </div>
                </div>

                <div className="page-content max-w-5xl">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                        {/* ── ستون چپ ── */}
                        <div className="lg:col-span-2 space-y-4">

                            {/* بنر وضعیت */}
                            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                        className="rounded-2xl p-4 flex items-center justify-between"
                                        style={{ background: statusInfo.bg, border: `1px solid ${statusInfo.color}22` }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                         style={{ background: statusInfo.color + '22' }}>
                                        <FontAwesomeIcon icon={faFileInvoiceDollar} className="w-4 h-4" style={{ color: statusInfo.color }} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black" style={{ color: statusInfo.color }}>وضعیت: {statusInfo.label}</p>
                                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                            شناسه #{data.id} — شماره {data.factor_number}
                                        </p>
                                    </div>
                                </div>
                                {data.is_canceled && (
                                    <span className="badge badge-danger">فاکتور لغو شده است</span>
                                )}
                            </motion.div>

                            {/* مشتری */}
                            {data.customer && (
                                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                                            className="card">
                                    <div className="card-header">
                                        <p className="card-title text-sm">مشتری</p>
                                    </div>
                                    <div className="card-body flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                             style={{ background: 'var(--primary-light)' }}>
                                            <FontAwesomeIcon icon={faUser} className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold" style={{ color: 'var(--text)' }}>
                                                {data.customer.name} {data.customer.family || ''}
                                            </p>
                                            <div className="flex items-center gap-3 text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                                {data.customer.phone && <span>{data.customer.phone}</span>}
                                                {data.customer.national_code && <span>کد: {data.customer.national_code}</span>}
                                            </div>
                                        </div>
                                        <Link href={`/warehouse/customers/${data.customer_id}`}>
                                            <button className="btn btn-secondary btn-sm">مشاهده مشتری</button>
                                        </Link>
                                    </div>
                                </motion.div>
                            )}

                            {/* آیتم‌ها */}
                            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
                                        className="card">
                                <div className="card-header">
                                    <p className="card-title">آیتم‌های فاکتور</p>
                                    <span className="badge badge-primary">{data.items?.length || 0} آیتم</span>
                                </div>
                                <div className="card-body p-0">
                                    {!data.items?.length ? (
                                        <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>
                                            <FontAwesomeIcon icon={faBox} className="w-10 h-10 mb-2 opacity-30" />
                                            <p className="text-sm">این فاکتور آیتمی ندارد</p>
                                            <Link href={`/warehouse/factors/${id}/edit`}>
                                                <button className="btn btn-primary btn-sm mt-3">افزودن آیتم</button>
                                            </Link>
                                        </div>
                                    ) : data.items.map((item, i) => (
                                        <motion.div key={item.id}
                                                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.04 }}
                                                    className="px-4 py-3.5"
                                                    style={{ borderBottom: i < data.items.length - 1 ? '1px solid var(--border)' : 'none' }}
                                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                                     style={{ background: 'var(--primary-light)' }}>
                                                    <FontAwesomeIcon icon={faBox} className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>
                                                            محصول #{item.product_id}
                                                        </p>
                                                        <span className={`badge text-xs ${item.status === 'sold' ? 'badge-success' : 'badge-warning'}`}>
                                                            {item.status === 'sold' ? 'فروخته شده' : item.status}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4 mt-1 text-xs flex-wrap" style={{ color: 'var(--text-muted)' }}>
                                                        <span>تعداد: <strong>{item.count}</strong></span>
                                                        <span>قیمت واحد: <strong>{Number(item.single_amount).toLocaleString('fa-IR')}</strong></span>
                                                        {item.discount > 0 && <span>تخفیف: <strong style={{ color: 'var(--danger)' }}>{Number(item.discount).toLocaleString('fa-IR')}</strong></span>}
                                                    </div>
                                                </div>
                                                <div className="text-left flex-shrink-0 ml-2">
                                                    <p className="text-sm font-black" style={{ color: 'var(--success)' }}>
                                                        {Number(item.discount_with_amount).toLocaleString('fa-IR')} ﷼
                                                    </p>
                                                    <p className="text-xs line-through text-right" style={{ color: 'var(--text-muted)' }}>
                                                        {Number(item.amount).toLocaleString('fa-IR')}
                                                    </p>
                                                </div>
                                                {/* اکشن‌های آیتم */}
                                                <div className="flex gap-1 flex-shrink-0">
                                                    <button title="مرجوع کردن"
                                                            onClick={() => Swal.fire({
                                                                title: 'مرجوع کردن آیتم؟',
                                                                text:  'این آیتم به انبار برمی‌گردد',
                                                                icon: 'question', showCancelButton: true,
                                                                confirmButtonText: 'بله', cancelButtonText: 'انصراف'
                                                            }).then(r => { if (r.isConfirmed) returnItemMutation.mutate(item.id) })}
                                                            className="action-btn w-7 h-7"
                                                            style={{ background: 'var(--info-light)', color: 'var(--info)' }}>
                                                        <FontAwesomeIcon icon={returnItemMutation.isPending ? faSpinner : faRotateLeft}
                                                                         className={`w-3 h-3 ${returnItemMutation.isPending ? 'animate-spin' : ''}`} />
                                                    </button>
                                                    <button title="حذف آیتم"
                                                            onClick={() => Swal.fire({
                                                                title: 'حذف آیتم؟',
                                                                icon: 'warning', showCancelButton: true,
                                                                confirmButtonColor: 'var(--danger)',
                                                                confirmButtonText: 'حذف', cancelButtonText: 'انصراف'
                                                            }).then(r => { if (r.isConfirmed) deleteItemMutation.mutate(item.id) })}
                                                            className="action-btn action-btn-delete w-7 h-7">
                                                        <FontAwesomeIcon icon={deleteItemMutation.isPending ? faSpinner : faTrash}
                                                                         className={`w-3 h-3 ${deleteItemMutation.isPending ? 'animate-spin' : ''}`} />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        {/* ── ستون راست ── */}
                        <div className="space-y-4">

                            {/* خلاصه مالی */}
                            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.06 }}
                                        className="card">
                                <div className="card-header">
                                    <p className="card-title text-sm">خلاصه مالی</p>
                                </div>
                                <div className="card-body">
                                    <MoneyRow label="جمع کل"           value={data.total_amount} />
                                    <MoneyRow label="تخفیف"            value={data.total_discount}             color="var(--danger)" />
                                    <MoneyRow label="مالیات"           value={data.total_tax}                  color="var(--warning)" />
                                    <MoneyRow label="مبلغ نهایی"       value={data.total_amount_with_discount} color="var(--success)" bold />
                                    <div className="my-2 h-px" style={{ background: 'var(--border)' }} />
                                    <MoneyRow label="پرداخت کارت"      value={data.amount_paid_by_card}        color="var(--info)" />
                                    <MoneyRow label="پرداخت نقد"       value={data.amount_paid_by_cash}        color="var(--info)" />
                                    <MoneyRow label="پرداخت چک"        value={data.amount_paid_by_check}       color="var(--info)" />
                                    <MoneyRow label="کل پرداخت"        value={data.total_amount_paid}          color="var(--primary)" bold />
                                    {/* مانده بدهی */}
                                    <div className="mt-3 p-4 rounded-xl text-center"
                                         style={{
                                             background: data.amount_owed > 0 ? 'var(--danger-light)' : 'var(--success-light)',
                                             border:     `1px solid ${data.amount_owed > 0 ? 'var(--danger)' : 'var(--success)'}33`
                                         }}>
                                        <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>مانده بدهی</p>
                                        <p className="text-2xl font-black font-mono"
                                           style={{ color: data.amount_owed > 0 ? 'var(--danger)' : 'var(--success)' }}>
                                            {Number(data.amount_owed).toLocaleString('fa-IR')} ﷼
                                        </p>
                                        {data.amount_owed === 0 && (
                                            <p className="text-xs font-bold mt-1" style={{ color: 'var(--success)' }}>✓ تسویه شده</p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>

                            {/* تاریخچه */}
                            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                                        className="card">
                                <div className="card-header">
                                    <p className="card-title text-sm">جزئیات</p>
                                </div>
                                <div className="card-body p-0">
                                    {[
                                        { icon: faHashtag,  label: 'شناسه',          value: `#${data.id}`,             bg: 'var(--primary-light)',  color: 'var(--primary)' },
                                        { icon: faHashtag,  label: 'شماره فاکتور',  value: data.factor_number,         bg: 'var(--info-light)',     color: 'var(--info)'    },
                                        { icon: faCalendar, label: 'تاریخ ایجاد',    value: new Date(data.created_at).toLocaleDateString('fa-IR'), bg: 'var(--warning-light)', color: 'var(--warning)' },
                                        { icon: faCalendar, label: 'آخرین ویرایش',   value: new Date(data.updated_at).toLocaleDateString('fa-IR'), bg: 'var(--surface-2)',     color: 'var(--muted)'   },
                                    ].map(({ icon, label, value, bg, color }, i, arr) => (
                                        <div key={label} className="flex items-center gap-3 px-4 py-3"
                                             style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                                                <FontAwesomeIcon icon={icon} className="w-3 h-3" style={{ color }} />
                                            </div>
                                            <div className="flex-1 flex justify-between">
                                                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
                                                <span className="text-xs font-bold" style={{ color: 'var(--text)' }}>{value}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}