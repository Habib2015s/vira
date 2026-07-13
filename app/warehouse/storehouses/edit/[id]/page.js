'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWarehouse, faSave, faArrowLeft, faSpinner,
    faHashtag, faTag, faPhone, faLocationDot, faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import DashboardLayout from "@/app/dashboard/Dashboardlayout"
import Swal from 'sweetalert2'
import { ENV, getHeaders } from '@/app/config/env'

const BASE    = ENV.API_WAREHOUSE_STOREHOUSES

const fields = [
    { key: 'code',    label: 'کد انبار', icon: faHashtag,     iconColor: 'var(--primary)', iconBg: 'var(--primary-light)',  required: true },
    { key: 'name',    label: 'نام انبار', icon: faTag,         iconColor: 'var(--info)',    iconBg: 'var(--info-light)',     required: true },
    { key: 'phone',   label: 'تلفن',      icon: faPhone,       iconColor: 'var(--success)', iconBg: 'var(--success-light)', required: true },
    { key: 'address', label: 'آدرس',      icon: faLocationDot, iconColor: 'var(--danger)',  iconBg: 'var(--danger-light)',   required: true },
]

export default function StorehouseEditPage() {
    const router      = useRouter()
    const { id }      = useParams()
    const queryClient = useQueryClient()

    const [fetching,  setFetching]  = useState(true)
    const [original,  setOriginal]  = useState({})          // مقادیر اولیه سرور
    const [form,      setForm]      = useState({ code: '', name: '', address: '', phone: '' })
    const [errors,    setErrors]    = useState({})

    // ── GET ──────────────────────────────────────────
    useEffect(() => {
        fetch(`${BASE}/${id}`, { headers: getHeaders() })
            .then(r => r.json())
            .then(res => {
                const s = res.data?.storehouse
                if (s) {
                    const vals = { code: s.code ?? '', name: s.name ?? '', address: s.address ?? '', phone: s.phone ?? '' }
                    setOriginal(vals)
                    setForm(vals)
                }
            })
            .catch(() => Swal.fire({ icon: 'error', title: 'خطا', text: 'دریافت اطلاعات ناموفق بود' }))
            .finally(() => setFetching(false))
    }, [id])

    // ── PUT ──────────────────────────────────────────
    const mutation = useMutation({
        mutationFn: (body) =>
            fetch(`${BASE}/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(body) }).then(r => r.json()),
        onSuccess: (res) => {
            if (res.data?.storehouse) {
                queryClient.invalidateQueries({ queryKey: ['warehouseStorehouses'] })
                Swal.fire({ title: 'ذخیره شد!', icon: 'success', timer: 2000, showConfirmButton: false })
                router.push('/warehouse/storehouses')
            } else {
                const errMap = {}
                if (res.errors) Object.entries(res.errors).forEach(([k, v]) => { errMap[k] = Array.isArray(v) ? v[0] : v })
                setErrors(errMap)
                Swal.fire({ icon: 'error', title: 'خطا', text: Object.values(errMap)[0] || 'خطایی رخ داد' })
            }
        },
        onError: () => Swal.fire('خطا!', 'مشکل در اتصال به سرور', 'error'),
    })

    const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: null })) }

    // فیلدهایی که تغییر کردن
    const changed = fields.filter(f => form[f.key] !== original[f.key])

    const handleSubmit = (e) => {
        e.preventDefault()
        const err = {}
        if (!form.code.trim())    err.code    = 'کد الزامی است'
        if (!form.name.trim())    err.name    = 'نام الزامی است'
        if (!form.address.trim()) err.address = 'آدرس الزامی است'
        if (!form.phone.trim())   err.phone   = 'تلفن الزامی است'
        if (Object.keys(err).length) return setErrors(err)
        // فقط فیلدهای تغییر یافته
        const body = {}
        Object.keys(form).forEach(k => { if (form[k] !== '') body[k] = form[k] })
        mutation.mutate(body)
    }

    const handleReset = () => { setForm(original); setErrors({}) }

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

                {/* هدر */}
                <div className="page-header-bar">
                    <div className="max-w-2xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                 style={{ background: 'rgba(255,255,255,0.2)' }}>
                                <FontAwesomeIcon icon={faWarehouse} className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-white leading-none">ویرایش انبار</h1>
                                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
                                    {original.name} — کد: {original.code}
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

                    {/* نوار تغییرات */}
                    <AnimatePresence>
                        {changed.length > 0 && (
                            <motion.div initial={{ opacity: 0, y: -8, height: 0 }}
                                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                                        exit={{ opacity: 0, y: -8, height: 0 }}
                                        className="mb-4 overflow-hidden">
                                <div className="alert alert-warning flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <FontAwesomeIcon icon={faCircleInfo} className="w-4 h-4 flex-shrink-0" />
                                        <span className="font-bold text-sm">
                                            {changed.length} فیلد تغییر کرده
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        {changed.map(f => (
                                            <span key={f.key} className="badge badge-warning text-xs">{f.label}</span>
                                        ))}
                                        <button type="button" onClick={handleReset}
                                                className="text-xs font-bold underline mr-1"
                                                style={{ color: 'var(--warning)' }}>
                                            بازگردانی
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card">
                        <div className="card-header">
                            <p className="card-title">ویرایش اطلاعات انبار</p>
                            <span className="badge badge-primary">#{id}</span>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="grid grid-cols-2 gap-4 mb-2">
                                    {fields.map(f => {
                                        const isChanged = form[f.key] !== original[f.key]
                                        return (
                                            <div key={f.key}>
                                                {/* label با آیکون */}
                                                <label className="form-label flex items-center gap-1.5">
                                                    <div className="w-5 h-5 rounded flex items-center justify-center"
                                                         style={{ background: f.iconBg }}>
                                                        <FontAwesomeIcon icon={f.icon} className="w-2.5 h-2.5"
                                                                         style={{ color: f.iconColor }} />
                                                    </div>
                                                    {f.required && <span style={{ color: 'var(--danger)' }}>*</span>}
                                                    {f.label}
                                                </label>

                                                {/* input با نشانگر تغییر */}
                                                <div className="relative">
                                                    <input
                                                        value={form[f.key]}
                                                        onChange={e => set(f.key, e.target.value)}
                                                        className={`form-input ${errors[f.key] ? 'error' : ''}`}
                                                        style={isChanged ? { borderColor: 'var(--warning)', paddingLeft: '28px' } : {}}
                                                    />
                                                    {/* نقطه نارنجی نشانگر تغییر */}
                                                    {isChanged && (
                                                        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                                                             style={{ background: 'var(--warning)' }} />
                                                    )}
                                                </div>

                                                {/* مقدار قبلی */}
                                                <AnimatePresence>
                                                    {isChanged && (
                                                        <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                                                  exit={{ opacity: 0, height: 0 }}
                                                                  className="text-xs mt-1 overflow-hidden"
                                                                  style={{ color: 'var(--text-muted)' }}>
                                                            قبلاً:&nbsp;
                                                            <span className="line-through">{original[f.key] || '—'}</span>
                                                        </motion.p>
                                                    )}
                                                </AnimatePresence>

                                                {errors[f.key] && (
                                                    <p className="text-xs mt-1 font-medium" style={{ color: 'var(--danger)' }}>
                                                        {errors[f.key]}
                                                    </p>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>

                                <div className="flex justify-end gap-3 pt-4 mt-2"
                                     style={{ borderTop: '1px solid var(--border)' }}>
                                    <Link href="/warehouse/storehouses">
                                        <button type="button" className="btn btn-ghost">انصراف</button>
                                    </Link>
                                    <button type="submit"
                                            disabled={mutation.isPending || changed.length === 0}
                                            className="btn btn-primary">
                                        {mutation.isPending
                                            ? <><FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />در حال ذخیره...</>
                                            : <><FontAwesomeIcon icon={faSave} className="w-4 h-4" />ذخیره تغییرات</>
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