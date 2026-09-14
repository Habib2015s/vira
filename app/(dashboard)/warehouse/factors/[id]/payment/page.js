'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileInvoiceDollar, faArrowLeft, faSpinner, faCheck, faBan,
    faCreditCard, faBox, faUser, faHashtag, faCalendar,
    faTrash, faRotateLeft } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import Swal from '@/app/utils/swal'
import { ENV, getHeaders } from '@/app/config/env'

const BASE    = ENV.API_WAREHOUSE_FACTORS

const STATUS_MAP = {
    'pre-invoice': { label: 'پیش‌فاکتور', badge: 'badge-warning' },
    'invoice':     { label: 'فاکتور',     badge: 'badge-primary' },
    'confirmed':   { label: 'تأیید شده',  badge: 'badge-success' },
    'canceled':    { label: 'لغو شده',    badge: 'badge-danger'  },
}

const MoneyRow = ({ label, value, color = 'var(--text)', bold = false }) => (
    <div className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}</span>
        <span className={`text-sm font-mono ${bold ? 'font-black' : 'font-bold'}`} style={{ color }}>
            {Number(value).toLocaleString('fa-IR')} ﷼
        </span>
    </div>
)

export default function FactorShowPage() {
    const router      = useRouter()
    const { id }      = useParams()
    const queryClient = useQueryClient()
    const [data,    setData]    = useState(null)
    const [loading, setLoading] = useState(true)

    const load = () => {
        setLoading(true)
        fetch(`${BASE}/${id}`, { headers: getHeaders() })
            .then(r => r.json())
            .then(res => { setData(res.data?.factor || null); setLoading(false) })
            .catch(() => { Swal.fire({ icon: 'error', title: 'خطا', text: 'دریافت ناموفق' }); setLoading(false) })
    }
    useEffect(() => { load() }, [id])

    const confirmMutation = useMutation({
        mutationFn: () => fetch(`${BASE}/${id}/confirm`, { method: 'POST', headers: getHeaders() }).then(r => r.json()),
        onSuccess: () => { Swal.fire({ title: 'تأیید شد!', icon: 'success', timer: 1800, showConfirmButton: false }); load() },
        onError: () => Swal.fire('خطا!', 'عملیات انجام نشد', 'error'),
    })
    const cancelMutation = useMutation({
        mutationFn: () => fetch(`${BASE}/${id}/cancel`, { method: 'POST', headers: getHeaders() }).then(r => r.json()),
        onSuccess: () => { Swal.fire({ title: 'لغو شد!', icon: 'warning', timer: 1800, showConfirmButton: false }); load() },
        onError: () => Swal.fire('خطا!', 'عملیات انجام نشد', 'error'),
    })
    const deleteItemMutation = useMutation({
        mutationFn: (itemId) => fetch(`${BASE}/${id}/items/${itemId}`, { method: 'DELETE', headers: getHeaders() }).then(r => r.json()),
        onSuccess: () => { Swal.fire({ title: 'آیتم حذف شد!', icon: 'success', timer: 1800, showConfirmButton: false }); load() },
        onError: () => Swal.fire('خطا!', 'حذف ناموفق', 'error'),
    })
    const returnItemMutation = useMutation({
        mutationFn: (itemId) => fetch(`${BASE}/${id}/items/${itemId}/return`, { method: 'POST', headers: getHeaders() }).then(r => r.json()),
        onSuccess: () => { Swal.fire({ title: 'مرجوع شد!', icon: 'info', timer: 1800, showConfirmButton: false }); load() },
        onError: () => Swal.fire('خطا!', 'مرجوع ناموفق', 'error'),
    })

    if (loading) return (
            <div className="w-full min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card text-center p-12">
                    <FontAwesomeIcon icon={faSpinner} className="w-14 h-14 animate-spin mb-5" style={{ color: 'var(--primary)' }} />
                    <p className="font-bold" style={{ color: 'var(--text)' }}>در حال بارگذاری...</p>
                </motion.div>
            </div>
    )

    if (!data) return (
            <div className="w-full min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
                <div className="card text-center p-12">
                    <p className="font-bold mb-4" style={{ color: 'var(--text)' }}>فاکتور یافت نشد</p>
                    <button onClick={() => router.back()} className="btn btn-back">
                        <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" /> بازگشت
                    </button>
                </div>
            </div>
    )

    const statusInfo  = STATUS_MAP[data.status] || { label: data.status, badge: 'badge-muted' }
    const canConfirm  = !data.is_canceled && data.status !== 'confirmed'
    const canCancel   = !data.is_canceled && data.status !== 'canceled'

    return (
            <div className="w-full min-h-screen" style={{ background: 'var(--bg)' }}>
                <div className="page-header-bar">
                    <div className="max-w-5xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                 style={{ background: 'rgba(255,255,255,0.2)' }}>
                                <FontAwesomeIcon icon={faFileInvoiceDollar} className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-xl font-black text-white leading-none">
                                        فاکتور #{data.factor_number}
                                    </h1>
                                    <span className={`badge text-xs ${statusInfo.badge}`}>{statusInfo.label}</span>
                                    {data.is_canceled && <span className="badge badge-danger text-xs">لغو شده</span>}
                                </div>
                                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
                                    {new Date(data.created_at).toLocaleDateString('fa-IR')}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap justify-end">
                            <Link href={`/warehouse/factors/${id}/payment`}>
                                <button className="btn btn-sm" style={{ background: 'var(--info)', color: '#fff' }}>
                                    <FontAwesomeIcon icon={faCreditCard} className="w-3.5 h-3.5" />پرداخت
                                </button>
                            </Link>
                            {canConfirm && (
                                <button onClick={() => confirmMutation.mutate()} disabled={confirmMutation.isPending}
                                        className="btn btn-success btn-sm">
                                    <FontAwesomeIcon icon={confirmMutation.isPending ? faSpinner : faCheck}
                                                     className={`w-3.5 h-3.5 ${confirmMutation.isPending ? 'animate-spin' : ''}`} />
                                    تأیید
                                </button>
                            )}
                            {canCancel && (
                                <button onClick={() => cancelMutation.mutate()} disabled={cancelMutation.isPending}
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

                        {/* ── ستون چپ: آیتم‌ها ── */}
                        <div className="lg:col-span-2 space-y-4">

                            {/* اطلاعات مشتری */}
                            {data.customer && (
                                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card">
                                    <div className="card-header">
                                        <p className="card-title text-sm">مشتری</p>
                                    </div>
                                    <div className="card-body flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                             style={{ background: 'var(--primary-light)' }}>
                                            <FontAwesomeIcon icon={faUser} className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                                        </div>
                                        <div>
                                            <p className="font-bold" style={{ color: 'var(--text)' }}>
                                                {data.customer.name} {data.customer.family || ''}
                                            </p>
                                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{data.customer.phone}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* آیتم‌ها */}
                            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                                        className="card">
                                <div className="card-header">
                                    <p className="card-title">آیتم‌های فاکتور</p>
                                    <span className="badge badge-primary">{data.items?.length || 0} آیتم</span>
                                </div>
                                <div className="card-body p-0">
                                    {!data.items?.length ? (
                                        <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>
                                            <FontAwesomeIcon icon={faBox} className="w-10 h-10 mb-2 opacity-30" />
                                            <p className="text-sm">آیتمی ندارد</p>
                                        </div>
                                    ) : (
                                        data.items.map((item, i) => (
                                            <motion.div key={item.id}
                                                        initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: i * 0.05 }}
                                                        className="flex items-center gap-3 px-4 py-3.5"
                                                        style={{ borderBottom: i < data.items.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                                     style={{ background: 'var(--primary-light)' }}>
                                                    <FontAwesomeIcon icon={faBox} className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>محصول #{item.product_id}</p>
                                                        <span className={`badge text-xs ${item.status === 'sold' ? 'badge-success' : 'badge-warning'}`}>
                                                            {item.status === 'sold' ? 'فروخته شده' : item.status}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                                                        <span>تعداد: {item.count}</span>
                                                        <span>قیمت واحد: {Number(item.single_amount).toLocaleString('fa-IR')}</span>
                                                        {item.discount > 0 && <span>تخفیف: {Number(item.discount).toLocaleString('fa-IR')}</span>}
                                                    </div>
                                                </div>
                                                <div className="text-left ml-2">
                                                    <p className="text-sm font-black" style={{ color: 'var(--success)' }}>
                                                        {Number(item.discount_with_amount).toLocaleString('fa-IR')} ﷼
                                                    </p>
                                                </div>
                                                {/* اکشن آیتم */}
                                                <div className="flex gap-1 flex-shrink-0">
                                                    <button onClick={() => {
                                                        Swal.fire({ title: 'مرجوع آیتم؟', icon: 'question', showCancelButton: true,
                                                            confirmButtonText: 'بله', cancelButtonText: 'خیر' })
                                                            .then(r => { if (r.isConfirmed) returnItemMutation.mutate(item.id) })
                                                    }} className="action-btn w-7 h-7" style={{ background: 'var(--info-light)', color: 'var(--info)' }}
                                                            title="مرجوع کردن">
                                                        <FontAwesomeIcon icon={faRotateLeft} className="w-3 h-3" />
                                                    </button>
                                                    <button onClick={() => {
                                                        Swal.fire({ title: 'حذف آیتم؟', icon: 'warning', showCancelButton: true,
                                                            confirmButtonColor: 'var(--danger)', confirmButtonText: 'حذف', cancelButtonText: 'انصراف' })
                                                            .then(r => { if (r.isConfirmed) deleteItemMutation.mutate(item.id) })
                                                    }} className="action-btn action-btn-delete w-7 h-7" title="حذف آیتم">
                                                        <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        </div>

                        {/* ── ستون راست: مالی ── */}
                        <div className="space-y-4">
                            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.06 }}
                                        className="card">
                                <div className="card-header">
                                    <p className="card-title text-sm">خلاصه مالی</p>
                                </div>
                                <div className="card-body">
                                    <MoneyRow label="جمع کل"           value={data.total_amount} />
                                    <MoneyRow label="تخفیف"            value={data.total_discount}              color="var(--danger)" />
                                    <MoneyRow label="مالیات"           value={data.total_tax}                   color="var(--warning)" />
                                    <MoneyRow label="مبلغ نهایی"       value={data.total_amount_with_discount}  color="var(--success)" bold />
                                    <div className="my-2 h-px" style={{ background: 'var(--border)' }} />
                                    <MoneyRow label="کارت"             value={data.amount_paid_by_card}         color="var(--info)" />
                                    <MoneyRow label="نقد"              value={data.amount_paid_by_cash}         color="var(--info)" />
                                    <MoneyRow label="چک"               value={data.amount_paid_by_check}        color="var(--info)" />
                                    <MoneyRow label="کل پرداخت"        value={data.total_amount_paid}           color="var(--primary)" bold />
                                    <div className="mt-3 p-3 rounded-xl" style={{
                                        background: data.amount_owed > 0 ? 'var(--danger-light)' : 'var(--success-light)',
                                        border:     `1px solid ${data.amount_owed > 0 ? 'var(--danger)' : 'var(--success)'}22`
                                    }}>
                                        <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>مانده بدهی</p>
                                        <p className="text-xl font-black"
                                           style={{ color: data.amount_owed > 0 ? 'var(--danger)' : 'var(--success)' }}>
                                            {Number(data.amount_owed).toLocaleString('fa-IR')} ﷼
                                        </p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* اطلاعات فاکتور */}
                            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                                        className="card">
                                <div className="card-header">
                                    <p className="card-title text-sm">جزئیات</p>
                                </div>
                                <div className="card-body space-y-2">
                                    {[
                                        { icon: faHashtag,  label: 'شناسه',   value: `#${data.id}`,             color: 'var(--primary)', bg: 'var(--primary-light)' },
                                        { icon: faHashtag,  label: 'شماره',   value: data.factor_number,         color: 'var(--info)',    bg: 'var(--info-light)'    },
                                        { icon: faCalendar, label: 'تاریخ',   value: new Date(data.created_at).toLocaleDateString('fa-IR'), color: 'var(--warning)', bg: 'var(--warning-light)' },
                                    ].map(({ icon, label, value, color, bg }) => (
                                        <div key={label} className="flex items-center gap-2 p-2 rounded-lg"
                                             style={{ background: 'var(--surface-2)' }}>
                                            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: bg }}>
                                                <FontAwesomeIcon icon={icon} className="w-3 h-3" style={{ color }} />
                                            </div>
                                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}:</span>
                                            <span className="text-xs font-bold" style={{ color: 'var(--text)' }}>{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
    )
}