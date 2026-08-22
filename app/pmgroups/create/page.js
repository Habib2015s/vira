'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLayerGroup, faSpinner, faSave, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import DashboardLayout from "@/app/dashboard/Dashboardlayout"
import Swal from 'sweetalert2'
import Select from 'react-select'
import { ENV, getHeaders } from '@/app/config/env'


const BASE = ENV.API_PM_GROUPS

// ⭐⭐ استایل Select هماهنگ با بقیه فرم‌های پروژه
const selectStyles = {
    control: (b, s) => ({ ...b, minHeight: '48px', borderRadius: '8px', background: 'var(--surface)', borderColor: s.isFocused ? 'var(--primary)' : 'var(--border)', borderWidth: '2px', boxShadow: s.isFocused ? '0 0 0 3px rgba(24,24,27,0.15)' : 'none', '&:hover': { borderColor: 'var(--border-strong)' } }),
    menu:        (b) => ({ ...b, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', zIndex: 9999 }),
    menuList:    (b) => ({ ...b, padding: '6px', background: 'var(--surface)' }),
    option:      (b, s) => ({ ...b, borderRadius: '6px', background: s.isSelected ? 'var(--primary)' : s.isFocused ? 'var(--surface-2)' : 'transparent', color: s.isSelected ? '#fff' : 'var(--text)' }),
    singleValue: (b) => ({ ...b, color: 'var(--text)' }),
    placeholder: (b) => ({ ...b, color: 'var(--muted)' }),
    input:       (b) => ({ ...b, color: 'var(--text)' }),
    menuPortal:  (b) => ({ ...b, zIndex: 9999 }),
}

export default function PmGroupCreatePage() {
    const router      = useRouter()
    const queryClient = useQueryClient()
    const [form, setForm] = useState({ tm_code_id: null, mechanism_group_code: '', description: '', minutes: '', km: '' })
    const [errors, setErrors] = useState({})

    // ⭐⭐ اضافه شد: لیست tm_codes موجود رو از بک‌اند می‌گیریم
    // چون tm_code_id باید «انتخاب از رکورد موجود» باشه، نه عددی که کاربر خودش تایپ می‌کنه
    const [tmCodes, setTmCodes] = useState([])
    const [tmCodesLoading, setTmCodesLoading] = useState(true)

    useEffect(() => {
        fetch(ENV.API_TM_CODES, { headers: getHeaders() })
            .then(r => r.json())
            .then(res => setTmCodes(res.data?.tmCodes?.data || []))
            .catch(console.error)
            .finally(() => setTmCodesLoading(false))
    }, [])

    const tmCodeOptions = tmCodes.map(t => ({
        value: t.id,
        label: `${t.code} — ${t.title}${t.type ? ` (${t.type})` : ''}`,
    }))

    const mutation = useMutation({
        mutationFn: (data) => fetch(BASE, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) })
            .then(async r => {
                const json = await r.json().catch(() => ({}))
                return { ...json, __ok: r.ok }
            }),
        onSuccess: (res) => {
            if (res.__ok && res.data) {
                queryClient.invalidateQueries({ queryKey: ['pmGroups'] })
                Swal.fire({ title: 'ثبت شد!', icon: 'success', timer: 2000, showConfirmButton: false })
                router.push('/pmgroups')
            } else {
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
        if (!form.tm_code_id) err.tm_code_id = 'انتخاب کد TM الزامی است'
        if (!form.mechanism_group_code) err.mechanism_group_code = 'کد گروه مکانیزم الزامی است'
        if (!form.minutes) err.minutes = 'دقیقه الزامی است'
        if (!form.km) err.km = 'کیلومتر الزامی است'
        if (Object.keys(err).length) return setErrors(err)
        mutation.mutate({
            tm_code_id: form.tm_code_id,
            mechanism_group_code: form.mechanism_group_code,
            description: form.description || undefined,
            minutes: parseInt(form.minutes),
            km: parseInt(form.km),
        })
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

                                {/* ⭐⭐ تغییر اصلی: به‌جای input متنی، حالا Select با جستجو از لیست واقعی tm_codes */}
                                <div>
                                    <label className="form-label">
                                        <span style={{ color: 'var(--danger)' }}>* </span>کد TM
                                    </label>
                                    <Select
                                        options={tmCodeOptions}
                                        value={tmCodeOptions.find(o => o.value === form.tm_code_id) || null}
                                        onChange={opt => set('tm_code_id', opt?.value || null)}
                                        placeholder={tmCodesLoading ? 'در حال بارگذاری...' : 'جستجو یا انتخاب کد TM...'}
                                        isClearable isSearchable isLoading={tmCodesLoading}
                                        noOptionsMessage={() => 'کدی یافت نشد'}
                                        styles={{ ...selectStyles, control: (b, s) => ({ ...selectStyles.control(b, s), borderColor: errors.tm_code_id ? 'var(--danger)' : s.isFocused ? 'var(--primary)' : 'var(--border)' }) }}
                                        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                        menuPosition="fixed"
                                    />
                                    {errors.tm_code_id && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.tm_code_id}</p>}
                                </div>

                                {[
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