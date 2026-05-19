'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUsers, faArrowLeft, faPen, faSpinner, faUser, faBuilding,
    faPhone, faLocationDot, faHashtag, faIdCard, faMailBulk, faCalendar } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import DashboardLayout from "@/app/dashboard/Dashboardlayout"
import Swal from 'sweetalert2'
import { ENV } from '@/app/config/env'

const BASE    = ENV.API_WAREHOUSE_CUSTOMERS
const HEADERS = { 'Content-Type': 'application/json', 'Accept': 'application/json' }

// ── hook تشخیص دارک مود ────────────────────────────
function useIsDark() {
    const [isDark, setIsDark] = useState(false)
    useEffect(() => {
        const check = () => setIsDark(
            document.documentElement.classList.contains('dark') ||
            document.documentElement.getAttribute('data-theme') === 'dark'
        )
        check()
        const obs = new MutationObserver(check)
        obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] })
        return () => obs.disconnect()
    }, [])
    return isDark
}

const InfoRow = ({ icon, label, value, mono = false, iconColor, iconBg, delay = 0 }) => (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay }}
                className="flex items-center gap-4 px-5 py-3.5 transition-all"
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: iconBg }}>
            <FontAwesomeIcon icon={icon} className="w-3.5 h-3.5" style={{ color: iconColor }} />
        </div>
        <div className="flex-1 flex items-center justify-between">
            <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>{label}</span>
            <span className={`text-sm font-bold ${mono ? 'font-mono' : ''}`} style={{ color: 'var(--text)' }}>
                {value || '—'}
            </span>
        </div>
    </motion.div>
)

export default function CustomerShowPage() {
    const router  = useRouter()
    const { id }  = useParams()
    const isDark  = useIsDark()
    const [data,    setData]    = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch(`${BASE}/${id}`, { headers: HEADERS })
            .then(r => r.json())
            .then(res => { setData(res.data?.customer || null); setLoading(false) })
            .catch(() => {
                Swal.fire({ icon: 'error', title: 'خطا', text: 'دریافت اطلاعات ناموفق بود' })
                setLoading(false)
            })
    }, [id])

    if (loading) return (
        <DashboardLayout>
            <div className="w-full min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card text-center p-12">
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
                    <p className="font-bold mb-4" style={{ color: 'var(--text)' }}>مشتری یافت نشد</p>
                    <button onClick={() => router.back()} className="btn btn-back">
                        <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" /> بازگشت
                    </button>
                </div>
            </div>
        </DashboardLayout>
    )

    const isCompany = data.type === 'company'
    const hue       = (data.id * 53) % 360

    // ⭐ رنگ‌های کاملاً تم‌aware
    const colors = isCompany
        ? {
            // شرکت — آبی
            bannerBg:    isDark ? 'var(--info-light)'    : 'var(--info-light)',
            avatarBg:    isDark ? 'rgba(2,132,199,0.15)' : 'var(--info-light)',
            avatarBorder:isDark ? '1px solid rgba(2,132,199,0.3)' : 'none',
            mainColor:   'var(--info)',
            subColor:    isDark ? 'rgba(56,189,248,0.7)' : 'rgba(2,132,199,0.65)',
            badgeBg:     isDark ? 'rgba(2,132,199,0.2)'  : 'var(--info)',
            badgeColor:  isDark ? 'var(--info)'          : '#fff',
        }
        : {
            // شخص — رنگ پویا بر اساس ID
            bannerBg:    isDark ? `hsl(${hue}, 25%, 14%)`  : `hsl(${hue}, 60%, 94%)`,
            avatarBg:    isDark ? `hsl(${hue}, 30%, 20%)`  : `hsl(${hue}, 65%, 90%)`,
            avatarBorder:isDark ? `1px solid hsl(${hue}, 40%, 30%)` : 'none',
            mainColor:   isDark ? `hsl(${hue}, 65%, 72%)`  : `hsl(${hue}, 55%, 38%)`,
            subColor:    isDark ? `hsl(${hue}, 45%, 52%)`  : `hsl(${hue}, 45%, 55%)`,
            badgeBg:     isDark ? `hsl(${hue}, 30%, 22%)`  : `hsl(${hue}, 55%, 38%)`,
            badgeColor:  isDark ? `hsl(${hue}, 65%, 72%)`  : '#fff',
        }

    return (
        <DashboardLayout>
            <div className="w-full min-h-screen" style={{ background: 'var(--bg)' }}>

                <div className="page-header-bar">
                    <div className="max-w-3xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                 style={{ background: 'rgba(255,255,255,0.2)' }}>
                                <FontAwesomeIcon icon={faUsers} className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-white leading-none">
                                    {data.name} {data.family || ''}
                                </h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`badge text-xs ${isCompany ? 'badge-info' : 'badge-success'}`}>
                                        {isCompany ? 'حقوقی' : 'حقیقی'}
                                    </span>
                                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>#{data.id}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link href={`/warehouse/customers/edit/${id}`}>
                                <button className="btn btn-warning btn-sm">
                                    <FontAwesomeIcon icon={faPen} className="w-3.5 h-3.5" />ویرایش
                                </button>
                            </Link>
                            <button onClick={() => router.back()} className="btn btn-back btn-sm">
                                <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" />بازگشت
                            </button>
                        </div>
                    </div>
                </div>

                <div className="page-content max-w-3xl">
                    <div className="card">

                        {/* ⭐ بنر آواتار — تم‌aware */}
                        <div className="p-6 flex items-center gap-5 transition-colors"
                             style={{ background: colors.bannerBg, borderBottom: '1px solid var(--border)' }}>
                            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                        className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0"
                                        style={{
                                            background:  colors.avatarBg,
                                            border:      colors.avatarBorder,
                                            boxShadow:   `0 6px 24px ${colors.mainColor}22`,
                                        }}>
                                <FontAwesomeIcon icon={isCompany ? faBuilding : faUser}
                                                 className="w-8 h-8" style={{ color: colors.mainColor }} />
                            </motion.div>
                            <div>
                                <h2 className="text-2xl font-black" style={{ color: colors.mainColor }}>
                                    {data.name} {data.family || ''}
                                </h2>
                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                    {/* badge نوع */}
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold"
                                          style={{ background: colors.badgeBg, color: colors.badgeColor }}>
                                        <FontAwesomeIcon icon={isCompany ? faBuilding : faUser} className="w-3 h-3" />
                                        {isCompany ? 'شخص حقوقی' : 'شخص حقیقی'}
                                    </span>
                                    {data.phone && (
                                        <span className="text-sm font-mono flex items-center gap-1"
                                              style={{ color: colors.subColor }}>
                                            <FontAwesomeIcon icon={faPhone} className="w-3 h-3" />
                                            {data.phone}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* اطلاعات */}
                        <div className="card-body p-0">
                            <InfoRow icon={faHashtag}     label="شناسه"       value={`#${data.id}`}          iconColor="var(--primary)" iconBg="var(--primary-light)" delay={0}    />
                            <InfoRow icon={faIdCard}      label={isCompany ? 'شناسه ملی' : 'کد ملی'} value={data.national_code} mono
                                     iconColor="var(--warning)" iconBg="var(--warning-light)" delay={0.05} />
                            <InfoRow icon={faPhone}       label="تلفن"         value={data.phone}             mono iconColor="var(--success)" iconBg="var(--success-light)" delay={0.10} />
                            <InfoRow icon={faMailBulk}    label="کد پستی"      value={data.zip_code}          mono iconColor="var(--info)"    iconBg="var(--info-light)"    delay={0.15} />
                            <InfoRow icon={faLocationDot} label="آدرس"         value={data.address}           iconColor="var(--danger)"  iconBg="var(--danger-light)"  delay={0.20} />
                            <InfoRow icon={faCalendar}    label="تاریخ ثبت"    value={new Date(data.created_at).toLocaleDateString('fa-IR')}
                                     iconColor="var(--muted)" iconBg="var(--surface-2)" delay={0.25} />
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}