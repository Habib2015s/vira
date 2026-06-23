'use client'

import { useState } from 'react'
import Sidebar from "@/app/components/Sidebar/Sidebar"
import Header from "@/app/header/Header"

export default function DashboardLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} style={{
                marginRight: isSidebarOpen ? '256px' : '96px'
            }}
            />

            {/* Main Content */}
            <div
                className={`
                    flex-1 min-h-screen transition-all duration-300
                    ${isSidebarOpen ? 'mr-64' : 'mr-20'}
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
