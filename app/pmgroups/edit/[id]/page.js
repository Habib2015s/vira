'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLayerGroup, faSpinner, faSave, faArrowLeft, faCode, faCog } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import DashboardLayout from "@/app/dashboard/Dashboardlayout"
import Swal from 'sweetalert2'
import { ENV, getHeaders } from '@/app/config/env'

const BASE    = ENV.API_PM_GROUPS

// ── InfoRow — نمایش داده‌های response ──
const InfoRow = ({ label, value }) => (
    <div className="flex items-center justify-between py-2 gap-3"
         style={{ borderBottom: '1px solid var(--border)' }}>
        <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{label}</span>
        <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>{value ?? '—'}</span>
    </div>
)

export default function PmGroupEditPage() {
    const router      = useRouter()
    const { id }      = useParams()
    const queryClient = useQueryClient()

    const [fetching,  setFetching]  = useState(true)
    const [errors,    setErrors]    = useState({})
    const [savedData, setSavedData] = useState(null) // آنچه از server برگشته

    // ── فرم — همه فیلدهای PUT/PATCH ──
    const [form, setForm] = useState({
        tm_code_id:           '',
        mechanism_group_code: '',
        description:          '',
        minutes:              '',
        km:                   '',
    })

    // ── GET برای پر کردن اولیه فرم ──
    useEffect(() => {
        fetch(`${BASE}/${id}`, { headers: getHeaders() })
            .then(r => r.json())
            .then(res => {
                const g = res.data?.pmGroup
                if (g) {
                    setForm({
                        tm_code_id:           g.tm_code_id           ?? '',
                        mechanism_group_code: g.mechanism_group_code ?? '',
                        description:          g.description          ?? '',
                        minutes:              g.minutes              ?? '',
                        km:                   g.km                   ?? '',
                    })
                    setSavedData(g)
                }
            })
            .catch(() => Swal.fire({ icon: 'error', title: 'خطا', text: 'دریافت اطلاعات ناموفق بود' }))
            .finally(() => setFetching(false))
    }, [id])

    // ── PUT /pmGroups/{id} ──
    const mutation = useMutation({
        mutationFn: (body) =>
            fetch(`${BASE}/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(body) })
                .then(r => r.json()),

        onSuccess: (res) => {
            if (res.data?.pmGroup) {
                // ⭐ آپدیت savedData با response جدید
                setSavedData(res.data.pmGroup)
                queryClient.invalidateQueries({ queryKey: ['pmGroups'] })
                Swal.fire({ title: 'ویرایش شد!', icon: 'success', timer: 2000, showConfirmButton: false })
                router.push('/pmgroups')
            } else {
                // خطاهای validation از سرور
                const errMap = {}
                if (res.errors) {
                    Object.entries(res.errors).forEach(([k, v]) => {
                        errMap[k] = Array.isArray(v) ? v[0] : v
                    })
                }
                setErrors(errMap)
                Swal.fire({
                    icon: 'error', title: 'خطا در ویرایش',
                    text: res.message || Object.values(errMap)[0] || 'خطایی رخ داد',
                })
            }
        },
        onError: () => Swal.fire('خطا!', 'مشکل در اتصال به سرور', 'error'),
    })

    const set = (k, v) => {
        setForm(p => ({ ...p, [k]: v }))
        setErrors(p => ({ ...p, [k]: null }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const err = {}
        // همه فیلدها اختیاری هستند در PUT ولی اگه پر شدن validate کن
        if (form.minutes !== '' && isNaN(parseInt(form.minutes)))
            err.minutes = 'مقدار دقیقه باید عدد باشد'
        if (form.km !== '' && isNaN(parseInt(form.km)))
            err.km = 'مقدار کیلومتر باید عدد باشد'
        if (Object.keys(err).length) return setErrors(err)

        // ارسال فقط فیلدهای غیر خالی
        const body = {}
        if (form.tm_code_id           !== '') body.tm_code_id           = form.tm_code_id
        if (form.mechanism_group_code !== '') body.mechanism_group_code = form.mechanism_group_code
        if (form.description          !== '') body.description          = form.description
        if (form.minutes              !== '') body.minutes              = parseInt(form.minutes)
        if (form.km                   !== '') body.km                   = parseInt(form.km)

        mutation.mutate(body)
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

                {/* ── هدر ── */}
                <div className="page-header-bar">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                 style={{ background: 'rgba(255,255,255,0.2)' }}>
                                <FontAwesomeIcon icon={faLayerGroup} className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-white leading-none">ویرایش گروه PM</h1>
                                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
                                    شناسه #{id}
                                    {savedData?.mechanism_group_code && ` — ${savedData.mechanism_group_code}`}
                                </p>
                            </div>
                        </div>
                        <button onClick={() => router.back()} className="btn btn-back btn-sm">
                            <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" />
                            بازگشت
                        </button>
                    </div>
                </div>

                <div className="page-content max-w-4xl">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                        {/* ── فرم ویرایش ── */}
                        <div className="lg:col-span-2">
                            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                                        className="card">
                                <div className="card-header">
                                    <h2 className="card-title flex items-center gap-2">
                                        <FontAwesomeIcon icon={faLayerGroup} className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                                        فرم ویرایش
                                    </h2>
                                </div>
                                <div className="card-body">
                                    <form onSubmit={handleSubmit}>
                                        <div className="grid grid-cols-2 gap-4">

                                            {/* tm_code_id */}
                                            <div>
                                                <label className="form-label">شناسه TM Code</label>
                                                <input
                                                    value={form.tm_code_id}
                                                    onChange={e => set('tm_code_id', e.target.value)}
                                                    placeholder="شناسه کد TM"
                                                    className={`form-input ${errors.tm_code_id ? 'error' : ''}`}
                                                />
                                                {errors.tm_code_id && (
                                                    <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.tm_code_id}</p>
                                                )}
                                            </div>

                                            {/* mechanism_group_code */}
                                            <div>
                                                <label className="form-label">کد گروه مکانیزم</label>
                                                <input
                                                    value={form.mechanism_group_code}
                                                    onChange={e => set('mechanism_group_code', e.target.value)}
                                                    placeholder="مثال: architecto"
                                                    className={`form-input ${errors.mechanism_group_code ? 'error' : ''}`}
                                                />
                                                {errors.mechanism_group_code && (
                                                    <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.mechanism_group_code}</p>
                                                )}
                                            </div>

                                            {/* minutes */}
                                            <div>
                                                <label className="form-label">دقیقه</label>
                                                <input
                                                    type="number" min="0"
                                                    value={form.minutes}
                                                    onChange={e => set('minutes', e.target.value)}
                                                    placeholder="مثال: 60"
                                                    className={`form-input ${errors.minutes ? 'error' : ''}`}
                                                />
                                                {errors.minutes && (
                                                    <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.minutes}</p>
                                                )}
                                            </div>

                                            {/* km */}
                                            <div>
                                                <label className="form-label">کیلومتر</label>
                                                <input
                                                    type="number" min="0"
                                                    value={form.km}
                                                    onChange={e => set('km', e.target.value)}
                                                    placeholder="مثال: 5000"
                                                    className={`form-input ${errors.km ? 'error' : ''}`}
                                                />
                                                {errors.km && (
                                                    <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.km}</p>
                                                )}
                                            </div>

                                            {/* description */}
                                            <div className="col-span-2">
                                                <label className="form-label">توضیحات</label>
                                                <textarea
                                                    value={form.description}
                                                    onChange={e => set('description', e.target.value)}
                                                    placeholder="توضیحات (اختیاری)"
                                                    rows={3}
                                                    className="form-textarea"
                                                />
                                            </div>
                                        </div>

                                        {/* دکمه‌ها */}
                                        <div className="flex justify-end gap-3 mt-5 pt-4"
                                             style={{ borderTop: '1px solid var(--border)' }}>
                                            <Link href="/pmgroups">
                                                <button type="button" className="btn btn-ghost">انصراف</button>
                                            </Link>
                                            <button type="submit" disabled={mutation.isPending}
                                                    className="btn btn-success
                                                    ">
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

                        {/* ── پنل اطلاعات جاری — response سرور ── */}
                        <div className="lg:col-span-1 space-y-4">

                            {/* اطلاعات اصلی */}
                            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.05 }} className="card">
                                <div className="card-header">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                                             style={{ background: 'var(--primary-light)' }}>
                                            <FontAwesomeIcon icon={faCog} className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
                                        </div>
                                        <p className="card-title text-sm">اطلاعات جاری</p>
                                    </div>
                                </div>
                                <div className="card-body">
                                    {savedData ? (
                                        <>
                                            <InfoRow label="شناسه"             value={savedData.id} />
                                            <InfoRow label="کد TM"             value={savedData.tm_code_id} />
                                            <InfoRow label="کد گروه مکانیزم"   value={savedData.mechanism_group_code} />
                                            <InfoRow label="دقیقه"             value={savedData.minutes} />
                                            <InfoRow label="کیلومتر"           value={savedData.km} />
                                            {savedData.description && (
                                                <div className="mt-3 p-3 rounded-lg" style={{ background: 'var(--surface-2)' }}>
                                                    <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>توضیحات</p>
                                                    <p className="text-sm" style={{ color: 'var(--text)' }}>{savedData.description}</p>
                                                </div>
                                            )}
                                            <div className="mt-3 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                                    آخرین ویرایش: {new Date(savedData.updated_at).toLocaleDateString('fa-IR')}
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>
                                            اطلاعاتی یافت نشد
                                        </p>
                                    )}
                                </div>
                            </motion.div>

                            {/* کد TM مرتبط */}
                            {savedData?.code && (
                                <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 }} className="card">
                                    <div className="card-header">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                                                 style={{ background: 'var(--info-light)' }}>
                                                <FontAwesomeIcon icon={faCode} className="w-3.5 h-3.5" style={{ color: 'var(--info)' }} />
                                            </div>
                                            <p className="card-title text-sm">کد TM مرتبط</p>
                                        </div>
                                        <span className={`badge ${savedData.code.type === 'CM' ? 'badge-info' : savedData.code.type === 'PM' ? 'badge-success' : 'badge-danger'}`}>
                                            {savedData.code.type}
                                        </span>
                                    </div>
                                    <div className="card-body">
                                        <InfoRow label="کد"        value={savedData.code.code} />
                                        <InfoRow label="عنوان"     value={savedData.code.title} />
                                        <InfoRow label="ساعت"      value={savedData.code.hours} />
                                        <InfoRow label="هزینه پایه" value={savedData.code.base_amount?.toLocaleString()} />
                                        <InfoRow label="وضعیت"     value={savedData.code.is_active === 'Y' ? 'فعال' : 'غیرفعال'} />
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}