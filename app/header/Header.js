// app/header/Header.js
'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useTheme }         from './_hooks/useTheme'
import { useHeader }        from './_hooks/useHeader'
import { ThemeToggle }      from './_components/ThemeToggle'
import { NotifDropdown }    from './_components/NotifDropdown'
import { ProfileDropdown }  from './_components/ProfileDropdown'

export default function Header() {
    const { isDark, toggleTheme }                                                           = useTheme()
    const { router, dropdownOpen, notifOpen, dropdownRef, notifRef, logout, toggleDropdown, toggleNotif, setDropdownOpen, setNotifOpen } = useHeader()

    return (
        <header className="h-14 flex items-center justify-between sticky top-0 z-30"
                style={{
                    padding: '0 16px',
                    background:     isDark ? 'rgba(22,27,34,0.96)' : 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(16px)',
                    borderBottom:   '1px solid var(--border)',
                    boxShadow:      isDark
                        ? '0 1px 0 rgba(255,255,255,0.04), 0 2px 12px rgba(0,0,0,0.35)'
                        : '0 1px 0 rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.05)',
                }}>

            {/* لوگو */}
            <div className="flex items-center gap-2 min-w-0">
                <motion.div animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                            className="flex-shrink-0">
                    <Image src="/IMG_20260420_095352_613.png" alt="logo" width={40} height={40}
                           className="object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.25)]" priority />
                </motion.div>
                <span className="hidden sm:block text-sm font-bold truncate" style={{ color: 'var(--text)' }}>
                    سامانه ویرا
                </span>
            </div>

            {/* ابزارها */}
            <div className="flex items-center gap-2 flex-shrink-0">

                <ThemeToggle isDark={isDark} onToggle={toggleTheme} />

                <NotifDropdown
                    isOpen={notifOpen}
                    onToggle={toggleNotif}
                    notifRef={notifRef}
                    isDark={isDark}
                    onNavigate={() => { setNotifOpen(false); router.push('/notifications') }}
                />

                <ProfileDropdown
                    isOpen={dropdownOpen}
                    onToggle={toggleDropdown}
                    dropdownRef={dropdownRef}
                    isDark={isDark}
                    onLogout={logout}
                    onNavigate={(path) => { setDropdownOpen(false); if (path) router.push(path) }}
                />
            </div>
        </header>
    )
}