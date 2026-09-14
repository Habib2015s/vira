// app/profile/page.js
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faUser, faPhone, faShield, faKey, faBell,
    faClockRotateLeft, faArrowLeft, faIdCard, faHashtag
} from '@fortawesome/free-solid-svg-icons'
import { useRouter } from 'next/navigation'
const ACTIVITY = [
    { id: 1, action: 'ورود به سیستم',        time: 'همین الان',   icon: '🔐', color: '#544ccf' },
    { id: 2, action: 'مشاهده گروه‌های PM',    time: '۱ ساعت پیش', icon: '📋', color: '#059669' },
    { id: 3, action: 'مشاهده صورت وضعیت‌ها', time: 'دیروز',       icon: '📊', color: '#d97706' },
]

const NOTIF_DEFAULTS = [
    { id: 'waybill',  label: 'اعلان بارنامه جدید', desc: 'هر بار بارنامه‌ای ثبت شود', enabled: true  },
    { id: 'payment',  label: 'اعلان پرداخت',       desc: 'تایید یا رد پرداخت‌ها',    enabled: true  },
    { id: 'report',   label: 'گزارش هفتگی',        desc: 'هر دوشنبه ارسال می‌شود',   enabled: false },
    { id: 'security', label: 'هشدار امنیتی',       desc: 'ورود از دستگاه جدید',      enabled: true  },
]

const TABS = [
    { id: 'info',     label: 'اطلاعات شخصی', icon: faUser            },
    { id: 'security', label: 'امنیت',        icon: faShield          },
    { id: 'notif',    label: 'اعلان‌ها',     icon: faBell            },
    { id: 'activity', label: 'فعالیت‌ها',    icon: faClockRotateLeft },
]

function InfoRow({ icon, label, value }) {
    return (
        <div className="flex items-start gap-3 p-4 rounded-xl transition-all"
             style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
             onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
             onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none' }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                 style={{ background: 'var(--primary-light)' }}>
                <FontAwesomeIcon icon={icon} className="w-4 h-4" style={{ color: 'var(--primary)' }} />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
                <p className="text-sm font-bold break-all" style={{ color: 'var(--text)' }}>{value || '—'}</p>
            </div>
        </div>
    )
}

function Toggle({ enabled, onChange }) {
    return (
        <button onClick={onChange} style={{
            position: 'relative', width: 44, height: 24, borderRadius: 100,
            border: 'none', cursor: 'pointer', padding: 0, outline: 'none', flexShrink: 0,
            background: enabled ? 'var(--primary)' : 'var(--border-strong)',
            transition: 'background 0.25s ease',
        }}>
            <motion.div animate={{ x: enabled ? 20 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        style={{ position: 'absolute', top: 3, left: 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
        </button>
    )
}

export default function ProfilePage() {
    const router = useRouter()
    const [activeTab,     setActiveTab]     = useState('info')
    const [direction,     setDirection]     = useState(1)
    const [notifSettings, setNotifSettings] = useState(
        Object.fromEntries(NOTIF_DEFAULTS.map(n => [n.id, n.enabled]))
    )
    const [user, setUser] = useState({
        name: '...', username: '', phone: '', nationalCode: '',
        personnelCode: '', role: 'کاربر', id: null,
    })

    useEffect(() => {
        try {
            const raw = localStorage.getItem('vira-user')
            if (raw) setUser(JSON.parse(raw))
        } catch {}
    }, [])

    const avatarChar = (user.name || 'ک')[0]

    function changeTab(id) {
        const ci = TABS.findIndex(t => t.id === activeTab)
        const ni = TABS.findIndex(t => t.id === id)
        setDirection(ni > ci ? 1 : -1)
        setActiveTab(id)
    }

    const variants = {
        enter:  (d) => ({ opacity: 0, x: d > 0 ? 40 : -40 }),
        center:       { opacity: 1, x: 0 },
        exit:   (d) => ({ opacity: 0, x: d > 0 ? -40 : 40 }),
    }

    return (
            <div className="w-full min-h-screen" style={{ background: 'var(--bg)' }}>

                {/* ══ بنر تصویری ══════════════════════════════ */}
                <div className="relative overflow-hidden" style={{ height: 180 }}>
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: "url('/scene-with-photorealistic-logistics-operations-proceedings.jpg')",
                        backgroundSize: 'cover', backgroundPosition: 'center',
                    }} />
                    <div style={{
                        position: 'absolute', inset: 0,
                        backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)',
                        background: 'rgba(0,0,0,0.4)',
                    }} />
                    <button onClick={() => router.back()} className="btn btn-back btn-sm"
                            style={{ position: 'absolute', top: 20, right: 24 }}>
                        <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" />بازگشت
                    </button>
                </div>

                {/* ══ ناحیه آواتار + اطلاعات ══════════════════
                    آواتار با position:absolute نصف روی بنر
                    اطلاعات در جریان عادی صفحه
                ═══════════════════════════════════════════════ */}
                <div className="max-w-4xl mx-auto px-8">

                    {/* wrapper نسبی برای آواتار */}
                    <div style={{ position: 'relative', height: 60 }}>
                        <motion.div
                            initial={{ scale: 0.7, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 22, delay: 0.1 }}
                            style={{
                                position: 'absolute',
                                top: -60,        /* نصف آواتار بالای بنر */
                                right: 0,
                            }}>
                            <div className="relative">
                                <div style={{
                                    width: 96, height: 96,
                                    borderRadius: 16,
                                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
                                    border: '4px solid var(--bg)',
                                    boxShadow: 'var(--shadow-lg)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 36, fontWeight: 900, color: '#fff',
                                    userSelect: 'none',
                                }}>
                                    {avatarChar}
                                </div>
                                <span style={{
                                    position: 'absolute', bottom: 4, left: 4,
                                    width: 16, height: 16, borderRadius: '50%',
                                    background: 'var(--success)',
                                    border: '2px solid var(--bg)',
                                }} />
                            </div>
                        </motion.div>
                    </div>

                    {/* اسم و نقش — در جریان عادی، زیر آواتار */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.18 }} style={{ marginTop: 8 }}>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h2 className="text-2xl font-black" style={{ color: 'var(--text)' }}>{user.name}</h2>
                            <span className="badge badge-primary">{user.role}</span>
                            <span className="badge badge-success" style={{ fontSize: '10px' }}>آنلاین</span>
                        </div>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                            {user.username && <span>@{user.username}</span>}
                            {user.phone && <span className="mr-3">📞 {user.phone}</span>}
                        </p>
                    </motion.div>
                </div>

                {/* ══ کارت‌های سریع ═══════════════════════════ */}
                <div className="max-w-4xl mx-auto px-8 mt-6">
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }} className="grid grid-cols-3 gap-4">
                        {[
                            { label: 'شناسه کاربر', value: `#${user.id || '—'}`,     color: 'var(--primary)', bg: 'var(--primary-light)' },
                            { label: 'کد پرسنلی',   value: user.personnelCode || '—', color: 'var(--info)',    bg: 'var(--info-light)'    },
                            { label: 'وضعیت حساب',  value: 'فعال',                    color: 'var(--success)', bg: 'var(--success-light)' },
                        ].map(({ label, value, color, bg }) => (
                            <div key={label} className="card p-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                     style={{ background: bg }}>
                                    <span className="text-base font-black" style={{ color }}>{value[0]}</span>
                                </div>
                                <div>
                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
                                    <p className="text-sm font-black" style={{ color }}>{value}</p>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* ══ تب‌بار ══════════════════════════════════ */}
                <div className="mt-6 px-8 max-w-4xl mx-auto">
                    <div className="flex gap-1 p-1 rounded-xl w-fit"
                         style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                        {TABS.map(tab => (
                            <button key={tab.id} onClick={() => changeTab(tab.id)}
                                    className="relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
                                    style={{ color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)' }}>
                                {activeTab === tab.id && (
                                    <motion.div layoutId="tab-pill" className="absolute inset-0 rounded-lg"
                                                style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-sm)' }}
                                                transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                                )}
                                <span className="relative z-10 flex items-center gap-2">
                                    <FontAwesomeIcon icon={tab.icon} className="w-3.5 h-3.5" />{tab.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ══ محتوا ═══════════════════════════════════ */}
                <div className="mt-5 px-8 pb-16 max-w-4xl mx-auto overflow-hidden">
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div key={activeTab} custom={direction} variants={variants}
                                    initial="enter" animate="center" exit="exit"
                                    transition={{ duration: 0.22, ease: 'easeInOut' }}>

                            {activeTab === 'info' && (
                                <div className="card overflow-hidden">
                                    <div className="card-header">
                                        <h3 className="card-title flex items-center gap-2">
                                            <FontAwesomeIcon icon={faUser} className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                                            اطلاعات کاربری
                                        </h3>
                                        <span className="badge badge-success" style={{ fontSize: '10px' }}>اطلاعات واقعی</span>
                                    </div>
                                    <div className="card-body">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <InfoRow icon={faUser}    label="نام کامل"     value={user.name} />
                                            <InfoRow icon={faUser}    label="نام کاربری"   value={user.username} />
                                            <InfoRow icon={faPhone}   label="شماره موبایل" value={user.phone} />
                                            <InfoRow icon={faIdCard}  label="کد ملی"       value={user.nationalCode} />
                                            <InfoRow icon={faHashtag} label="کد پرسنلی"    value={user.personnelCode} />
                                            <InfoRow icon={faUser}    label="نقش کاربری"   value={user.role} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="space-y-4">
                                    <div className="card">
                                        <div className="card-header">
                                            <h3 className="card-title flex items-center gap-2">
                                                <FontAwesomeIcon icon={faKey} className="w-4 h-4" style={{ color: 'var(--warning)' }} />
                                                تغییر رمز عبور
                                            </h3>
                                        </div>
                                        <div className="card-body space-y-3">
                                            {['رمز عبور فعلی', 'رمز عبور جدید', 'تکرار رمز جدید'].map(l => (
                                                <div key={l}>
                                                    <label className="form-label">{l}</label>
                                                    <input type="password" placeholder="••••••••" className="form-input" />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="card-footer">
                                            <button className="btn btn-primary">
                                                <FontAwesomeIcon icon={faKey} className="w-3.5 h-3.5" />تغییر رمز عبور
                                            </button>
                                        </div>
                                    </div>
                                    <div className="card">
                                        <div className="card-header">
                                            <h3 className="card-title flex items-center gap-2">
                                                <FontAwesomeIcon icon={faShield} className="w-4 h-4" style={{ color: 'var(--info)' }} />
                                                جلسات فعال
                                            </h3>
                                        </div>
                                        <div className="card-body space-y-3">
                                            {[
                                                { device: 'Chrome / Windows', location: 'تهران', time: 'همین الان',   current: true  },
                                                { device: 'Safari / iPhone',  location: 'تهران', time: '۲ ساعت پیش', current: false },
                                            ].map((s, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 rounded-xl"
                                                     style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{s.device}</p>
                                                            {s.current && <span className="badge badge-success" style={{ fontSize: '10px' }}>فعلی</span>}
                                                        </div>
                                                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.location} · {s.time}</p>
                                                    </div>
                                                    {!s.current && <button className="btn btn-danger btn-sm">پایان جلسه</button>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'notif' && (
                                <div className="card overflow-hidden">
                                    <div className="card-header">
                                        <h3 className="card-title flex items-center gap-2">
                                            <FontAwesomeIcon icon={faBell} className="w-4 h-4" style={{ color: 'var(--warning)' }} />
                                            تنظیمات اعلان
                                        </h3>
                                    </div>
                                    {NOTIF_DEFAULTS.map((n, i) => (
                                        <motion.div key={n.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.06 }}
                                                    className="flex items-center justify-between px-5 py-4"
                                                    style={{ borderBottom: i < NOTIF_DEFAULTS.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                            <div>
                                                <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{n.label}</p>
                                                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{n.desc}</p>
                                            </div>
                                            <Toggle enabled={notifSettings[n.id]}
                                                    onChange={() => setNotifSettings(p => ({ ...p, [n.id]: !p[n.id] }))} />
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'activity' && (
                                <div className="card overflow-hidden">
                                    <div className="card-header">
                                        <h3 className="card-title flex items-center gap-2">
                                            <FontAwesomeIcon icon={faClockRotateLeft} className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                                            آخرین فعالیت‌ها
                                        </h3>
                                    </div>
                                    <div className="card-body">
                                        <div className="relative">
                                            <div className="absolute right-5 top-0 bottom-0 w-px" style={{ background: 'var(--border)' }} />
                                            <div className="space-y-5">
                                                {ACTIVITY.map((a, i) => (
                                                    <motion.div key={a.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: i * 0.08 }}
                                                                className="flex items-center gap-4 relative">
                                                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 z-10"
                                                             style={{ background: 'var(--surface-2)', border: `2px solid ${a.color}44` }}>
                                                            {a.icon}
                                                        </div>
                                                        <div className="flex-1 p-3 rounded-xl"
                                                             style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                                                            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{a.action}</p>
                                                            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{a.time}</p>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
    )
}