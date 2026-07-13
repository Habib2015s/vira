'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUsers, faSave, faArrowLeft, faSpinner, faUser, faBuilding } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import DashboardLayout from "@/app/dashboard/Dashboardlayout"
import Swal from 'sweetalert2'
import { ENV, getHeaders } from '@/app/config/env'

const BASE    = ENV.API_WAREHOUSE_CUSTOMERS

const ErrorMsg = ({ error }) => error
    ? <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="text-xs mt-1.5 font-medium" style={{ color: 'var(--danger)' }}>{error}</motion.p>
    : null

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

export default function CustomerEditPage() {
    const router      = useRouter()
    const { id }      = useParams()
    const queryClient = useQueryClient()

    const [fetching,  setFetching]  = useState(true)
    const [savedData, setSavedData] = useState(null)
    const [form,      setForm]      = useState({
        name: '', family: '', type: 'person',
        national_code: '', phone: '', zip_code: '', address: ''
    })
    const [errors, setErrors] = useState({})

    useEffect(() => {
        fetch(`${BASE}/${id}`, { headers: getHeaders() })
            .then(r => r.json())
            .then(res => {
                const c = res.data?.customer
                if (c) {
                    setSavedData(c)
                    setForm({
                        name:          c.name          ?? '',
                        family:        c.family        ?? '',
                        type:          c.type          ?? 'person',
                        national_code: c.national_code ?? '',
                        phone:         c.phone         ?? '',
                        zip_code:      c.zip_code      ?? '',
                        address:       c.address       ?? '',
                    })
                }
            })
            .catch(() => Swal.fire({ icon: 'error', title: 'خطا', text: 'دریافت اطلاعات ناموفق بود' }))
            .finally(() => setFetching(false))
    }, [id])

    const mutation = useMutation({
        mutationFn: (body) =>
            fetch(`${BASE}/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(body) }).then(r => r.json()),
        onSuccess: (res) => {
            if (res.data?.customer) {
                setSavedData(res.data.customer)
                queryClient.invalidateQueries({ queryKey: ['warehouseCustomers'] })
                Swal.fire({ title: 'ویرایش شد!', icon: 'success', timer: 2000, showConfirmButton: false })
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
        if (!form.name.trim())           err.name = 'نام الزامی است'
        if (form.name.trim().length < 2) err.name = 'حداقل ۲ کاراکتر'
        if (form.family && form.family.trim().length < 2) err.family = 'حداقل ۲ کاراکتر'
        if (form.national_code && (form.national_code.length < 10 || form.national_code.length > 20))
            err.national_code = 'بین ۱۰ تا ۲۰ کاراکتر'
        if (Object.keys(err).length) return setErrors(err)

        const body = {}
        Object.entries(form).forEach(([k, v]) => { if (v !== '') body[k] = v })
        mutation.mutate(body)
    }

    const isCompany     = form.type === 'company'
    const changedFields = savedData
        ? Object.keys(form).filter(k => form[k] !== (savedData[k] ?? ''))
        : []

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
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                 style={{ background: 'rgba(255,255,255,0.2)' }}>
                                <FontAwesomeIcon icon={faUsers} className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-white leading-none">ویرایش مشتری</h1>
                                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
                                    {savedData?.name} {savedData?.family || ''} — #{id}
                                </p>
                            </div>
                        </div>
                        <button onClick={() => router.back()} className="btn btn-back btn-sm">
                            <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" />بازگشت
                        </button>
                    </div>
                </div>

                <div className="page-content max-w-4xl">

                    {/* نوار تغییرات */}
                    <AnimatePresence>
                        {changedFields.length > 0 && (
                            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                                        className="alert alert-warning flex items-center justify-between mb-5">
                                <span className="font-bold">{changedFields.length} فیلد تغییر کرده</span>
                                <div className="flex gap-1.5 flex-wrap">
                                    {changedFields.slice(0, 4).map(k => (
                                        <span key={k} className="badge badge-warning text-xs">{k}</span>
                                    ))}
                                    {changedFields.length > 4 && (
                                        <span className="badge badge-muted text-xs">+{changedFields.length - 4}</span>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                        {/* فرم */}
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                                    className="lg:col-span-2 card">
                            <div className="card-header">
                                <p className="card-title">ویرایش اطلاعات</p>
                                <span className="badge badge-primary">#{id}</span>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleSubmit}>

                                    {/* toggle نوع */}
                                    <div className="mb-6 p-1 rounded-xl flex gap-1"
                                         style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                                        {[
                                            { val: 'person',  label: 'شخص حقیقی', icon: faUser     },
                                            { val: 'company', label: 'شخص حقوقی', icon: faBuilding },
                                        ].map(({ val, label, icon }) => (
                                            <button key={val} type="button" onClick={() => set('type', val)}
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

                                    <Section title="اطلاعات اصلی">
                                        {[
                                            { key: 'name',          label: `${isCompany ? 'نام شرکت' : 'نام'} *`,    placeholder: '', req: true },
                                            { key: 'family',        label: isCompany ? 'نام مدیر' : 'نام خانوادگی', placeholder: '' },
                                            { key: 'national_code', label: isCompany ? 'شناسه ملی' : 'کد ملی',       placeholder: '', mono: true },
                                            { key: 'phone',         label: 'تلفن',                                    placeholder: '', mono: true },
                                        ].map(({ key, label, placeholder, mono }) => (
                                            <div key={key}>
                                                <label className="form-label">{label}</label>
                                                <div className="relative">
                                                    <input value={form[key]} onChange={e => set(key, e.target.value)}
                                                           placeholder={placeholder}
                                                           className={`form-input ${mono ? 'font-mono' : ''} ${errors[key] ? 'error' : ''} ${savedData && form[key] !== (savedData[key] ?? '') ? '' : ''}`}
                                                           style={savedData && form[key] !== (savedData[key] ?? '') ? { borderColor: 'var(--warning)' } : {}} />
                                                    {savedData && form[key] !== (savedData[key] ?? '') && (
                                                        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
                                                             style={{ background: 'var(--warning)' }} />
                                                    )}
                                                </div>
                                                {savedData && form[key] !== (savedData[key] ?? '') && (
                                                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                                                        قبلاً: <span className="line-through">{savedData[key] || '—'}</span>
                                                    </p>
                                                )}
                                                <ErrorMsg error={errors[key]} />
                                            </div>
                                        ))}
                                    </Section>

                                    <Section title="آدرس" colorVar="var(--info)">
                                        <div>
                                            <label className="form-label">کد پستی</label>
                                            <input value={form.zip_code} onChange={e => set('zip_code', e.target.value)}
                                                   className="form-input font-mono"
                                                   style={savedData && form.zip_code !== (savedData.zip_code ?? '') ? { borderColor: 'var(--warning)' } : {}} />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="form-label">آدرس کامل</label>
                                            <textarea value={form.address} onChange={e => set('address', e.target.value)}
                                                      rows={2} className="form-textarea"
                                                      style={savedData && form.address !== (savedData.address ?? '') ? { borderColor: 'var(--warning)' } : {}} />
                                        </div>
                                    </Section>

                                    <div className="flex justify-end gap-3 pt-3"
                                         style={{ borderTop: '1px solid var(--border)' }}>
                                        <Link href="/warehouse/customers">
                                            <button type="button" className="btn btn-ghost">انصراف</button>
                                        </Link>
                                        <button type="submit" disabled={mutation.isPending} className="btn btn-primary">
                                            {mutation.isPending
                                                ? <><FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />در حال ذخیره...</>
                                                : <><FontAwesomeIcon icon={faSave} className="w-4 h-4" />ذخیره تغییرات</>
                                            }
                                        </button>
                                    </div>
                                </form>
                            </div>
                            {savedData && (
                                <div className="card-footer flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                                    <span>ایجاد: {new Date(savedData.created_at).toLocaleDateString('fa-IR')}</span>
                                    <span>ویرایش: {new Date(savedData.updated_at).toLocaleDateString('fa-IR')}</span>
                                </div>
                            )}
                        </motion.div>

                        {/* پنل راست — اطلاعات جاری */}
                        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.06 }} className="card">
                            <div className="card-header">
                                <p className="card-title text-sm">اطلاعات جاری</p>
                            </div>
                            {savedData && (
                                <div className="card-body p-0">
                                    {/* آواتار */}
                                    <div className="p-4 flex items-center gap-3"
                                         style={{ borderBottom: '1px solid var(--border)' }}>
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                                             style={{
                                                 background: savedData.type === 'company' ? 'var(--info-light)' : `hsl(${(savedData.id * 53) % 360}, 65%, 90%)`,
                                                 color:      savedData.type === 'company' ? 'var(--info)' : `hsl(${(savedData.id * 53) % 360}, 55%, 38%)`,
                                             }}>
                                            <FontAwesomeIcon icon={savedData.type === 'company' ? faBuilding : faUser} className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-black text-sm" style={{ color: 'var(--text)' }}>
                                                {savedData.name} {savedData.family || ''}
                                            </p>
                                            <span className={`badge text-xs ${savedData.type === 'company' ? 'badge-info' : 'badge-success'}`}>
                                                {savedData.type === 'company' ? 'حقوقی' : 'حقیقی'}
                                            </span>
                                        </div>
                                    </div>
                                    {[
                                        { label: 'کد ملی',    value: savedData.national_code },
                                        { label: 'تلفن',      value: savedData.phone         },
                                        { label: 'کد پستی',   value: savedData.zip_code      },
                                        { label: 'آدرس',      value: savedData.address       },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="px-4 py-2.5 flex items-start justify-between gap-2"
                                             style={{ borderBottom: '1px solid var(--border)' }}>
                                            <span className="text-xs text-right" style={{ color: 'var(--text-muted)' }}>{label}</span>
                                            <span className="text-xs font-bold text-left" style={{ color: 'var(--text)' }}>{value || '—'}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}