'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWarehouse, faSave, faArrowLeft, faSpinner, faHashtag, faTag, faPhone, faLocationDot } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import Swal from '@/app/utils/swal'
import { ENV, getHeaders } from '@/app/config/env'

const BASE    = ENV.API_WAREHOUSE_STOREHOUSES

// ── فیلد با آیکون ──────────────────────────────────
const FormField = ({ icon, iconColor, iconBg, label, required, children, error }) => (
    <div>
        <label className="form-label flex items-center gap-1.5">
            <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: iconBg }}>
                <FontAwesomeIcon icon={icon} className="w-2.5 h-2.5" style={{ color: iconColor }} />
            </div>
            {required && <span style={{ color: 'var(--danger)' }}>*</span>}
            {label}
        </label>
        {children}
        {error && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                      className="text-xs mt-1.5 font-medium" style={{ color: 'var(--danger)' }}>
                {error}
            </motion.p>
        )}
    </div>
)

export default function StorehouseCreatePage() {
    const router      = useRouter()
    const queryClient = useQueryClient()
    const [form,   setForm]   = useState({ code: '', name: '', address: '', phone: '' })
    const [errors, setErrors] = useState({})

    const mutation = useMutation({
        mutationFn: (body) =>
            fetch(BASE, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(r => r.json()),
        onSuccess: (res) => {
            if (res.data?.storehouse) {
                queryClient.invalidateQueries({ queryKey: ['warehouseStorehouses'] })
                Swal.fire({ title: 'ثبت شد!', icon: 'success', timer: 2000, showConfirmButton: false })
                router.push('/warehouse/storehouses')
            } else {
                const errMap = {}
                if (res.errors) Object.entries(res.errors).forEach(([k, v]) => { errMap[k] = Array.isArray(v) ? v[0] : v })
                setErrors(errMap)
            }
        },
        onError: () => Swal.fire('خطا!', 'مشکل در اتصال به سرور', 'error'),
    })

    const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: null })) }

    const handleSubmit = (e) => {
        e.preventDefault()
        const err = {}
        if (!form.code.trim())    err.code    = 'کد الزامی است'
        if (!form.name.trim())    err.name    = 'نام الزامی است'
        if (!form.address.trim()) err.address = 'آدرس الزامی است'
        if (!form.phone.trim())   err.phone   = 'تلفن الزامی است'
        if (Object.keys(err).length) return setErrors(err)
        mutation.mutate(form)
    }

    const fields = [
        { key: 'code',    label: 'کد انبار',   icon: faHashtag,     iconColor: 'var(--primary)', iconBg: 'var(--primary-light)',  placeholder: 'مثال: WH-001',          required: true },
        { key: 'name',    label: 'نام انبار',  icon: faTag,         iconColor: 'var(--info)',    iconBg: 'var(--info-light)',     placeholder: 'مثال: انبار مرکزی',     required: true },
        { key: 'phone',   label: 'تلفن',       icon: faPhone,       iconColor: 'var(--success)', iconBg: 'var(--success-light)', placeholder: 'مثال: ۰۲۱-۱۲۳۴۵۶۷۸', required: true },
        { key: 'address', label: 'آدرس',       icon: faLocationDot, iconColor: 'var(--danger)',  iconBg: 'var(--danger-light)',   placeholder: 'آدرس کامل انبار',       required: true },
    ]

    return (
            <div className="w-full min-h-screen" style={{ background: 'var(--bg)' }}>

                <div className="page-header-bar">
                    <div className="max-w-2xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                 style={{ background: 'rgba(255,255,255,0.2)' }}>
                                <FontAwesomeIcon icon={faWarehouse} className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-white leading-none">افزودن انبار جدید</h1>
                                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>ثبت اطلاعات انبار</p>
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
                            <p className="card-title">اطلاعات انبار</p>
                            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                                همه فیلدها الزامی هستند
                            </span>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="grid grid-cols-2 gap-4 mb-5">
                                    {fields.map(f => (
                                        <FormField key={f.key} icon={f.icon} iconColor={f.iconColor} iconBg={f.iconBg}
                                                   label={f.label} required={f.required} error={errors[f.key]}>
                                            <input
                                                value={form[f.key]}
                                                onChange={e => set(f.key, e.target.value)}
                                                placeholder={f.placeholder}
                                                className={`form-input ${errors[f.key] ? 'error' : ''}`}
                                            />
                                        </FormField>
                                    ))}
                                </div>

                                {/* ⭐ پیش‌نمایش کارت انبار */}
                                {(form.name || form.code) && (
                                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                                className="mb-5 p-4 rounded-xl"
                                                style={{ background: 'var(--primary-subtle)', border: '1.5px dashed var(--primary-light)' }}>
                                        <p className="text-xs font-bold mb-2" style={{ color: 'var(--primary)' }}>
                                            👁 پیش‌نمایش
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                                 style={{ background: 'var(--primary-light)' }}>
                                                <FontAwesomeIcon icon={faWarehouse} className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                                            </div>
                                            <div>
                                                <p className="font-black text-sm" style={{ color: 'var(--text)' }}>
                                                    {form.name || 'نام انبار'}
                                                </p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="badge badge-primary text-xs">{form.code || 'کد'}</span>
                                                    {form.phone && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{form.phone}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        {form.address && (
                                            <p className="text-xs mt-2 flex items-center gap-1" style={{ color: 'var(--text-soft)' }}>
                                                <FontAwesomeIcon icon={faLocationDot} className="w-3 h-3" style={{ color: 'var(--danger)' }} />
                                                {form.address}
                                            </p>
                                        )}
                                    </motion.div>
                                )}

                                <div className="flex justify-end gap-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                                    <Link href="/warehouse/storehouses">
                                        <button type="button" className="btn btn-ghost">انصراف</button>
                                    </Link>
                                    <button type="submit" disabled={mutation.isPending} className="btn btn-success">
                                        {mutation.isPending
                                            ? <><FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />در حال ثبت...</>
                                            : <><FontAwesomeIcon icon={faSave} className="w-4 h-4" />ثبت انبار</>
                                        }
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </div>
    )
}