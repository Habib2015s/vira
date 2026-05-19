'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faUserCog, faSpinner, faArrowLeft, faPen,
    faUser, faPhone, faIdCard, faBuilding,
    faFileContract, faHashtag
} from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import DashboardLayout from "@/app/dashboard/Dashboardlayout"
import Swal from 'sweetalert2'
import { ENV } from '@/app/config/env'

const BASE    = ENV.API_REPAIRMEN
const HEADERS = { 'Content-Type': 'application/json', 'Accept': 'application/json' }

const CONTRACT_LABELS = { have: 'دارد', completion: 'اتمام یافته', no_need: 'نیاز نیست' }
const CONTRACT_COLORS = {
    have:       { background: 'var(--success-light)', color: 'var(--success)' },
    completion: { background: 'var(--warning-light)', color: 'var(--warning)' },
    no_need:    { background: 'var(--surface-2)',      color: 'var(--text-muted)' },
}

// ── InfoCard — یک فیلد اطلاعاتی ───────────────────────
const InfoCard = ({ icon, label, value, iconColor = 'var(--primary)', iconBg = 'var(--primary-light)', delay = 0 }) => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
                className="flex items-start gap-3 p-4 rounded-xl transition-all"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = iconColor; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: iconBg }}>
            <FontAwesomeIcon icon={icon} className="w-4 h-4" style={{ color: iconColor }} />
        </div>
        <div className="min-w-0">
            <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
            <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{value || '—'}</p>
        </div>
    </motion.div>
)

// ══════════════════════════════════════════════════════
export default function RepairmanShowPage() {
    const router = useRouter()
    const { id } = useParams()
    const [data,    setData]    = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch(`${BASE}/${id}`, { headers: HEADERS })
            .then(r => r.json())
            .then(res => { setData(res.data?.repairman || null); setLoading(false) })
            .catch(() => {
                Swal.fire({ icon: 'error', title: 'خطا', text: 'دریافت اطلاعات ناموفق بود', confirmButtonText: 'باشه' })
                setLoading(false)
            })
    }, [id])

    // ── Loading ──────────────────────────────────────────
    if (loading) return (
        <DashboardLayout>
            <div className="w-full min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card text-center p-12">
                    <FontAwesomeIcon icon={faSpinner} className="w-14 h-14 animate-spin mb-5" style={{ color: 'var(--primary)' }} />
                    <p className="text-lg font-black" style={{ color: 'var(--text)' }}>در حال بارگذاری...</p>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>تعمیرکار #{id}</p>
                </motion.div>
            </div>
        </DashboardLayout>
    )

    if (!data) return (
        <DashboardLayout>
            <div className="w-full min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
                <div className="card text-center p-12">
                    <p className="font-bold mb-4" style={{ color: 'var(--text)' }}>تعمیرکار یافت نشد</p>
                    <button onClick={() => router.back()} className="btn btn-back">
                        <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" /> بازگشت
                    </button>
                </div>
            </div>
        </DashboardLayout>
    )

    const contractColor = CONTRACT_COLORS[data.contract_status] ?? CONTRACT_COLORS.no_need
    const contractLabel = CONTRACT_LABELS[data.contract_status] ?? data.contract_status

    return (
        <DashboardLayout>
            <div className="w-full min-h-screen" style={{ background: 'var(--bg)' }}>

                {/* ── هدر ── */}
                <div className="page-header-bar">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                 style={{ background: 'rgba(255,255,255,0.2)' }}>
                                <FontAwesomeIcon icon={faUserCog} className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-white leading-none">
                                    {data.name} {data.family}
                                </h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>
                                        کد پرسنلی: {data.personal_code || '—'}
                                    </span>
                                    <span className="w-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.4)' }} />
                                    <span className="badge" style={{ ...contractColor, fontSize: '10px', padding: '2px 8px' }}>
                                        {contractLabel}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link href={`/repairmen/edit/${id}`}>
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

                {/* ── محتوا ── */}
                <div className="page-content max-w-4xl">
                    <div className="card">

                        <div className="card-header">
                            <h2 className="card-title flex items-center gap-2">
                                <FontAwesomeIcon icon={faUserCog} className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                                اطلاعات تعمیرکار
                            </h2>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                                  style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                                شناسه #{data.id}
                            </span>
                        </div>

                        <div className="card-body">
                            <div className="grid grid-cols-2 gap-3">
                                <InfoCard icon={faUser}         label="نام"            value={data.name}           delay={0}    />
                                <InfoCard icon={faUser}         label="نام خانوادگی"   value={data.family}         delay={0.04} />
                                <InfoCard icon={faPhone}        label="تلفن"           value={data.phone}
                                          iconColor="var(--success)" iconBg="var(--success-light)" delay={0.08} />
                                <InfoCard icon={faIdCard}       label="کد ملی"         value={data.national_code}
                                          iconColor="var(--info)" iconBg="var(--info-light)" delay={0.12} />
                                <InfoCard icon={faHashtag}      label="کد پرسنلی"      value={data.personal_code}
                                          iconColor="var(--warning)" iconBg="var(--warning-light)" delay={0.16} />
                                <InfoCard icon={faBuilding}     label="محل کار"        value={data.workplace}
                                          iconColor="var(--success)" iconBg="var(--success-light)" delay={0.20} />
                            </div>

                            {/* وضعیت قرارداد — row مستقل */}
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}
                                        className="mt-3 flex items-center justify-between p-4 rounded-xl"
                                        style={{ background: 'var(--surface-2)', border: '1.5px solid var(--border)' }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                         style={{ background: 'var(--primary-light)' }}>
                                        <FontAwesomeIcon icon={faFileContract} className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>وضعیت قرارداد</p>
                                        <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{contractLabel}</p>
                                    </div>
                                </div>
                                <span className="badge" style={contractColor}>{contractLabel}</span>
                            </motion.div>
                        </div>

                        {/* تاریخ‌ها */}
                        <div className="card-footer flex items-center gap-6 text-xs" style={{ color: 'var(--text-muted)' }}>
                            <span>ایجاد: {new Date(data.created_at).toLocaleDateString('fa-IR')}</span>
                            <span>بروزرسانی: {new Date(data.updated_at).toLocaleDateString('fa-IR')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}