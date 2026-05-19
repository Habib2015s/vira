// app/header/_components/ProfileDropdown.js
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGear, faRightFromBracket, faCircleUser, faTicket } from '@fortawesome/free-solid-svg-icons'
import { LordIcon } from './LordIcon'
import { useUser } from '../_hooks/useUser'
export function ProfileDropdown({ isOpen, onToggle, dropdownRef, isDark, onLogout, onNavigate }) {
    const { user } = useUser()

    const menuItems = [
        { icon: faCircleUser, label: 'پروفایل من', color: 'var(--primary)', bg: 'var(--primary-light)', path: '/profile' },
        { icon: faTicket,     label: 'ثبت تیکت',  color: 'var(--success)', bg: 'var(--success-light)', path: '/tickets' },
    ]

    return (
        <div className="relative" ref={dropdownRef}>
            {/* ── دکمه هدر ── */}
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                           onClick={onToggle}
                           className="flex items-center gap-2.5 pr-1.5 pl-3 py-1.5 rounded-xl transition-all"
                           style={{ background: isDark ? 'rgba(30,39,51,0.9)' : 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden"
                     style={{ background: 'var(--primary-light)' }}>
                    <LordIcon src="https://cdn.lordicon.com/shcfcebj.json" trigger="hover"
                              colors={`primary:${isDark ? '#a5b4fc' : '#3730a3'},secondary:${isDark ? '#7c72e0' : '#544ccf'}`}
                              size={32} />
                </div>
                {/* ⭐ اسم واقعی */}
                <div className="hidden sm:flex flex-col leading-none text-right gap-1">
                    <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>{user.name}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full self-end"
                          style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                        {user.role}
                    </span>
                </div>
                <svg className="hidden sm:block" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                     style={{ color: 'var(--text-muted)', flexShrink: 0, transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
                    <path d="M6 9l6 6 6-6"/>
                </svg>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div initial={{ opacity: 0, y: 6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 6, scale: 0.97 }} transition={{ duration: 0.16 }}
                                className="absolute mt-2 rounded-2xl overflow-hidden z-50"
                                style={{ left: 0, width: 'min(280px, calc(100vw - 24px))', background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>

                        {/* ⭐ کارت کاربر با اطلاعات واقعی */}
                        <div className="px-5 py-4 flex items-center gap-3"
                             style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                                 style={{ background: 'var(--primary-light)', border: '2px solid var(--primary)', boxShadow: '0 4px 12px rgba(84,76,207,0.2)' }}>
                                <LordIcon src="https://cdn.lordicon.com/shcfcebj.json" trigger="loop"
                                          colors={`primary:${isDark ? '#a5b4fc' : '#3730a3'},secondary:${isDark ? '#7c72e0' : '#544ccf'}`}
                                          size={52} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="font-black text-base truncate" style={{ color: 'var(--text)' }}>
                                    {user.name}
                                </p>
                                <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                                    {user.email || user.credential || '—'}
                                </p>
                                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                                     style={{ background: 'var(--primary-light)', border: '1px solid var(--primary)' }}>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--success)' }} />
                                    <span className="text-[10px] font-bold" style={{ color: 'var(--primary)' }}>
                                        {user.role}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* آیتم‌ها */}
                        <div className="py-2">
                            {menuItems.map(({ icon, label, color, bg, path }) => (
                                <button key={label} onClick={() => onNavigate(path)}
                                        className="w-full text-right px-4 py-2.5 flex items-center gap-3 text-sm font-semibold transition-all"
                                        style={{ color: 'var(--text)' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                                        <FontAwesomeIcon icon={icon} className="w-4 h-4" style={{ color }} />
                                    </div>
                                    {label}
                                </button>
                            ))}

                            <div className="mx-4 my-1.5 h-px" style={{ background: 'var(--border)' }} />

                            <button onClick={onLogout}
                                    className="w-full text-right px-4 py-2.5 flex items-center gap-3 text-sm font-semibold transition-all"
                                    style={{ color: 'var(--danger)' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-light)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                     style={{ background: 'var(--danger-light)' }}>
                                    <FontAwesomeIcon icon={faRightFromBracket} className="w-4 h-4" style={{ color: 'var(--danger)' }} />
                                </div>
                                خروج از حساب
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}