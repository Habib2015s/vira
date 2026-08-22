'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserCog, faSpinner, faSave, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import DashboardLayout from "@/app/dashboard/Dashboardlayout"
import Swal from 'sweetalert2'
import { ENV, getHeaders } from '@/app/config/env'

const BASE = ENV.API_REPAIRMEN

// ⭐⭐ تغییر اصلی: این کامپوننت از داخل RepairmenCreatePage به اینجا (بیرون از تابع، سطح فایل) منتقل شد.
// قبلاً چون داخل کامپوننت اصلی تعریف می‌شد، با هر تایپ (هر re-render) از نو ساخته می‌شد
// و React اون رو یه کامپوننت جدید می‌دید → input قبلی حذف و input جدید ساخته می‌شد → فوکوس از دست می‌رفت.
// حالا چون بیرونه، همیشه همون reference ثابت رو داره و React فقط props رو آپدیت می‌کنه، نه کل DOM node رو.
function Field({ label, name, placeholder, type = 'text', value, error, onChange }) {
    return (
        <div>
            <label className="form-label">{label}</label>
            <input type={type} value={value} onChange={e => onChange(name, e.target.value)}
                   placeholder={placeholder}
                   className={`form-input ${error ? 'border-red-400 focus:border-red-500' : ''}`} />
            {error && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{error}</p>}
        </div>
    )
}

export default function RepairmenCreatePage() {
    const router      = useRouter()
    const queryClient = useQueryClient()
    const [form, setForm] = useState({
        name: '', family: '', phone: '', national_code: '',
        personal_code: '', workplace: '', contract_status: 'have'
    })
    const [errors, setErrors] = useState({})

    const mutation = useMutation({
        mutationFn: (data) => fetch(BASE, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) })
            .then(async r => {
                const json = await r.json().catch(() => ({}))
                return { ...json, __ok: r.ok }
            }),
        onSuccess: (res) => {
            if (res.__ok && res.data) {
                // ⭐⭐ اضافه شد: بدون این خط، لیست تعمیرکاران رکورد جدید رو نشون نمی‌داد
                // (مگر با رفرش دستی صفحه). الان به‌محض ثبت، cache لیست باطل میشه و لیست دوباره fetch میشه.
                queryClient.invalidateQueries({ queryKey: ['repairmen'] })
                Swal.fire({ title: 'ثبت شد!', text: 'تعمیرکار جدید اضافه شد', icon: 'success', timer: 2000, showConfirmButton: false })
                router.push('/repairmen')
            } else {
                // ⭐ نرمال‌سازی خطاهای validation (چه رشته باشن چه آرایه)
                const errMap = {}
                if (res.errors && typeof res.errors === 'object') {
                    Object.entries(res.errors).forEach(([k, v]) => { errMap[k] = Array.isArray(v) ? v[0] : v })
                }
                setErrors(errMap)
                const firstMsg = Object.values(errMap)[0] || (typeof res.errors === 'string' ? res.errors : null) || res.message || 'عملیات انجام نشد'
                Swal.fire({ title: 'خطا', text: firstMsg, icon: 'error' })
            }
        },
        onError: () => Swal.fire('خطا!', 'مشکل در اتصال به سرور', 'error')
    })

    const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: null })) }

    const handleSubmit = (e) => {
        e.preventDefault()
        const err = {}
        if (!form.name.trim()) err.name = 'نام الزامی است'
        if (!form.family.trim()) err.family = 'نام خانوادگی الزامی است'
        if (Object.keys(err).length) return setErrors(err)
        mutation.mutate(form)
    }

    return (
        <DashboardLayout>
            <div className="w-full min-h-screen" style={{ background: 'var(--bg)' }}>
                <div className="page-header-bar">
                    <div className="max-w-3xl mx-auto flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-black text-white mb-0.5 flex items-center gap-3">
                                <FontAwesomeIcon icon={faUserCog} className="w-6 h-6 opacity-90" />
                                افزودن تعمیرکار
                            </h1>
                            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>ثبت تعمیرکار جدید</p>
                        </div>
                        <Link href="/repairmen">
                            <button className="btn btn-back">
                                <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
                                بازگشت
                            </button>
                        </Link>
                    </div>
                </div>

                <div className="p-6 max-w-3xl mx-auto">
                    <div className="card">
                        <div className="card-body">
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <Field label="نام *" name="name" placeholder="نام تعمیرکار"
                                       value={form.name} error={errors.name} onChange={set} />
                                <Field label="نام خانوادگی *" name="family" placeholder="نام خانوادگی"
                                       value={form.family} error={errors.family} onChange={set} />
                                <Field label="تلفن" name="phone" placeholder="09xxxxxxxxx"
                                       value={form.phone} error={errors.phone} onChange={set} />
                                <Field label="کد ملی" name="national_code" placeholder="کد ملی"
                                       value={form.national_code} error={errors.national_code} onChange={set} />
                                <Field label="کد پرسنلی" name="personal_code" placeholder="کد پرسنلی"
                                       value={form.personal_code} error={errors.personal_code} onChange={set} />
                                <Field label="محل کار" name="workplace" placeholder="محل کار"
                                       value={form.workplace} error={errors.workplace} onChange={set} />

                                <div>
                                    <label className="form-label">وضعیت قرارداد</label>
                                    <select value={form.contract_status} onChange={e => set('contract_status', e.target.value)} className="form-select">
                                        <option value="have">دارد</option>
                                        <option value="completion">اتمام یافته</option>
                                        <option value="no_need">نیاز نیست</option>
                                    </select>
                                </div>

                                <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                                    <Link href="/repairmen"><button type="button" className="btn btn-ghost">انصراف</button></Link>
                                    <button type="submit" disabled={mutation.isPending} className="btn btn-success">
                                        {mutation.isPending ? <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" /> : <FontAwesomeIcon icon={faSave} className="w-4 h-4" />}
                                        ذخیره
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}