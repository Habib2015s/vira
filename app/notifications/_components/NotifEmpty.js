// app/notifications/_components/NotifEmpty.js
'use client'

import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInbox } from '@fortawesome/free-solid-svg-icons'

export function NotifEmpty() {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card text-center py-16">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--surface-2)' }}>
                <FontAwesomeIcon icon={faInbox} className="w-7 h-7" style={{ color: 'var(--muted)' }} />
            </div>
            <p className="font-bold text-base mb-1" style={{ color: 'var(--text)' }}>اعلانی یافت نشد</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>فیلتر دیگری را انتخاب کنید</p>
        </motion.div>
    )
}