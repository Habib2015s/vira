// app/notifications/_components/NotifGroup.js
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { NotifCard } from './NotifCard'

export function NotifGroup({ label, items, onRead, onDelete }) {
    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-black px-3 py-1 rounded-full"
                      style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>{label}</span>
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{items.length} اعلان</span>
            </div>
            <div className="card overflow-hidden">
                <AnimatePresence>
                    {items.map((notif, idx) => (
                        <div key={notif.id} style={{ borderBottom: idx < items.length - 1 ? '1px solid var(--border)' : 'none' }}>
                            <NotifCard notif={notif} index={idx} onRead={onRead} onDelete={onDelete} />
                        </div>
                    ))}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}