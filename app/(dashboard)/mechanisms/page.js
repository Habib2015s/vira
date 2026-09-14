'use client'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faTrash, faSpinner, faPlus, faTruck, faEye } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import Swal from 'sweetalert2'
import DataTable from '@/app/components/DataTable/DataTable'
import PageCrumb from '@/app/components/PageHeader/PageCrumb'
import { ENV, getHeaders } from '@/app/config/env'

const BASE = ENV.API_MECHANISMS

const MECH_TYPE = { passenger: 'سواری', pickup: 'وانت', tractor: 'تراکتور', cargo: 'باری', light_truck: 'کامیونت', industrial: 'صنعتی' }
const OWN_TYPE  = { property: 'ملکی', rental: 'اجاره‌ای', rent_to_own: 'اجاره به شرط تملیک' }

const fetchMechanisms = async ({ pageParam = null }) => {
    const url = pageParam ? `${BASE}?cursor=${pageParam}` : BASE
    const res = await fetch(url, { headers: getHeaders() })
    if (!res.ok) throw new Error('خطا')
    return (await res.json()).data.mechanisms
}

export default function MechanismsPage() {
    const observerTarget = useRef(null)
    const queryClient    = useQueryClient()

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
        queryKey: ['mechanisms'], queryFn: fetchMechanisms,
        initialPageParam: null, getNextPageParam: (p) => p?.next_cursor ?? undefined, staleTime: 5 * 60 * 1000,
    })

    const deleteMutation = useMutation({
        mutationFn: (id) => fetch(`${BASE}/${id}`, { method: 'DELETE', headers: getHeaders() }).then(r => r.json()),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['mechanisms'] }); Swal.fire({ title: 'حذف شد!', icon: 'success', timer: 2000, showConfirmButton: false }) },
        onError: () => Swal.fire('خطا!', 'حذف انجام نشد', 'error'),
    })

    useEffect(() => {
        const obs = new IntersectionObserver(e => { if (e[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage() }, { threshold: 0.5 })
        if (observerTarget.current) obs.observe(observerTarget.current)
        return () => { if (observerTarget.current) obs.unobserve(observerTarget.current) }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage])

    const handleDelete = (row) => Swal.fire({
        title: 'حذف مکانیزم', html: `مکانیزم <strong>${row.code}</strong> حذف شود؟`,
        icon: 'warning', showCancelButton: true, confirmButtonColor: 'var(--danger)',
        confirmButtonText: 'بله، حذف شود', cancelButtonText: 'انصراف'
    }).then(r => { if (r.isConfirmed) deleteMutation.mutate(row.id) })

    const allData = data?.pages.flatMap(p => p.data) ?? []

    const columns = [
        { key: 'code', label: 'کد', render: (row) => <span className="font-mono font-bold" style={{ color: 'var(--primary)' }}>{row.code}</span> },
        {
            key: 'mechanism_type', label: 'نوع',
            filter: { type: 'select', placeholder: 'نوع...', options: () => Object.entries(MECH_TYPE).map(([v,l]) => ({ value: v, label: l })) },
            render: (row) => <span className="badge badge-info">{MECH_TYPE[row.mechanism_type] ?? row.mechanism_type}</span>
        },
        {
            key: 'plate', label: 'پلاک',
            render: (row) => <span className="font-mono text-sm" style={{ color: 'var(--text-soft)' }}>{row.first_part_plate}{row.second_part_plate}{row.third_part_plate}</span>
        },
        { key: 'mechanism_group_code', label: 'کد گروه', render: (row) => <span className="badge badge-muted">{row.mechanism_group_code}</span> },
        {
            key: 'is_active', label: 'وضعیت',
            filter: { type: 'select', placeholder: 'وضعیت...', options: () => [{ value: 'yes', label: 'فعال' }, { value: 'no', label: 'غیرفعال' }] },
            render: (row) => <span className={`badge ${row.is_active === 'yes' ? 'badge-success' : 'badge-danger'}`}>{row.is_active === 'yes' ? 'فعال' : 'غیرفعال'}</span>
        },
        {
            key: 'ownership_type', label: 'مالکیت',
            filter: { type: 'select', placeholder: 'مالکیت...', options: () => Object.entries(OWN_TYPE).map(([v,l]) => ({ value: v, label: l })) },
            render: (row) => <span className="badge badge-primary">{OWN_TYPE[row.ownership_type] ?? row.ownership_type}</span>
        },
        {
            key: 'actions', label: 'عملیات',
            render: (row) => (
                <div className="flex items-center justify-center gap-1.5">
                    <Link href={`/mechanisms/${row.id}`}><button className="action-btn action-btn-view"><FontAwesomeIcon icon={faEye} className="w-3.5 h-3.5" /></button></Link>
                    <Link href={`/mechanisms/edit/${row.id}`}><button className="action-btn action-btn-edit"><FontAwesomeIcon icon={faPen} className="w-3.5 h-3.5" /></button></Link>
                    <button className="action-btn action-btn-delete" onClick={() => handleDelete(row)} disabled={deleteMutation.isPending}>
                        <FontAwesomeIcon icon={deleteMutation.isPending ? faSpinner : faTrash} className={`w-3.5 h-3.5 ${deleteMutation.isPending ? 'animate-spin' : ''}`} />
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
                            icon={faTruck}
                            root="حمل و نقل"
                            current="مکانیزم‌ها"
                        />
                        <Link href="/mechanisms/create">
                            <button className="btn btn-primary">
                                <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
                                مکانیزم جدید
                            </button>
                        </Link>
                    </div>
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                        <DataTable data={allData} columns={columns} loading={isLoading && allData.length === 0} emptyMessage="هیچ مکانیزمی یافت نشد" disablePagination={true} />
                        {hasNextPage && <div ref={observerTarget} className="py-8 flex items-center justify-center gap-3"><FontAwesomeIcon icon={faSpinner} className="w-5 h-5 animate-spin" style={{ color: 'var(--primary)' }} /></div>}
                        {!hasNextPage && allData.length > 0 && <div className="py-5 text-center"><span className="inline-block px-5 py-2 rounded-xl text-sm font-semibold" style={{ background: 'var(--surface-2)', color: 'var(--text-soft)' }}>✓ همه مکانیزم‌ها بارگذاری شدند</span></div>}
                    </motion.div>
                </div>
            </div>
    )
}