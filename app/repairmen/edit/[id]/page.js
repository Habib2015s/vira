'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserCog, faSpinner, faSave, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import DashboardLayout from "@/app/dashboard/Dashboardlayout"
import Swal from 'sweetalert2'
import { ENV } from '@/app/config/env'

const BASE = ENV.API_REPAIRMEN

const HEADERS = { 'Content-Type': 'application/json', 'Accept': 'application/json' }

export default function RepairmenEditPage() {
    const router = useRouter()
    const { id } = useParams()
    const queryClient = useQueryClient()
    const [form, setForm] = useState({ name: '', family: '', phone: '', national_code: '', personal_code: '', workplace: '', contract_status: 'have' })
    const [errors, setErrors] = useState({})

    const { isLoading } = useQuery({
        queryKey: ['repairman', id],
        queryFn: () => fetch(`${BASE}/${id}`, { headers: HEADERS }).then(r => r.json()),
        onSuccess: (res) => { if (res.data?.repairman) setForm({ ...form, ...res.data.repairman }) }
    })

    const mutation = useMutation({
        mutationFn: (data) => fetch(`${BASE}/${id}`, { method: 'PUT', headers: HEADERS, body: JSON.stringify(data) }).then(r => r.json()),
        onSuccess: (res) => {
            if (res.data) {
                queryClient.invalidateQueries(['repairmen'])
                Swal.fire({ title: 'ذخیره شد!', icon: 'success', timer: 2000, showConfirmButton: false })
                router.push('/repairmen')
            } else setErrors(res.errors ?? {})
        },
        onError: () => Swal.fire('خطا!', 'عملیات انجام نشد', 'error')
    })

    const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: null })) }

    const handleSubmit = (e) => {
        e.preventDefault()
        mutation.mutate(form)
    }

    const Field = ({ label, name, placeholder }) => (
        <div>
            <label className="form-label">{label}</label>
            <input value={form[name] ?? ''} onChange={e => set(name, e.target.value)}
                placeholder={placeholder}
                className={`form-input ${errors[name] ? 'border-red-400' : ''}`} />
            {errors[name] && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors[name]}</p>}
        </div>
    )

    if (isLoading) return (
        <DashboardLayout>
            <div className="w-full min-h-screen flex items-center justify-center">
                <FontAwesomeIcon icon={faSpinner} className="w-10 h-10 animate-spin" style={{ color: 'var(--primary)' }} />
            </div>
        </DashboardLayout>
    )

    return (
        <DashboardLayout>
            <div className="w-full min-h-screen" style={{ background: 'var(--bg)' }}>
                <div className="page-header-bar">
                    <div className="max-w-3xl mx-auto flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-black text-white mb-0.5 flex items-center gap-3">
                                <FontAwesomeIcon icon={faUserCog} className="w-6 h-6 opacity-90" />
                                ویرایش تعمیرکار
                            </h1>
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
                                <Field label="نام" name="name" placeholder="نام" />
                                <Field label="نام خانوادگی" name="family" placeholder="نام خانوادگی" />
                                <Field label="تلفن" name="phone" placeholder="09xxxxxxxxx" />
                                <Field label="کد ملی" name="national_code" placeholder="کد ملی" />
                                <Field label="کد پرسنلی" name="personal_code" placeholder="کد پرسنلی" />
                                <Field label="محل کار" name="workplace" placeholder="محل کار" />
                                <div>
                                    <label className="form-label">وضعیت قرارداد</label>
                                    <select value={form.contract_status ?? 'have'} onChange={e => set('contract_status', e.target.value)} className="form-select">
                                        <option value="have">دارد</option>
                                        <option value="completion">اتمام یافته</option>
                                        <option value="no_need">نیاز نیست</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                                    <Link href="/repairmen"><button type="button" className="btn btn-ghost">انصراف</button></Link>
                                    <button type="submit" disabled={mutation.isPending} className="btn btn-primary">
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
