// app/finalstatements/create/_hooks/useCreateFinalStatement.js
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Swal from '@/app/utils/swal'
import { ENV, getHeaders } from '@/app/config/env'


export function useCreateFinalStatement() {
    const router = useRouter()

    const [loading,      setLoading]      = useState(false)
    const [shops,        setShops]        = useState([])
    const [loadingShops, setLoadingShops] = useState(false)
    const [selectedDate, setSelectedDate] = useState(null)
    const [formData,     setFormData]     = useState({ title: '', number: '', shop_id: '', shop_name: '', description: '' })

    useEffect(() => {
        setLoadingShops(true)
        fetch(ENV.API_SHOPS, { headers: getHeaders() })
            .then(r => r.json())
            .then(r => setShops(r.data?.shops?.data || []))
            .catch(console.error)
            .finally(() => setLoadingShops(false))
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(p => ({ ...p, [name]: value }))
    }

    const handleShopChange = (opt) =>
        setFormData(p => ({ ...p, shop_id: opt?.value || '', shop_name: opt?.name || '' }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.title || !formData.number || !selectedDate || !formData.shop_id || !formData.description) {
            Swal.fire({ title: 'خطا!', text: 'لطفاً تمام فیلدهای ضروری را پر کنید', icon: 'error' })
            return
        }
        setLoading(true)
        try {
            let creatorId = 1
            if (typeof window !== 'undefined') {
                const userData = localStorage.getItem('user')
                if (userData) creatorId = JSON.parse(userData).id || 1
            }
            const payload = {
                title:       formData.title,
                number:      parseInt(formData.number),
                date:        selectedDate.isoDateTime,
                creator_id:  creatorId,
                shop_id:     parseInt(formData.shop_id),
                shop_name:   formData.shop_name,
                description: formData.description,
            }
            const res    = await fetch(ENV.API_FINAL_STATEMENTS, { method: 'POST', headers: getHeaders(), body: JSON.stringify(payload) })
            const result = await res.json()
            if (res.ok) {
                await Swal.fire({ title: 'موفق!', text: 'صورت وضعیت ایجاد شد', icon: 'success', timer: 2000, showConfirmButton: false })
                router.push('/finalstatements')
            } else {
                const msg = result.errors ? Object.values(result.errors).flat().join('\n') : result.message || 'خطا'
                throw new Error(msg)
            }
        } catch (err) {
            Swal.fire({ title: 'خطا!', text: err.message, icon: 'error' })
        } finally { setLoading(false) }
    }

    const shopOptions = shops.map(s => ({ value: s.id, label: `${s.name} (${s.code})`, name: s.name }))

    return { loading, formData, handleChange, handleShopChange, handleSubmit, selectedDate, setSelectedDate, shopOptions, loadingShops }
}