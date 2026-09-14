'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave, faArrowLeft, faPlus, faTrash, faWrench, faClipboardList, faSpinner } from '@fortawesome/free-solid-svg-icons'
import Select from 'react-select'
import Swal from 'sweetalert2'
import { ENV, getHeaders } from '@/app/config/env'

const BASE    = ENV.API_TM_REQUESTS

const selectStyles = {
    control: (b, s) => ({ ...b, minHeight: '40px', background: 'var(--surface)', borderColor: s.isFocused ? 'var(--primary)' : 'var(--border)', borderWidth: '1.5px', borderRadius: 'var(--radius)', boxShadow: s.isFocused ? '0 0 0 3px rgba(84,76,207,0.1)' : 'none' }),
    menu:        (b) => ({ ...b, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', zIndex: 9999, boxShadow: 'var(--shadow-lg)' }),
    menuList:    (b) => ({ ...b, padding: '4px', background: 'var(--surface)' }),
    option:      (b, s) => ({ ...b, borderRadius: 'var(--radius-sm)', background: s.isSelected ? 'var(--primary)' : s.isFocused ? 'var(--surface-2)' : 'transparent', color: s.isSelected ? '#fff' : 'var(--text)', fontSize: '13.5px' }),
    singleValue: (b) => ({ ...b, color: 'var(--text)', fontSize: '13.5px' }),
    placeholder: (b) => ({ ...b, color: 'var(--muted)', fontSize: '13.5px' }),
    input:       (b) => ({ ...b, color: 'var(--text)' }),
    menuPortal:  (b) => ({ ...b, zIndex: 9999 }),
}

const ErrorMsg = ({ msg }) => msg ? <p className="text-xs mt-1.5 font-medium" style={{ color: 'var(--danger)' }}>{msg}</p> : null

export default function TmRequestEditPage() {
    const router      = useRouter()
    const { id }      = useParams()
    const queryClient = useQueryClient()

    const [fetching, setFetching] = useState(true)
    const [infos,    setInfos]    = useState([])
    const [errors,   setErrors]   = useState({})

    // ── لیست‌ها ──────────────────────────────────────
    const { data: repairmenData = [] } = useQuery({
        queryKey: ['repairmen'],
        queryFn: () => fetch(ENV.API_REPAIRMEN, { headers: getHeaders() }).then(r => r.json()).then(r => r.data?.repairmen?.data || []),
        staleTime: 10 * 60 * 1000,
    })
    const { data: shopsData = [] } = useQuery({
        queryKey: ['shops'],
        queryFn: () => fetch(ENV.API_SHOPS, { headers: getHeaders() }).then(r => r.json()).then(r => r.data?.shops?.data || []),
        staleTime: 10 * 60 * 1000,
    })
    const { data: tmCodesData = [] } = useQuery({
        queryKey: ['tmCodes'],
        queryFn: () => fetch(ENV.API_TM_CODES, { headers: getHeaders() }).then(r => r.json()).then(r => r.data?.tmCodes?.data || []),
        staleTime: 10 * 60 * 1000,
    })

    const repairmenOptions = repairmenData.map(r => ({ value: r.id, label: `${r.name} ${r.family || ''} — ${r.personal_code || r.id}`, item: r }))
    const shopOptions      = shopsData.map(s => ({ value: s.id, label: `${s.name} (${s.code})`, item: s }))
    const tmCodeOptions    = tmCodesData.map(t => ({ value: t.id, label: `${t.code} — ${t.title} (${t.type})`, item: t }))

    // ── GET درخواست ──────────────────────────────────
    useEffect(() => {
        fetch(`${BASE}/${id}`, { headers: getHeaders() })
            .then(r => r.json())
            .then(res => {
                const existing = res.data?.tmrequest?.infos || []
                setInfos(existing.length > 0 ? existing.map(info => ({
                    id:           info.id || null,
                    tm_code_id:   info.tm_code_id   || null,
                    shop_id:      info.shop_id      || null,
                    mechanism_id: info.mechanism_id || null,
                    driver_id:    info.driver_id    || null,
                    status:       info.status       || '',
                })) : [{ id: null, tm_code_id: null, shop_id: null, mechanism_id: null, driver_id: null, status: '' }])
            })
            .catch(() => Swal.fire({ icon: 'error', title: 'خطا', text: 'دریافت اطلاعات ناموفق' }))
            .finally(() => setFetching(false))
    }, [id])

    const mutation = useMutation({
        mutationFn: (body) => fetch(`${BASE}/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(body) }).then(r => r.json()),
        onSuccess: (res) => {
            if (res.data || res.message) {
                queryClient.invalidateQueries({ queryKey: ['tmRequests'] })
                Swal.fire({ title: 'ویرایش شد!', icon: 'success', timer: 2000, showConfirmButton: false })
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

    const addInfo    = () => setInfos(p => [...p, { id: null, tm_code_id: null, shop_id: null, mechanism_id: null, driver_id: null, status: '' }])
    const removeInfo = (i) => { if (infos.length > 1) setInfos(p => p.filter((_, idx) => idx !== i)) }
    const updateInfo = (i, key, val) => setInfos(p => p.map((item, idx) => idx === i ? { ...item, [key]: val } : item))

    const handleSubmit = (e) => {
        e.preventDefault()
        const err = {}
        infos.forEach((info, i) => {
            if (!info.tm_code_id) err[`info_${i}`] = `قلم ${i+1}: کد تعمیر الزامی است`
        })
        if (Object.keys(err).length) return setErrors(err)

        mutation.mutate({
            infos: infos.map(info => ({
                ...(info.id ? { id: info.id } : {}),
                tm_code_id:   info.tm_code_id,
                ...(info.shop_id      ? { shop_id:      info.shop_id }      : {}),
                ...(info.mechanism_id ? { mechanism_id: info.mechanism_id } : {}),
                ...(info.driver_id    ? { driver_id:    info.driver_id }    : {}),
                ...(info.status       ? { status:       info.status }       : {}),
            }))
        })
    }

    if (fetching) return (
            <div className="w-full min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card text-center p-12">
                    <FontAwesomeIcon icon={faSpinner} className="w-12 h-12 animate-spin mb-4" style={{ color: 'var(--primary)' }} />
                    <p className="font-bold" style={{ color: 'var(--text)' }}>در حال بارگذاری...</p>
                </motion.div>
            </div>
    )

    return (
            <div className="w-full min-h-screen" style={{ background: 'var(--bg)' }}>
                <div className="page-header-bar">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                                <FontAwesomeIcon icon={faClipboardList} className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-white leading-none">ویرایش درخواست تعمیر</h1>
                                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>شناسه #{id} — ویرایش اقلام</p>
                            </div>
                        </div>
                        <button onClick={() => router.back()} className="btn btn-back btn-sm">
                            <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" />بازگشت
                        </button>
                    </div>
                </div>

                <div className="page-content max-w-4xl">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="card">
                            <div className="card-header">
                                <p className="card-title flex items-center gap-2">
                                    <FontAwesomeIcon icon={faWrench} className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                                    اقلام تعمیر
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className="badge badge-primary">{infos.length} قلم</span>
                                    <button type="button" onClick={addInfo} className="btn btn-success btn-sm">
                                        <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" />افزودن
                                    </button>
                                </div>
                            </div>
                            <div className="card-body space-y-4">
                                {infos.map((info, i) => (
                                    <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                                                className="p-4 rounded-xl" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-black px-2.5 py-1 rounded-full"
                                                      style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                                                    قلم {i+1}
                                                </span>
                                                {info.id && <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>#{info.id}</span>}
                                            </div>
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
                                                        styles={selectStyles} placeholder="انتخاب کد تعمیر..."
                                                        menuPortalTarget={typeof document !== 'undefined' ? document.body : null} menuPosition="fixed"
                                                        isClearable noOptionsMessage={() => 'کدی یافت نشد'} />
                                                <ErrorMsg msg={errors[`info_${i}`]} />
                                            </div>
                                            {/* شاپ */}
                                            <div>
                                                <label className="form-label">شاپ</label>
                                                <Select options={shopOptions}
                                                        value={shopOptions.find(o => o.value === info.shop_id) || null}
                                                        onChange={opt => updateInfo(i, 'shop_id', opt?.value || null)}
                                                        styles={selectStyles} placeholder="انتخاب شاپ..."
                                                        menuPortalTarget={typeof document !== 'undefined' ? document.body : null} menuPosition="fixed"
                                                        isClearable noOptionsMessage={() => 'شاپی یافت نشد'} />
                                            </div>
                                            {/* مکانیزم */}
                                            <div>
                                                <label className="form-label">مکانیزم</label>
                                                <Select options={repairmenOptions}
                                                        value={repairmenOptions.find(o => o.value === info.mechanism_id) || null}
                                                        onChange={opt => updateInfo(i, 'mechanism_id', opt?.value || null)}
                                                        styles={selectStyles} placeholder="انتخاب مکانیزم..."
                                                        menuPortalTarget={typeof document !== 'undefined' ? document.body : null} menuPosition="fixed"
                                                        isClearable noOptionsMessage={() => 'موردی یافت نشد'} />
                                            </div>
                                            {/* راننده */}
                                            <div>
                                                <label className="form-label">راننده</label>
                                                <Select options={repairmenOptions}
                                                        value={repairmenOptions.find(o => o.value === info.driver_id) || null}
                                                        onChange={opt => updateInfo(i, 'driver_id', opt?.value || null)}
                                                        styles={selectStyles} placeholder="انتخاب راننده..."
                                                        menuPortalTarget={typeof document !== 'undefined' ? document.body : null} menuPosition="fixed"
                                                        isClearable noOptionsMessage={() => 'موردی یافت نشد'} />
                                            </div>
                                            {/* وضعیت */}
                                            <div className="col-span-2">
                                                <label className="form-label">وضعیت (اختیاری)</label>
                                                <select value={info.status}
                                                        onChange={e => updateInfo(i, 'status', e.target.value)}
                                                        className="form-select">
                                                    <option value="">انتخاب نشده</option>
                                                    <option value="request">درخواست</option>
                                                    <option value="waiting">در انتظار</option>
                                                    <option value="accepted">پذیرفته</option>
                                                    <option value="rejected">رد شده</option>
                                                    <option value="departure">ترخیص</option>
                                                </select>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => router.back()} className="btn btn-ghost">انصراف</button>
                            <button type="submit" disabled={mutation.isPending} className="btn btn-primary btn-lg">
                                {mutation.isPending
                                    ? <><FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />در حال ذخیره...</>
                                    : <><FontAwesomeIcon icon={faSave} className="w-4 h-4" />ذخیره تغییرات</>
                                }
                            </button>
                        </div>
                    </form>
                </div>
            </div>
    )
}