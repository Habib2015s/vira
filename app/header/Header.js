// app/header/Header.js
'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass, faSyncAlt, faXmark } from '@fortawesome/free-solid-svg-icons'
import { useTheme }         from './_hooks/useTheme'
import { useHeader }        from './_hooks/useHeader'
import { ThemeToggle }      from './_components/ThemeToggle'
import { NotifDropdown }    from './_components/NotifDropdown'
import { ProfileDropdown }  from './_components/ProfileDropdown'

export default function Header() {
    const { isDark, toggleTheme } = useTheme()
    const {
        router, dropdownOpen, notifOpen,
        dropdownRef, notifRef, logout,
        toggleDropdown, toggleNotif,
        setDropdownOpen, setNotifOpen,
    } = useHeader()

    const [query, setQuery]           = useState('')
    const [searchOpen, setSearchOpen] = useState(false)
    const [spinning, setSpinning]     = useState(false)
    const inputRef                    = useRef(null)
    const searchWrapRef               = useRef(null)

    useEffect(() => {
        if (searchOpen) {
            const t = setTimeout(() => inputRef.current?.focus(), 180)
            return () => clearTimeout(t)
        }
    }, [searchOpen])

    useEffect(() => {
        const handler = (e) => {
            if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
                if (!query) setSearchOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [query])

    const handleRefresh = () => {
        setSpinning(true)
        router.refresh()
        setTimeout(() => setSpinning(false), 800)
    }

    const handleSearchKey = (e) => {
        if (e.key === 'Escape') {
            setQuery('')
            setSearchOpen(false)
            inputRef.current?.blur()
        }
    }

    return (
        <header
            className="h-14 flex items-center sticky top-0 z-30 pl-4 pr-16 lg:pr-4"
            style={{
                background: 'var(--surface)',
                borderBottom: '1px solid var(--border)',
            }}
        >
            {/*
              در RTL:
              - flex-start = راست صفحه
              - flex-end   = چپ صفحه
              پس اول سرچ می‌آید (راست) و بعد ابزارها (چپ)
            */}
            <div className="flex items-center justify-between w-full gap-3">

                {/* ═══════════ راست: سرچ جمع‌شونده ═══════════ */}
                <div className="flex items-center" ref={searchWrapRef}>
                    <motion.div
                        className="relative flex items-center"
                        initial={false}
                        animate={{ width: searchOpen ? 280 : 36 }}
                        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                        style={{ height: 36, overflow: 'hidden' }}
                        onMouseEnter={() => setSearchOpen(true)}
                    >
                        {/* پس‌زمینه */}
                        <motion.div
                            className="absolute inset-0 rounded-xl"
                            animate={{
                                background: searchOpen ? 'var(--surface-2)' : 'transparent',
                                borderColor: searchOpen ? 'var(--border)' : 'transparent',
                            }}
                            style={{ border: '1px solid transparent' }}
                            transition={{ duration: 0.2 }}
                        />

                        {/* آیکون سرچ */}
                        <button
                            type="button"
                            onClick={() => setSearchOpen(true)}
                            className="absolute right-0 top-0 w-9 h-9 rounded-xl flex items-center justify-center z-10"
                            style={{ color: searchOpen ? 'var(--text)' : 'var(--text-muted)' }}
                            onMouseEnter={e => { if (!searchOpen) e.currentTarget.style.background = 'var(--surface-2)' }}
                            onMouseLeave={e => { if (!searchOpen) e.currentTarget.style.background = 'transparent' }}
                            title="جستجو"
                        >
                            <FontAwesomeIcon icon={faMagnifyingGlass} className="w-3.5 h-3.5" />
                        </button>

                        {/* اینپوت */}
                        <AnimatePresence>
                            {searchOpen && (
                                <motion.input
                                    ref={inputRef}
                                    key="search-input"
                                    type="text"
                                    value={query}
                                    onChange={e => setQuery(e.target.value)}
                                    onKeyDown={handleSearchKey}
                                    placeholder="جستجو..."
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 6 }}
                                    transition={{ duration: 0.16 }}
                                    className="absolute inset-0 w-full h-full bg-transparent outline-none text-sm font-medium"
                                    style={{
                                        color: 'var(--text)',
                                        paddingRight: 38,
                                        paddingLeft: query ? 34 : 12,
                                    }}
                                />
                            )}
                        </AnimatePresence>

                        {/* پاک کردن */}
                        <AnimatePresence>
                            {searchOpen && query && (
                                <motion.button
                                    type="button"
                                    initial={{ opacity: 0, scale: 0.6 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.6 }}
                                    onClick={() => { setQuery(''); inputRef.current?.focus() }}
                                    className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg flex items-center justify-center z-10"
                                    style={{ color: 'var(--muted)' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--border)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

                {/* ═══════════ چپ: ابزارها + پروفایل ═══════════ */}
                <div className="flex items-center gap-0.5 flex-shrink-0">

                    {/* بروزرسانی */}
                    <motion.button
                        title="بروزرسانی"
                        onClick={handleRefresh}
                        whileTap={{ scale: 0.9 }}
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
                    >
                        <motion.span
                            animate={spinning ? { rotate: 360 } : { rotate: 0 }}
                            transition={spinning ? { duration: 0.7, ease: 'linear' } : {}}
                            className="inline-flex"
                        >
                            <FontAwesomeIcon icon={faSyncAlt} className="w-3.5 h-3.5" />
                        </motion.span>
                    </motion.button>

                    {/* تم */}
                    <ThemeToggle isDark={isDark} onToggle={toggleTheme} />

                    {/* نوتیف */}
                    <NotifDropdown
                        isOpen={notifOpen}
                        onToggle={toggleNotif}
                        notifRef={notifRef}
                        isDark={isDark}
                        onNavigate={() => { setNotifOpen(false); router.push('/notifications') }}
                    />

                    {/* خط جداکننده */}
                    <div
                        className="w-px h-5 mx-1.5 hidden sm:block"
                        style={{ background: 'var(--border)' }}
                    />

                    {/* پروفایل */}
                    <ProfileDropdown
                        isOpen={dropdownOpen}
                        onToggle={toggleDropdown}
                        dropdownRef={dropdownRef}
                        isDark={isDark}
                        onLogout={logout}
                        onNavigate={(path) => { setDropdownOpen(false); if (path) router.push(path) }}
                    />
                </div>
            </div>
        </header>
    )
}
