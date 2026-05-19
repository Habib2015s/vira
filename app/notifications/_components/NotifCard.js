// app/notifications/_components/NotifCard.js
'use client'

import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faTrash } from '@fortawesome/free-solid-svg-icons'
import { TYPE_CONFIG } from '../_data/notifConfig'
import { timeLabel } from '../_data/notifHelpers'

export function NotifCard({ notif, index, onRead, onDelete }) {
    const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.alert
    return (
        <motion.div layout
                    initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12, height: 0 }} transition={{ delay: index * 0.04 }}
                    className="flex items-start gap-4 px-4 py-3.5 group cursor-pointer transition-all"
                    style={{ background: notif.unread ? 'var(--primary-subtle)' : 'transparent', borderRight: notif.unread ? '3px solid var(--primary)' : '3px solid transparent' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                    onMouseLeave={e => e.currentTarget.style.background = notif.unread ? 'var(--primary-subtle)' : 'transparent'}
                    onClick={() => onRead(notif.id)}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: cfg.bg }}>
                <FontAwesomeIcon icon={cfg.icon} className="w-4 h-4" style={{ color: cfg.color }} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold leading-snug" style={{ color: 'var(--text)' }}>
                        {notif.unread && <span className="inline-block w-1.5 h-1.5 rounded-full ml-1.5 align-middle" style={{ background: 'var(--primary)' }} />}
                        {notif.title}
                    </p>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{timeLabel(notif.time)}</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {notif.unread && (
                                <button onClick={e => { e.stopPropagation(); onRead(notif.id) }} title="خوانده شد"
                                        className="w-6 h-6 rounded-lg flex items-center justify-center"
                                        style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
                                    <FontAwesomeIcon icon={faCheck} className="w-3 h-3" />
                                </button>
                            )}
                            <button onClick={e => { e.stopPropagation(); onDelete(notif.id) }} title="حذف"
                                    className="w-6 h-6 rounded-lg flex items-center justify-center"
                                    style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
                                <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </div>
                <p className="text-xs mt-1 line-clamp-1" style={{ color: 'var(--text-muted)' }}>{notif.desc}</p>
                <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: cfg.bg, color: cfg.color }}>
                    <FontAwesomeIcon icon={cfg.icon} className="w-2.5 h-2.5" />{cfg.label}
                </span>
            </div>
        </motion.div>
    )
}