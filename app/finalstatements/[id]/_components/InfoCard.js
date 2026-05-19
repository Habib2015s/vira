'use client'

import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export function InfoCard({ icon, label, value, i = 0 }) {
    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="card p-5 flex items-start gap-4 transition-all cursor-default"
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                 style={{ background: 'var(--primary-light)' }}>
                <FontAwesomeIcon icon={icon} className="w-4 h-4" style={{ color: 'var(--primary)' }} />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
                <p className="text-base font-bold truncate" style={{ color: 'var(--text)' }}>{value || '—'}</p>
            </div>
        </motion.div>
    )
}