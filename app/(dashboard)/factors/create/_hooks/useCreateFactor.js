'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import Swal from 'sweetalert2'
import { ENV, getHeaders } from '@/app/config/env'


export function useCreateFactor() {
    const router      = useRouter()
    const queryClient = useQueryClient()

    const [loading,           setLoading]           = useState(false)
    const [statements,        setStatements]        = useState([])
    const [loadingStatements, setLoadingStatements] = useState(false)
    const [selectedDate,      setSelectedDate]      = useState(null)
    const [formData,          setFormData]          = useState({ name: '', number: '', final_statement_id: '' })

    useEffect(() => {
        setLoadingStatements(true)
        fetch(ENV.API_FINAL_STATEMENTS, { headers: getHeaders() })
            .then(r => r.json())
            .then(r => setStatements(r.data?.finalStatements?.data || []))
            .catch(console.error)
            .finally(() => setLoadingStatements(false))
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(p => ({ ...p, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.name) {
            Swal.fire({ title: 'خطا!', text: 'نام فاکتور الزامی است', icon: 'error' })
            return
        }
        setLoading(true)
        try {
            const payload = { name: formData.name }
            if (formData.number)             payload.number             = parseInt(formData.number)
            if (selectedDate)                payload.date               = selectedDate.isoDateTime
            if (formData.final_statement_id) payload.final_statement_id = parseInt(formData.final_statement_id)

            const res    = await fetch(ENV.API_FINAL_STATEMENTS_FACTORS, { method: 'POST', headers: getHeaders(), body: JSON.stringify(payload) })
            const result = await res.json()
            if (res.ok) {
                queryClient.invalidateQueries({ queryKey: ['factors'] })
                await Swal.fire({ title: 'موفق!', text: 'فاکتور ایجاد شد', icon: 'success', timer: 2000, showConfirmButton: false })
                router.push('/factors')
            } else {
                throw new Error(Array.isArray(result.message) ? result.message[0] : result.message || 'خطا')
            }
        } catch (err) {
            Swal.fire({ title: 'خطا!', text: err.message, icon: 'error' })
        } finally { setLoading(false) }
    }

    const statementOptions = statements.map(s => ({ value: s.id, label: `${s.title} (${s.number})` }))

    return { loading, formData, handleChange, handleSubmit, selectedDate, setSelectedDate, statementOptions, loadingStatements }
}