'use client'

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faTrash, faSpinner, faPlus, faFileInvoice, faEye } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import DashboardLayout from "@/app/dashboard/Dashboardlayout"
import { useEffect, useRef } from 'react'
import Swal from 'sweetalert2'
import DataTable from '@/app/components/DataTable/DataTable'
import { ENV, getHeaders } from '@/app/config/env'   // ⭐ import اضافه شد

// ── API calls ────────────────────────────────────────────
const fetchFinalStatements = async ({ pageParam = null }) => {
    // ⭐ حذف ?with=creator — API این پارامتر رو نداره
    let url = ENV.API_FINAL_STATEMENTS
    if (pageParam) url += `?cursor=${pageParam}`
    const res = await fetch(url, { headers: getHeaders() })
    if (!res.ok) throw new Error('Failed to fetch final statements')
    const result = await res.json()
    return result.data.finalStatements
}

const deleteFinalStatement = async (id) => {
    const res = await fetch(`${ENV.API_FINAL_STATEMENTS}/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    })
    if (!res.ok) throw new Error('Failed to delete final statement')
    return res.json()
}

// ── دکمه آیکون ───────────────────────────────────────────
const ActionBtn = ({ onClick, disabled, icon, spinning, colorVar, bgVar, title, href }) => {
    const btn = (
        <button onClick={onClick} disabled={disabled} title={title}
                className="w-9 h-9 flex items-center justify-center rounded-lg transition-all disabled:opacity-50"
                style={{ color: colorVar, background: bgVar }}
                onMouseEnter={e => { if (!disabled) e.currentTarget.style.filter = 'brightness(0.88)' }}
                onMouseLeave={e => e.currentTarget.style.filter = 'none'}>
            <FontAwesomeIcon icon={icon} className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} />
        </button>
    )
    return href ? <Link href={href}>{btn}</Link> : btn
}

// ════════════════════════════════════════════════════════
export default function FinalStatementsListPage() {
    const observerTarget = useRef(null)
    const queryClient    = useQueryClient()

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
        queryKey: ['finalStatements'],
        queryFn:  fetchFinalStatements,
        getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
        staleTime: 5 * 60 * 1000,
        gcTime:    10 * 60 * 1000,
    })

    const deleteMutation = useMutation({
        mutationFn: deleteFinalStatement,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['finalStatements'] })
            Swal.fire({ title: 'حذف شد!', text: 'صورت وضعیت با موفقیت حذف شد', icon: 'success', timer: 2000, showConfirmButton: false })
        },
        onError: (err) => Swal.fire({ title: 'خطا!', text: err.message, icon: 'error' })
    })

    // infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => { if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage() },
            { threshold: 0.5 }
        )
        if (observerTarget.current) observer.observe(observerTarget.current)
        return () => { if (observerTarget.current) observer.unobserve(observerTarget.current) }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage])

    const handleDelete = (statement) => {
        Swal.fire({
            title: 'حذف صورت وضعیت',
            html: `آیا از حذف <strong>${statement.title}</strong> مطمئن هستید؟`,
            icon: 'warning', showCancelButton: true,
            confirmButtonColor: '#dc2626', cancelButtonColor: '#64748b',
            confirmButtonText: 'بله، حذف شود', cancelButtonText: 'انصراف'
        }).then(r => { if (r.isConfirmed) deleteMutation.mutate(statement.id) })
    }

    const allStatements = data?.pages.flatMap(page => page.data) ?? []

    // ── ستون‌ها — بر اساس فیلدهای واقعی API ─────────────
    const columns = [
        {
            key: 'number', label: 'شماره',
            filter: {
                type: 'select', placeholder: 'شماره...',
                options: (data) => [...new Set(data.map(s => s.number))]
                    .sort((a, b) => a - b)
                    .map(n => ({ value: n, label: n }))
            },
            render: (row) => <span className="badge badge-primary">{row.number}</span>
        },
        {
            key: 'title', label: 'عنوان',
            filter: {
                type: 'select', placeholder: 'عنوان...',
                options: (data) => [...new Set(data.map(s => s.title))]
                    .map(t => ({ value: t, label: t }))
                    .sort((a, b) => a.label.localeCompare(b.label))
            },
            render: (row) => <span className="font-bold" style={{ color: 'var(--text)' }}>{row.title}</span>
        },
        {
            key: 'shop_name', label: 'شاپ',
            filter: {
                type: 'select', placeholder: 'شاپ...',
                options: (data) => [...new Set(data.map(s => s.shop_name).filter(Boolean))]
                    .map(s => ({ value: s, label: s }))
                    .sort((a, b) => a.label.localeCompare(b.label))
            },
            render: (row) => <span style={{ color: 'var(--text-soft)' }}>{row.shop_name || '—'}</span>
        },
        {
            key: 'date', label: 'تاریخ',
            render: (row) => (
                <span style={{ color: 'var(--text-soft)' }}>
                    {row.date ? new Date(row.date).toLocaleDateString('fa-IR') : '—'}
                </span>
            )
        },
        {
            key: 'description', label: 'توضیحات',
            render: (row) => (
                <span className="truncate max-w-xs block" style={{ color: 'var(--text-soft)' }}>
                    {row.description || '—'}
                </span>
            )
        },
        {
            key: 'actions', label: 'عملیات', searchable: false,
            render: (row) => (
                <div className="flex items-center justify-center gap-1.5">
                    <ActionBtn href={`/finalstatements/${row.id}`}
                               icon={faEye}   colorVar="var(--info)"    bgVar="var(--info-light)"    title="مشاهده" />
                    <ActionBtn href={`/finalstatements/edit/${row.id}`}
                               icon={faPen}   colorVar="var(--warning)" bgVar="var(--warning-light)" title="ویرایش" />
                    <ActionBtn onClick={() => handleDelete(row)}
                               icon={deleteMutation.isPending ? faSpinner : faTrash}
                               spinning={deleteMutation.isPending} disabled={deleteMutation.isPending}
                               colorVar="var(--danger)" bgVar="var(--danger-light)" title="حذف" />
                </div>
            )
        }
    ]

    return (
        <DashboardLayout>
            <div className="w-full min-h-screen" style={{ background: 'var(--bg)' }}>

                <div className="page-header-bar">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                 style={{ background: 'rgba(255,255,255,0.2)' }}>
                                <FontAwesomeIcon icon={faFileInvoice} className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-white leading-none">صورت وضعیت‌ها</h1>
                                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
                                    {allStatements.length > 0 ? `${allStatements.length} مورد` : 'مدیریت صورت وضعیت‌های نهایی'}
                                </p>
                            </div>
                        </div>
                        <Link href="/finalstatements/create">
                            <button className="btn btn-success">
                                <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
                                صورت وضعیت جدید
                            </button>
                        </Link>
                    </div>
                </div>

                <div className="p-6 max-w-7xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                        <DataTable
                            data={allStatements}
                            columns={columns}
                            loading={isLoading}
                            emptyMessage="هیچ صورت وضعیتی یافت نشد"
                            title="لیست صورت وضعیت‌ها"
                        />

                        {/* infinite scroll trigger */}
                        {hasNextPage && (
                            <div ref={observerTarget} className="py-8 flex justify-center">
                                <FontAwesomeIcon icon={faSpinner} className="w-5 h-5 animate-spin" style={{ color: 'var(--primary)' }} />
                                <span className="mr-2 text-sm font-semibold" style={{ color: 'var(--primary)' }}>در حال بارگذاری...</span>
                            </div>
                        )}

                        {!hasNextPage && allStatements.length > 0 && (
                            <div className="py-5 text-center">
                                <span className="inline-block px-5 py-2.5 rounded-xl text-sm font-semibold"
                                      style={{ background: 'var(--surface-2)', color: 'var(--text-soft)' }}>
                                    ✓ همه صورت وضعیت‌ها بارگذاری شدند
                                </span>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </DashboardLayout>
    )
}