'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRuler, faSave, faArrowLeft, faSpinner } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import DashboardLayout from "@/app/dashboard/Dashboardlayout"
import Swal from 'sweetalert2'
import { ENV, getHeaders } from '@/app/config/env'

const BASE    = ENV.API_WAREHOUSE_UNITS

export default function WarehouseUnitCreatePage() {
    const router      = useRouter()
    const queryClient = useQueryClient()
    const [name,  setName]  = useState('')
    const [error, setError] = useState('')

    const mutation = useMutation({
        mutationFn: (body) =>
            fetch(BASE, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(r => r.json()),
        onSuccess: (res) => {
            if (res.data?.unit) {
                queryClient.invalidateQueries({ queryKey: ['warehouseUnits'] })
                Swal.fire({ title: 'ثبت شد!', icon: 'success', timer: 2000, showConfirmButton: false })
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
                                <h1 className="text-xl font-black text-white leading-none">افزودن واحد جدید</h1>
                                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>ثبت واحد اندازه‌گیری</p>
                            </div>
                        </div>
                        <button onClick={() => router.back()} className="btn btn-back btn-sm">
                            <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" />
                            بازگشت
                        </button>
                    </div>
                </div>

                <div className="page-content max-w-2xl">
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card">
                        <div className="card-header">
                            <p className="card-title">اطلاعات واحد</p>
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

                                <div className="flex justify-end gap-3 pt-3"
                                     style={{ borderTop: '1px solid var(--border)' }}>
                                    <Link href="/warehouse/units">
                                        <button type="button" className="btn btn-ghost">انصراف</button>
                                    </Link>
                                    <button type="submit" disabled={mutation.isPending} className="btn btn-success">
                                        {mutation.isPending
                                            ? <><FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />در حال ثبت...</>
                                            : <><FontAwesomeIcon icon={faSave} className="w-4 h-4" />ثبت واحد</>
                                        }
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </div>
        </DashboardLayout>
    )
}