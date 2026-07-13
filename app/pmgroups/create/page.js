'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLayerGroup, faSpinner, faSave, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import DashboardLayout from "@/app/dashboard/Dashboardlayout"
import Swal from 'sweetalert2'
import { ENV, getHeaders } from '@/app/config/env'


const BASE = ENV.API_PM_GROUPS


export default function PmGroupCreatePage() {
    const router = useRouter()
    const [form, setForm] = useState({ tm_code_id: '', mechanism_group_code: '', description: '', minutes: '', km: '' })
    const [errors, setErrors] = useState({})

    const mutation = useMutation({
        mutationFn: (data) => fetch(BASE, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(r => r.json()),
        onSuccess: (res) => {
            if (res.data) {
                Swal.fire({ title: 'ثبت شد!', icon: 'success', timer: 2000, showConfirmButton: false })
                router.push('/pmgroups')
            } else setErrors(res.errors ?? {})
        },
        onError: () => Swal.fire('خطا!', 'عملیات انجام نشد', 'error')
    })

    const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: null })) }

    const handleSubmit = (e) => {
        e.preventDefault()
        const err = {}
        if (!form.tm_code_id) err.tm_code_id = 'شناسه TM الزامی است'
        if (!form.mechanism_group_code) err.mechanism_group_code = 'کد گروه مکانیزم الزامی است'
        if (!form.minutes) err.minutes = 'دقیقه الزامی است'
        if (!form.km) err.km = 'کیلومتر الزامی است'
        if (Object.keys(err).length) return setErrors(err)
        mutation.mutate({ ...form, minutes: parseInt(form.minutes), km: parseInt(form.km) })
    }

    return (
        <DashboardLayout>
            <div className="w-full min-h-screen" style={{ background: 'var(--bg)' }}>
                <div className="page-header-bar">
                    <div className="max-w-3xl mx-auto flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-black text-white mb-0.5 flex items-center gap-3">
                                <FontAwesomeIcon icon={faLayerGroup} className="w-6 h-6 opacity-90" />
                                افزودن گروه PM
                            </h1>
                        </div>
                        <Link href="/pmgroups">
                            <button className="btn btn-back"><FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" /> بازگشت</button>
                        </Link>
                    </div>
                </div>
                <div className="p-6 max-w-3xl mx-auto">
                    <div className="card">
                        <div className="card-body">
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {[
                                    { label: 'شناسه TM Code *', name: 'tm_code_id', placeholder: 'شناسه کد TM' },
                                    { label: 'کد گروه مکانیزم *', name: 'mechanism_group_code', placeholder: 'کد گروه مکانیزم' },
                                    { label: 'دقیقه *', name: 'minutes', placeholder: 'مقدار دقیقه' },
                                    { label: 'کیلومتر *', name: 'km', placeholder: 'مقدار کیلومتر' },
                                ].map(f => (
                                    <div key={f.name}>
                                        <label className="form-label">{f.label}</label>
                                        <input value={form[f.name]} onChange={e => set(f.name, e.target.value)}
                                            placeholder={f.placeholder}
                                            className={`form-input ${errors[f.name] ? 'border-red-400' : ''}`} />
                                        {errors[f.name] && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors[f.name]}</p>}
                                    </div>
                                ))}
                                <div className="md:col-span-2">
                                    <label className="form-label">توضیحات</label>
                                    <textarea value={form.description} onChange={e => set('description', e.target.value)}
                                        placeholder="توضیحات (اختیاری)" rows={3} className="form-textarea" />
                                </div>
                                <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                                    <Link href="/pmgroups"><button type="button" className="btn btn-ghost">انصراف</button></Link>
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
