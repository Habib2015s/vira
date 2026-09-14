'use client'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faHouse, faWallet, faCalendar } from "@fortawesome/free-solid-svg-icons"
import { motion } from 'framer-motion'
import PageCrumb from '@/app/components/PageHeader/PageCrumb'
import StatsCards from '@/app/cards/Statscards'
import KpiRow from "@/app/components/Dashboardoverview/Kpirow";
import OverviewCharts from "@/app/components/Dashboardoverview/Overviewcharts";

export default function DashboardContent() {
    return (
        <div className="w-full min-h-screen" style={{ background: 'var(--bg)' }}>
            <div className="page-content">

                <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
                    <div>
                        <PageCrumb icon={faHouse} root="داشبورد" current="خانه" />
                        <p className="text-xs flex items-center gap-1.5 mt-1" style={{ color: 'var(--text-muted)' }}>
                            <FontAwesomeIcon icon={faCalendar} className="w-3 h-3" />
                            {new Date().toLocaleDateString('fa-IR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>

                    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center gap-3 px-4 py-2 rounded-xl"
                                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--surface-2)' }}>
                            <FontAwesomeIcon icon={faWallet} className="w-4 h-4" style={{ color: 'var(--text)' }} />
                        </div>
                        <div>
                            <p className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>موجودی کیف پول</p>
                            <p className="text-sm font-black" style={{ color: 'var(--text)' }}>۷,۶۸۴,۶۲۱ ریال</p>
                        </div>
                    </motion.div>
                </div>

                <div className="space-y-4">
                    <KpiRow />
                    <StatsCards />
                    <OverviewCharts />
                </div>
            </div>
        </div>
    )
}