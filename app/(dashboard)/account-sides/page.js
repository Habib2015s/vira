'use client'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faTrash, faSpinner, faPlus, faBuilding } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import Swal from '@/app/utils/swal'
import DataTable from '@/app/components/DataTable/DataTable'
import PageCrumb from '@/app/components/PageHeader/PageCrumb'
import { ENV, getHeaders } from '@/app/config/env'

const BASE = ENV.API_ACCOUNT_SIDES

const fetchAccountSides = async ({ pageParam = null }) => {
    const url = pageParam ? `${BASE}?cursor=${pageParam}` : BASE
    const res = await fetch(url, { headers: getHeaders() })
    if (!res.ok) throw new Error('خطا')
    return (await res.json()).data.accountSides
}

export default function AccountSidesPage() {
    const observerTarget = useRef(null)
    const queryClient    = useQueryClient()

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
        queryKey: ['accountSides'], queryFn: fetchAccountSides,
        initialPageParam: null, getNextPageParam: (p) => p?.next_cursor ?? undefined, staleTime: 5 * 60 * 1000,
    })

    const deleteMutation = useMutation({
        mutationFn: (id) => fetch(`${BASE}/${id}`, { method: 'DELETE', headers: getHeaders() }).then(r => r.json()),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['accountSides'] }); Swal.fire({ title: 'حذف شد!', icon: 'success', timer: 2000, showConfirmButton: false }) },
        onError: () => Swal.fire('خطا!', 'حذف انجام نشد', 'error'),
    })

    useEffect(() => {
        const obs = new IntersectionObserver(e => { if (e[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage() }, { threshold: 0.5 })
        if (observerTarget.current) obs.observe(observerTarget.current)
        return () => { if (observerTarget.current) obs.unobserve(observerTarget.current) }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage])

    const allData = data?.pages.flatMap(p => p.data) ?? []

    const columns = [
        { key: 'number',    label: 'شماره حساب', render: (row) => <span className="font-mono font-bold" style={{ color: 'var(--primary)' }}>{row.number}</span> },
        { key: 'name',      label: 'نام صاحب حساب', render: (row) => <span className="font-bold" style={{ color: 'var(--text)' }}>{row.name}</span> },
        { key: 'bank_name', label: 'نام بانک',    render: (row) => <span className="badge badge-info">{row.bank_name}</span> },
        {
            key: 'actions', label: 'عملیات',
            render: (row) => (
                <div className="flex items-center justify-center gap-1.5">
                    <Link href={`/account-sides/edit/${row.id}`}><button className="action-btn action-btn-edit"><FontAwesomeIcon icon={faPen} className="w-3.5 h-3.5" /></button></Link>
                    <button className="action-btn action-btn-delete" onClick={() => Swal.fire({ title: 'حذف؟', icon: 'warning', showCancelButton: true, confirmButtonColor: 'var(--danger)', confirmButtonText: 'بله', cancelButtonText: 'انصراف' }).then(r => r.isConfirmed && deleteMutation.mutate(row.id))} disabled={deleteMutation.isPending}>
                        <FontAwesomeIcon icon={deleteMutation.isPending ? faSpinner : faTrash} className={`w-3.5 h-3.5 ${deleteMutation.isPending ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            )
        }
    ]

    return (
            <div className="w-full min-h-screen" style={{ background: 'var(--bg)' }}>
                <div className="page-content">

                    <div className="flex items-center justify-between gap-3 flex-wrap mb-1">
                        <PageCrumb
                            icon={faBuilding}
                            root="مالی"
                            current="طرف‌های حساب"
                        />
                        <Link href="/account-sides/create">
                            <button className="btn btn-primary">
                                <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
                                طرف حساب جدید
                            </button>
                        </Link>
                    </div>

                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                        <DataTable
                            data={allData}
                            columns={columns}
                            loading={isLoading && allData.length === 0}
                            emptyMessage="هیچ طرف حسابی یافت نشد"
                            disablePagination={true}
                        />
                        {hasNextPage && (
                            <div ref={observerTarget} className="py-8 flex justify-center">
                                <FontAwesomeIcon icon={faSpinner} className="w-5 h-5 animate-spin" style={{ color: 'var(--primary)' }} />
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
    )
}