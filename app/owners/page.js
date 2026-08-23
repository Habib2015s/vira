'use client'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faTrash, faSpinner, faPlus, faUser, faBuilding, faEye } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import DashboardLayout from '@/app/dashboard/Dashboardlayout'
import { useEffect, useRef } from 'react'
import Swal from 'sweetalert2'
import DataTable from '@/app/components/DataTable/DataTable'
import PageCrumb from '@/app/components/PageHeader/PageCrumb'
import { ENV, getHeaders } from '@/app/config/env'

const BASE = ENV.API_OWNERS

const fetchOwners = async ({ pageParam = null }) => {
    const url = pageParam ? `${BASE}?cursor=${pageParam}` : BASE
    const res = await fetch(url, { headers: getHeaders() })
    if (!res.ok) throw new Error('خطا')
    return (await res.json()).data.owners
}

export default function OwnersPage() {
    const observerTarget = useRef(null)
    const queryClient    = useQueryClient()

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
        queryKey: ['owners'], queryFn: fetchOwners,
        initialPageParam: null, getNextPageParam: (p) => p?.next_cursor ?? undefined, staleTime: 5 * 60 * 1000,
    })

    const deleteMutation = useMutation({
        mutationFn: (id) => fetch(`${BASE}/${id}`, { method: 'DELETE', headers: getHeaders() }).then(r => r.json()),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['owners'] }); Swal.fire({ title: 'حذف شد!', icon: 'success', timer: 2000, showConfirmButton: false }) },
        onError: () => Swal.fire('خطا!', 'حذف انجام نشد', 'error'),
    })

    useEffect(() => {
        const obs = new IntersectionObserver(e => { if (e[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage() }, { threshold: 0.5 })
        if (observerTarget.current) obs.observe(observerTarget.current)
        return () => { if (observerTarget.current) obs.unobserve(observerTarget.current) }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage])

    const handleDelete = (row) => Swal.fire({
        title: 'حذف مالک', html: `مالک <strong>${row.name}</strong> حذف شود؟`,
        icon: 'warning', showCancelButton: true, confirmButtonColor: 'var(--danger)',
        confirmButtonText: 'بله، حذف شود', cancelButtonText: 'انصراف'
    }).then(r => { if (r.isConfirmed) deleteMutation.mutate(row.id) })

    const allData = data?.pages.flatMap(p => p.data) ?? []

    const columns = [
        {
            key: 'name', label: 'نام',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={row.type === 'legal' ? faBuilding : faUser} className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                    <span className="font-bold" style={{ color: 'var(--text)' }}>{row.name} {row.family || ''}</span>
                </div>
            )
        },
        {
            key: 'type', label: 'نوع',
            filter: { type: 'select', placeholder: 'نوع...', options: () => [{ value: 'genuine', label: 'حقیقی' }, { value: 'legal', label: 'حقوقی' }] },
            render: (row) => <span className={`badge ${row.type === 'legal' ? 'badge-info' : 'badge-success'}`}>{row.type === 'legal' ? 'حقوقی' : 'حقیقی'}</span>
        },
        { key: 'national_code', label: 'کد ملی', render: (row) => <span className="font-mono text-sm" style={{ color: 'var(--text-soft)' }}>{row.national_code}</span> },
        {
            key: 'actions', label: 'عملیات',
            render: (row) => (
                <div className="flex items-center justify-center gap-1.5">
                    <Link href={`/owners/${row.id}`}><button className="action-btn action-btn-view"><FontAwesomeIcon icon={faEye} className="w-3.5 h-3.5" /></button></Link>
                    <Link href={`/owners/edit/${row.id}`}><button className="action-btn action-btn-edit"><FontAwesomeIcon icon={faPen} className="w-3.5 h-3.5" /></button></Link>
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
                <div className="page-content">
                    <div className="flex items-center justify-between gap-3 flex-wrap mb-1">
                        <PageCrumb
                            icon={faUser}
                            root="حمل و نقل"
                            current="مالکین"
                        />
                        <Link href="/owners/create">
                            <button className="btn btn-primary">
                                <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
                                مالک جدید
                            </button>
                        </Link>
                    </div>
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                        <DataTable data={allData} columns={columns} loading={isLoading && allData.length === 0} emptyMessage="هیچ مالکی یافت نشد" disablePagination={true} />
                        {hasNextPage && <div ref={observerTarget} className="py-8 flex items-center justify-center gap-3"><FontAwesomeIcon icon={faSpinner} className="w-5 h-5 animate-spin" style={{ color: 'var(--primary)' }} /></div>}
                    </motion.div>
                </div>
            </div>
        </DashboardLayout>
    )
}