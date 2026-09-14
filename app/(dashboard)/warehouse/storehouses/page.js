'use client'

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faTrash, faSpinner, faPlus, faWarehouse, faEye, faLocationDot } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import Swal from 'sweetalert2'
import DataTable from '@/app/components/DataTable/DataTable'
import PageCrumb from '@/app/components/PageHeader/PageCrumb'
import { ENV, getHeaders } from '@/app/config/env'

const BASE = ENV.API_WAREHOUSE_STOREHOUSES

const fetchStorehouses = async ({ pageParam = null }) => {
    let url = BASE
    if (pageParam) url += `?cursor=${pageParam}`

    const res = await fetch(url, { headers: getHeaders() })
    const json = await res.json()

    if (!res.ok) {
        throw new Error(json?.message || 'خطا')
    }

    return {
        data: json?.data?.storehouses?.data || [],
        next_cursor: json?.data?.storehouses?.next_cursor || null
    }
}

export default function StorehousesPage() {
    const observerTarget = useRef(null)
    const queryClient    = useQueryClient()

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
        queryKey: ['warehouseStorehouses'],
        queryFn: fetchStorehouses,
        getNextPageParam: (p) => p?.next_cursor ?? undefined,
        staleTime: 5 * 60 * 1000,
    })

    const deleteMutation = useMutation({
        mutationFn: (id) => fetch(`${BASE}/${id}`, { method: 'DELETE', headers: getHeaders() }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouseStorehouses'] })
            Swal.fire({ title: 'حذف شد!', icon: 'success', timer: 2000, showConfirmButton: false })
        },
        onError: () => Swal.fire('خطا!', 'حذف انجام نشد', 'error'),
    })

    useEffect(() => {
        const observer = new IntersectionObserver(
            e => { if (e[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage() },
            { threshold: 0.5 }
        )
        if (observerTarget.current) observer.observe(observerTarget.current)
        return () => { if (observerTarget.current) observer.unobserve(observerTarget.current) }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage])

    const handleDelete = (row) =>
        Swal.fire({
            title: 'حذف انبار',
            html: `آیا از حذف انبار <strong>${row.name}</strong> مطمئن هستید؟`,
            icon: 'warning', showCancelButton: true,
            confirmButtonColor: 'var(--danger)', cancelButtonColor: 'var(--muted)',
            confirmButtonText: 'بله، حذف شود', cancelButtonText: 'انصراف'
        }).then(r => { if (r.isConfirmed) deleteMutation.mutate(row.id) })

    const allData = data?.pages?.flatMap(p => p.data) ?? []

    const columns = [
        {
            key: 'code', label: 'کد',
            filter: { type: 'text', placeholder: 'جستجو کد...' },
            render: (row) => (
                <span className="font-mono text-center font-bold text-sm" style={{ color: 'var(--primary)' }}>
                    {row.code}
                </span>
            )
        },
        {
            key: 'name', label: 'نام انبار',
            filter: { type: 'text', placeholder: 'جستجو نام...' },
            render: (row) => (
                <div className="text-center">
                    <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>{row.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>#{row.id}</p>
                </div>
            )
        },
        {
            key: 'phone', label: 'تلفن',
            render: (row) => (
                <div className="text-center text-sm font-mono" style={{ color: 'var(--text-soft)' }}>
                    {row.phone || '—'}
                </div>
            )
        },
        {
            key: 'address', label: 'آدرس',
            render: (row) => (
                <div className="flex justify-center items-center gap-1.5">
                    <FontAwesomeIcon
                        icon={faLocationDot}
                        className="w-3 h-3"
                        style={{ color: 'var(--danger)' }}
                    />
                    <span className="text-sm" style={{ color: 'var(--text-soft)' }}>
                        {row.address || '—'}
                    </span>
                </div>
            )
        },
        {
            key: 'created_at', label: 'تاریخ',
            render: (row) => (
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {new Date(row.created_at).toLocaleDateString('fa-IR')}
                </span>
            )
        },
        {
            key: 'actions', label: 'عملیات',
            render: (row) => (
                <div className="flex items-center justify-center gap-1.5">
                    <Link href={`/warehouse/storehouses/${row.id}`}>
                        <button className="action-btn action-btn-view" title="مشاهده">
                            <FontAwesomeIcon icon={faEye} className="w-3.5 h-3.5" />
                        </button>
                    </Link>
                    <Link href={`/warehouse/storehouses/edit/${row.id}`}>
                        <button className="action-btn action-btn-edit" title="ویرایش">
                            <FontAwesomeIcon icon={faPen} className="w-3.5 h-3.5" />
                        </button>
                    </Link>
                    <button className="action-btn action-btn-delete" title="حذف"
                            onClick={() => handleDelete(row)} disabled={deleteMutation.isPending}>
                        <FontAwesomeIcon icon={deleteMutation.isPending ? faSpinner : faTrash}
                                         className={`w-3.5 h-3.5 ${deleteMutation.isPending ? 'animate-spin' : ''}`} />
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
                            icon={faWarehouse}
                            root="انبار"
                            current="لیست انبارها"
                        />
                        <Link href="/warehouse/storehouses/create">
                            <button className="btn btn-primary">
                                <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
                                انبار جدید
                            </button>
                        </Link>
                    </div>

                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                        <DataTable
                            data={allData}
                            columns={columns}
                            loading={isLoading && allData.length === 0}
                            emptyMessage="هیچ انباری یافت نشد"
                            disablePagination={true}
                        />
                        {hasNextPage && (
                            <div ref={observerTarget} className="py-8 flex items-center justify-center gap-3">
                                <FontAwesomeIcon icon={faSpinner} className="w-5 h-5 animate-spin" style={{ color: 'var(--primary)' }} />
                                <span className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>بارگذاری بیشتر...</span>
                            </div>
                        )}
                        {!hasNextPage && allData.length > 0 && (
                            <div className="py-5 text-center">
                                <span className="inline-block px-5 py-2 rounded-xl text-sm font-semibold"
                                      style={{ background: 'var(--surface-2)', color: 'var(--text-soft)' }}>
                                    ✓ همه انبارها بارگذاری شدند
                                </span>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
    )
}