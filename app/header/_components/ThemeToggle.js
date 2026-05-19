// app/header/_components/ThemeToggle.js
'use client'

import { motion, AnimatePresence } from 'framer-motion'

export function ThemeToggle({ isDark, onToggle }) {
    return (
        <button onClick={onToggle} title={isDark ? 'تم روشن' : 'تم تیره'} aria-label="تغییر تم"
                style={{
                    position: 'relative', width: 52, height: 26, borderRadius: 100,
                    border: 'none', cursor: 'pointer', padding: 0, outline: 'none', flexShrink: 0,
                    background: isDark ? '#3730a3' : '#d4a017',
                    transition: 'background 0.35s ease',
                }}>
            <motion.div animate={{ x: isDark ? 26 : 0 }} transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                        style={{
                            position: 'absolute', top: 3, left: 3, width: 20, height: 20,
                            borderRadius: '50%', background: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.28)',
                        }}>
                <AnimatePresence mode="wait" initial={false}>
                    {isDark ? (
                        <motion.svg key="moon" initial={{ opacity: 0, rotate: -60, scale: 0.5 }} animate={{ opacity: 1, rotate: 0, scale: 1 }} exit={{ opacity: 0, rotate: 60, scale: 0.5 }} transition={{ duration: 0.18 }} width="11" height="11" viewBox="0 0 24 24" fill="#6366f1">
                            <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"/>
                        </motion.svg>
                    ) : (
                        <motion.svg key="sun" initial={{ opacity: 0, rotate: 60, scale: 0.5 }} animate={{ opacity: 1, rotate: 0, scale: 1 }} exit={{ opacity: 0, rotate: -60, scale: 0.5 }} transition={{ duration: 0.18 }} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round">
                            <circle cx="12" cy="12" r="4"/>
                            <line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/>
                            <line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/>
                            <line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/>
                            <line x1="19.78" y1="4.22" x2="17.66" y2="6.34"/><line x1="6.34" y1="17.66" x2="4.22" y2="19.78"/>
                        </motion.svg>
                    )}
                </AnimatePresence>
            </motion.div>
        </button>
    )
}