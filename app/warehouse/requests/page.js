'use client'

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faSpinner, faClipboardCheck } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import DashboardLayout from "@/app/dashboard/Dashboardlayout"
import { useEffect, useRef } from 'react'
import DataTable from '@/app/components/DataTable/DataTable'
import { ENV, getHeaders } from '@/app/config/env'


const BASE = ENV.API_WAREHOUSE_REQUESTS

const STATUS_LABEL = { pending: 'در انتظار', approved: 'تأیید شده', rejected: 'رد شده', imported: 'وارد شده', exported: 'خارج شده' }
const STATUS_STYLE = {
    pending:  { background: 'var(--warning-light)', color: 'var(--warning)' },
    approved: { background: 'var(--success-light)', color: 'var(--success)' },
    rejected: { background: 'var(--danger-light)',  color: 'var(--danger)'  },
    imported: { background: 'var(--info-light)',    color: 'var(--info)'    },
    exported: { background: 'var(--primary-light)', color: 'var(--primary)' },
}

const fetchRequests = async ({ pageParam = null }) => {
    let url = BASE
    if (pageParam) url += `?cursor=${pageParam}`
    const res = await fetch(url, { headers: getHeaders() })
    if (!res.ok) throw new Error('خطا')
    const result = await res.json()
    return result.data.requests
}

export default function WarehouseRequestsPage() {
    const observerTarget = useRef(null)
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
        queryKey: ['warehouseRequests'],
        queryFn: fetchRequests,
        getNextPageParam: (p) => p?.next_cursor ?? undefined,
        staleTime: 5 * 60 * 1000,
    })

    useEffect(() => {
        const observer = new IntersectionObserver(
            e => { if (e[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage() }, { threshold: 0.5 })
        if (observerTarget.current) observer.observe(observerTarget.current)
        return () => { if (observerTarget.current) observer.unobserve(observerTarget.current) }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage])

    const allData = data?.pages.flatMap(p => p.data) ?? []

    const columns = [
        { key: 'request_number', label: 'شماره درخواست', render: (row) => <span className="badge badge-primary">#{row.request_number}</span> },
        {
            key: 'type', label: 'نوع',
            filter: { type: 'select', placeholder: 'نوع...', options: () => [{ value: 'request', label: 'درخواست' }, { value: 'buy', label: 'خرید' }] },
            render: (row) => <span className="badge" style={row.type === 'buy' ? { background: 'var(--warning-light)', color: 'var(--warning)' } : { background: 'var(--info-light)', color: 'var(--info)' }}>{row.type === 'buy' ? 'خرید' : 'درخواست'}</span>
        },
        {
            key: 'status', label: 'وضعیت',
            filter: { type: 'select', placeholder: 'وضعیت...', options: () => Object.entries(STATUS_LABEL).map(([v, l]) => ({ value: v, label: l })) },
            render: (row) => <span className="badge" style={STATUS_STYLE[row.status] ?? {}}>{STATUS_LABEL[row.status] ?? row.status}</span>
        },
        { key: 'work_order_number', label: 'شماره کاری', render: (row) => <span style={{ color: 'var(--text-soft)' }}>{row.work_order_number || '—'}</span> },
        { key: 'comment', label: 'توضیحات', render: (row) => <span className="truncate max-w-xs block" style={{ color: 'var(--text-soft)' }}>{row.comment || '—'}</span> },
        {
            key: 'actions', label: 'عملیات',
            render: (row) => (
                <Link href={`/warehouse/requests/edit/${row.id}`}>
                    <button className="w-9 h-9 flex items-center justify-center rounded-lg"
                            style={{ color: 'var(--info)', background: 'var(--info-light)' }}
                            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.9)'}
                            onMouseLeave={e => e.currentTarget.style.filter = 'none'}>
                        <FontAwesomeIcon icon={faPen} className="w-4 h-4" />
                    </button>
                </Link>
            )
        }
    ]

    return (
        <DashboardLayout>
            <div className="w-full min-h-screen" style={{ background: 'var(--bg)' }}>
                <div className="page-header-bar">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-black text-white mb-0.5 flex items-center gap-3">
                                <FontAwesomeIcon icon={faClipboardCheck} className="w-6 h-6 opacity-90" />
                                درخواست‌های انبار
                            </h1>
                            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>مدیریت درخواست‌های ورود/خروج کالا ({allData.length} مورد)</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 max-w-7xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                        <DataTable data={allData} columns={columns} loading={isLoading && allData.length === 0}
                                   emptyMessage="هیچ درخواستی یافت نشد" disablePagination={true} />
                        {hasNextPage && <div ref={observerTarget} className="py-8 flex justify-center"><FontAwesomeIcon icon={faSpinner} className="w-5 h-5 animate-spin" style={{ color: 'var(--primary)' }} /></div>}
                    </motion.div>
                </div>
            </div>
        </DashboardLayout>
    )
}