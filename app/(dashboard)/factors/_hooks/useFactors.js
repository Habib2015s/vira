'use client'

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import Swal from '@/app/utils/swal'
import { ENV, getHeaders } from '@/app/config/env'

const BASE = ENV.API_WAREHOUSE_FACTORS

const fetchFactors = async ({ pageParam = null }) => {
    const url = pageParam ? `${BASE}?cursor=${pageParam}` : BASE
    const res = await fetch(url, { headers: getHeaders() })
    if (!res.ok) throw new Error('خطا در دریافت فاکتورها')
    return (await res.json()).data.factors
}

export function useFactors() {
    const queryClient    = useQueryClient()
    const observerTarget = useRef(null)

    const query = useInfiniteQuery({
        queryKey: ['warehouseFactors'],
        queryFn:  fetchFactors,
        initialPageParam: null,
        getNextPageParam: (p) => p?.next_cursor ?? undefined,
        staleTime: 3 * 60 * 1000,
    })

    const { fetchNextPage, hasNextPage, isFetchingNextPage } = query

    useEffect(() => {
        const observer = new IntersectionObserver(
            e => { if (e[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage() },
            { threshold: 0.5 }
        )
        if (observerTarget.current) observer.observe(observerTarget.current)
        return () => { if (observerTarget.current) observer.unobserve(observerTarget.current) }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage])

    const confirmMutation = useMutation({
        mutationFn: (id) => fetch(`${BASE}/${id}/confirm`, { method: 'POST', headers: getHeaders() }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouseFactors'] })
            Swal.fire({ title: 'تأیید شد!', icon: 'success', timer: 2000, showConfirmButton: false })
        },
        onError: () => Swal.fire('خطا!', 'عملیات انجام نشد', 'error'),
    })

    const cancelMutation = useMutation({
        mutationFn: (id) => fetch(`${BASE}/${id}/cancel`, { method: 'POST', headers: getHeaders() }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouseFactors'] })
            Swal.fire({ title: 'لغو شد!', icon: 'warning', timer: 2000, showConfirmButton: false })
        },
        onError: () => Swal.fire('خطا!', 'عملیات انجام نشد', 'error'),
    })

    const handleConfirm = (row) =>
        Swal.fire({
            title: 'تأیید فاکتور',
            html: `فاکتور شماره <strong>${row.factor_number}</strong> تأیید شود؟`,
            icon: 'question', showCancelButton: true,
            confirmButtonColor: 'var(--success)', cancelButtonText: 'انصراف', confirmButtonText: 'بله، تأیید شود',
        }).then(r => { if (r.isConfirmed) confirmMutation.mutate(row.id) })

    const handleCancel = (row) =>
        Swal.fire({
            title: 'لغو فاکتور',
            html: `فاکتور شماره <strong>${row.factor_number}</strong> لغو شود؟`,
            icon: 'warning', showCancelButton: true,
            confirmButtonColor: 'var(--danger)', cancelButtonText: 'انصراف', confirmButtonText: 'بله، لغو شود',
        }).then(r => { if (r.isConfirmed) cancelMutation.mutate(row.id) })

    const allData = query.data?.pages.flatMap(p => p.data) ?? []

    return {
        ...query,
        allData,
        observerTarget,
        handleConfirm,
        handleCancel,
        confirmPending: confirmMutation.isPending,
        cancelPending:  cancelMutation.isPending,
    }
}