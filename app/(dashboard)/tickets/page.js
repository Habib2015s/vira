'use client'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faPlus, faTicket, faEye, faLockOpen, faXmark, faPaperPlane, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import Swal from 'sweetalert2'
import DataTable from '@/app/components/DataTable/DataTable'
import { ENV, getHeaders } from '@/app/config/env'

const BASE = ENV.API_TICKETS

const STATUS_LABEL = { open: 'باز', closed: 'بسته', pending: 'در انتظار' }
const STATUS_STYLE = {
    open:    { background: 'var(--success-light)', color: 'var(--success)' },
    closed:  { background: 'var(--danger-light)',  color: 'var(--danger)'  },
    pending: { background: 'var(--warning-light)', color: 'var(--warning)' },
}
const PRIORITY_STYLE = {
    low:    { background: 'var(--info-light)',    color: 'var(--info)'    },
    medium: { background: 'var(--warning-light)', color: 'var(--warning)' },
    high:   { background: 'var(--danger-light)',  color: 'var(--danger)'  },
}

const fetchTickets = async ({ pageParam = null }) => {
    const url = pageParam ? `${BASE}?cursor=${pageParam}` : BASE
    const res = await fetch(url, { headers: getHeaders() })
    if (!res.ok) throw new Error('خطا')
    return (await res.json()).data.tickets
}

export default function TicketsPage() {
    const observerTarget = useRef(null)
    const queryClient    = useQueryClient()

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
        queryKey: ['tickets'], queryFn: fetchTickets,
        initialPageParam: null, getNextPageParam: (p) => p?.next_cursor ?? undefined, staleTime: 3 * 60 * 1000,
    })

    const closeMutation = useMutation({
        mutationFn: (id) => fetch(`${BASE}/${id}/close`, { method: 'POST', headers: getHeaders() }).then(r => r.json()),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tickets'] }); Swal.fire({ title: 'بسته شد!', icon: 'success', timer: 2000, showConfirmButton: false }) },
        onError: () => Swal.fire('خطا!', 'عملیات انجام نشد', 'error'),
    })

    useEffect(() => {
        const obs = new IntersectionObserver(e => { if (e[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage() }, { threshold: 0.5 })
        if (observerTarget.current) obs.observe(observerTarget.current)
        return () => { if (observerTarget.current) obs.unobserve(observerTarget.current) }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage])

    const allData = data?.pages.flatMap(p => p.data) ?? []
    const openCount   = allData.filter(t => t.status === 'open').length
    const closedCount = allData.filter(t => t.status === 'closed').length

    const columns = [
        { key: 'title', label: 'عنوان', render: (row) => <span className="font-bold" style={{ color: 'var(--text)' }}>{row.title}</span> },
        { key: 'category', label: 'دسته‌بندی', render: (row) => <span className="badge badge-muted">{row.category || '—'}</span> },
        {
            key: 'priority', label: 'اولویت',
            filter: { type: 'select', placeholder: 'اولویت...', options: () => [{ value: 'low', label: 'پایین' }, { value: 'medium', label: 'متوسط' }, { value: 'high', label: 'بالا' }] },
            render: (row) => <span className="badge" style={PRIORITY_STYLE[row.priority] ?? {}}>{row.priority === 'low' ? 'پایین' : row.priority === 'medium' ? 'متوسط' : 'بالا'}</span>
        },
        {
            key: 'status', label: 'وضعیت',
            filter: { type: 'select', placeholder: 'وضعیت...', options: () => Object.entries(STATUS_LABEL).map(([v,l]) => ({ value: v, label: l })) },
            render: (row) => <span className="badge" style={STATUS_STYLE[row.status] ?? {}}>{STATUS_LABEL[row.status] ?? row.status}</span>
        },
        { key: 'created_at', label: 'تاریخ', render: (row) => <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(row.created_at).toLocaleDateString('fa-IR')}</span> },
        {
            key: 'actions', label: 'عملیات',
            render: (row) => (
                <div className="flex items-center justify-center gap-1.5">
                    <Link href={`/tickets/${row.id}`}><button className="action-btn action-btn-view"><FontAwesomeIcon icon={faEye} className="w-3.5 h-3.5" /></button></Link>
                    {row.status !== 'closed' && (
                        <button className="action-btn action-btn-delete" title="بستن تیکت"
                                onClick={() => Swal.fire({ title: 'بستن تیکت؟', icon: 'question', showCancelButton: true, confirmButtonColor: 'var(--danger)', confirmButtonText: 'بله', cancelButtonText: 'انصراف' }).then(r => r.isConfirmed && closeMutation.mutate(row.id))}>
                            <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            )
        }
    ]

    return (
            <div className="w-full min-h-screen" style={{ background: 'var(--bg)' }}>
                <div className="page-header-bar">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                                <FontAwesomeIcon icon={faTicket} className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-white leading-none">تیکت‌ها</h1>
                                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.75)' }}>{openCount} باز · {closedCount} بسته</p>
                            </div>
                        </div>
                        <Link href="/tickets/create"><button className="btn btn-success"><FontAwesomeIcon icon={faPlus} className="w-4 h-4" />تیکت جدید</button></Link>
                    </div>
                </div>
                <div className="page-content max-w-7xl">
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                        <DataTable data={allData} columns={columns} loading={isLoading && allData.length === 0} emptyMessage="هیچ تیکتی یافت نشد" disablePagination={true} />
                        {hasNextPage && <div ref={observerTarget} className="py-8 flex justify-center"><FontAwesomeIcon icon={faSpinner} className="w-5 h-5 animate-spin" style={{ color: 'var(--primary)' }} /></div>}
                    </motion.div>
                </div>
            </div>
    )
}