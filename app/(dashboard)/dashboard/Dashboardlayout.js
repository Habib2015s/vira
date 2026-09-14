'use client'

import { useState, useEffect } from 'react'
import Sidebar from "@/app/components/Sidebar/Sidebar"
import Header from "@/app/header/Header"

export default function DashboardLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)

    // روی موبایل سایدبار پیش‌فرض بسته باشه (به‌صورت کشو روی محتوا باز میشه، نه کنارش)
    useEffect(() => {
        if (window.innerWidth < 1024) setIsSidebarOpen(false)
    }, [])

    return (
        <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>
            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            {/* Main Content — فاصله برای سایدبار فقط از lg به بالا رزرو میشه؛ زیر آن سایدبار به‌صورت کشوی روی محتوا نمایش داده میشه */}
            {/* min-w-0 لازمه وگرنه این آیتم فلکس به‌خاطر محتوای عریض‌تر (مثل جدول) کل صفحه رو عریض‌تر از موبایل می‌کنه
                و به‌جای اسکرول‌شدن جدول، محتوا توسط overflow-x:hidden سراسری body بریده و مخفی می‌شه */}
            <div
                className={`
                    flex-1 min-w-0 min-h-screen transition-all duration-300
                    ${isSidebarOpen ? 'lg:mr-64' : 'lg:mr-20'}
                `}
            >
                <Header />
                <main className="w-full">
                    {children}
                </main>
            </div>
        </div>
    )
}