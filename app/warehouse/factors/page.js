'use client'

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faEye, faTrash, faSpinner, faPlus, faFileInvoiceDollar,
    faCheck, faBan, faCreditCard, faPen
} from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import DashboardLayout from "@/app/dashboard/Dashboardlayout"
import { useEffect, useRef } from 'react'
import Swal from 'sweetalert2'
import DataTable from '@/app/components/DataTable/DataTable'
import { ENV, getHeaders } from '@/app/config/env'

const BASE    = ENV.API_WAREHOUSE_FACTORS

const STATUS_MAP = {
    'pre-invoice': { label: 'پیش‌فاکتور', badge: 'badge-warning'  },
    'invoice':     { label: 'فاکتور',     badge: 'badge-primary'  },
    'confirmed':   { label: 'تأیید شده',  badge: 'badge-success'  },
    'canceled':    { label: 'لغو شده',    badge: 'badge-danger'   },
}

const fetchFactors = async ({ pageParam = null }) => {
    let url = BASE
    if (pageParam) url += `?cursor=${pageParam}`
    const res = await fetch(url, { headers: getHeaders() })
    if (!res.ok) throw new Error('خطا')
    return (await res.json()).data.factors
}

export default function FactorsPage() {
    const observerTarget = useRef(null)
    const queryClient    = useQueryClient()

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
        queryKey: ['warehouseFactors'],
        queryFn:  fetchFactors,
        initialPageParam: null,
        getNextPageParam: (p) => p?.next_cursor ?? undefined,
        staleTime: 3 * 60 * 1000,
    })

    // ── mutations ─────────────────────────────────────
    const confirmMutation = useMutation({
        mutationFn: (id) => fetch(`${BASE}/${id}/confirm`, { method: 'POST', headers: getHeaders() }).then(r => r.json()),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['warehouseFactors'] }); Swal.fire({ title: 'تأیید شد!', icon: 'success', timer: 2000, showConfirmButton: false }) },
        onError: () => Swal.fire('خطا!', 'عملیات انجام نشد', 'error'),
    })
    const cancelMutation = useMutation({
        mutationFn: (id) => fetch(`${BASE}/${id}/cancel`, { method: 'POST', headers: getHeaders() }).then(r => r.json()),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['warehouseFactors'] }); Swal.fire({ title: 'لغو شد!', icon: 'warning', timer: 2000, showConfirmButton: false }) },
        onError: () => Swal.fire('خطا!', 'عملیات انجام نشد', 'error'),
    })

    useEffect(() => {
        const observer = new IntersectionObserver(
            e => { if (e[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage() },
            { threshold: 0.5 }
        )
        if (observerTarget.current) observer.observe(observerTarget.current)
        return () => { if (observerTarget.current) observer.unobserve(observerTarget.current) }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage])

    const handleConfirm = (row) =>
        Swal.fire({
            title: 'تأیید فاکتور',
            html: `فاکتور شماره <strong>${row.factor_number}</strong> تأیید شود؟`,
            icon: 'question', showCancelButton: true,
            confirmButtonColor: 'var(--success)', cancelButtonColor: 'var(--muted)',
            confirmButtonText: 'بله، تأیید شود', cancelButtonText: 'انصراف'
        }).then(r => { if (r.isConfirmed) confirmMutation.mutate(row.id) })

    const handleCancel = (row) =>
        Swal.fire({
            title: 'لغو فاکتور',
            html: `فاکتور شماره <strong>${row.factor_number}</strong> لغو شود؟`,
            icon: 'warning', showCancelButton: true,
            confirmButtonColor: 'var(--danger)', cancelButtonColor: 'var(--muted)',
            confirmButtonText: 'بله، لغو شود', cancelButtonText: 'انصراف'
        }).then(r => { if (r.isConfirmed) cancelMutation.mutate(row.id) })

    const allData = data?.pages.flatMap(p => p.data) ?? []

    // آمار
    const totalOwed = allData.reduce((s, f) => s + (f.amount_owed || 0), 0)
    const confirmed = allData.filter(f => f.status === 'confirmed').length
    const pending   = allData.filter(f => f.status === 'pre-invoice').length

    const columns = [
        {
            key: 'factor_number', label: 'شماره فاکتور',
            filter: { type: 'text', placeholder: 'جستجو...' },
            render: (row) => (
                <div className="flex items-center justify-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                         style={{ background: 'var(--primary-light)' }}>
                        <FontAwesomeIcon icon={faFileInvoiceDollar} className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
                    </div>
                    <span className="font-bold font-mono" style={{ color: 'var(--primary)' }}>
                        #{row.factor_number}
                    </span>
                </div>
            )
        },
        {
            key: 'status', label: 'وضعیت',
            filter: { type: 'select', placeholder: 'وضعیت...', options: () => Object.entries(STATUS_MAP).map(([v, { label }]) => ({ value: v, label })) },
            render: (row) => {
                const s = STATUS_MAP[row.status] || { label: row.status, badge: 'badge-muted' }
                return (
                    <div className="flex justify-center">
                        <span className={`badge ${s.badge}`}>{s.label}</span>
                        {row.is_canceled && <span className="badge badge-danger mr-1">لغو</span>}
                    </div>
                )
            }
        },
        {
            key: 'customer_id', label: 'مشتری',
            render: (row) => (
                <div className="text-center">
                    <span className="badge badge-muted text-xs">مشتری #{row.customer_id}</span>
                </div>
            )
        },
        {
            key: 'total_amount_with_discount', label: 'مبلغ (با تخفیف)',
            render: (row) => (
                <div className="text-center">
                    <p className="font-bold text-sm" style={{ color: 'var(--success)' }}>
                        {Number(row.total_amount_with_discount).toLocaleString('fa-IR')}
                    </p>
                    {row.total_discount > 0 && (
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            تخفیف: {Number(row.total_discount).toLocaleString('fa-IR')}
                        </p>
                    )}
                </div>
            )
        },
        {
            key: 'amount_owed', label: 'مانده بدهی',
            render: (row) => (
                <div className="text-center">
                    <span className={`badge ${row.amount_owed > 0 ? 'badge-danger' : 'badge-success'}`}>
                        {Number(row.amount_owed).toLocaleString('fa-IR')}
                    </span>
                </div>
            )
        },
        {
            key: 'total_amount_paid', label: 'پرداخت شده',
            render: (row) => (
                <div className="text-center">
                    <span className="text-sm font-bold" style={{ color: 'var(--info)' }}>
                        {Number(row.total_amount_paid).toLocaleString('fa-IR')}
                    </span>
                </div>
            )
        },
        {
            key: 'actions', label: 'عملیات',
            render: (row) => {
                const canConfirm = !row.is_canceled && row.status !== 'confirmed'
                const canCancel  = !row.is_canceled && row.status !== 'canceled'
                return (
                    <div className="flex items-center justify-center gap-1">

                        {/* ✏️ EDIT */}
                        <Link href={`/warehouse/factors/${row.id}/edit`}>
                            <button className="action-btn"
                                    title="ویرایش"
                                    style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}>
                                <FontAwesomeIcon icon={faPen} className="w-3.5 h-3.5" />
                            </button>
                        </Link>

                        {/* 👁 VIEW */}
                        <Link href={`/warehouse/factors/${row.id}`}>
                            <button className="action-btn action-btn-view" title="مشاهده">
                                <FontAwesomeIcon icon={faEye} className="w-3.5 h-3.5" />
                            </button>
                        </Link>

                        {/* 💳 PAYMENT */}
                        <Link href={`/warehouse/factors/${row.id}/payment`}>
                            <button className="action-btn"
                                    title="ثبت پرداخت"
                                    style={{ background: 'var(--info-light)', color: 'var(--info)' }}>
                                <FontAwesomeIcon icon={faCreditCard} className="w-3.5 h-3.5" />
                            </button>
                        </Link>

                        {/* ✔ CONFIRM */}
                        {canConfirm && (
                            <button className="action-btn action-btn-toggle-off" title="تأیید"
                                    onClick={() => handleConfirm(row)}>
                                <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5" />
                            </button>
                        )}

                        {/* ❌ CANCEL */}
                        {canCancel && (
                            <button className="action-btn action-btn-delete" title="لغو"
                                    onClick={() => handleCancel(row)}>
                                <FontAwesomeIcon icon={faBan} className="w-3.5 h-3.5" />
                            </button>
                        )}

                    </div>                )
            }
        }
    ]

    return (
        <DashboardLayout>
            <div className="w-full min-h-screen" style={{ background: 'var(--bg)' }}>
                <div className="page-header-bar">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                 style={{ background: 'rgba(255,255,255,0.2)' }}>
                                <FontAwesomeIcon icon={faFileInvoiceDollar} className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-white leading-none">فاکتورها</h1>
                                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.75)' }}>
                                    {allData.length} فاکتور — {confirmed} تأیید شده / {pending} در انتظار
                                </p>
                            </div>
                        </div>
                        <Link href="/warehouse/factors/create">
                            <button className="btn btn-success">
                                <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
                                فاکتور جدید
                            </button>
                        </Link>
                    </div>
                </div>

                {/* آمار مالی */}
                <div className="max-w-7xl mx-auto px-8 pt-5 grid grid-cols-4 gap-4">
                    {[
                        { label: 'کل فاکتورها',  value: allData.length,                 color: 'var(--primary)', bg: 'var(--primary-light)', icon: faFileInvoiceDollar, num: false },
                        { label: 'تأیید شده',    value: confirmed,                      color: 'var(--success)', bg: 'var(--success-light)', icon: faCheck,             num: false },
                        { label: 'در انتظار',    value: pending,                        color: 'var(--warning)', bg: 'var(--warning-light)', icon: faSpinner,           num: false },
                        { label: 'کل مانده',     value: `${totalOwed.toLocaleString('fa-IR')} ﷼`, color: 'var(--danger)', bg: 'var(--danger-light)', icon: faCreditCard, num: true },
                    ].map(({ label, value, color, bg, icon }) => (
                        <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    className="card p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                                <FontAwesomeIcon icon={icon} className="w-4 h-4" style={{ color }} />
                            </div>
                            <div>
                                <p className="text-lg font-black leading-none" style={{ color }}>{value}</p>
                                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="page-content max-w-7xl">
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                        <DataTable data={allData} columns={columns}
                                   loading={isLoading && allData.length === 0}
                                   emptyMessage="هیچ فاکتوری یافت نشد" disablePagination={true} />
                        {hasNextPage && (
                            <div ref={observerTarget} className="py-8 flex items-center justify-center gap-3">
                                <FontAwesomeIcon icon={faSpinner} className="w-5 h-5 animate-spin" style={{ color: 'var(--primary)' }} />
                                <span className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>در حال بارگذاری...</span>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </DashboardLayout>
    )
}