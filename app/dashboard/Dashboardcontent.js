'use client'

import StatsCards from "@/app/cards/Statscards"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCalendar, faTruck, faChartLine, faClockRotateLeft, faWallet } from "@fortawesome/free-solid-svg-icons"
import { motion } from 'framer-motion'
import DashboardOverview from "@/app/components/DashboardOverview"

const quickStats = [
    { label: 'بارهای امروز', value: '۱۲',   icon: faTruck,          color: 'var(--info)',    bg: 'var(--info-light)'    },
    { label: 'درآمد امروز',  value: '۳.۲M',  icon: faChartLine,      color: 'var(--success)', bg: 'var(--success-light)' },
    { label: 'در انتظار',    value: '۸',     icon: faClockRotateLeft, color: 'var(--warning)', bg: 'var(--warning-light)' },
]

export default function DashboardContent() {
    return (
        <div className="w-full min-h-screen" style={{ background: 'var(--bg)' }}>

            {/* ── هدر ── */}
            <div className="page-header-bar">
                <div className="flex items-center justify-between gap-6 flex-wrap">

                    <div className="flex items-center gap-6">
                        {/* عنوان */}
                        <div>
                            <h2 className="text-2xl font-black text-white">داشبورد</h2>
                            <p className="text-sm flex items-center gap-2 mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
                                <FontAwesomeIcon icon={faCalendar} className="w-3.5 h-3.5" />
                                {new Date().toLocaleDateString('fa-IR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>

                        {/* آمار سریع */}
                        <div className="hidden lg:flex items-center gap-2">
                            {quickStats.map((stat, i) => (
                                <motion.div key={i}
                                            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl"
                                            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: stat.bg }}>
                                        <FontAwesomeIcon icon={stat.icon} className="w-4 h-4" style={{ color: stat.color }} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>{stat.label}</p>
                                        <p className="text-sm font-black text-white">{stat.value}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* کیف پول */}
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
                                className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                                style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.25)' }}>
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                             style={{ background: 'var(--success-light)' }}>
                            <FontAwesomeIcon icon={faWallet} className="w-4 h-4" style={{ color: 'var(--success)' }} />
                        </div>
                        <div>
                            <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>موجودی کیف پول</p>
                            <p className="text-base font-black text-white">۷,۶۸۴,۶۲۱ ریال</p>
                        </div>
                    </motion.div>

                </div>
            </div>

            {/* ── محتوا ── */}
            <div className="page-content">
                <StatsCards />
                <DashboardOverview />
            </div>

        </div>
    )
}