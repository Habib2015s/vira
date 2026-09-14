'use client'

import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faSpinner, faPlus, faWrench } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import DataTable from '@/app/components/DataTable/DataTable'
import PageCrumb from '@/app/components/PageHeader/PageCrumb'
import { ENV, getHeaders } from '@/app/config/env'

const fetchTmCodes = async ({ pageParam = null, queryKey }) => {
    const [_key, filters] = queryKey
    let url = ENV.API_TM_CODES
    const params = new URLSearchParams()
    if (pageParam) params.append('cursor', pageParam)
    if (filters?.type) params.append('type', filters.type)
    if (params.toString()) url += `?${params.toString()}`

    const response = await fetch(url, {
        headers: getHeaders()
    })
    if (!response.ok) throw new Error('Failed to fetch TM codes')
    const result = await response.json()
    return result.data.tmCodes
}

export default function RequestsListPage() {
    const queryClient = useQueryClient()
    const observerTarget = useRef(null)

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
        queryKey: ['tmCodes', {}],
        queryFn: fetchTmCodes,
        getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    })

    const allRequests = data?.pages.flatMap(page => page.data) ?? []

    // بازخوانی وقتی تب فعال میشه
    useEffect(() => {
        const handle = () => {
            if (!document.hidden) queryClient.invalidateQueries({ queryKey: ['tmCodes'] })
        }
        document.addEventListener('visibilitychange', handle)
        return () => document.removeEventListener('visibilitychange', handle)
    }, [queryClient])

    // infinite scroll trigger
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage()
            },
            { threshold: 0.5 }
        )
        if (observerTarget.current) observer.observe(observerTarget.current)
        return () => { if (observerTarget.current) observer.unobserve(observerTarget.current) }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage])

    // ── ستون‌ها ──
    const columns = [
        {
            key: 'code',
            label: 'کد',
            filter: {
                type: 'select',
                placeholder: 'جستجو کد...',
                options: (data) => [...new Set(data.map(r => r.code))]
                    .map(c => ({ value: c, label: c }))
                    .sort((a, b) => a.label.localeCompare(b.label))
            },
            render: (row) => (
                <span className="font-bold" style={{ color: 'var(--text)' }}>{row.code}</span>
            )
        },
        {
            key: 'title',
            label: 'عنوان',
            filter: {
                type: 'select',
                placeholder: 'جستجو عنوان...',
                options: (data) => [...new Set(data.map(r => r.title))]
                    .map(t => ({ value: t, label: t }))
                    .sort((a, b) => a.label.localeCompare(b.label))
            },
            render: (row) => (
                <span style={{ color: 'var(--text-soft)' }}>{row.title}</span>
            )
        },
        {
            key: 'type',
            label: 'نوع',
            filter: {
                type: 'select',
                placeholder: 'نوع...',
                options: () => [
                    { value: 'CM', label: 'CM' },
                    { value: 'PM', label: 'PM' },
                    { value: 'EM', label: 'EM' }
                ]
            },
            render: (row) => {
                const styles = {
                    CM: { background: 'var(--info-light)',    color: 'var(--info)'    },
                    PM: { background: 'var(--success-light)', color: 'var(--success)' },
                    EM: { background: 'var(--primary-light)', color: 'var(--primary)' },
                }
                return (
                    <span className="badge" style={styles[row.type] ?? { background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
                        {row.type}
                    </span>
                )
            }
        },
        {
            key: 'hours',
            label: 'ساعت',
            render: (row) => (
                <span style={{ color: 'var(--text-soft)' }}>{row.hours || '—'}</span>
            )
        },
        {
            key: 'base_amount',
            label: 'هزینه پایه',
            render: (row) => (
                <span className="font-bold" style={{ color: 'var(--success)' }}>
                    {row.base_amount ? `${row.base_amount.toLocaleString('fa-IR')} ریال` : '—'}
                </span>
            )
        },
        {
            key: 'actions',
            label: 'عملیات',
            render: (row) => (
                <div className="flex justify-center items-center">
                    <Link href={`/requests/edit/${row.id}`}>
                        <button
                            className="icon-action"
                            title="ویرایش"
                        >
                            <FontAwesomeIcon icon={faPen} className="w-3.5 h-3.5" />
                        </button>
                    </Link>
                </div>
            )
        }
    ]

    return (
            <div className="w-full min-h-screen" style={{ background: 'var(--bg)' }}>
                <div className="page-content">

                    {/* ── crumb + دکمه‌ها (مثل شاپ‌ها) ── */}
                    <div className="flex items-center justify-between gap-3 flex-wrap mb-1">
                        <PageCrumb
                            icon={faWrench}
                            root="عملیات تعمیرگاه"
                            current="لیست کدهای TM"
                        />
                        <div className="flex items-center gap-2">
                            <Link href="/requests/create">
                                <button className="btn btn-primary">
                                    <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
                                    افزودن کد تعمیر
                                </button>
                            </Link>
                            <Link href="/components/RepairRequest">
                                <button className="btn btn-secondary">
                                    ⚡ پذیرش مستقیم
                                </button>
                            </Link>
                        </div>
                    </div>

                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                        <DataTable
                            data={allRequests}
                            columns={columns}
                            loading={isLoading && allRequests.length === 0}
                            emptyMessage="هیچ کد تعمیری یافت نشد"
                            disablePagination={true}
                        />

                        {/* Infinite scroll trigger */}
                        {hasNextPage && (
                            <div ref={observerTarget} className="py-8 flex justify-center">
                                <div className="flex items-center gap-3">
                                    <FontAwesomeIcon
                                        icon={faSpinner}
                                        className="w-5 h-5 animate-spin"
                                        style={{ color: 'var(--primary)' }}
                                    />
                                    <span className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>
                                        در حال بارگذاری بیشتر...
                                    </span>
                                </div>
                            </div>
                        )}

                        {!hasNextPage && allRequests.length > 0 && (
                            <div className="py-5 text-center">
                                <span
                                    className="inline-block px-5 py-2.5 rounded-xl text-sm font-semibold"
                                    style={{ background: 'var(--surface-2)', color: 'var(--text-soft)' }}
                                >
                                    ✓ همه رکوردها بارگذاری شدند ({allRequests.length} رکورد)
                                </span>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
    )
}