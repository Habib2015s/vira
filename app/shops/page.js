// app/shops/page.js
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faSpinner, faStore } from '@fortawesome/free-solid-svg-icons'
import DashboardLayout from '@/app/dashboard/Dashboardlayout'
import DataTable from '@/app/components/DataTable/DataTable'
import PageCrumb from '@/app/components/PageHeader/PageCrumb'
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
                <div className="page-content">

                    <div className="flex items-center justify-between gap-3 flex-wrap mb-1">
                        <PageCrumb icon={faStore} root="شاپ‌ها" current="لیست شاپ‌ها" />
                        <button onClick={() => router.push('/shops/create')} className="btn btn-primary">
                            <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
                            افزودن شاپ
                        </button>
                    </div>

                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                        <DataTable
                            data={shops}
                            columns={columns}
                            loading={loading}
                            emptyMessage="شاپی یافت نشد"
                        />
                    </motion.div>
                </div>
            </div>
        </DashboardLayout>
    )
}