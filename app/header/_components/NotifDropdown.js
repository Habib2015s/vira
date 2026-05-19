// app/header/_components/NotifDropdown.js
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell } from '@fortawesome/free-solid-svg-icons'

// داده موقت — بعداً از API بیاد
const notifications = [
    { id: 1, text: 'بارنامه جدید ثبت شد',  time: '۵ دقیقه پیش',  unread: true  },
    { id: 2, text: 'ماشین به مقصد رسید',    time: '۱۵ دقیقه پیش', unread: true  },
    { id: 3, text: 'پرداخت انجام شد',       time: '۱ ساعت پیش',   unread: false },
]

export function NotifDropdown({ isOpen, onToggle, notifRef, onNavigate, isDark }) {
    const unreadCount = notifications.filter(n => n.unread).length

    return (
        <div className="relative" ref={notifRef}>
            <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                           onClick={onToggle}
                           className="relative w-9 h-9 flex items-center justify-center rounded-xl transition-all"
                           style={{ background: isDark ? 'rgba(124,114,224,0.18)' : 'rgba(84,76,207,0.09)', color: 'var(--primary)' }}>
                <FontAwesomeIcon icon={faBell} className="w-4 h-4" />
                {unreadCount > 0 && (
                    <>
                        <span className="absolute -top-0.5 -left-0.5 w-4 h-4 rounded-full flex items-center justify-center font-bold text-white"
                              style={{ background: 'var(--danger)', fontSize: '10px' }}>{unreadCount}</span>
                        <span className="absolute -top-0.5 -left-0.5 w-4 h-4 rounded-full animate-ping opacity-50"
                              style={{ background: 'var(--danger)' }} />
                    </>
                )}
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div initial={{ opacity: 0, y: 6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 6, scale: 0.97 }} transition={{ duration: 0.16 }}
                                className="absolute mt-2 rounded-2xl overflow-hidden z-50"
                                style={{ left: 0, width: 'min(320px, calc(100vw - 24px))', background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
                        <div className="px-4 py-3 flex items-center justify-between"
                             style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                            <div>
                                <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>اعلان‌ها</p>
                                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{unreadCount} مورد خوانده نشده</p>
                            </div>
                            {unreadCount > 0 && (
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                                      style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
                                    {unreadCount} جدید
                                </span>
                            )}
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                            {notifications.map((notif, i) => (
                                <motion.button key={notif.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                                               transition={{ delay: i * 0.05 }}
                                               className="w-full text-right px-4 py-3 flex items-start gap-3 transition-all"
                                               style={{ background: notif.unread ? 'var(--primary-subtle)' : 'transparent' }}
                                               onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                                               onMouseLeave={e => e.currentTarget.style.background = notif.unread ? 'var(--primary-subtle)' : 'transparent'}>
                                    <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                                          style={{ background: notif.unread ? 'var(--primary)' : 'var(--border-strong)' }} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium leading-snug" style={{ color: 'var(--text)' }}>{notif.text}</p>
                                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{notif.time}</p>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                        <div style={{ borderTop: '1px solid var(--border)' }}>
                            <button className="w-full py-2.5 text-xs font-bold transition-all"
                                    style={{ color: 'var(--primary)' }}
                                    onClick={onNavigate}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                مشاهده همه اعلان‌ها ←
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}