'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faHouse, faFileLines, faChevronLeft, faChevronDown, faBars, faXmark,
    faWrench, faStore, faFileContract, faUserCog, faLayerGroup, faClipboardList,
    faUsers, faBuilding, faFileInvoiceDollar, faClipboardCheck, faBoxOpen,
    faArrowRightArrowLeft, faChevronRight, faUserShield, faRuler, faTruckRampBox,
    faReceipt, faIdCard, faTruck, faUser, faKey, faShield, faTicket, faSyncAlt,
} from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'

const menuGroups = [
    {
        groupLabel: 'داشبورد',
        items: [
            { id: 'dashboard', label: 'خانه', icon: faHouse, path: '/dashboard' },
        ]
    },
    {
        groupLabel: 'عملیات تعمیرگاه',
        items: [
            { id: 'requests',   label: 'کدهای TM',          icon: faWrench,       submenu: [{ label: 'لیست کدهای TM', path: '/requests/list' }, { label: 'افزودن کد TM', path: '/requests/create' }] },
            { id: 'tmrequests', label: 'درخواست‌های تعمیر', icon: faClipboardList, submenu: [{ label: 'لیست درخواست‌ها', path: '/tmrequests' }, { label: 'درخواست جدید', path: '/tmrequests/create' }] },
            { id: 'repairmen',  label: 'تعمیرکاران',        icon: faUserCog,      submenu: [{ label: 'لیست تعمیرکاران', path: '/repairmen' }, { label: 'افزودن تعمیرکار', path: '/repairmen/create' }] },
            { id: 'pmgroups',   label: 'گروه‌های PM',       icon: faLayerGroup,   submenu: [{ label: 'لیست گروه‌ها', path: '/pmgroups' }, { label: 'افزودن گروه', path: '/pmgroups/create' }] },
            { id: 'waybills',   label: 'بارنامه',            icon: faFileLines,    submenu: [{ label: 'لیست بارنامه‌ها', path: '/waybills' }] },
        ]
    },
    {
        groupLabel: 'مدیریت مالی',
        items: [
            { id: 'shops',                   label: 'شاپ‌ها',                icon: faStore,           submenu: [{ label: 'لیست شاپ‌ها', path: '/shops' }, { label: 'افزودن شاپ', path: '/shops/create' }] },
            { id: 'finalstatements',         label: 'صورت وضعیت‌ها',        icon: faFileContract,    submenu: [{ label: 'لیست صورت وضعیت‌ها', path: '/finalstatements' }, { label: 'ایجاد صورت وضعیت', path: '/finalstatements/create' }] },
            { id: 'finalstatements-factors', label: 'فاکتورهای صورت وضعیت', icon: faReceipt,         submenu: [{ label: 'لیست فاکتورها', path: '/factors' }] },
            { id: 'account-sides',           label: 'طرف‌های حساب',         icon: faBuilding,        submenu: [{ label: 'لیست طرف‌های حساب', path: '/account-sides' }, { label: 'افزودن', path: '/account-sides/create' }] },
        ]
    },
    {
        groupLabel: 'انبارداری',
        items: [
            { id: 'warehouse-products',    label: 'محصولات',           icon: faBoxOpen,            submenu: [{ label: 'لیست محصولات', path: '/warehouse/products' }, { label: 'افزودن محصول', path: '/warehouse/products/create' }] },
            { id: 'warehouse-storehouses', label: 'انبارها',            icon: faBuilding,           submenu: [{ label: 'لیست انبارها', path: '/warehouse/storehouses' }, { label: 'افزودن انبار', path: '/warehouse/storehouses/create' }] },
            { id: 'warehouse-users',       label: 'کاربران انبار',      icon: faUserShield,         submenu: [{ label: 'مدیریت دسترسی‌ها', path: '/warehouse/users' }] },
            { id: 'warehouse-units',       label: 'واحد اندازه‌گیری',   icon: faRuler,              submenu: [{ label: 'لیست واحدها', path: '/warehouse/units' }, { label: 'افزودن واحد', path: '/warehouse/units/create' }] },
            { id: 'warehouse-customers',   label: 'مشتریان',            icon: faUsers,              submenu: [{ label: 'لیست مشتریان', path: '/warehouse/customers' }, { label: 'افزودن مشتری', path: '/warehouse/customers/create' }] },
            { id: 'warehouse-factors',     label: 'فاکتورهای انبار',    icon: faFileInvoiceDollar,  submenu: [{ label: 'لیست فاکتورها', path: '/warehouse/factors' }, { label: 'فاکتور جدید', path: '/warehouse/factors/create' }] },
            { id: 'warehouse-requests',    label: 'درخواست‌های انبار',  icon: faClipboardCheck,     submenu: [{ label: 'لیست درخواست‌ها', path: '/warehouse/requests' }, { label: 'درخواست جدید', path: '/warehouse/requests/create' }] },
            { id: 'warehouse-transfers',   label: 'انتقال بین انبارها', icon: faArrowRightArrowLeft, submenu: [{ label: 'لیست انتقال‌ها', path: '/warehouse/transfers' }, { label: 'انتقال جدید', path: '/warehouse/transfers/create' }] },
            { id: 'warehouse-imports',     label: 'ورود / خروج کالا',   icon: faTruckRampBox,       path: '/warehouse/imports' },
        ]
    },
    {
        groupLabel: 'حمل و نقل',
        items: [
            { id: 'drivers',           label: 'رانندگان',        icon: faIdCard,    submenu: [{ label: 'لیست رانندگان', path: '/drivers' }, { label: 'راننده جدید', path: '/drivers/create' }] },
            { id: 'mechanisms',        label: 'مکانیزم‌ها',      icon: faTruck,     submenu: [{ label: 'لیست مکانیزم‌ها', path: '/mechanisms' }, { label: 'مکانیزم جدید', path: '/mechanisms/create' }] },
            { id: 'mechanism-groups',  label: 'گروه‌های مکانیزم', icon: faLayerGroup, submenu: [{ label: 'لیست گروه‌ها', path: '/mechanism-groups' }, { label: 'گروه جدید', path: '/mechanism-groups/create' }] },
            { id: 'owners',            label: 'مالکین',           icon: faUser,      submenu: [{ label: 'لیست مالکین', path: '/owners' }, { label: 'مالک جدید', path: '/owners/create' }] },
        ]
    },
    {
        groupLabel: 'مدیریت سیستم',
        items: [
            { id: 'roles',       label: 'نقش‌ها',      icon: faShield,  path: '/roles' },
            { id: 'permissions', label: 'دسترسی‌ها',   icon: faKey,     path: '/permissions' },
            { id: 'tickets',     label: 'تیکت‌ها',     icon: faTicket,  submenu: [{ label: 'لیست تیکت‌ها', path: '/tickets' }, { label: 'تیکت جدید', path: '/tickets/create' }] },
        ]
    },
]

const allItems = menuGroups.flatMap(g => g.items)

function FlyoutMenu({ item, isActive, onNavigate }) {
    const [open, setOpen] = useState(false)
    const [top,  setTop]  = useState(0)
    const wrapRef         = useRef(null)
    const hideTimer       = useRef(null)
    const router          = useRouter()
    const pathname        = usePathname()
    const hasSubmenu      = item.submenu?.length > 0

    const show = useCallback(() => { clearTimeout(hideTimer.current); if (wrapRef.current) setTop(wrapRef.current.getBoundingClientRect().top); setOpen(true) }, [])
    const hide = useCallback(() => { hideTimer.current = setTimeout(() => setOpen(false), 80) }, [])
    const keep = useCallback(() => clearTimeout(hideTimer.current), [])
    useEffect(() => () => clearTimeout(hideTimer.current), [])

    return (
        <div ref={wrapRef} className="relative" onMouseEnter={show} onMouseLeave={hide}>
            <div className="w-full h-10 flex items-center justify-center rounded-xl cursor-pointer transition-all"
                 style={{ background: isActive ? 'var(--surface-2)' : 'transparent', color: isActive ? 'var(--text)' : 'var(--text-soft)', border: isActive ? '1px solid var(--border-strong)' : '1px solid transparent' }}
                 onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--surface-2)' }}
                 onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                 onClick={() => { if (hasSubmenu) router.push(item.submenu[0].path); else if (item.path) router.push(item.path) }}>
                <FontAwesomeIcon icon={item.icon} className="w-4 h-4" />
            </div>
            <AnimatePresence>
                {open && (
                    <motion.div initial={{ opacity: 0, x: -8, scale: 0.96 }} animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: -8, scale: 0.96 }} transition={{ duration: 0.14 }}
                                onMouseEnter={keep} onMouseLeave={hide}
                                style={{ position: 'fixed', right: '88px', top: `${top}px`, zIndex: 9999, minWidth: '210px' }}>
                        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
                            <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: 'var(--primary)' }}>
                                <FontAwesomeIcon icon={item.icon} className="w-3.5 h-3.5 text-white opacity-90" />
                                <span className="text-sm font-black text-white">{item.label}</span>
                            </div>
                            {hasSubmenu ? item.submenu.map((sub, i) => {
                                const isSubActive = pathname === sub.path
                                return (
                                    <Link key={i} href={sub.path} onClick={() => { setOpen(false); onNavigate?.() }}>
                                        <div className="flex items-center gap-2.5 px-4 py-2.5 transition-all"
                                             style={{ color: isSubActive ? 'var(--primary)' : 'var(--text-soft)', background: isSubActive ? 'var(--primary-light)' : 'transparent', fontWeight: isSubActive ? '700' : '500', fontSize: '13.5px', borderRight: isSubActive ? '3px solid var(--primary)' : '3px solid transparent' }}
                                             onMouseEnter={e => { if (!isSubActive) e.currentTarget.style.background = 'var(--surface-2)' }}
                                             onMouseLeave={e => { if (!isSubActive) e.currentTarget.style.background = isSubActive ? 'var(--primary-light)' : 'transparent' }}>
                                            <FontAwesomeIcon icon={faChevronLeft} className="w-2.5 h-2.5 opacity-40 flex-shrink-0" />{sub.label}
                                        </div>
                                    </Link>
                                )
                            }) : (
                                <Link href={item.path} onClick={() => { setOpen(false); onNavigate?.() }}>
                                    <div className="flex items-center gap-2.5 px-4 py-2.5 text-sm" style={{ color: 'var(--text-soft)' }}
                                         onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                                         onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                        <FontAwesomeIcon icon={faChevronLeft} className="w-2.5 h-2.5 opacity-40" />رفتن به {item.label}
                                    </div>
                                </Link>
                            )}
                        </div>
                        <div style={{ position: 'absolute', top: '12px', right: '-6px', width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: '6px solid var(--primary)' }} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default function Sidebar({ isOpen, setIsOpen }) {
    const scrollRef = useRef(null)
    const pathname  = usePathname()

    const activeMenuId = allItems.find(item =>
        item.path === pathname || item.submenu?.some(sub => pathname === sub.path)
    )?.id ?? null

    const [openMenus, setOpenMenus] = useState(() => activeMenuId ? new Set([activeMenuId]) : new Set())

    useEffect(() => { if (activeMenuId) setOpenMenus(prev => new Set([...prev, activeMenuId])) }, [activeMenuId])

    useEffect(() => {
        const saved = sessionStorage.getItem('sidebar-scroll')
        if (saved && scrollRef.current) scrollRef.current.scrollTop = parseInt(saved, 10)
    }, [pathname])

    const saveScroll = () => { if (scrollRef.current) sessionStorage.setItem('sidebar-scroll', scrollRef.current.scrollTop) }

    const toggleMenu = (menuId) => {
        if (!isOpen || menuId === activeMenuId) return
        setOpenMenus(prev => { const next = new Set(prev); next.has(menuId) ? next.delete(menuId) : next.add(menuId); return next })
    }

    const isSubmenuActive  = (submenu) => submenu?.some(s => pathname === s.path)
    const handleMobileClose = () => { if (window.innerWidth < 1024) setIsOpen(false) }

    return (
        <>
            <button onClick={() => setIsOpen(!isOpen)}
                    className="lg:hidden fixed top-3 right-3 z-50 w-10 h-10 flex items-center justify-center rounded-xl shadow-md"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <FontAwesomeIcon icon={isOpen ? faXmark : faBars} className="w-5 h-5" style={{ color: 'var(--text-soft)' }} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div key="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onClick={() => setIsOpen(false)} className="lg:hidden fixed inset-0 z-30"
                                style={{ background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(2px)' }} />
                )}
            </AnimatePresence>

            {/* روی موبایل وقتی بسته‌ست کاملاً مخفیه (کشو) — روی lg به بالا همیشه به‌صورت نوار (باز/جمع) نمایش داده میشه */}
            <motion.aside animate={{ width: isOpen ? 260 : 80 }} transition={{ duration: 0.28, ease: 'easeInOut' }}
                          className={`fixed right-0 top-0 h-screen flex-col z-40 overflow-hidden ${isOpen ? 'flex' : 'hidden lg:flex'}`}
                          style={{ background: 'var(--surface)', borderLeft: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>

                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
                    <AnimatePresence mode="wait">
                        {isOpen ? (
                            <motion.div key="open" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        className="flex items-center gap-3 flex-1 min-w-0">
                                <motion.div animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }} className="flex justify-center m-2 flex-shrink-0">
                                    <Image src="/IMG_20260420_095352_613.png" alt="logo" width={52} height={52} className="object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.35)]" priority />
                                </motion.div>
                                <span className="font-bold text-base truncate" style={{ color: 'var(--text)' }}>سامانه ویرا</span>
                            </motion.div>
                        ) : (
                            <motion.div key="closed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center w-full">
                                <Image src="/IMG_20260420_095352_613.png" alt="logo" width={48} height={48} className="object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.35)]" priority />
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {isOpen && (
                        <button onClick={() => setIsOpen(false)} className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg shrink-0 transition-all"
                                style={{ color: 'var(--text-muted)' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <FontAwesomeIcon icon={faChevronRight} className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Nav */}
                <nav ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide py-3 px-2">
                    {!isOpen && (
                        <div className="mb-3 px-2">
                            <button onClick={() => setIsOpen(true)} className="w-full h-10 flex items-center justify-center rounded-xl transition-all"
                                    style={{ background: 'var(--surface-2)', color: 'var(--primary)', border: '1px solid var(--border)' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-2)'}>
                                <FontAwesomeIcon icon={faChevronRight} className="w-4 h-4 rotate-180" />
                            </button>
                        </div>
                    )}

                    {menuGroups.map((group, gIdx) => (
                        <div key={gIdx} className={gIdx > 0 ? 'mt-2' : ''}>
                            <AnimatePresence>
                                {isOpen && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                className="mx-1 mb-2 px-3 py-2 rounded-xl select-none text-center"
                                                style={{ border: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                                        <span className="text-[12px] font-black tracking-widest uppercase" style={{ color: 'var(--primary)' }}>
                                            {group.groupLabel}
                                        </span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            {!isOpen && gIdx > 0 && <div className="mx-3 my-2 h-px" style={{ background: 'var(--border)' }} />}

                            <div className="space-y-0.5">
                                {group.items.map((item) => {
                                    const hasSubmenu = item.submenu?.length > 0
                                    const isActive   = pathname === item.path || (hasSubmenu && isSubmenuActive(item.submenu))
                                    const isMenuOpen = isActive || openMenus.has(item.id)

                                    if (!isOpen) return <FlyoutMenu key={item.id} item={item} isActive={isActive} onNavigate={handleMobileClose} />

                                    return (
                                        <div key={item.id}>
                                            {hasSubmenu ? (
                                                <button onClick={() => toggleMenu(item.id)}
                                                        className="w-full flex items-center h-10 px-3 rounded-xl transition-all justify-between"
                                                        style={{
                                                            background: isActive ? 'var(--surface-2)' : 'transparent',
                                                            color: isActive ? 'var(--text)' : 'var(--text-soft)',
                                                            fontWeight: isActive ? 700 : 500,
                                                            borderRight: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                                                        }}
                                                        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--surface-2)' }}
                                                        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}>
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <FontAwesomeIcon icon={item.icon} className="w-4 h-4 shrink-0" />
                                                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-semibold text-sm truncate">{item.label}</motion.span>
                                                    </div>
                                                    <FontAwesomeIcon icon={faChevronDown} className="w-3 h-3 shrink-0 transition-transform duration-200"
                                                                     style={{ transform: isMenuOpen ? 'rotate(0deg)' : 'rotate(-90deg)', opacity: 0.6 }} />
                                                </button>
                                            ) : (
                                                <Link href={item.path} onClick={() => { saveScroll(); handleMobileClose() }}>
                                                    <div className="flex items-center h-10 px-3 gap-3 rounded-xl transition-all"
                                                         style={{
                                                             background: isActive ? 'var(--surface-2)' : 'transparent',
                                                             color: isActive ? 'var(--text)' : 'var(--text-soft)',
                                                             fontWeight: isActive ? 700 : 500,
                                                             borderRight: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                                                         }}
                                                         onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--surface-2)' }}
                                                         onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}>
                                                        <FontAwesomeIcon icon={item.icon} className="w-4 h-4 shrink-0" />
                                                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-semibold text-sm truncate">{item.label}</motion.span>
                                                    </div>
                                                </Link>
                                            )}
                                            <AnimatePresence>
                                                {hasSubmenu && isMenuOpen && (
                                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
                                                        <div className="mt-0.5 mb-1 mr-3 rounded-lg overflow-hidden"
                                                             style={{ background: 'var(--surface-2)', border: isActive ? '1px solid var(--primary)44' : '1px solid var(--border)' }}>
                                                            {item.submenu.map((sub, idx) => {
                                                                const isSubActive = pathname === sub.path
                                                                return (
                                                                    <Link key={idx} href={sub.path} onClick={() => { saveScroll(); handleMobileClose() }}>
                                                                        <div className="flex items-center h-9 pr-4 pl-3 text-sm transition-all"
                                                                             style={{ color: isSubActive ? 'var(--primary)' : 'var(--text-soft)', background: isSubActive ? 'var(--primary-light)' : 'transparent', fontWeight: isSubActive ? '700' : '500', borderRight: isSubActive ? '3px solid var(--primary)' : '3px solid transparent' }}
                                                                             onMouseEnter={e => { if (!isSubActive) e.currentTarget.style.background = 'var(--surface)' }}
                                                                             onMouseLeave={e => { if (!isSubActive) e.currentTarget.style.background = 'transparent' }}>
                                                                            <FontAwesomeIcon icon={faChevronLeft} className="w-2 h-2 ml-2 shrink-0" style={{ opacity: isSubActive ? 1 : 0.4 }} />
                                                                            <span className="truncate">{sub.label}</span>
                                                                        </div>
                                                                    </Link>
                                                                )
                                                            })}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Footer */}
                <div className="shrink-0 px-4 py-3 flex items-center gap-3" style={{ borderTop: '1px solid var(--border)' }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--primary-light)' }}>
                        <span className="text-xs font-black" style={{ color: 'var(--primary)' }}>V</span>
                    </div>
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-w-0">
                                <p className="text-xs font-bold truncate" style={{ color: 'var(--text-soft)' }}>سامانه ویرا</p>
                                <p className="text-[10px]" style={{ color: 'var(--muted)' }}>نسخه ۱.۰.۰</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.aside>
        </>
    )
}