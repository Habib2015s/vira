'use client'

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faTrash, faSpinner, faPlus, faUserCog } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import DashboardLayout from "@/app/dashboard/Dashboardlayout"
import { useEffect, useRef } from 'react'
import Swal from 'sweetalert2'
import DataTable from '@/app/components/DataTable/DataTable'
import { ENV, getHeaders } from '@/app/config/env'
import { faEye } from '@fortawesome/free-solid-svg-icons'

const BASE = ENV.API_REPAIRMEN


const fetchRepairmen = async ({ pageParam = null }) => {
    let url = BASE
    if (pageParam) url += `?cursor=${pageParam}`
    const res = await fetch(url, { headers: getHeaders() })
    if (!res.ok) throw new Error('خطا در دریافت اطلاعات')
    const result = await res.json()
    return {
        data: result.data.repairmen,
        next_cursor: result.data.next_cursor
    }}

const CONTRACT_LABELS = { have: 'دارد', completion: 'اتمام', no_need: 'نیاز نیست' }
const CONTRACT_COLORS = {
    have: { background: 'var(--success-light)', color: 'var(--success)' },
    completion: { background: 'var(--warning-light)', color: 'var(--warning)' },
    no_need: { background: 'var(--surface-2)', color: 'var(--text-muted)' }
}

export default function RepairmenPage() {
    const observerTarget = useRef(null)
    const queryClient = useQueryClient()

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
        queryKey: ['repairmen'],
        queryFn: fetchRepairmen,
        getNextPageParam: (p) => p.next_cursor ?? undefined,
        staleTime: 5 * 60 * 1000,
    })

    const deleteMutation = useMutation({
        mutationFn: (id) => fetch(`${BASE}/${id}`, { method: 'DELETE', headers: getHeaders() }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries(['repairmen'])
            Swal.fire({ title: 'حذف شد!', text: 'تعمیرکار حذف شد', icon: 'success', timer: 2000, showConfirmButton: false })
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
            title: 'حذف تعمیرکار',
            html: `آیا از حذف <strong>${row.name} ${row.family}</strong> مطمئن هستید؟`,
            icon: 'warning', showCancelButton: true,
            confirmButtonColor: 'var(--danger)', cancelButtonColor: 'var(--muted)',
            confirmButtonText: 'بله، حذف شود', cancelButtonText: 'انصراف'
        }).then(r => { if (r.isConfirmed) deleteMutation.mutate(row.id) })
    }

    const allData = data?.pages.flatMap(p => p.data) ?? []

    const columns = [
        {
            key: 'name', label: 'نام',
            filter: { type: 'select', placeholder: 'جستجو نام...', options: (d) => [...new Set(d.map(r => r.name))].map(v => ({ value: v, label: v })) },
            render: (row) => <span className="font-bold" style={{ color: 'var(--text)' }}>{row.name} {row.family}</span>
        },
        {
            key: 'personal_code', label: 'کد پرسنلی',
            render: (row) => <span className="font-mono text-sm" style={{ color: 'var(--text-soft)' }}>{row.personal_code || '—'}</span>
        },
        {
            key: 'phone', label: 'تلفن',
            render: (row) => <span style={{ color: 'var(--text-soft)' }}>{row.phone || '—'}</span>
        },
        {
            key: 'workplace', label: 'محل کار',
            render: (row) => <span style={{ color: 'var(--text-soft)' }}>{row.workplace || '—'}</span>
        },
        {
            key: 'contract_status', label: 'وضعیت قرارداد',
            filter: {
                type: 'select', placeholder: 'وضعیت...',
                options: () => Object.entries(CONTRACT_LABELS).map(([v, l]) => ({ value: v, label: l }))
            },
            render: (row) => (
                <span className="badge" style={CONTRACT_COLORS[row.contract_status] ?? {}}>
                    {CONTRACT_LABELS[row.contract_status] ?? row.contract_status}
                </span>
            )
        },
        {
            key: 'actions',
            label: 'عملیات',
            render: (row) => (
                <div className="flex items-center justify-center gap-2">

                    {/* 👁️ Show */}
                    <Link href={`/repairmen/${row.id}`}>
                        <button
                            className="w-9 h-9 flex items-center justify-center rounded-lg"
                            style={{
                                color: 'var(--primary)',
                                background: 'var(--primary-light)'
                            }}
                        >
                            <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
                        </button>
                    </Link>

                    {/* ✏️ Edit */}
                    <Link href={`/repairmen/edit/${row.id}`}>
                        <button className="w-9 h-9 flex items-center justify-center rounded-lg"
                                style={{ color: 'var(--info)', background: 'var(--info-light)' }}
                                onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.9)'}
                                onMouseLeave={e => e.currentTarget.style.filter = 'none'}>
                            <FontAwesomeIcon icon={faPen} className="w-4 h-4" />
                        </button>
                    </Link>

                    {/* 🗑️ Delete */}
                    <button onClick={() => handleDelete(row)} disabled={deleteMutation.isPending}
                            className="w-9 h-9 flex items-center justify-center rounded-lg disabled:opacity-50"
                            style={{ color: 'var(--danger)', background: 'var(--danger-light)' }}
                            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.9)'}
                            onMouseLeave={e => e.currentTarget.style.filter = 'none'}>
                        <FontAwesomeIcon
                            icon={deleteMutation.isPending ? faSpinner : faTrash}
                            className={`w-4 h-4 ${deleteMutation.isPending ? 'animate-spin' : ''}`}
                        />
                    </button>

                </div>
            )
        }    ]

    return (
        <DashboardLayout>
            <div className="w-full min-h-screen" style={{ background: 'var(--bg)' }}>
                <div className="page-header-bar">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-black text-white mb-0.5 flex items-center gap-3">
                                <FontAwesomeIcon icon={faUserCog} className="w-6 h-6 opacity-90" />
                                تعمیرکاران
                            </h1>
                            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
                                مدیریت تعمیرکاران ({allData.length} نفر)
                            </p>
                        </div>
                        <Link href="/repairmen/create">
                            <button className="btn btn-success">
                                <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
                                افزودن تعمیرکار
                            </button>
                        </Link>
                    </div>
                </div>

                <div className="p-6 max-w-7xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                        <DataTable data={allData} columns={columns} loading={isLoading && allData.length === 0}
                                   emptyMessage="هیچ تعمیرکاری یافت نشد" disablePagination={true} />

                        {hasNextPage && (
                            <div ref={observerTarget} className="py-8 flex justify-center">
                                <FontAwesomeIcon icon={faSpinner} className="w-5 h-5 animate-spin" style={{ color: 'var(--primary)' }} />
                                <span className="text-sm font-semibold mr-3" style={{ color: 'var(--primary)' }}>در حال بارگذاری...</span>
                            </div>
                        )}
                        {!hasNextPage && allData.length > 0 && (
                            <div className="py-5 text-center">
                                <span className="inline-block px-5 py-2.5 rounded-xl text-sm font-semibold"
                                      style={{ background: 'var(--surface-2)', color: 'var(--text-soft)' }}>
                                    ✓ همه تعمیرکاران بارگذاری شدند
                                </span>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </DashboardLayout>
    )
}