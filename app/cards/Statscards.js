'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faFileLines, faTruck, faBoxesStacked, faMoneyBillWave,
    faChartLine, faUsers, faClipboardCheck, faWallet,
    faArrowUp, faArrowDown
} from '@fortawesome/free-solid-svg-icons'

const statsCategories = [
    {
        id: 'transport', label: 'حمل و نقل', icon: faTruck,
        stats: [
            { id: 1, label: 'بارهای در حال حمل', value: '۵۶', subValue: 'تعداد بار', change: '+۸٪', trend: 'up', icon: faBoxesStacked },
            { id: 2, label: 'ماشین‌های فعال', value: '۳۸', subValue: 'تعداد ماشین', change: '+۳٪', trend: 'up', icon: faTruck },
            { id: 3, label: 'تعداد بارنامه‌ها', value: '۱۲۴', subValue: 'بارنامه', change: '+۱۲٪', trend: 'up', icon: faFileLines },
        ]
    },
    {
        id: 'financial', label: 'مالی', icon: faMoneyBillWave,
        stats: [
            { id: 4, label: 'درآمد این ماه', value: '۲۳.۵', subValue: 'میلیون تومان', change: '+۱۸٪', trend: 'up', icon: faMoneyBillWave },
            { id: 5, label: 'موجودی کیف پول', value: '۷.۶', subValue: 'میلیون تومان', change: '+۵٪', trend: 'up', icon: faWallet },
            { id: 6, label: 'درآمد سالانه', value: '۲۸۰', subValue: 'میلیون تومان', change: '+۲۲٪', trend: 'up', icon: faChartLine },
        ]
    },
    {
        id: 'users', label: 'کاربران', icon: faUsers,
        stats: [
            { id: 7, label: 'رانندگان فعال', value: '۴۲', subValue: 'راننده', change: '+۶٪', trend: 'up', icon: faUsers },
            { id: 8, label: 'کاربران جدید', value: '۱۸', subValue: 'کاربر', change: '-۲٪', trend: 'down', icon: faUsers },
            { id: 9, label: 'تراکنش‌های امروز', value: '۹۳', subValue: 'تراکنش', change: '+۱۵٪', trend: 'up', icon: faClipboardCheck },
        ]
    }
]

export default function StatsCards() {
    const [activeTab, setActiveTab] = useState('transport')
    const activeCategory = statsCategories.find(cat => cat.id === activeTab)

    return (
        <div>
            {/* Tabs */}
            <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide">
                {statsCategories.map((cat) => {
                    const isActive = activeTab === cat.id
                    return (
                        <motion.button key={cat.id} onClick={() => setActiveTab(cat.id)}
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                            className="relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all overflow-hidden"
                            style={{
                                background: isActive ? 'var(--primary)' : 'var(--surface)',
                                color: isActive ? '#fff' : 'var(--text-soft)',
                                border: `1px solid ${isActive ? 'var(--primary)' : 'var(--border)'}`,
                                boxShadow: isActive ? '0 4px 12px rgba(79,70,229,0.3)' : 'var(--shadow-sm)'
                            }}
                        >
                            <FontAwesomeIcon icon={cat.icon} className="w-4 h-4" />
                            {cat.label}
                        </motion.button>
                    )
                })}
            </div>

            {/* Cards */}
            <AnimatePresence mode="wait">
                <motion.div key={activeTab}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                >
                    {activeCategory?.stats.map((stat, i) => (
                        <motion.div key={stat.id}
                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }} whileHover={{ y: -3 }}
                            className="card overflow-hidden transition-all"
                            style={{ cursor: 'default' }}
                        >
                            {/* Top accent line */}
                            <div style={{ height: '3px', background: 'var(--primary)' }} />

                            <div className="p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                                            style={{ background: 'var(--primary-light)' }}>
                                            <FontAwesomeIcon icon={stat.icon} className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                                        </div>
                                        <h3 className="text-sm font-bold" style={{ color: 'var(--text-soft)' }}>{stat.label}</h3>
                                    </div>
                                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold"
                                        style={{
                                            background: stat.trend === 'up' ? 'var(--success-light)' : 'var(--danger-light)',
                                            color: stat.trend === 'up' ? 'var(--success)' : 'var(--danger)'
                                        }}>
                                        <FontAwesomeIcon icon={stat.trend === 'up' ? faArrowUp : faArrowDown} className="w-2.5 h-2.5" />
                                        {stat.change}
                                    </div>
                                </div>

                                <div className="flex items-baseline gap-2 mb-3">
                                    <span className="text-4xl font-black" style={{ color: 'var(--text)' }}>{stat.value}</span>
                                    <span className="text-sm font-medium" style={{ color: 'var(--muted)' }}>{stat.subValue}</span>
                                </div>

                                {/* Progress bar */}
                                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
                                    <motion.div
                                        initial={{ width: 0 }} animate={{ width: '72%' }}
                                        transition={{ delay: i * 0.08 + 0.3, duration: 0.8 }}
                                        className="h-full rounded-full"
                                        style={{ background: 'var(--primary)' }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </AnimatePresence>
        </div>
    )
}
