'use client'

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faTrash, faSpinner, faPlus, faUsers, faEye, faBuilding, faUser } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import Swal from 'sweetalert2'
import DataTable from '@/app/components/DataTable/DataTable'
import PageCrumb from '@/app/components/PageHeader/PageCrumb'
import { ENV, getHeaders } from '@/app/config/env'

const BASE = ENV.API_WAREHOUSE_CUSTOMERS

const fetchCustomers = async ({ pageParam = null }) => {
    let url = BASE
    if (pageParam) url += `?cursor=${pageParam}`
    const res = await fetch(url, { headers: getHeaders() })
    if (!res.ok) throw new Error('خطا در دریافت')
    return (await res.json()).data.customers
}

export default function CustomersPage() {
    const observerTarget = useRef(null)
    const queryClient    = useQueryClient()

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
        queryKey: ['warehouseCustomers'],
        queryFn:  fetchCustomers,
        initialPageParam: null,
        getNextPageParam: (p) => p?.next_cursor ?? undefined,
        staleTime: 5 * 60 * 1000,
    })

    const deleteMutation = useMutation({
        mutationFn: (id) => fetch(`${BASE}/${id}`, { method: 'DELETE', headers: getHeaders() }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouseCustomers'] })
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
            title: 'حذف مشتری',
            html: `آیا از حذف <strong>${row.name} ${row.family || ''}</strong> مطمئن هستید؟`,
            icon: 'warning', showCancelButton: true,
            confirmButtonColor: 'var(--danger)', cancelButtonColor: 'var(--muted)',
            confirmButtonText: 'بله، حذف شود', cancelButtonText: 'انصراف'
        }).then(r => { if (r.isConfirmed) deleteMutation.mutate(row.id) })

    const allData = data?.pages.flatMap(p => p.data) ?? []

    const persons   = allData.filter(c => c.type === 'person').length
    const companies = allData.filter(c => c.type === 'company').length

    const columns = [
        {
            key: 'name', label: 'مشتری',
            filter: { type: 'text', placeholder: 'جستجو نام...' },
            render: (row) => {
                const isCompany = row.type === 'company'
                const hue = (row.id * 53) % 360
                return (
                    <div className="flex items-center gap-2.5 justify-center">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-sm"
                             style={{
                                 background: isCompany ? 'var(--info-light)' : `hsl(${hue}, 65%, 90%)`,
                                 color:      isCompany ? 'var(--info)'       : `hsl(${hue}, 55%, 38%)`,
                             }}>
                            <FontAwesomeIcon icon={isCompany ? faBuilding : faUser} className="w-4 h-4" />
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>
                                {row.name} {row.family || ''}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                {isCompany ? 'شرکت' : 'شخص حقیقی'}
                            </p>
                        </div>
                    </div>
                )
            }
        },
        {
            key: 'type', label: 'نوع',
            filter: { type: 'select', placeholder: 'نوع...', options: () => [{ value: 'person', label: 'حقیقی' }, { value: 'company', label: 'حقوقی' }] },
            render: (row) => (
                <div className="flex justify-center">
                    <span className={`badge ${row.type === 'company' ? 'badge-info' : 'badge-success'}`}>
                        <FontAwesomeIcon icon={row.type === 'company' ? faBuilding : faUser} className="w-3 h-3" />
                        {row.type === 'company' ? 'حقوقی' : 'حقیقی'}
                    </span>
                </div>
            )
        },
        {
            key: 'national_code', label: 'کد ملی / شناسه',
            render: (row) => (
                <div className="text-center">
                    <span className="font-mono text-sm" style={{ color: 'var(--text-soft)' }}>
                        {row.national_code || '—'}
                    </span>
                </div>
            )
        },
        {
            key: 'phone', label: 'تلفن',
            render: (row) => (
                <div className="text-center">
                    <span className="font-mono text-sm" style={{ color: 'var(--text-soft)' }}>
                        {row.phone || '—'}
                    </span>
                </div>
            )
        },
        {
            key: 'address', label: 'آدرس',
            render: (row) => (
                <div className="text-center max-w-xs mx-auto">
                    <span className="text-sm truncate block" style={{ color: 'var(--text-muted)' }}>
                        {row.address || '—'}
                    </span>
                </div>
            )
        },
        {
            key: 'actions', label: 'عملیات',
            render: (row) => (
                <div className="flex items-center justify-center gap-1.5">
                    <Link href={`/warehouse/customers/${row.id}`}>
                        <button className="action-btn action-btn-view" title="مشاهده">
                            <FontAwesomeIcon icon={faEye} className="w-3.5 h-3.5" />
                        </button>
                    </Link>
                    <Link href={`/warehouse/customers/edit/${row.id}`}>
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
                            icon={faUsers}
                            root="انبار"
                            current="مشتریان"
                        />
                        <Link href="/warehouse/customers/create">
                            <button className="btn btn-primary">
                                <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
                                مشتری جدید
                            </button>
                        </Link>
                    </div>

                    {/* آمار */}
                    <div className="grid grid-cols-3 gap-4 mb-5">
                        {[
                            { label: 'کل مشتریان',   value: allData.length, icon: faUsers,    color: 'var(--primary)', bg: 'var(--primary-light)' },
                            { label: 'اشخاص حقیقی',  value: persons,        icon: faUser,     color: 'var(--success)', bg: 'var(--success-light)' },
                            { label: 'اشخاص حقوقی',  value: companies,      icon: faBuilding, color: 'var(--info)',    bg: 'var(--info-light)'    },
                        ].map(({ label, value, icon, color, bg }) => (
                            <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                        className="card p-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                                    <FontAwesomeIcon icon={icon} className="w-4 h-4" style={{ color }} />
                                </div>
                                <div>
                                    <p className="text-xl font-black" style={{ color }}>{value}</p>
                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                        <DataTable
                            data={allData}
                            columns={columns}
                            loading={isLoading && allData.length === 0}
                            emptyMessage="هیچ مشتری‌ای یافت نشد"
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
                                    ✓ همه مشتریان بارگذاری شدند
                                </span>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
    )
}