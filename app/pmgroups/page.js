'use client'

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faTrash, faSpinner, faPlus, faLayerGroup, faEye } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import DashboardLayout from "@/app/dashboard/Dashboardlayout"
import { useEffect, useRef } from 'react'
import Swal from 'sweetalert2'
import DataTable from '@/app/components/DataTable/DataTable'
import PageCrumb from '@/app/components/PageHeader/PageCrumb'
import { ENV, getHeaders } from '@/app/config/env'

const BASE = ENV.API_PM_GROUPS

const fetchPmGroups = async ({ pageParam = null }) => {
    let url = BASE
    if (pageParam) url += `?cursor=${pageParam}`
    const res = await fetch(url, { headers: getHeaders() })
    if (!res.ok) throw new Error('خطا در دریافت')
    const result = await res.json()
    return result.data.pmGroups
}

export default function PmGroupsPage() {
    const observerTarget = useRef(null)
    const queryClient = useQueryClient()

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
        queryKey: ['pmGroups'],
        queryFn: fetchPmGroups,
        getNextPageParam: (p) => p.next_cursor ?? undefined,
        staleTime: 5 * 60 * 1000,
    })

    const deleteMutation = useMutation({
        mutationFn: (id) => fetch(`${BASE}/${id}`, { method: 'DELETE', headers: getHeaders() }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries(['pmGroups'])
            Swal.fire({ title: 'حذف شد!', icon: 'success', timer: 2000, showConfirmButton: false })
        },
        onError: () => Swal.fire('خطا!', 'حذف انجام نشد', 'error')
    })

    useEffect(() => {
        const observer = new IntersectionObserver(
            e => { if (e[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage() },
            { threshold: 0.5 }
        )
        if (observerTarget.current) observer.observe(observerTarget.current)
        return () => { if (observerTarget.current) observer.unobserve(observerTarget.current) }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage])

    const handleDelete = (row) => {
        Swal.fire({
            title: 'حذف گروه PM', html: `آیا از حذف گروه <strong>${row.mechanism_group_code}</strong> مطمئن هستید؟`,
            icon: 'warning', showCancelButton: true,
            confirmButtonColor: 'var(--danger)', cancelButtonColor: 'var(--muted)',
            confirmButtonText: 'بله، حذف شود', cancelButtonText: 'انصراف'
        }).then(r => { if (r.isConfirmed) deleteMutation.mutate(row.id) })
    }

    const allData = data?.pages.flatMap(p => p.data) ?? []

    const columns = [
        {
            key: 'mechanism_group_code', label: 'کد گروه مکانیزم',
            filter: { type: 'select', placeholder: 'جستجو کد...', options: (d) => [...new Set(d.map(r => r.mechanism_group_code))].map(v => ({ value: v, label: v })) },
            render: (row) => <span className="font-mono font-bold" style={{ color: 'var(--primary)' }}>{row.mechanism_group_code}</span>
        },
        {
            key: 'tm_code_id', label: 'کد TM',
            render: (row) => <span className="badge badge-primary">{row.tm_code_id}</span>
        },
        {
            key: 'minutes', label: 'دقیقه',
            render: (row) => <span style={{ color: 'var(--text-soft)' }}>{row.minutes ?? '—'}</span>
        },
        {
            key: 'km', label: 'کیلومتر',
            render: (row) => <span style={{ color: 'var(--text-soft)' }}>{row.km ?? '—'}</span>
        },
        {
            key: 'description', label: 'توضیحات',
            render: (row) => <span className="truncate max-w-xs block" style={{ color: 'var(--text-soft)' }}>{row.description || '—'}</span>
        },
        {
            key: 'actions', label: 'عملیات',
            render: (row) => (
                <div className="flex items-center justify-center gap-2">
                    <Link href={`/pmgroups/show/${row.id}`}>
                        <button
                            className="w-9 h-9 flex items-center justify-center rounded-lg"
                            style={{ color: 'var(--success)', background: 'var(--success-light)' }}
                            title="مشاهده"
                        >
                            <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
                        </button>
                    </Link>
                    <Link href={`/pmgroups/edit/${row.id}`}>
                        <button
                            className="w-9 h-9 flex items-center justify-center rounded-lg"
                            style={{ color: 'var(--info)', background: 'var(--info-light)' }}
                            title="ویرایش"
                        >
                            <FontAwesomeIcon icon={faPen} className="w-4 h-4" />
                        </button>
                    </Link>
                    <button
                        onClick={() => handleDelete(row)}
                        disabled={deleteMutation.isPending}
                        className="w-9 h-9 flex items-center justify-center rounded-lg disabled:opacity-50"
                        style={{ color: 'var(--danger)', background: 'var(--danger-light)' }}
                        title="حذف"
                    >
                        <FontAwesomeIcon
                            icon={deleteMutation.isPending ? faSpinner : faTrash}
                            className={`w-4 h-4 ${deleteMutation.isPending ? 'animate-spin' : ''}`}
                        />
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
                            icon={faLayerGroup}
                            root="عملیات تعمیرگاه"
                            current="گروه‌های PM"
                        />
                        <Link href="/pmgroups/create">
                            <button className="btn btn-primary">
                                <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
                                افزودن گروه
                            </button>
                        </Link>
                    </div>

                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                        <DataTable
                            data={allData}
                            columns={columns}
                            loading={isLoading && allData.length === 0}
                            emptyMessage="هیچ گروه PM یافت نشد"
                            disablePagination={true}
                        />
                        {hasNextPage && (
                            <div ref={observerTarget} className="py-8 flex justify-center">
                                <FontAwesomeIcon icon={faSpinner} className="w-5 h-5 animate-spin" style={{ color: 'var(--primary)' }} />
                                <span className="text-sm font-semibold mr-3" style={{ color: 'var(--primary)' }}>در حال بارگذاری...</span>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </DashboardLayout>
    )
}