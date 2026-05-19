'use client'

import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileInvoiceDollar, faCheck, faClock, faCreditCard } from '@fortawesome/free-solid-svg-icons'

export function FactorsStats({ data }) {
    const totalOwed  = data.reduce((s, f) => s + (f.amount_owed || 0), 0)
    const confirmed  = data.filter(f => f.status === 'confirmed').length
    const pending    = data.filter(f => f.status === 'pre-invoice').length

    const stats = [
        { label: 'کل فاکتورها', value: data.length,                           color: 'var(--primary)', bg: 'var(--primary-light)', icon: faFileInvoiceDollar },
        { label: 'تأیید شده',   value: confirmed,                             color: 'var(--success)', bg: 'var(--success-light)', icon: faCheck             },
        { label: 'در انتظار',   value: pending,                               color: 'var(--warning)', bg: 'var(--warning-light)', icon: faClock             },
        { label: 'کل مانده',    value: `${totalOwed.toLocaleString('fa-IR')} ﷼`, color: 'var(--danger)', bg: 'var(--danger-light)', icon: faCreditCard       },
    ]

    return (
        <div className="max-w-7xl mx-auto px-8 pt-5 grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map(({ label, value, color, bg, icon }, i) => (
                <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="card p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                        <FontAwesomeIcon icon={icon} className="w-4 h-4" style={{ color }} />
                    </div>
                    <div>
                        <p className="text-lg font-black leading-none" style={{ color }}>{value}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
                    </div>
                </motion.div>
            ))}
        </div>
    )
}