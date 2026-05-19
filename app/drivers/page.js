'use client'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faTrash, faSpinner, faPlus, faIdCard, faEye } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import DashboardLayout from '@/app/dashboard/Dashboardlayout'
import { useEffect, useRef } from 'react'
import Swal from 'sweetalert2'
import DataTable from '@/app/components/DataTable/DataTable'
import { ENV, getHeaders } from '@/app/config/env'

const BASE = ENV.API_DRIVERS

const fetchDrivers = async ({ pageParam = null }) => {
    const url = pageParam ? `${BASE}?cursor=${pageParam}` : BASE
    const res = await fetch(url, { headers: getHeaders() })
    if (!res.ok) throw new Error('خطا در دریافت')
    return (await res.json()).data.drivers
}

const CONTRACT_TYPE = { property: 'ملکی', transition: 'انتقالی', contract: 'قراردادی' }
const CERT_TYPE     = { 1: 'نوع ۱', 2: 'نوع ۲', 3: 'نوع ۳' }

export default function DriversPage() {
    const observerTarget = useRef(null)
    const queryClient    = useQueryClient()

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
        queryKey: ['drivers'],
        queryFn: fetchDrivers,
        initialPageParam: null,
        getNextPageParam: (p) => p?.next_cursor ?? undefined,
        staleTime: 5 * 60 * 1000,
    })

    const deleteMutation = useMutation({
        mutationFn: (id) => fetch(`${BASE}/${id}`, { method: 'DELETE', headers: getHeaders() }).then(r => r.json()),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['drivers'] }); Swal.fire({ title: 'حذف شد!', icon: 'success', timer: 2000, showConfirmButton: false }) },
        onError: () => Swal.fire('خطا!', 'حذف انجام نشد', 'error'),
    })

    useEffect(() => {
        const obs = new IntersectionObserver(e => { if (e[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage() }, { threshold: 0.5 })
        if (observerTarget.current) obs.observe(observerTarget.current)
        return () => { if (observerTarget.current) obs.unobserve(observerTarget.current) }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage])

    const handleDelete = (row) => Swal.fire({
        title: 'حذف راننده', html: `آیا از حذف <strong>${row.name} ${row.last_name}</strong> مطمئن هستید؟`,
        icon: 'warning', showCancelButton: true, confirmButtonColor: 'var(--danger)',
        confirmButtonText: 'بله، حذف شود', cancelButtonText: 'انصراف'
    }).then(r => { if (r.isConfirmed) deleteMutation.mutate(row.id) })

    const allData = data?.pages.flatMap(p => p.data) ?? []

    const columns = [
        {
            key: 'name', label: 'نام راننده',
            render: (row) => (
                <div className="flex flex-col items-center">
                    <span className="font-bold" style={{ color: 'var(--text)' }}>{row.name} {row.last_name}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>کد: {row.personal_code}</span>
                </div>
            )
        },
        { key: 'national_code', label: 'کد ملی', render: (row) => <span className="font-mono text-sm" style={{ color: 'var(--text-soft)' }}>{row.national_code}</span> },
        { key: 'phone',         label: 'تلفن',   render: (row) => <span className="font-mono text-sm" style={{ color: 'var(--text-soft)' }}>{row.phone || '—'}</span> },
        {
            key: 'contract_type', label: 'نوع قرارداد',
            filter: { type: 'select', placeholder: 'نوع...', options: () => Object.entries(CONTRACT_TYPE).map(([v,l]) => ({ value: v, label: l })) },
            render: (row) => <span className="badge badge-info">{CONTRACT_TYPE[row.contract_type] ?? row.contract_type}</span>
        },
        {
            key: 'is_active', label: 'وضعیت',
            filter: { type: 'select', placeholder: 'وضعیت...', options: () => [{ value: 'yes', label: 'فعال' }, { value: 'no', label: 'غیرفعال' }] },
            render: (row) => <span className={`badge ${row.is_active === 'yes' ? 'badge-success' : 'badge-danger'}`}>{row.is_active === 'yes' ? 'فعال' : 'غیرفعال'}</span>
        },
        {
            key: 'actions', label: 'عملیات',
            render: (row) => (
                <div className="flex items-center justify-center gap-1.5">
                    <Link href={`/drivers/${row.id}`}><button className="action-btn action-btn-view"><FontAwesomeIcon icon={faEye} className="w-3.5 h-3.5" /></button></Link>
                    <Link href={`/drivers/edit/${row.id}`}><button className="action-btn action-btn-edit"><FontAwesomeIcon icon={faPen} className="w-3.5 h-3.5" /></button></Link>
                    <button className="action-btn action-btn-delete" onClick={() => handleDelete(row)} disabled={deleteMutation.isPending}>
                        <FontAwesomeIcon icon={deleteMutation.isPending ? faSpinner : faTrash} className={`w-3.5 h-3.5 ${deleteMutation.isPending ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            )
        }
    ]

    return (
        <DashboardLayout>
            <div className="w-full min-h-screen" style={{ background: 'var(--bg)' }}>
                <div className="page-header-bar">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                                <FontAwesomeIcon icon={faIdCard} className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-white leading-none">رانندگان</h1>
                                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.75)' }}>مدیریت رانندگان ({allData.length} نفر)</p>
                            </div>
                        </div>
                        <Link href="/drivers/create"><button className="btn btn-success"><FontAwesomeIcon icon={faPlus} className="w-4 h-4" />راننده جدید</button></Link>
                    </div>
                </div>
                <div className="page-content max-w-7xl">
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                        <DataTable data={allData} columns={columns} loading={isLoading && allData.length === 0} emptyMessage="هیچ راننده‌ای یافت نشد" disablePagination={true} />
                        {hasNextPage && <div ref={observerTarget} className="py-8 flex items-center justify-center gap-3"><FontAwesomeIcon icon={faSpinner} className="w-5 h-5 animate-spin" style={{ color: 'var(--primary)' }} /><span className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>در حال بارگذاری...</span></div>}
                        {!hasNextPage && allData.length > 0 && <div className="py-5 text-center"><span className="inline-block px-5 py-2 rounded-xl text-sm font-semibold" style={{ background: 'var(--surface-2)', color: 'var(--text-soft)' }}>✓ همه رانندگان بارگذاری شدند</span></div>}
                    </motion.div>
                </div>
            </div>
        </DashboardLayout>
    )
}