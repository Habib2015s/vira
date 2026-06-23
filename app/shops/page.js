// app/shops/page.js
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faSpinner, faStore } from '@fortawesome/free-solid-svg-icons'
import DashboardLayout from '@/app/dashboard/Dashboardlayout'
import DataTable from '@/app/components/DataTable/DataTable'
import { useShops } from '@/app/hooks/useShops'
import { getShopsColumns } from './_components/ShopsColumns'

export default function ShopsPage() {
    const router = useRouter()
    const [togglingId, setTogglingId] = useState(null)
    const { shops, loading, load, toggle, remove } = useShops()

    useEffect(() => { load() }, [])

    const handleToggle = async (row) => {
        setTogglingId(row.id)
        await toggle(row)
        setTogglingId(null)
    }

    const columns = getShopsColumns({
        onView:    (id) => router.push(`/shops/show/${id}`),
        onEdit:    (id) => router.push(`/shops/edit/${id}`),
        onToggle:  handleToggle,
        onDelete:  remove,
        togglingId,
    })

    return (
        <DashboardLayout>
            <div className="w-full min-h-screen" style={{ background: 'var(--bg)' }}>

                <div className="page-header-bar">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                 style={{ background: 'rgba(255,255,255,0.2)' }}>
                                <FontAwesomeIcon icon={faStore} className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-white leading-none">مدیریت شاپ‌ها</h1>
                                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
                                    لیست و مدیریت شاپ‌های داخلی و خارجی
                                </p>
                            </div>
                        </div>
                        <button onClick={() => router.push('/shops/create')} className="btn btn-success">
                            <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
                            افزودن شاپ
                        </button>
                    </div>
                </div>

                <div className="p-6 max-w-7xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                        <DataTable
                            data={shops}
                            columns={columns}
                            loading={loading}
                            emptyMessage="شاپی یافت نشد"
                            title="لیست شاپ‌ها"
                            titleIcon={faStore}
                        />
                    </motion.div>
                </div>

            </div>
        </DashboardLayout>
    )
}