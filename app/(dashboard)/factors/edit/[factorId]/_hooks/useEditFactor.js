'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import Swal from '@/app/utils/swal'
import { ENV, getHeaders } from '@/app/config/env'


export function useEditFactor(factorId) {
    const router      = useRouter()
    const queryClient = useQueryClient()

    const [loading,           setLoading]           = useState(false)
    const [loadingData,       setLoadingData]       = useState(true)
    const [statements,        setStatements]        = useState([])
    const [loadingStatements, setLoadingStatements] = useState(false)
    const [formData,          setFormData]          = useState({ name: '', number: '', date: '', final_statement_id: '' })

    useEffect(() => {
        if (!factorId) return

        // fetch فاکتور
        fetch(`${ENV.API_FINAL_STATEMENTS_FACTORS}/${factorId}`, { headers: getHeaders() })
            .then(r => r.json())
            .then(r => {
                const f = r.data?.finalStatementFactor
                if (f) setFormData({ name: f.name || '', number: f.number || '', date: f.date || '', final_statement_id: f.final_statement_id || '' })
            })
            .catch(() => Swal.fire({ title: 'خطا!', text: 'خطا در دریافت اطلاعات', icon: 'error' }))
            .finally(() => setLoadingData(false))

        // fetch لیست صورت وضعیت‌ها
        setLoadingStatements(true)
        fetch(ENV.API_FINAL_STATEMENTS, { headers: getHeaders() })
            .then(r => r.json())
            .then(r => setStatements(r.data?.finalStatements?.data || []))
            .catch(console.error)
            .finally(() => setLoadingStatements(false))
    }, [factorId])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(p => ({ ...p, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const payload = {}
            if (formData.name)               payload.name               = formData.name
            if (formData.number)             payload.number             = parseInt(formData.number)
            if (formData.date)               payload.date               = formData.date
            if (formData.final_statement_id) payload.final_statement_id = parseInt(formData.final_statement_id)

            const res    = await fetch(`${ENV.API_FINAL_STATEMENTS_FACTORS}/${factorId}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(payload) })
            const result = await res.json()
            if (res.ok) {
                queryClient.invalidateQueries({ queryKey: ['factors'] })
                await Swal.fire({ title: 'موفق!', text: 'فاکتور ویرایش شد', icon: 'success', timer: 2000, showConfirmButton: false })
                router.push('/factors')
            } else {
                throw new Error(Array.isArray(result.message) ? result.message[0] : result.message || 'خطا')
            }
        } catch (err) {
            Swal.fire({ title: 'خطا!', text: err.message, icon: 'error' })
        } finally { setLoading(false) }
    }

    const statementOptions = statements.map(s => ({ value: s.id, label: `${s.title} (${s.number})` }))

    return { loading, loadingData, formData, handleChange, handleSubmit, statementOptions, loadingStatements, setFormData }
}