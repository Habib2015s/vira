'use client'

import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWallet, faChartLine, faUsers, faPercent, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons'

const kpis = [
    { label: 'مجموع هزینه‌ها', value: '۲۴,۵۰۰', unit: 'ریال', icon: faWallet,    change: '۵.۴٪', trend: 'up' },
    { label: 'میانگین درآمد',   value: '۴,۱۷۵',  unit: 'ریال', icon: faChartLine, change: '۳.۳٪', trend: 'down' },
    { label: 'هزینه جذب',      value: '۵۸',     unit: 'ریال', icon: faUsers,     change: '۱۳.۳٪', trend: 'down' },
    { label: 'نرخ تبدیل',      value: '۱۵.۸۹٪', unit: '',    icon: faPercent,   change: '۸.۵٪', trend: 'up' },
]

export default function KpiRow() {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((k, i) => (
                <motion.div key={k.label}
                            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.06 }}
                            className="card p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                             style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                            <FontAwesomeIcon icon={k.icon} className="w-4 h-4" style={{ color: 'var(--text)' }} />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-bold"
                              style={{ color: k.trend === 'up' ? 'var(--success)' : 'var(--danger)' }}>
                            {k.change}
                            <FontAwesomeIcon icon={k.trend === 'up' ? faArrowUp : faArrowDown} className="w-2.5 h-2.5" />
                        </span>
                    </div>
                    <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>{k.label}</p>
                    <p className="text-xl font-black" style={{ color: 'var(--text)' }}>
                        {k.value} <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{k.unit}</span>
                    </p>
                </motion.div>
            ))}
        </div>
    )
}