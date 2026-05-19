// app/finalstatements/_hooks/useFinalStatements.js
'use client'

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import Swal from 'sweetalert2'
import { ENV } from '@/app/config/env'

const HEADERS = { 'Content-Type': 'application/json', 'Accept': 'application/json' }

const fetchAll = async ({ pageParam = null }) => {
    const url = pageParam ? `${ENV.API_FINAL_STATEMENTS}?cursor=${pageParam}` : ENV.API_FINAL_STATEMENTS
    const res = await fetch(url, { headers: HEADERS })
    if (!res.ok) throw new Error('خطا در دریافت لیست')
    return (await res.json()).data.finalStatements
}

export function useFinalStatements() {
    const queryClient    = useQueryClient()
    const observerTarget = useRef(null)

    const query = useInfiniteQuery({
        queryKey: ['finalStatements'],
        queryFn:  fetchAll,
        initialPageParam: null,
        getNextPageParam: (p) => p?.next_cursor ?? undefined,
        staleTime: 5 * 60 * 1000,
        gcTime:    10 * 60 * 1000,
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

    const deleteMutation = useMutation({
        mutationFn: (id) => fetch(`${ENV.API_FINAL_STATEMENTS}/${id}`, { method: 'DELETE', headers: HEADERS }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['finalStatements'] })
            Swal.fire({ title: 'حذف شد!', icon: 'success', timer: 2000, showConfirmButton: false })
        },
        onError: () => Swal.fire('خطا!', 'حذف ناموفق بود', 'error'),
    })

    const handleDelete = (row) =>
        Swal.fire({
            title: 'حذف صورت وضعیت',
            html: `آیا از حذف <strong>${row.title}</strong> مطمئن هستید؟`,
            icon: 'warning', showCancelButton: true,
            confirmButtonColor: '#dc2626', cancelButtonColor: '#64748b',
            confirmButtonText: 'بله، حذف شود', cancelButtonText: 'انصراف',
        }).then(r => { if (r.isConfirmed) deleteMutation.mutate(row.id) })

    const allData = query.data?.pages.flatMap(p => p.data) ?? []

    return { ...query, allData, observerTarget, handleDelete, isDeleting: deleteMutation.isPending }
}