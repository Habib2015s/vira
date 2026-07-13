'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faBox, faArrowLeft, faPen, faSpinner, faHashtag,
    faRuler, faWeightHanging, faPalette, faWarehouse,
    faChartBar, faShekelSign, faCalendar,
    faTriangleExclamation, faCircleInfo, faGlobe
} from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import DashboardLayout from "@/app/dashboard/Dashboardlayout"
import Swal from 'sweetalert2'
import { ENV, getHeaders } from '@/app/config/env'


const InfoCard = ({ icon, label, value, iconColor = 'var(--primary)', iconBg = 'var(--primary-light)', delay = 0 }) => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
                className="flex items-start gap-3 p-4 rounded-xl transition-all"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = iconColor; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: iconBg }}>
            <FontAwesomeIcon icon={icon} className="w-4 h-4" style={{ color: iconColor }} />
        </div>
        <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
            <p className="text-sm font-bold break-words" style={{ color: 'var(--text)' }}>{value ?? '—'}</p>
        </div>
    </motion.div>
)

const SectionTitle = ({ title, colorVar = 'var(--primary)' }) => (
    <div className="flex items-center gap-3 mb-4 mt-6">
        <div className="w-1 h-5 rounded-full" style={{ background: colorVar }} />
        <h3 className="text-sm font-black" style={{ color: 'var(--text)' }}>{title}</h3>
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
    </div>
)

export default function ProductShowPage() {
    const router = useRouter()
    const { id } = useParams()
    const [data,    setData]    = useState(null)
    const [loading, setLoading] = useState(true)

    // ⭐ fetch storehouses و units برای resolve کردن نام‌ها
    const { data: shData } = useQuery({
        queryKey: ['warehouseStorehouses'],
        queryFn: () => fetch(ENV.API_WAREHOUSE_STOREHOUSES, { headers: getHeaders() }).then(r => r.json()).then(r => r.data?.storehouses?.data || []),
        staleTime: 10 * 60 * 1000,
    })
    const { data: unData } = useQuery({
        queryKey: ['warehouseUnits'],
        queryFn: () => fetch(ENV.API_WAREHOUSE_UNITS, { headers: getHeaders() }).then(r => r.json()).then(r => r.data?.units?.data || []),
        staleTime: 10 * 60 * 1000,
    })
    const storeMap = Object.fromEntries((shData || []).map(s => [s.id, s.name]))
    const unitMap  = Object.fromEntries((unData  || []).map(u => [u.id, u.name]))

    useEffect(() => {
        fetch(`${ENV.API_WAREHOUSE_PRODUCTS}/${id}`, { headers: getHeaders() })
            .then(r => r.json())
            .then(res => { setData(res.data?.product || null); setLoading(false) })
            .catch(() => {
                Swal.fire({ icon: 'error', title: 'خطا', text: 'دریافت اطلاعات ناموفق بود' })
                setLoading(false)
            })
    }, [id])

    if (loading) return (
        <DashboardLayout>
            <div className="w-full min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card text-center p-12">
                    <FontAwesomeIcon icon={faSpinner} className="w-14 h-14 animate-spin mb-5" style={{ color: 'var(--primary)' }} />
                    <p className="text-lg font-black" style={{ color: 'var(--text)' }}>در حال بارگذاری...</p>
                </motion.div>
            </div>
        </DashboardLayout>
    )

    if (!data) return (
        <DashboardLayout>
            <div className="w-full min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
                <div className="card text-center p-12">
                    <p className="font-bold mb-4" style={{ color: 'var(--text)' }}>محصول یافت نشد</p>
                    <button onClick={() => router.back()} className="btn btn-back">
                        <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" /> بازگشت
                    </button>
                </div>
            </div>
        </DashboardLayout>
    )

    const isLowStock = data.order_threshold && Number(data.count) <= Number(data.order_threshold)
    const storehouseName = storeMap[data.storehouse_id] || `انبار #${data.storehouse_id}`
    const unitName       = unitMap[data.unit_id]        || `واحد #${data.unit_id}`

    return (
        <DashboardLayout>
            <div className="w-full min-h-screen" style={{ background: 'var(--bg)' }}>

                <div className="page-header-bar">
                    <div className="max-w-5xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                 style={{ background: 'rgba(255,255,255,0.2)' }}>
                                <FontAwesomeIcon icon={faBox} className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-xl font-black text-white leading-none">{data.name}</h1>
                                    {isLowStock && (
                                        <span className="badge badge-danger" style={{ fontSize: '10px' }}>
                                            <FontAwesomeIcon icon={faTriangleExclamation} className="w-3 h-3" />
                                            موجودی کم
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.7)' }}>
                                        کد: {data.code}
                                    </span>
                                    <span className="w-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.4)' }} />
                                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>#{data.id}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link href={`/warehouse/products/${id}/edit`}>
                                <button className="btn btn-warning btn-sm">
                                    <FontAwesomeIcon icon={faPen} className="w-3.5 h-3.5" />
                                    ویرایش
                                </button>
                            </Link>
                            <button onClick={() => router.back()} className="btn btn-back btn-sm">
                                <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" />
                                بازگشت
                            </button>
                        </div>
                    </div>
                </div>

                <div className="page-content max-w-5xl">

                    {isLowStock && (
                        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
                                    className="alert alert-danger flex items-center gap-3 mb-5">
                            <FontAwesomeIcon icon={faTriangleExclamation} className="w-4 h-4 flex-shrink-0" />
                            <p className="font-bold">
                                موجودی ({Number(data.count).toLocaleString('fa-IR')}) به حد سفارش ({Number(data.order_threshold).toLocaleString('fa-IR')}) رسیده!
                            </p>
                        </motion.div>
                    )}

                    <div className="card">
                        <div className="card-header">
                            <p className="card-title">اطلاعات کامل محصول</p>
                            <div className="flex items-center gap-2">
                                <span className={`badge ${isLowStock ? 'badge-danger' : 'badge-success'}`}>
                                    موجودی: {Number(data.count).toLocaleString('fa-IR')}
                                </span>
                                <span className="badge badge-primary">#{data.id}</span>
                            </div>
                        </div>
                        <div className="card-body">

                            <SectionTitle title="اطلاعات اصلی" colorVar="var(--primary)" />
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                <InfoCard icon={faHashtag}   label="کد محصول"  value={data.code}          iconColor="var(--primary)" iconBg="var(--primary-light)" delay={0}    />
                                <InfoCard icon={faBox}       label="نام محصول" value={data.name}          iconColor="var(--info)"    iconBg="var(--info-light)"    delay={0.04} />
                                <InfoCard icon={faPalette}   label="رنگ"        value={data.color}         iconColor="var(--warning)" iconBg="var(--warning-light)" delay={0.08} />
                                <InfoCard icon={faWarehouse} label="انبار"      value={storehouseName}     iconColor="var(--success)" iconBg="var(--success-light)" delay={0.12} />
                                <InfoCard icon={faRuler}     label="واحد"       value={unitName}           iconColor="var(--info)"    iconBg="var(--info-light)"    delay={0.16} />
                            </div>

                            <SectionTitle title="مالی و موجودی" colorVar="var(--success)" />
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <InfoCard icon={faChartBar}            label="موجودی فعلی"
                                          value={Number(data.count).toLocaleString('fa-IR')}
                                          iconColor="var(--success)" iconBg="var(--success-light)" delay={0.2} />
                                <InfoCard icon={faShekelSign}          label="قیمت واحد (ریال)"
                                          value={Number(data.single_amount).toLocaleString('fa-IR')}
                                          iconColor="var(--primary)" iconBg="var(--primary-light)" delay={0.24} />
                                <InfoCard icon={faTriangleExclamation} label="حد سفارش"
                                          value={Number(data.order_threshold).toLocaleString('fa-IR')}
                                          iconColor="var(--warning)" iconBg="var(--warning-light)" delay={0.28} />
                                <InfoCard icon={faCalendar}            label="تاریخ خرید"
                                          value={data.purchase_date ? data.purchase_date.split(' ')[0] : '—'}
                                          iconColor="var(--info)"    iconBg="var(--info-light)"    delay={0.32} />
                            </div>

                            {(data.length || data.width || data.height || data.weight) && (
                                <>
                                    <SectionTitle title="ابعاد و وزن" colorVar="var(--warning)" />
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {data.length && <InfoCard icon={faRuler}         label="طول (cm)"   value={data.length}  iconColor="var(--warning)" iconBg="var(--warning-light)" delay={0.36} />}
                                        {data.width  && <InfoCard icon={faRuler}         label="عرض (cm)"   value={data.width}   iconColor="var(--warning)" iconBg="var(--warning-light)" delay={0.40} />}
                                        {data.height && <InfoCard icon={faRuler}         label="ارتفاع (cm)" value={data.height}  iconColor="var(--warning)" iconBg="var(--warning-light)" delay={0.44} />}
                                        {data.weight && <InfoCard icon={faWeightHanging} label="وزن (kg)"   value={data.weight}  iconColor="var(--danger)"  iconBg="var(--danger-light)"  delay={0.48} />}
                                    </div>
                                </>
                            )}

                            {(data.technical_description || data.fa_description || data.en_description) && (
                                <>
                                    <SectionTitle title="توضیحات" colorVar="var(--info)" />
                                    <div className="space-y-3">
                                        {data.technical_description && (
                                            <div className="p-4 rounded-xl" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <FontAwesomeIcon icon={faCircleInfo} className="w-3.5 h-3.5" style={{ color: 'var(--info)' }} />
                                                    <p className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>شرح فنی</p>
                                                </div>
                                                <p className="text-sm" style={{ color: 'var(--text)' }}>{data.technical_description}</p>
                                            </div>
                                        )}
                                        <div className="grid grid-cols-2 gap-3">
                                            {data.fa_description && (
                                                <div className="p-4 rounded-xl" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <FontAwesomeIcon icon={faCircleInfo} className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
                                                        <p className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>توضیحات فارسی</p>
                                                    </div>
                                                    <p className="text-sm" style={{ color: 'var(--text)' }}>{data.fa_description}</p>
                                                </div>
                                            )}
                                            {data.en_description && (
                                                <div className="p-4 rounded-xl" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <FontAwesomeIcon icon={faGlobe} className="w-3.5 h-3.5" style={{ color: 'var(--success)' }} />
                                                        <p className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>English Description</p>
                                                    </div>
                                                    <p className="text-sm" style={{ color: 'var(--text)', direction: 'ltr', textAlign: 'left' }}>{data.en_description}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="card-footer flex items-center gap-6 text-xs" style={{ color: 'var(--text-muted)' }}>
                            <span>ایجاد: {new Date(data.created_at).toLocaleDateString('fa-IR')}</span>
                            <span>ویرایش: {new Date(data.updated_at).toLocaleDateString('fa-IR')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}