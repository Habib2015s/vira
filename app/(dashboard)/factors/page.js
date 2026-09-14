'use client'

import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileInvoiceDollar, faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import DataTable from '@/app/components/DataTable/DataTable'
import PageCrumb from '@/app/components/PageHeader/PageCrumb'
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
            <div className="w-full min-h-screen" style={{ background: 'var(--bg)' }}>
                <div className="page-content">

                    <div className="flex items-center justify-between gap-3 flex-wrap mb-1">
                        <PageCrumb
                            icon={faFileInvoiceDollar}
                            root="انبار"
                            current="فاکتورهای انبار"
                        />
                        <Link href="/warehouse/factors/create">
                            <button className="btn btn-primary">
                                <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
                                فاکتور جدید
                            </button>
                        </Link>
                    </div>

                    {/* آمار */}
                    <FactorsStats data={allData} />

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
    )
}