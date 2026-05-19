'use client'

import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { ENV } from '@/app/config/env'

const HEADERS = { 'Content-Type': 'application/json', 'Accept': 'application/json' }

export function useViewFinalStatement(id) {
    const [loading,   setLoading]   = useState(true)
    const [statement, setStatement] = useState(null)

    useEffect(() => {
        if (!id) return
        fetch(`${ENV.API_FINAL_STATEMENTS}/${id}`, { headers: HEADERS })
            .then(r => r.json())
            .then(r => setStatement(r.data?.finalStatement || null))
            .catch(() => Swal.fire({ title: 'خطا!', text: 'خطا در دریافت اطلاعات', icon: 'error' }))
            .finally(() => setLoading(false))
    }, [id])

    return { loading, statement }
}