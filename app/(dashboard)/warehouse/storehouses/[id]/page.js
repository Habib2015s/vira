'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faWarehouse, faArrowLeft, faPen, faSpinner,
    faHashtag, faTag, faPhone, faLocationDot, faCalendar
} from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import Swal from '@/app/utils/swal'
import { ENV, getHeaders } from '@/app/config/env'

const BASE    = ENV.API_WAREHOUSE_STOREHOUSES

// ── تشخیص تم برای رنگ‌های پویا ─────────────────────
function useIsDark() {
    const [isDark, setIsDark] = useState(false)
    useEffect(() => {
        const check = () => setIsDark(document.documentElement.classList.contains('dark') ||
            document.documentElement.getAttribute('data-theme') === 'dark')
        check()
        const obs = new MutationObserver(check)
        obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] })
        return () => obs.disconnect()
    }, [])
    return isDark
}

// رنگ پویا تم‌aware
function getDynamicColor(id, isDark) {
    const hue = (id * 47) % 360
    return isDark
        ? { bg: `hsl(${hue}, 35%, 20%)`,  color: `hsl(${hue}, 60%, 70%)` }  // دارک: تیره‌تر + روشن‌تر
        : { bg: `hsl(${hue}, 70%, 92%)`,   color: `hsl(${hue}, 60%, 40%)` }  // لایت: روشن + تیره
}

export default function StorehouseShowPage() {
    const router  = useRouter()
    const { id }  = useParams()
    const isDark  = useIsDark()
    const [data,    setData]    = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch(`${BASE}/${id}`, { headers: getHeaders() })
            .then(r => r.json())
            .then(res => { setData(res.data?.storehouse || null); setLoading(false) })
            .catch(() => {
                Swal.fire({ icon: 'error', title: 'خطا', text: 'دریافت اطلاعات ناموفق بود' })
                setLoading(false)
            })
    }, [id])

    if (loading) return (
            <div className="w-full min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card text-center p-12">
                    <FontAwesomeIcon icon={faSpinner} className="w-14 h-14 animate-spin mb-5" style={{ color: 'var(--primary)' }} />
                    <p className="text-lg font-black" style={{ color: 'var(--text)' }}>در حال بارگذاری...</p>
                </motion.div>
            </div>
    )

    if (!data) return (
            <div className="w-full min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
                <div className="card text-center p-12">
                    <p className="font-bold mb-4" style={{ color: 'var(--text)' }}>انبار یافت نشد</p>
                    <button onClick={() => router.back()} className="btn btn-back">
                        <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" /> بازگشت
                    </button>
                </div>
            </div>
    )

    const { bg: avatarBg, color: avatarColor } = getDynamicColor(data.id, isDark)

    const infoItems = [
        { icon: faHashtag,     label: 'شناسه',        value: `#${data.id}`,  color: 'var(--primary)', bg: 'var(--primary-light)'  },
        { icon: faTag,         label: 'کد انبار',     value: data.code,       color: 'var(--info)',    bg: 'var(--info-light)'     },
        { icon: faTag,         label: 'نام انبار',    value: data.name,       color: 'var(--primary)', bg: 'var(--primary-light)'  },
        { icon: faPhone,       label: 'تلفن',          value: data.phone,      color: 'var(--success)', bg: 'var(--success-light)'  },
        { icon: faLocationDot, label: 'آدرس',          value: data.address,    color: 'var(--danger)',  bg: 'var(--danger-light)'   },
        { icon: faCalendar,    label: 'تاریخ ایجاد',   value: new Date(data.created_at).toLocaleDateString('fa-IR'), color: 'var(--warning)', bg: 'var(--warning-light)' },
        { icon: faCalendar,    label: 'آخرین ویرایش',  value: new Date(data.updated_at).toLocaleDateString('fa-IR'), color: 'var(--muted)',   bg: 'var(--surface-2)' },
    ]

    return (
            <div className="w-full min-h-screen" style={{ background: 'var(--bg)' }}>

                <div className="page-header-bar">
                    <div className="max-w-3xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                 style={{ background: 'rgba(255,255,255,0.2)' }}>
                                <FontAwesomeIcon icon={faWarehouse} className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-white leading-none">{data.name}</h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.7)' }}>{data.code}</span>
                                    <span className="w-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.4)' }} />
                                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>#{data.id}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link href={`/warehouse/storehouses/edit/${id}`}>
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

                <div className="page-content max-w-3xl">
                    <div className="card">

                        {/* ⭐ بنر رنگی — تم‌aware */}
                        <div className="p-6 flex items-center gap-4"
                             style={{
                                 background:   avatarBg,
                                 borderBottom: '1px solid var(--border)',
                             }}>
                            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                        className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                                        style={{
                                            background:  isDark ? 'rgba(255,255,255,0.08)' : '#fff',
                                            boxShadow:   `0 4px 20px ${avatarColor}33`,
                                            border:      isDark ? `1px solid ${avatarColor}44` : 'none',
                                        }}>
                                <FontAwesomeIcon icon={faWarehouse} className="w-7 h-7" style={{ color: avatarColor }} />
                            </motion.div>
                            <div>
                                <h2 className="text-xl font-black" style={{ color: avatarColor }}>{data.name}</h2>
                                <p className="text-sm font-medium mt-1" style={{ color: isDark ? `${avatarColor}bb` : `${avatarColor}99` }}>
                                    {data.address}
                                </p>
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    <span className="badge" style={{
                                        background: isDark ? `${avatarColor}30` : avatarColor,
                                        color:      isDark ? avatarColor : '#fff',
                                        fontSize:   '11px',
                                        border:     isDark ? `1px solid ${avatarColor}50` : 'none',
                                    }}>
                                        {data.code}
                                    </span>
                                    {data.phone && (
                                        <span className="text-xs font-mono flex items-center gap-1" style={{ color: isDark ? `${avatarColor}bb` : avatarColor }}>
                                            <FontAwesomeIcon icon={faPhone} className="w-3 h-3" />
                                            {data.phone}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* جدول اطلاعات */}
                        <div className="card-body p-0">
                            {infoItems.map(({ icon, label, value, color, bg }, i) => (
                                <motion.div key={label}
                                            initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="flex items-center gap-4 px-5 py-3.5 transition-all"
                                            style={{ borderBottom: i < infoItems.length - 1 ? '1px solid var(--border)' : 'none' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                         style={{ background: bg }}>
                                        <FontAwesomeIcon icon={icon} className="w-3.5 h-3.5" style={{ color }} />
                                    </div>
                                    <div className="flex-1 flex items-center justify-between">
                                        <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>{label}</span>
                                        <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>{value || '—'}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
    )
}