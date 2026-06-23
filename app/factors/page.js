'use client'

import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileInvoiceDollar, faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import DashboardLayout from '@/app/dashboard/Dashboardlayout'
import DataTable from '@/app/components/DataTable/DataTable'
import { useFactors } from './_hooks/useFactors'
import { getFactorsColumns } from './_components/FactorsColumns'
import { FactorsStats } from './_components/FactorsStats'

export default function FactorsPage() {
    const {
        allData, isLoading, hasNextPage, isFetchingNextPage,
        observerTarget, handleConfirm, handleCancel,
    } = useFactors()

    const columns = getFactorsColumns({ handleConfirm, handleCancel })

    return (
        <DashboardLayout>
            <div className="w-full min-h-screen" style={{ background: 'var(--bg)' }}>

                {/* هدر */}
                <div className="page-header-bar">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                 style={{ background: 'rgba(255,255,255,0.2)' }}>
                                <FontAwesomeIcon icon={faFileInvoiceDollar} className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-white leading-none">فاکتورهای انبار</h1>
                                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.75)' }}>
                                    {allData.length} فاکتور
                                </p>
                            </div>
                        </div>
                        <Link href="/warehouse/factors/create">
                            <button className="btn btn-success">
                                <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
                                فاکتور جدید
                            </button>
                        </Link>
                    </div>
                </div>

                {/* آمار */}
                <FactorsStats data={allData} />

                {/* جدول */}
                <div className="page-content max-w-7xl">
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                        <DataTable
                            data={allData}
                            columns={columns}
                            loading={isLoading && allData.length === 0}
                            emptyMessage="هیچ فاکتوری یافت نشد"
                            disablePagination={true}
                        />
                        {hasNextPage && (
                            <div ref={observerTarget} className="py-8 flex items-center justify-center gap-3">
                                <FontAwesomeIcon icon={faSpinner} className="w-5 h-5 animate-spin"
                                                 style={{ color: 'var(--primary)' }} />
                                <span className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>
                                    در حال بارگذاری...
                                </span>
                            </div>
                        )}
                    </motion.div>
                </div>

            </div>
        </DashboardLayout>
    )
}