'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserCog, faSpinner, faSave, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import DashboardLayout from "@/app/dashboard/Dashboardlayout"
import Swal from 'sweetalert2'
import { ENV, getHeaders } from '@/app/config/env'

const BASE = ENV.API_REPAIRMEN


export default function RepairmenCreatePage() {
    const router = useRouter()
    const [form, setForm] = useState({
        name: '', family: '', phone: '', national_code: '',
        personal_code: '', workplace: '', contract_status: 'have'
    })
    const [errors, setErrors] = useState({})

    const mutation = useMutation({
        mutationFn: (data) => fetch(BASE, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(r => r.json()),
        onSuccess: (res) => {
            if (res.data) {
                Swal.fire({ title: 'ثبت شد!', text: 'تعمیرکار جدید اضافه شد', icon: 'success', timer: 2000, showConfirmButton: false })
                router.push('/repairmen')
            } else {
                setErrors(res.errors ?? {})
            }
        },
        onError: () => Swal.fire('خطا!', 'عملیات انجام نشد', 'error')
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

    const Field = ({ label, name, placeholder, type = 'text' }) => (
        <div>
            <label className="form-label">{label}</label>
            <input type={type} value={form[name]} onChange={e => set(name, e.target.value)}
                placeholder={placeholder}
                className={`form-input ${errors[name] ? 'border-red-400 focus:border-red-500' : ''}`} />
            {errors[name] && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors[name]}</p>}
        </div>
    )

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
                                <Field label="نام *" name="name" placeholder="نام تعمیرکار" />
                                <Field label="نام خانوادگی *" name="family" placeholder="نام خانوادگی" />
                                <Field label="تلفن" name="phone" placeholder="09xxxxxxxxx" />
                                <Field label="کد ملی" name="national_code" placeholder="کد ملی" />
                                <Field label="کد پرسنلی" name="personal_code" placeholder="کد پرسنلی" />
                                <Field label="محل کار" name="workplace" placeholder="محل کار" />

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
