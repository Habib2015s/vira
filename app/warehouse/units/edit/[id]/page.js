'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRuler, faSave, faArrowLeft, faSpinner } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import DashboardLayout from "@/app/dashboard/Dashboardlayout"
import Swal from 'sweetalert2'
import { ENV, getHeaders } from '@/app/config/env'

const BASE    = ENV.API_WAREHOUSE_UNITS

export default function WarehouseUnitEditPage() {
    const router      = useRouter()
    const { id }      = useParams()
    const queryClient = useQueryClient()

    const [name,      setName]      = useState('')
    const [error,     setError]     = useState('')
    const [fetching,  setFetching]  = useState(true)
    const [savedData, setSavedData] = useState(null)

    // GET برای پر کردن فرم
    useEffect(() => {
        fetch(`${BASE}/${id}`, { headers: getHeaders() })
            .then(r => r.json())
            .then(res => {
                const u = res.data?.unit
                if (u) { setName(u.name); setSavedData(u) }
            })
            .catch(() => Swal.fire({ icon: 'error', title: 'خطا', text: 'دریافت اطلاعات ناموفق بود' }))
            .finally(() => setFetching(false))
    }, [id])

    // PUT /units/{id}
    const mutation = useMutation({
        mutationFn: (body) =>
            fetch(`${BASE}/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(body) }).then(r => r.json()),
        onSuccess: (res) => {
            if (res.data?.unit) {
                setSavedData(res.data.unit)   // آپدیت با response جدید
                queryClient.invalidateQueries({ queryKey: ['warehouseUnits'] })
                Swal.fire({ title: 'ویرایش شد!', icon: 'success', timer: 2000, showConfirmButton: false })
                router.push('/warehouse/units')
            } else {
                const err = res.errors?.name?.[0] || res.message || 'خطایی رخ داد'
                setError(err)
                Swal.fire({ icon: 'error', title: 'خطا', text: err })
            }
        },
        onError: () => Swal.fire('خطا!', 'مشکل در اتصال به سرور', 'error'),
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        setError('')
        if (!name.trim()) { setError('نام واحد الزامی است'); return }
        if (name.trim().length < 3) { setError('حداقل ۳ کاراکتر'); return }
        if (name.trim().length > 50) { setError('حداکثر ۵۰ کاراکتر'); return }
        mutation.mutate({ name: name.trim() })
    }

    if (fetching) return (
        <DashboardLayout>
            <div className="w-full min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card text-center p-12">
                    <FontAwesomeIcon icon={faSpinner} className="w-12 h-12 animate-spin mb-4" style={{ color: 'var(--primary)' }} />
                    <p className="font-bold" style={{ color: 'var(--text)' }}>در حال بارگذاری...</p>
                </motion.div>
            </div>
        </DashboardLayout>
    )

    return (
        <DashboardLayout>
            <div className="w-full min-h-screen" style={{ background: 'var(--bg)' }}>

                <div className="page-header-bar">
                    <div className="max-w-2xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                 style={{ background: 'rgba(255,255,255,0.2)' }}>
                                <FontAwesomeIcon icon={faRuler} className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-white leading-none">ویرایش واحد</h1>
                                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
                                    {savedData?.name || `واحد #${id}`}
                                </p>
                            </div>
                        </div>
                        <button onClick={() => router.back()} className="btn btn-back btn-sm">
                            <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" />
                            بازگشت
                        </button>
                    </div>
                </div>

                <div className="page-content max-w-2xl">
                    <div className="grid grid-cols-1 gap-5">

                        {/* فرم ویرایش */}
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card">
                            <div className="card-header">
                                <p className="card-title">ویرایش اطلاعات واحد</p>
                                <span className="badge badge-primary">#{id}</span>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-5">
                                        <label className="form-label">
                                            <span style={{ color: 'var(--danger)' }}>* </span>نام واحد
                                        </label>
                                        <input
                                            type="text" value={name} maxLength={50}
                                            onChange={e => { setName(e.target.value); setError('') }}
                                            placeholder="مثال: کیلوگرم، متر، عدد"
                                            className={`form-input ${error ? 'error' : ''}`}
                                            autoFocus
                                        />
                                        {error && (
                                            <p className="text-xs mt-1.5 font-medium" style={{ color: 'var(--danger)' }}>
                                                {error}
                                            </p>
                                        )}
                                        <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
                                            بین ۳ تا ۵۰ کاراکتر
                                        </p>
                                    </div>

                                    {/* نمایش مقدار ذخیره‌شده */}
                                    {savedData && name !== savedData.name && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                                    className="mb-4 p-3 rounded-lg"
                                                    style={{ background: 'var(--warning-light)', border: '1px solid var(--warning)' }}>
                                            <p className="text-xs font-semibold" style={{ color: 'var(--warning)' }}>
                                                مقدار قبلی: <span className="line-through">{savedData.name}</span>
                                            </p>
                                        </motion.div>
                                    )}

                                    <div className="flex justify-end gap-3 pt-3"
                                         style={{ borderTop: '1px solid var(--border)' }}>
                                        <Link href="/warehouse/units">
                                            <button type="button" className="btn btn-ghost">انصراف</button>
                                        </Link>
                                        <button type="submit" disabled={mutation.isPending} className="btn btn-success">
                                            {mutation.isPending
                                                ? <><FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />در حال ذخیره...</>
                                                : <><FontAwesomeIcon icon={faSave} className="w-4 h-4" />ذخیره تغییرات</>
                                            }
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* اطلاعات سرور */}
                            {savedData && (
                                <div className="card-footer">
                                    <div className="flex items-center gap-6 text-xs" style={{ color: 'var(--text-muted)' }}>
                                        <span>شناسه: #{savedData.id}</span>
                                        <span>ایجاد: {new Date(savedData.created_at).toLocaleDateString('fa-IR')}</span>
                                        <span>ویرایش: {new Date(savedData.updated_at).toLocaleDateString('fa-IR')}</span>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}