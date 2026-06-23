// app/shops/show/[id]/page.js
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faArrowLeft, faEdit, faStore, faCode, faTag, faMoneyBillWave,
    faToggleOn, faToggleOff, faClock, faFileAlt, faCircleCheck, faCircleXmark, faSpinner
} from '@fortawesome/free-solid-svg-icons'
import DashboardLayout from '@/app/dashboard/Dashboardlayout'
import Swal from 'sweetalert2'
import Link from 'next/link'
import { shopsApi } from '@/app/api/client/shopsApi'

const InfoCard = ({ icon, label, value, i = 0 }) => (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="card p-5 flex items-start gap-4 transition-all"
                onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none' }}>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--primary-light)' }}>
            <FontAwesomeIcon icon={icon} className="w-5 h-5" style={{ color: 'var(--primary)' }} />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-sm mb-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
            <p className="text-base font-bold truncate" style={{ color: 'var(--text)' }}>{value || '—'}</p>
        </div>
    </motion.div>
)

export default function ShowShop() {
    const { id: shopId } = useParams()
    const router = useRouter()
    const [shop,    setShop]    = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        shopsApi.getOne(shopId)
            .then(r => setShop(r.data.shop))
            .catch(() => { Swal.fire('خطا', 'مشکلی در دریافت اطلاعات رخ داد', 'error'); router.push('/shops') })
            .finally(() => setLoading(false))
    }, [shopId])

    if (loading) return (
        <DashboardLayout>
            <div className="w-full min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
                <FontAwesomeIcon icon={faSpinner} className="w-10 h-10 animate-spin" style={{ color: 'var(--primary)' }} />
            </div>
        </DashboardLayout>
    )

    if (!shop) return null

    const isActive = shop.is_active === 'active'

    return (
        <DashboardLayout>
            <div className="w-full min-h-screen" style={{ background: 'var(--bg)' }}>
                <div className="page-header-bar">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                                <FontAwesomeIcon icon={faStore} className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-white mb-1">{shop.name}</h1>
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 rounded-lg text-sm font-bold text-white" style={{ background: 'rgba(255,255,255,0.2)' }}>
                                        کد: {shop.code}
                                    </span>
                                    <span className="px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1.5"
                                          style={{ background: isActive ? 'rgba(16,185,129,0.25)' : 'rgba(220,38,38,0.2)', color: isActive ? '#d1fae5' : '#fee2e2' }}>
                                        <FontAwesomeIcon icon={isActive ? faCircleCheck : faCircleXmark} className="w-3.5 h-3.5" />
                                        {isActive ? 'فعال' : 'غیرفعال'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Link href={`/shops/edit/${shopId}`}>
                                <button className="btn btn-warning">
                                    <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                                    ویرایش
                                </button>
                            </Link>
                            <button onClick={() => router.back()} className="btn btn-back">
                                <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
                                بازگشت
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-6 max-w-7xl mx-auto space-y-6">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-1 h-6 rounded-full" style={{ background: 'var(--primary)' }} />
                            <h2 className="text-lg font-extrabold" style={{ color: 'var(--text)' }}>اطلاعات اصلی شاپ</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <InfoCard icon={faStore}        label="نام شاپ" value={shop.name} i={0} />
                            <InfoCard icon={faCode}         label="کد شاپ"  value={shop.code} i={1} />
                            <InfoCard icon={faTag}          label="نوع"     value={shop.type === 'inside' ? 'داخلی' : 'خارجی'} i={2} />
                            <InfoCard icon={faMoneyBillWave} label="هزینه"  value={shop.fee ? `${parseInt(shop.fee).toLocaleString('fa-IR')} ریال` : '—'} i={3} />
                            <InfoCard icon={isActive ? faToggleOn : faToggleOff} label="وضعیت" value={isActive ? 'فعال' : 'غیرفعال'} i={4} />
                        </div>
                    </div>

                    {shop.description && (
                        <div className="card">
                            <div className="card-header">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--warning-light)' }}>
                                        <FontAwesomeIcon icon={faFileAlt} className="w-4 h-4" style={{ color: 'var(--warning)' }} />
                                    </div>
                                    <h2 className="card-title">توضیحات</h2>
                                </div>
                            </div>
                            <div className="card-body">
                                <p className="leading-relaxed" style={{ color: 'var(--text-soft)' }}>{shop.description}</p>
                            </div>
                        </div>
                    )}

                    <div className="card">
                        <div className="card-header">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--surface-2)' }}>
                                    <FontAwesomeIcon icon={faClock} className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                                </div>
                                <h2 className="card-title">اطلاعات تاریخی</h2>
                            </div>
                        </div>
                        <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { label: 'تاریخ ایجاد',       val: shop.created_at },
                                { label: 'آخرین بروزرسانی',   val: shop.updated_at },
                            ].map(({ label, val }) => (
                                <div key={label} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--surface-2)' }}>
                                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}:</span>
                                    <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>
                                        {new Date(val).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}