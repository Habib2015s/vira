'use client'

import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faTrash, faSpinner, faPlus, faBox, faEye, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import DashboardLayout from "@/app/dashboard/Dashboardlayout"
import { useEffect, useRef } from 'react'
import Swal from 'sweetalert2'
import DataTable from '@/app/components/DataTable/DataTable'
import PageCrumb from '@/app/components/PageHeader/PageCrumb'
import { ENV, getHeaders } from '@/app/config/env'


const fetchProducts = async ({ pageParam = null }) => {
    let url = ENV.API_WAREHOUSE_PRODUCTS
    if (pageParam) url += `?cursor=${pageParam}`
    const res = await fetch(url, { headers: getHeaders() })
    if (!res.ok) throw new Error('خطا در دریافت')
    return (await res.json()).data.products
}

export default function ProductsListPage() {
    const observerTarget = useRef(null)
    const queryClient    = useQueryClient()

    const { data: shData } = useQuery({
        queryKey: ['warehouseStorehouses'],
        queryFn: () => fetch(ENV.API_WAREHOUSE_STOREHOUSES, { headers: getHeaders() }).then(r => r.json()).then(r => r.data?.storehouses?.data || []),
        staleTime: 10 * 60 * 1000,
    })
    const { data: unData } = useQuery({
        queryKey: ['warehouseUnits'],
        queryFn: () => fetch(ENV.API_WAREHOUSE_UNITS, { headers: getHeaders() }).then(r => r.json()).then(r => r.data?.units?.data || []),
        staleTime: 10 * 60 * 1000,
    })

    const storeMap = Object.fromEntries((shData || []).map(s => [s.id, s.name]))
    const unitMap  = Object.fromEntries((unData  || []).map(u => [u.id, u.name]))

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
        queryKey: ['warehouseProducts'],
        queryFn:  fetchProducts,
        getNextPageParam: (p) => p.next_cursor ?? undefined,
        staleTime: 5 * 60 * 1000,
    })

    const deleteMutation = useMutation({
        mutationFn: (id) => fetch(`${ENV.API_WAREHOUSE_PRODUCTS}/${id}`, { method: 'DELETE', headers: getHeaders() }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouseProducts'] })
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
            title: 'حذف محصول',
            html: `آیا از حذف <strong>${row.name}</strong> مطمئن هستید؟`,
            icon: 'warning', showCancelButton: true,
            confirmButtonColor: 'var(--danger)', cancelButtonColor: 'var(--muted)',
            confirmButtonText: 'بله، حذف شود', cancelButtonText: 'انصراف'
        }).then(r => { if (r.isConfirmed) deleteMutation.mutate(row.id) })

    const allData = data?.pages?.flatMap(p => p?.data || []) || []
    const columns = [
        {
            key: 'code', label: 'کد',
            filter: { type: 'text', placeholder: 'جستجو کد...' },
            render: (row) => (
                <span className="font-mono font-bold text-sm" style={{ color: 'var(--primary)' }}>
                    {row.code}
                </span>
            )
        },
        {
            key: 'name', label: 'نام محصول',
            filter: { type: 'text', placeholder: 'جستجو نام...' },
            render: (row) => (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                         style={{ background: 'var(--primary-light)' }}>
                        <FontAwesomeIcon icon={faBox} className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
                    </div>
                    <div>
                        <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>{row.name}</p>
                        {row.color && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>رنگ: {row.color}</p>}
                    </div>
                </div>
            )
        },
        {
            key: 'storehouse_id', label: 'انبار',
            render: (row) => (
                <span className="badge badge-info">
                    {storeMap[row.storehouse_id] || `انبار #${row.storehouse_id}`}
                </span>
            )
        },
        {
            key: 'unit_id', label: 'واحد',
            render: (row) => (
                <span className="text-sm" style={{ color: 'var(--text-soft)' }}>
                    {unitMap[row.unit_id] || `واحد #${row.unit_id}`}
                </span>
            )
        },
        {
            key: 'count', label: 'موجودی',
            render: (row) => {
                const low = row.order_threshold && Number(row.count) <= Number(row.order_threshold)
                return (
                    <div className="flex items-center gap-1.5">
                        <span className={`badge ${low ? 'badge-danger' : 'badge-success'}`}>
                            {Number(row.count).toLocaleString('fa-IR')}
                        </span>
                        {low && (
                            <FontAwesomeIcon icon={faTriangleExclamation} className="w-3.5 h-3.5"
                                             title="زیر حد سفارش" style={{ color: 'var(--warning)' }} />
                        )}
                    </div>
                )
            }
        },
        {
            key: 'single_amount', label: 'قیمت واحد',
            render: (row) => (
                <span className="font-bold text-sm" style={{ color: 'var(--success)' }}>
                    {row.single_amount ? `${Number(row.single_amount).toLocaleString('fa-IR')} ریال` : '—'}
                </span>
            )
        },
        {
            key: 'actions', label: 'عملیات',
            render: (row) => (
                <div className="flex items-center justify-center gap-1.5">
                    <Link href={`/warehouse/products/${row.id}`}>
                        <button className="action-btn action-btn-view" title="مشاهده">
                            <FontAwesomeIcon icon={faEye} className="w-3.5 h-3.5" />
                        </button>
                    </Link>
                    <Link href={`/warehouse/products/${row.id}/edit`}>
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
        <DashboardLayout>
            <div className="w-full min-h-screen" style={{ background: 'var(--bg)' }}>
                <div className="page-content">

                    <div className="flex items-center justify-between gap-3 flex-wrap mb-1">
                        <PageCrumb
                            icon={faBox}
                            root="انبار"
                            current="محصولات انبار"
                        />
                        <Link href="/warehouse/products/create">
                            <button className="btn btn-primary">
                                <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
                                محصول جدید
                            </button>
                        </Link>
                    </div>

                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                        <DataTable
                            data={allData}
                            columns={columns}
                            loading={isLoading && allData.length === 0}
                            emptyMessage="هیچ محصولی یافت نشد"
                            disablePagination={true}
                        />
                        {hasNextPage && (
                            <div ref={observerTarget} className="py-8 flex items-center justify-center gap-3">
                                <FontAwesomeIcon icon={faSpinner} className="w-5 h-5 animate-spin" style={{ color: 'var(--primary)' }} />
                                <span className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>در حال بارگذاری...</span>
                            </div>
                        )}
                        {!hasNextPage && allData.length > 0 && (
                            <div className="py-5 text-center">
                                <span className="inline-block px-5 py-2 rounded-xl text-sm font-semibold"
                                      style={{ background: 'var(--surface-2)', color: 'var(--text-soft)' }}>
                                    ✓ همه محصولات بارگذاری شدند
                                </span>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </DashboardLayout>
    )
}