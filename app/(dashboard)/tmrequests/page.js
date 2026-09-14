'use client'

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faTrash, faSpinner, faPlus, faClipboardList, faCheck, faTimes, faClock, faTruck } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import Swal from '@/app/utils/swal'
import DataTable from '@/app/components/DataTable/DataTable'
import PageCrumb from '@/app/components/PageHeader/PageCrumb'
import { ENV, getHeaders } from '@/app/config/env'


const BASE = ENV.API_TM_REQUESTS


const fetchTmRequests = async ({ pageParam = null }) => {
    let url = BASE
    if (pageParam) url += `?cursor=${pageParam}`
    const res = await fetch(url, { headers: getHeaders() })
    if (!res.ok) throw new Error('خطا در دریافت')
    const result = await res.json()
    return result.data.tmRequests
}

const STATUS_LABEL = {
    request:               'درخواست',
    waiting:               'در انتظار',
    accepted:              'پذیرفته',
    rejected:              'رد شده',
    departure:             'ترخیص',
    waiting_for_departure: 'در انتظار ترخیص',
    completed:             'تکمیل شده',
    canceled:              'لغو شده',
}
const STATUS_STYLE = {
    waiting:  { background: 'var(--warning-light)', color: 'var(--warning)' },
    accepted: { background: 'var(--success-light)', color: 'var(--success)' },
    rejected: { background: 'var(--danger-light)',  color: 'var(--danger)'  },
    departure:{ background: 'var(--info-light)',    color: 'var(--info)'    },
}
const TYPE_STYLE = {
    CM: { background: 'var(--info-light)',    color: 'var(--info)'    },
    PM: { background: 'var(--success-light)', color: 'var(--success)' },
    EM: { background: 'var(--danger-light)',  color: 'var(--danger)'  },
}

export default function TmRequestsPage() {
    const observerTarget = useRef(null)
    const queryClient = useQueryClient()

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
        queryKey: ['tmRequests'],
        queryFn: fetchTmRequests,
        getNextPageParam: (p) => p?.next_cursor ?? undefined,
        staleTime: 5 * 60 * 1000,
    })

    const deleteMutation = useMutation({
        mutationFn: (id) => fetch(`${BASE}/${id}`, { method: 'DELETE', headers: getHeaders() }).then(r => r.json()),
        onSuccess: () => { queryClient.invalidateQueries(['tmRequests']); Swal.fire({ title: 'حذف شد!', icon: 'success', timer: 2000, showConfirmButton: false }) },
        onError: () => Swal.fire('خطا!', 'حذف انجام نشد', 'error')
    })

    const statusMutation = useMutation({
        mutationFn: ({ id, action }) => fetch(`${BASE}/${id}/${action}`, { method: 'PATCH', headers: getHeaders() }).then(r => r.json()),
        onSuccess: () => queryClient.invalidateQueries(['tmRequests']),
        onError: () => Swal.fire('خطا!', 'عملیات انجام نشد', 'error')
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
            title: 'حذف درخواست', html: `آیا از حذف درخواست <strong>#${row.work_order_number}</strong> مطمئن هستید؟`,
            icon: 'warning', showCancelButton: true,
            confirmButtonColor: 'var(--danger)', cancelButtonColor: 'var(--muted)',
            confirmButtonText: 'بله، حذف شود', cancelButtonText: 'انصراف'
        }).then(r => { if (r.isConfirmed) deleteMutation.mutate(row.id) })
    }

    const allData = data?.pages.flatMap(p => p.data) ?? []

    const ActionIconBtn = ({ onClick, icon, color, bg, title, disabled }) => (
        <button onClick={onClick} disabled={disabled} title={title}
                className="w-9 h-9 flex items-center justify-center rounded-lg disabled:opacity-40"
                style={{ color, background: bg }}
                onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.88)'}
                onMouseLeave={e => e.currentTarget.style.filter = 'none'}>
            <FontAwesomeIcon icon={icon} className="w-3.5 h-3.5" />
        </button>
    )

    const columns = [
        {
            key: 'work_order_number', label: 'شماره کاری',
            render: (row) => <span className="badge badge-primary">#{row.work_order_number}</span>
        },
        {
            key: 'type', label: 'نوع',
            filter: { type: 'select', placeholder: 'نوع...', options: () => ['CM','PM','EM'].map(v => ({ value: v, label: v })) },
            render: (row) => <span className="badge" style={TYPE_STYLE[row.type] ?? {}}>{row.type}</span>
        },
        {
            key: 'status', label: 'وضعیت',
            filter: { type: 'select', placeholder: 'وضعیت...', options: () => Object.entries(STATUS_LABEL).map(([v,l]) => ({ value: v, label: l })) },
            render: (row) => (
                <span className="badge" style={STATUS_STYLE[row.status] ?? { background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
                    {STATUS_LABEL[row.status] ?? row.status}
                </span>
            )
        },
        {
            key: 'mechanism_id', label: 'شناسه مکانیزم',
            render: (row) => <span style={{ color: 'var(--text-soft)' }}>{row.mechanism_id ?? '—'}</span>
        },
        {
            key: 'created_at', label: 'تاریخ',
            render: (row) => <span style={{ color: 'var(--text-soft)' }}>{row.created_at ? new Date(row.created_at).toLocaleDateString('fa-IR') : '—'}</span>
        },
        {
            key: 'actions', label: 'عملیات',
            render: (row) => (
                <div className="flex items-center justify-center gap-1.5">
                    <Link href={`/tmrequests/show/${row.id}`}>
                        <ActionIconBtn icon={faEye} color="var(--info)" bg="var(--info-light)" title="مشاهده" />
                    </Link>
                    {row.status === 'accepted' && (
                        <ActionIconBtn icon={faTimes} color="var(--danger)" bg="var(--danger-light)" title="رد کردن"
                                       onClick={() => statusMutation.mutate({ id: row.id, action: 'reject' })} />
                    )}
                    {row.status === 'rejected' && (
                        <ActionIconBtn icon={faClock} color="var(--warning)" bg="var(--warning-light)" title="بازگشت به انتظار"
                                       onClick={() => statusMutation.mutate({ id: row.id, action: 'toWaiting' })} />
                    )}
                    {row.status === 'accepted' && (
                        <ActionIconBtn icon={faTruck} color="var(--success)" bg="var(--success-light)" title="ترخیص"
                                       onClick={() => statusMutation.mutate({ id: row.id, action: 'toDeparture' })} />
                    )}
                    <ActionIconBtn icon={deleteMutation.isPending ? faSpinner : faTrash}
                                   color="var(--danger)" bg="var(--danger-light)" title="حذف"
                                   onClick={() => handleDelete(row)} disabled={deleteMutation.isPending} />
                </div>
            )
        }
    ]

    return (
            <div className="w-full min-h-screen" style={{ background: 'var(--bg)' }}>
                <div className="page-content">

                    {/* ── crumb + دکمه (مثل شاپ‌ها) ── */}
                    <div className="flex items-center justify-between gap-3 flex-wrap mb-1">
                        <PageCrumb
                            icon={faClipboardList}
                            root="عملیات تعمیرگاه"
                            current="درخواست‌های تعمیر"
                        />
                        <Link href="/tmrequests/create">
                            <button className="btn btn-primary">
                                <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
                                درخواست جدید
                            </button>
                        </Link>
                    </div>

                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                        <DataTable
                            data={allData}
                            columns={columns}
                            loading={isLoading && allData.length === 0}
                            emptyMessage="هیچ درخواست تعمیری یافت نشد"
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
    )
}