// app/finalstatements/edit/[id]/_hooks/useEditFinalStatement.js
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'
import moment from 'moment-jalaali'
import { ENV, getHeaders } from '@/app/config/env'


export function useEditFinalStatement(id) {
    const router = useRouter()

    const [loading,      setLoading]      = useState(false)
    const [loadingData,  setLoadingData]  = useState(true)
    const [shops,        setShops]        = useState([])
    const [loadingShops, setLoadingShops] = useState(false)
    const [selectedDate, setSelectedDate] = useState(null)
    const [formData,     setFormData]     = useState({ title: '', number: '', shop_id: '', shop_name: '', description: '' })

    useEffect(() => {
        if (!id) return

        // fetch صورت وضعیت
        fetch(`${ENV.API_FINAL_STATEMENTS}/${id}`, { headers: getHeaders() })
            .then(r => r.json())
            .then(r => {
                const s = r.data?.finalStatement
                if (!s) return
                if (s.date) {
                    const m = moment(s.date, 'YYYY-MM-DD')
                    setSelectedDate({
                        jDate: m.format('jYYYY/jM/jD'), isoDate: m.format('YYYY-MM-DD'),
                        isoDateTime: m.format('YYYY-MM-DDTHH:mm:ss'),
                        year: parseInt(m.format('jYYYY')), month: parseInt(m.format('jM')), day: parseInt(m.format('jD')),
                    })
                }
                setFormData({ title: s.title || '', number: s.number || '', shop_id: s.shop_id || '', shop_name: s.shop_name || '', description: s.description || '' })
            })
            .catch(() => Swal.fire({ title: 'خطا!', text: 'خطا در دریافت اطلاعات', icon: 'error' }))
            .finally(() => setLoadingData(false))

        // fetch شاپ‌ها
        setLoadingShops(true)
        fetch(ENV.API_SHOPS, { headers: getHeaders() })
            .then(r => r.json())
            .then(r => setShops(r.data?.shops?.data || []))
            .catch(console.error)
            .finally(() => setLoadingShops(false))
    }, [id])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(p => ({ ...p, [name]: value }))
    }

    const handleShopChange = (opt) =>
        setFormData(p => ({ ...p, shop_id: opt?.value || '', shop_name: opt?.name || '' }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const payload = {}
            if (formData.title)       payload.title       = formData.title
            if (formData.number)      payload.number      = parseInt(formData.number)
            if (selectedDate)         payload.date        = selectedDate.isoDateTime
            if (formData.shop_id)     payload.shop_id     = parseInt(formData.shop_id)
            if (formData.shop_name)   payload.shop_name   = formData.shop_name
            if (formData.description) payload.description = formData.description

            const res    = await fetch(`${ENV.API_FINAL_STATEMENTS}/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(payload) })
            const result = await res.json()
            if (res.ok) {
                await Swal.fire({ title: 'موفق!', text: 'صورت وضعیت ویرایش شد', icon: 'success', timer: 2000, showConfirmButton: false })
                router.push('/finalstatements')
            } else {
                throw new Error(result.message || 'خطا در ویرایش')
            }
        } catch (err) {
            Swal.fire({ title: 'خطا!', text: err.message, icon: 'error' })
        } finally { setLoading(false) }
    }

    const shopOptions = shops.map(s => ({ value: s.id, label: `${s.name} (${s.code})`, name: s.name }))

    return { loading, loadingData, formData, handleChange, handleShopChange, handleSubmit, selectedDate, setSelectedDate, shopOptions, loadingShops }
}