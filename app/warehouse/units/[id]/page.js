'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRuler, faArrowLeft, faPen, faSpinner, faCalendar, faHashtag } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import DashboardLayout from "@/app/dashboard/Dashboardlayout"
import Swal from 'sweetalert2'
import { ENV, getHeaders } from '@/app/config/env'

const BASE    = ENV.API_WAREHOUSE_UNITS

const InfoCard = ({ icon, label, value, iconColor = 'var(--primary)', iconBg = 'var(--primary-light)', delay = 0 }) => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
                className="flex items-start gap-3 p-4 rounded-xl transition-all"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = iconColor; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: iconBg }}>
            <FontAwesomeIcon icon={icon} className="w-4 h-4" style={{ color: iconColor }} />
        </div>
        <div>
            <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
            <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{value || '—'}</p>
        </div>
    </motion.div>
)

export default function WarehouseUnitShowPage() {
    const router = useRouter()
    const { id } = useParams()
    const [data,    setData]    = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch(`${BASE}/${id}`, { headers: getHeaders() })
            .then(r => r.json())
            .then(res => { setData(res.data?.unit || null); setLoading(false) })
            .catch(() => {
                Swal.fire({ icon: 'error', title: 'خطا', text: 'دریافت اطلاعات ناموفق بود' })
                setLoading(false)
            })
    }, [id])

    if (loading) return (
        <DashboardLayout>
            <div className="w-full min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card text-center p-12">
                    <FontAwesomeIcon icon={faSpinner} className="w-12 h-12 animate-spin mb-4" style={{ color: 'var(--primary)' }} />
                    <p className="font-bold" style={{ color: 'var(--text)' }}>در حال بارگذاری...</p>
                </motion.div>
            </div>
        </DashboardLayout>
    )

    if (!data) return (
        <DashboardLayout>
            <div className="w-full min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
                <div className="card text-center p-12">
                    <p className="font-bold mb-4" style={{ color: 'var(--text)' }}>واحد یافت نشد</p>
                    <button onClick={() => router.back()} className="btn btn-back">
                        <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" /> بازگشت
                    </button>
                </div>
            </div>
        </DashboardLayout>
    )

    return (
        <DashboardLayout>
            <div className="w-full min-h-screen" style={{ background: 'var(--bg)' }}>

                <div className="page-header-bar">
                    <div className="max-w-2xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                 style={{ background: 'rgba(255,255,255,0.2)' }}>
                                <FontAwesomeIcon icon={faRuler} className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-white leading-none">{data.name}</h1>
                                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
                                    واحد اندازه‌گیری #{data.id}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link href={`/warehouse/units/edit/${id}`}>
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

                <div className="page-content max-w-2xl">
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card">
                        <div className="card-header">
                            <p className="card-title">اطلاعات واحد</p>
                            <span className="badge badge-primary">#{data.id}</span>
                        </div>
                        <div className="card-body">
                            <div className="grid grid-cols-1 gap-3">
                                <InfoCard icon={faRuler}    label="نام واحد"      value={data.name}    delay={0}    />
                                <InfoCard icon={faHashtag}  label="شناسه"         value={`#${data.id}`} delay={0.04}
                                          iconColor="var(--info)" iconBg="var(--info-light)" />
                                <InfoCard icon={faCalendar} label="تاریخ ایجاد"   value={new Date(data.created_at).toLocaleDateString('fa-IR')}  delay={0.08}
                                          iconColor="var(--success)" iconBg="var(--success-light)" />
                                <InfoCard icon={faCalendar} label="آخرین ویرایش"  value={new Date(data.updated_at).toLocaleDateString('fa-IR')}  delay={0.12}
                                          iconColor="var(--warning)" iconBg="var(--warning-light)" />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </DashboardLayout>
    )
}