'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUsers, faSave, faArrowLeft, faSpinner, faUser, faBuilding,
    faPhone, faLocationDot, faHashtag, faMailBulk } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import DashboardLayout from "@/app/dashboard/Dashboardlayout"
import Swal from 'sweetalert2'
import { ENV, getHeaders } from '@/app/config/env'

const BASE    = ENV.API_WAREHOUSE_CUSTOMERS

const ErrorMsg = ({ error }) => error
    ? <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="text-xs mt-1.5 font-medium" style={{ color: 'var(--danger)' }}>{error}</motion.p>
    : null

// ── Section با خط عنوان ─────────────────────────────
const Section = ({ title, colorVar = 'var(--primary)', children }) => (
    <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-5 rounded-full" style={{ background: colorVar }} />
            <p className="text-sm font-black" style={{ color: 'var(--text)' }}>{title}</p>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        </div>
        <div className="grid grid-cols-2 gap-4">{children}</div>
    </div>
)

export default function CustomerCreatePage() {
    const router      = useRouter()
    const queryClient = useQueryClient()
    const [form,   setForm]   = useState({
        name: '', family: '', type: 'person',
        national_code: '', phone: '', zip_code: '', address: ''
    })
    const [errors, setErrors] = useState({})

    const mutation = useMutation({
        mutationFn: (body) =>
            fetch(BASE, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(r => r.json()),
        onSuccess: (res) => {
            if (res.data?.customer) {
                queryClient.invalidateQueries({ queryKey: ['warehouseCustomers'] })
                Swal.fire({ title: 'ثبت شد!', icon: 'success', timer: 2000, showConfirmButton: false })
                router.push('/warehouse/customers')
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

    const handleSubmit = (e) => {
        e.preventDefault()
        const err = {}
        if (!form.name.trim())              err.name          = 'نام الزامی است'
        if (form.name.trim().length < 2)    err.name          = 'حداقل ۲ کاراکتر'
        if (form.family && form.family.trim().length < 2) err.family = 'حداقل ۲ کاراکتر'
        if (form.national_code && (form.national_code.length < 10 || form.national_code.length > 20))
            err.national_code = 'بین ۱۰ تا ۲۰ کاراکتر'
        if (Object.keys(err).length) return setErrors(err)

        // ارسال فقط فیلدهای غیر خالی
        const body = {}
        Object.entries(form).forEach(([k, v]) => { if (v !== '') body[k] = v })
        mutation.mutate(body)
    }

    const isCompany = form.type === 'company'

    return (
        <DashboardLayout>
            <div className="w-full min-h-screen" style={{ background: 'var(--bg)' }}>

                <div className="page-header-bar">
                    <div className="max-w-3xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                 style={{ background: 'rgba(255,255,255,0.2)' }}>
                                <FontAwesomeIcon icon={faUsers} className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-white leading-none">افزودن مشتری جدید</h1>
                                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>ثبت اطلاعات مشتری</p>
                            </div>
                        </div>
                        <button onClick={() => router.back()} className="btn btn-back btn-sm">
                            <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" />بازگشت
                        </button>
                    </div>
                </div>

                <div className="page-content max-w-3xl">
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card">
                        <div className="card-header">
                            <p className="card-title">اطلاعات مشتری</p>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>

                                {/* ── نوع مشتری — toggle ── */}
                                <div className="mb-6 p-1 rounded-xl flex gap-1"
                                     style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                                    {[
                                        { val: 'person',  label: 'شخص حقیقی', icon: faUser     },
                                        { val: 'company', label: 'شخص حقوقی', icon: faBuilding },
                                    ].map(({ val, label, icon }) => (
                                        <button key={val} type="button"
                                                onClick={() => set('type', val)}
                                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all"
                                                style={form.type === val
                                                    ? { background: val === 'company' ? 'var(--info)' : 'var(--success)', color: '#fff', boxShadow: 'var(--shadow-sm)' }
                                                    : { color: 'var(--text-muted)' }
                                                }>
                                            <FontAwesomeIcon icon={icon} className="w-4 h-4" />
                                            {label}
                                        </button>
                                    ))}
                                </div>

                                {/* اطلاعات اصلی */}
                                <Section title="اطلاعات اصلی">
                                    <div>
                                        <label className="form-label"><span style={{ color: 'var(--danger)' }}>* </span>
                                            {isCompany ? 'نام شرکت' : 'نام'}
                                        </label>
                                        <input value={form.name} onChange={e => set('name', e.target.value)} maxLength={50}
                                               placeholder={isCompany ? 'نام شرکت / سازمان' : 'نام'}
                                               className={`form-input ${errors.name ? 'error' : ''}`} autoFocus />
                                        <ErrorMsg error={errors.name} />
                                    </div>
                                    <div>
                                        <label className="form-label">{isCompany ? 'نام مدیر' : 'نام خانوادگی'}</label>
                                        <input value={form.family} onChange={e => set('family', e.target.value)} maxLength={30}
                                               placeholder={isCompany ? 'نام مدیرعامل' : 'نام خانوادگی'}
                                               className={`form-input ${errors.family ? 'error' : ''}`} />
                                        <ErrorMsg error={errors.family} />
                                    </div>
                                    <div>
                                        <label className="form-label">
                                            {isCompany ? 'شناسه ملی (۱۱ رقم)' : 'کد ملی (۱۰ رقم)'}
                                        </label>
                                        <input value={form.national_code} onChange={e => set('national_code', e.target.value)}
                                               maxLength={20} placeholder={isCompany ? '۱۱ رقم' : '۱۰ رقم'}
                                               className={`form-input font-mono ${errors.national_code ? 'error' : ''}`} />
                                        <ErrorMsg error={errors.national_code} />
                                    </div>
                                    <div>
                                        <label className="form-label">تلفن</label>
                                        <input value={form.phone} onChange={e => set('phone', e.target.value)}
                                               placeholder="مثال: ۰۹۱۲۱۲۳۴۵۶۷"
                                               className="form-input font-mono" />
                                    </div>
                                </Section>

                                {/* آدرس */}
                                <Section title="آدرس و مکان" colorVar="var(--info)">
                                    <div>
                                        <label className="form-label">کد پستی</label>
                                        <input value={form.zip_code} onChange={e => set('zip_code', e.target.value)}
                                               placeholder="کد پستی ۱۰ رقمی" className="form-input font-mono" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="form-label">آدرس کامل</label>
                                        <textarea value={form.address} onChange={e => set('address', e.target.value)}
                                                  rows={2} placeholder="استان، شهر، خیابان، پلاک"
                                                  className="form-textarea" />
                                    </div>
                                </Section>

                                {/* پیش‌نمایش */}
                                <AnimatePresence>
                                    {form.name && (
                                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                                    className="mb-5 p-4 rounded-xl flex items-center gap-3"
                                                    style={{ background: 'var(--primary-subtle)', border: '1.5px dashed var(--primary-light)' }}>
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                                 style={{ background: isCompany ? 'var(--info-light)' : 'var(--success-light)' }}>
                                                <FontAwesomeIcon icon={isCompany ? faBuilding : faUser} className="w-4 h-4"
                                                                 style={{ color: isCompany ? 'var(--info)' : 'var(--success)' }} />
                                            </div>
                                            <div>
                                                <p className="font-black text-sm" style={{ color: 'var(--text)' }}>
                                                    {form.name} {form.family}
                                                </p>
                                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                    <span className={`badge text-xs ${isCompany ? 'badge-info' : 'badge-success'}`}>
                                                        {isCompany ? 'حقوقی' : 'حقیقی'}
                                                    </span>
                                                    {form.phone && <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{form.phone}</span>}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="flex justify-end gap-3 pt-3"
                                     style={{ borderTop: '1px solid var(--border)' }}>
                                    <Link href="/warehouse/customers">
                                        <button type="button" className="btn btn-ghost">انصراف</button>
                                    </Link>
                                    <button type="submit" disabled={mutation.isPending} className="btn btn-success">
                                        {mutation.isPending
                                            ? <><FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />در حال ثبت...</>
                                            : <><FontAwesomeIcon icon={faSave} className="w-4 h-4" />ثبت مشتری</>
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