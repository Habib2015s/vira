'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave, faArrowLeft, faPlus, faTrash, faWrench, faClipboardList, faSpinner } from '@fortawesome/free-solid-svg-icons'
import Select from 'react-select'
import DashboardLayout from "@/app/dashboard/Dashboardlayout"
import Swal from 'sweetalert2'
import { ENV } from '@/app/config/env'

const BASE    = ENV.API_TM_REQUESTS
const HEADERS = { 'Content-Type': 'application/json', 'Accept': 'application/json' }

// ── Select styles ────────────────────────────────────
const selectStyles = {
    control: (b, s) => ({ ...b, minHeight: '40px', background: 'var(--surface)', borderColor: s.isFocused ? 'var(--primary)' : 'var(--border)', borderWidth: '1.5px', borderRadius: 'var(--radius)', boxShadow: s.isFocused ? '0 0 0 3px rgba(84,76,207,0.1)' : 'none', '&:hover': { borderColor: 'var(--border-strong)' } }),
    menu:        (b) => ({ ...b, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', zIndex: 9999, boxShadow: 'var(--shadow-lg)' }),
    menuList:    (b) => ({ ...b, padding: '4px', background: 'var(--surface)' }),
    option:      (b, s) => ({ ...b, borderRadius: 'var(--radius-sm)', background: s.isSelected ? 'var(--primary)' : s.isFocused ? 'var(--surface-2)' : 'transparent', color: s.isSelected ? '#fff' : 'var(--text)', fontSize: '13.5px' }),
    singleValue: (b) => ({ ...b, color: 'var(--text)', fontSize: '13.5px' }),
    placeholder: (b) => ({ ...b, color: 'var(--muted)', fontSize: '13.5px' }),
    input:       (b) => ({ ...b, color: 'var(--text)' }),
    menuPortal:  (b) => ({ ...b, zIndex: 9999 }),
}

const ErrorMsg = ({ msg }) => msg ? <p className="text-xs mt-1.5 font-medium" style={{ color: 'var(--danger)' }}>{msg}</p> : null

export default function TmRequestCreatePage() {
    const router      = useRouter()
    const queryClient = useQueryClient()
    const [storeType, setStoreType] = useState('workshop')
    const [form,      setForm]      = useState({ mechanism_id: null, driver_id: null, type: 'CM', description: '' })
    const [infos,     setInfos]     = useState([{ tm_code_id: null, shop_id: null, description: '', cost: '', tm_code_count: 1, type_code: 'not_accepted' }])
    const [errors,    setErrors]    = useState({})

    // ── fetch لیست‌ها ──────────────────────────────
    const { data: repairmenData = [] } = useQuery({
        queryKey: ['repairmen'],
        queryFn: () => fetch(ENV.API_REPAIRMEN, { headers: HEADERS }).then(r => r.json()).then(r => r.data?.repairmen?.data || []),
        staleTime: 10 * 60 * 1000,
    })
    const { data: shopsData = [] } = useQuery({
        queryKey: ['shops'],
        queryFn: () => fetch(ENV.API_SHOPS, { headers: HEADERS }).then(r => r.json()).then(r => r.data?.shops?.data || []),
        staleTime: 10 * 60 * 1000,
    })
    const { data: tmCodesData = [] } = useQuery({
        queryKey: ['tmCodes'],
        queryFn: () => fetch(ENV.API_TM_CODES, { headers: HEADERS }).then(r => r.json()).then(r => r.data?.tmCodes?.data || []),
        staleTime: 10 * 60 * 1000,
    })

    // ⭐ تعمیرکاران برای mechanism و driver
    const repairmenOptions = repairmenData.map(r => ({
        value: r.id,
        label: `${r.name} ${r.family || ''} — کد: ${r.personal_code || r.id}`,
        item: r,
    }))
    const shopOptions   = shopsData.map(s => ({ value: s.id, label: `${s.name} (${s.code})`, item: s }))
    const tmCodeOptions = tmCodesData.map(t => ({ value: t.id, label: `${t.code} — ${t.title} (${t.type})`, item: t }))

    const mutation = useMutation({
        mutationFn: ({ url, body }) => fetch(url, { method: 'POST', headers: HEADERS, body: JSON.stringify(body) }).then(r => r.json()),
        onSuccess: (res) => {
            if (res.data) {
                queryClient.invalidateQueries({ queryKey: ['tmRequests'] })
                Swal.fire({ title: 'ثبت شد!', icon: 'success', timer: 2000, showConfirmButton: false })
                router.push('/tmrequests')
            } else {
                const errMap = {}
                if (res.errors) Object.entries(res.errors).forEach(([k, v]) => { errMap[k] = Array.isArray(v) ? v[0] : v })
                setErrors(errMap)
                Swal.fire({ icon: 'error', title: 'خطا', text: Object.values(errMap)[0] || res.message || 'خطایی رخ داد' })
            }
        },
        onError: () => Swal.fire('خطا!', 'مشکل در اتصال', 'error'),
    })

    const addInfo    = () => setInfos(p => [...p, { tm_code_id: null, shop_id: null, description: '', cost: '', tm_code_count: 1, type_code: 'not_accepted' }])
    const removeInfo = (i) => setInfos(p => p.filter((_, idx) => idx !== i))
    const updateInfo = (i, key, val) => setInfos(p => p.map((item, idx) => idx === i ? { ...item, [key]: val } : item))

    const handleSubmit = (e) => {
        e.preventDefault()
        const err = {}
        if (!form.mechanism_id) err.mechanism_id = 'انتخاب مکانیزم الزامی است'
        if (!form.driver_id)    err.driver_id    = 'انتخاب راننده الزامی است'
        if (storeType === 'workshop') {
            infos.forEach((info, i) => {
                if (!info.tm_code_id) err[`info_${i}_tm_code`] = `قلم ${i+1}: کد تعمیر الزامی است`
                if (!info.shop_id)    err[`info_${i}_shop`]    = `قلم ${i+1}: شاپ الزامی است`
            })
        }
        if (Object.keys(err).length) return setErrors(err)

        let url, body
        if (storeType === 'workshop') {
            url  = ENV.API_TM_REQUESTS_FROM_WORKSHOP
            body = {
                mechanism_id: form.mechanism_id,
                driver_id:    form.driver_id,
                type:         form.type,
                infos: infos.map(info => ({
                    tm_code_id:    info.tm_code_id,
                    shop_id:       info.shop_id,
                    description:   info.description || undefined,
                    cost:          info.cost ? parseInt(info.cost) : undefined,
                    tm_code_count: parseInt(info.tm_code_count) || 1,
                    type_code:     info.type_code || 'not_accepted',
                }))
            }
        } else {
            url  = BASE
            body = {
                mechanism_id: form.mechanism_id,
                driver_id:    form.driver_id,
                type:         form.type,
                ...(form.description && { description: form.description }),
            }
        }
        mutation.mutate({ url, body })
    }

    return (
        <DashboardLayout>
            <div className="w-full min-h-screen" style={{ background: 'var(--bg)' }}>
                <div className="page-header-bar">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                                <FontAwesomeIcon icon={faClipboardList} className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-white leading-none">ثبت درخواست تعمیر</h1>
                                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>TM Request جدید</p>
                            </div>
                        </div>
                        <button onClick={() => router.back()} className="btn btn-back btn-sm">
                            <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" />بازگشت
                        </button>
                    </div>
                </div>

                <div className="page-content max-w-4xl">
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* نوع ثبت */}
                        <div className="card">
                            <div className="card-header"><p className="card-title">نوع ثبت درخواست</p></div>
                            <div className="card-body grid grid-cols-2 gap-3">
                                {[
                                    { key: 'workshop', label: 'ثبت از کارگاه',  desc: 'با اقلام تعمیر (storeFromWorkshop)', icon: faWrench },
                                    { key: 'simple',   label: 'ثبت ساده',        desc: 'بدون اقلام تعمیر',                   icon: faClipboardList },
                                ].map(({ key, label, desc, icon }) => (
                                    <button key={key} type="button" onClick={() => setStoreType(key)}
                                            className="p-4 rounded-xl text-right transition-all"
                                            style={{ border: `2px solid ${storeType === key ? 'var(--primary)' : 'var(--border)'}`, background: storeType === key ? 'var(--primary-subtle)' : 'var(--surface-2)' }}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <FontAwesomeIcon icon={icon} className="w-4 h-4" style={{ color: storeType === key ? 'var(--primary)' : 'var(--muted)' }} />
                                            <span className="font-black text-sm" style={{ color: storeType === key ? 'var(--primary)' : 'var(--text)' }}>{label}</span>
                                        </div>
                                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* اطلاعات پایه */}
                        <div className="card">
                            <div className="card-header"><p className="card-title">اطلاعات پایه</p></div>
                            <div className="card-body grid grid-cols-2 gap-4">

                                {/* مکانیزم — از لیست تعمیرکاران */}
                                <div>
                                    <label className="form-label"><span style={{ color: 'var(--danger)' }}>* </span>مکانیزم</label>
                                    <Select options={repairmenOptions} value={repairmenOptions.find(o => o.value === form.mechanism_id) || null}
                                            onChange={opt => { setForm(p => ({ ...p, mechanism_id: opt?.value || null })); setErrors(p => ({ ...p, mechanism_id: null })) }}
                                            styles={selectStyles} placeholder="جستجو تعمیرکار..."
                                            menuPortalTarget={typeof document !== 'undefined' ? document.body : null} menuPosition="fixed"
                                            isClearable noOptionsMessage={() => 'تعمیرکاری یافت نشد'}
                                            formatOptionLabel={opt => (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                                                         style={{ background: `hsl(${(opt.value * 53) % 360}, 65%, 88%)`, color: `hsl(${(opt.value * 53) % 360}, 55%, 38%)` }}>
                                                        <span className="text-xs font-black">{opt.item?.name?.[0] || '#'}</span>
                                                    </div>
                                                    <span>{opt.label}</span>
                                                </div>
                                            )} />
                                    <ErrorMsg msg={errors.mechanism_id} />
                                </div>

                                {/* راننده — از لیست تعمیرکاران */}
                                <div>
                                    <label className="form-label"><span style={{ color: 'var(--danger)' }}>* </span>راننده</label>
                                    <Select options={repairmenOptions} value={repairmenOptions.find(o => o.value === form.driver_id) || null}
                                            onChange={opt => { setForm(p => ({ ...p, driver_id: opt?.value || null })); setErrors(p => ({ ...p, driver_id: null })) }}
                                            styles={selectStyles} placeholder="جستجو راننده..."
                                            menuPortalTarget={typeof document !== 'undefined' ? document.body : null} menuPosition="fixed"
                                            isClearable noOptionsMessage={() => 'رانندهٔ یافت نشد'} />
                                    <ErrorMsg msg={errors.driver_id} />
                                </div>

                                {/* نوع */}
                                <div>
                                    <label className="form-label">نوع</label>
                                    <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="form-select">
                                        <option value="CM">CM — تعمیر اصلاحی</option>
                                        <option value="PM">PM — نگهداری پیشگیرانه</option>
                                        <option value="EM">EM — اضطراری</option>
                                    </select>
                                </div>

                                {/* توضیحات — فقط حالت ساده */}
                                {storeType === 'simple' && (
                                    <div>
                                        <label className="form-label">توضیحات</label>
                                        <input type="text" value={form.description} maxLength={255}
                                               onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                               placeholder="اختیاری" className="form-input" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* اقلام — فقط storeFromWorkshop */}
                        <AnimatePresence>
                            {storeType === 'workshop' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                            className="card">
                                    <div className="card-header">
                                        <p className="card-title flex items-center gap-2">
                                            <FontAwesomeIcon icon={faWrench} className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                                            اقلام تعمیر
                                        </p>
                                        <button type="button" onClick={addInfo} className="btn btn-success btn-sm">
                                            <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" />افزودن قلم
                                        </button>
                                    </div>
                                    <div className="card-body space-y-4">
                                        {infos.map((info, i) => (
                                            <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                                                        className="p-4 rounded-xl" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-xs font-black px-2.5 py-1 rounded-full"
                                                          style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                                                        قلم {i + 1}
                                                    </span>
                                                    {infos.length > 1 && (
                                                        <button type="button" onClick={() => removeInfo(i)} className="action-btn action-btn-delete w-7 h-7">
                                                            <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {/* کد تعمیر */}
                                                    <div>
                                                        <label className="form-label"><span style={{ color: 'var(--danger)' }}>* </span>کد تعمیر</label>
                                                        <Select options={tmCodeOptions}
                                                                value={tmCodeOptions.find(o => o.value === info.tm_code_id) || null}
                                                                onChange={opt => updateInfo(i, 'tm_code_id', opt?.value || null)}
                                                                styles={selectStyles} placeholder="جستجو کد تعمیر..."
                                                                menuPortalTarget={typeof document !== 'undefined' ? document.body : null} menuPosition="fixed"
                                                                isClearable noOptionsMessage={() => 'کدی یافت نشد'} />
                                                        <ErrorMsg msg={errors[`info_${i}_tm_code`]} />
                                                    </div>
                                                    {/* شاپ */}
                                                    <div>
                                                        <label className="form-label"><span style={{ color: 'var(--danger)' }}>* </span>شاپ</label>
                                                        <Select options={shopOptions}
                                                                value={shopOptions.find(o => o.value === info.shop_id) || null}
                                                                onChange={opt => updateInfo(i, 'shop_id', opt?.value || null)}
                                                                styles={selectStyles} placeholder="جستجو شاپ..."
                                                                menuPortalTarget={typeof document !== 'undefined' ? document.body : null} menuPosition="fixed"
                                                                isClearable noOptionsMessage={() => 'شاپی یافت نشد'} />
                                                        <ErrorMsg msg={errors[`info_${i}_shop`]} />
                                                    </div>
                                                    {/* تعداد */}
                                                    <div>
                                                        <label className="form-label">تعداد</label>
                                                        <input type="number" value={info.tm_code_count} min="1"
                                                               onChange={e => updateInfo(i, 'tm_code_count', e.target.value)}
                                                               className="form-input" placeholder="1" />
                                                    </div>
                                                    {/* هزینه */}
                                                    <div>
                                                        <label className="form-label">هزینه</label>
                                                        <input type="number" value={info.cost} min="0"
                                                               onChange={e => updateInfo(i, 'cost', e.target.value)}
                                                               className="form-input" placeholder="اختیاری" />
                                                    </div>
                                                    {/* وضعیت پذیرش */}
                                                    <div>
                                                        <label className="form-label">وضعیت پذیرش</label>
                                                        <select value={info.type_code} onChange={e => updateInfo(i, 'type_code', e.target.value)} className="form-select">
                                                            <option value="not_accepted">تایید نشده</option>
                                                            <option value="accepted">تایید شده</option>
                                                            <option value="all">همه</option>
                                                        </select>
                                                    </div>
                                                    {/* توضیحات */}
                                                    <div>
                                                        <label className="form-label">توضیحات</label>
                                                        <input type="text" value={info.description} maxLength={255}
                                                               onChange={e => updateInfo(i, 'description', e.target.value)}
                                                               className="form-input" placeholder="اختیاری" />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => router.back()} className="btn btn-ghost">انصراف</button>
                            <button type="submit" disabled={mutation.isPending} className="btn btn-success btn-lg">
                                {mutation.isPending
                                    ? <><FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />در حال ثبت...</>
                                    : <><FontAwesomeIcon icon={faSave} className="w-4 h-4" />ثبت درخواست</>
                                }
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    )
}