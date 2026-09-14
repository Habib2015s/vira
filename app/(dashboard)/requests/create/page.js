'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave, faArrowLeft, faExclamationCircle } from '@fortawesome/free-solid-svg-icons'
import { useRouter } from 'next/navigation'
import Swal from '@/app/utils/swal'
import { useQueryClient } from '@tanstack/react-query'
import Select from 'react-select'
import { ENV, getHeaders } from '@/app/config/env'


export default function CreateTmCodePage() {
    const queryClient = useQueryClient()
    const router      = useRouter()
    const [shops,      setShops]      = useState([])
    const [pmGroups,   setPmGroups]   = useState([])
    const [loading,    setLoading]    = useState(false)
    const [errors,     setErrors]     = useState({})

    const [formData, setFormData] = useState({
        code: '', title: '', shop_id: '', type: 'CM',
        hours: 0, amount_per_hours: 0, max_cost: 0,
        base_amount: 0, mechanism_group_id: null, is_active: 'Y'
    })

    useEffect(() => {
        Promise.all([
            fetch(ENV.API_SHOPS,    { headers: getHeaders() }).then(r => r.json()),
            fetch(ENV.API_SHOPS.replace('/shops', '/pmGroups'), { headers: getHeaders() }).then(r => r.json()),
        ]).then(([shopsRes, groupsRes]) => {
            setShops(shopsRes.data?.shops?.data || [])
            setPmGroups(groupsRes.data?.pmGroups?.data || [])
        }).catch(console.error)
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
    }

    const normalizeInt = (val) => (val ? parseInt(val) : 0)

    // ⭐⭐ تغییر اصلی: mechanism_group_id به لیست الزامی‌ها اضافه شد
    // چون بک‌اند اونو required می‌خواد (طبق پاسخ 422 که برگردوند)
    const validateForm = () => {
        const newErrors = {}
        if (!formData.code.trim())      newErrors.code                = 'کد الزامی است'
        if (!formData.title.trim())     newErrors.title               = 'عنوان الزامی است'
        if (!formData.shop_id)          newErrors.shop_id             = 'انتخاب شاپ الزامی است'
        if (!formData.mechanism_group_id) newErrors.mechanism_group_id = 'انتخاب گروه مکانیزم الزامی است'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validateForm()) {
            Swal.fire({ title: 'خطا!', text: 'لطفاً فیلدهای الزامی را پر کنید', icon: 'error', confirmButtonColor: 'var(--primary)' })
            return
        }
        try {
            setLoading(true)
            const res = await fetch(ENV.API_TM_CODES, {
                method: 'POST', headers: getHeaders(),
                body: JSON.stringify({
                    code:               formData.code,
                    title:              formData.title,
                    shop_id:            normalizeInt(formData.shop_id),
                    type:               formData.type,
                    hours:              normalizeInt(formData.hours),
                    amount_per_hours:   normalizeInt(formData.amount_per_hours),
                    max_cost:           normalizeInt(formData.max_cost),
                    base_amount:        normalizeInt(formData.base_amount),
                    // ⭐ دیگه undefined نمیشه چون validate قبلش جلوش رو می‌گیره
                    mechanism_group_id: parseInt(formData.mechanism_group_id),
                    is_active:          formData.is_active,
                })
            })
            if (res.ok) {
                await queryClient.invalidateQueries({ queryKey: ['tmCodes'] })
                await Swal.fire({ title: 'موفق!', text: 'کد تعمیر با موفقیت ایجاد شد', icon: 'success', timer: 2000, showConfirmButton: false })
                router.push('/requests/list')
            } else {
                const err = await res.json()
                // ⭐ خواندن درست پیام خطای validation لاراول (errors.field[0])، نه فقط message
                let msg = 'مشکلی رخ داد'
                if (err?.errors && typeof err.errors === 'object') {
                    const firstKey = Object.keys(err.errors)[0]
                    msg = err.errors[firstKey]?.[0] || err.message || msg
                } else if (typeof err?.message === 'string') {
                    msg = err.message
                }
                Swal.fire({ title: 'خطا', text: msg, icon: 'error' })

                // ⭐ اگه خطای validation مربوط به فیلد خاصی بود، زیر همون فیلد هم نشون بده
                if (err?.errors && typeof err.errors === 'object') {
                    const fieldErrors = {}
                    Object.entries(err.errors).forEach(([k, v]) => { fieldErrors[k] = Array.isArray(v) ? v[0] : v })
                    setErrors(prev => ({ ...prev, ...fieldErrors }))
                }
            }
        } catch {
            Swal.fire({ title: 'خطا', text: 'مشکل در اتصال', icon: 'error' })
        } finally { setLoading(false) }
    }

    const ErrorMsg = ({ error }) => error ? (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1.5 mt-1.5" style={{ color: 'var(--danger)' }}>
            <FontAwesomeIcon icon={faExclamationCircle} className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">{error}</span>
        </motion.div>
    ) : null

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

    const shopOptions    = shops.map(s => ({ value: s.id, label: `${s.name} (${s.code})` }))
    const pmGroupOptions = pmGroups.map(g => ({
        value: g.id,
        label: `${g.mechanism_group_code || g.id}${g.description ? ` — ${g.description}` : ''}`,
    }))

    const fieldStyle = (hasError = false) => ({
        width: '100%', height: '48px', padding: '0 16px', borderRadius: '8px', fontSize: '14px',
        fontWeight: 500, outline: 'none', background: 'var(--surface)', color: 'var(--text)',
        border: `2px solid ${hasError ? 'var(--danger)' : 'var(--border)'}`, transition: 'border-color 0.15s',
    })
    const onFocus = (e, err) => { e.target.style.borderColor = err ? 'var(--danger)' : 'var(--primary)'; e.target.style.boxShadow = `0 0 0 3px ${err ? 'rgba(220,38,38,0.12)' : 'rgba(24,24,27,0.15)'}` }
    const onBlur  = (e, err) => { e.target.style.borderColor = err ? 'var(--danger)' : 'var(--border)'; e.target.style.boxShadow = 'none' }
    const L = ({ text, required }) => (
        <label className="form-label">
            {required && <span style={{ color: 'var(--danger)' }}>* </span>}{text}
        </label>
    )

    return (
            <div className="w-full min-h-screen" style={{ background: 'var(--bg)' }}>
                <div className="page-header-bar">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-black text-white">افزودن کد تعمیر</h1>
                            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>ایجاد کد تعمیر جدید</p>
                        </div>
                        <button onClick={() => router.back()} className="btn btn-back btn-sm">
                            <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" />بازگشت
                        </button>
                    </div>
                </div>

                <div className="page-content max-w-4xl">
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card">
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                    <div>
                                        <L text="کد" required />
                                        <input type="text" name="code" value={formData.code} onChange={handleChange}
                                               style={fieldStyle(!!errors.code)} placeholder="مثال: CM-001"
                                               onFocus={e => onFocus(e, !!errors.code)} onBlur={e => onBlur(e, !!errors.code)} />
                                        <ErrorMsg error={errors.code} />
                                    </div>

                                    <div>
                                        <L text="عنوان" required />
                                        <input type="text" name="title" value={formData.title} onChange={handleChange}
                                               style={fieldStyle(!!errors.title)} placeholder="مثال: تعمیر موتور"
                                               onFocus={e => onFocus(e, !!errors.title)} onBlur={e => onBlur(e, !!errors.title)} />
                                        <ErrorMsg error={errors.title} />
                                    </div>

                                    <div>
                                        <L text="شاپ" required />
                                        <Select options={shopOptions}
                                                value={shopOptions.find(o => o.value === Number(formData.shop_id)) || null}
                                                onChange={s => setFormData(p => ({ ...p, shop_id: s?.value || '' }))}
                                                placeholder="حداقل ۲ کاراکتر تایپ کنید..."
                                                isClearable isSearchable
                                                noOptionsMessage={({ inputValue }) => inputValue.length < 2 ? 'حداقل ۲ کاراکتر وارد کنید' : 'نتیجه‌ای یافت نشد'}
                                                filterOption={(opt, input) => input.length >= 2 && opt.label.toLowerCase().includes(input.toLowerCase())}
                                                styles={{ ...selectStyles, control: (b, s) => ({ ...selectStyles.control(b, s), borderColor: errors.shop_id ? 'var(--danger)' : s.isFocused ? 'var(--primary)' : 'var(--border)' }) }}
                                                menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                                menuPosition="fixed" />
                                        <ErrorMsg error={errors.shop_id} />
                                    </div>

                                    <div>
                                        <L text="نوع" />
                                        <select name="type" value={formData.type} onChange={handleChange}
                                                style={fieldStyle()} onFocus={e => onFocus(e, false)} onBlur={e => onBlur(e, false)}>
                                            <option value="CM">CM — تعمیر اصلاحی</option>
                                            <option value="PM">PM — نگهداری پیشگیرانه</option>
                                            <option value="EM">EM — اضطراری</option>
                                        </select>
                                    </div>

                                    <div>
                                        <L text="ساعت" />
                                        <input type="number" name="hours" value={formData.hours} onChange={handleChange} min="0"
                                               style={fieldStyle()} placeholder="۰"
                                               onFocus={e => onFocus(e, false)} onBlur={e => onBlur(e, false)} />
                                    </div>

                                    <div>
                                        <L text="مبلغ بر ساعت (ریال)" />
                                        <input type="number" name="amount_per_hours" value={formData.amount_per_hours} onChange={handleChange} min="0"
                                               style={fieldStyle()} placeholder="۰"
                                               onFocus={e => onFocus(e, false)} onBlur={e => onBlur(e, false)} />
                                    </div>

                                    <div>
                                        <L text="حداکثر هزینه (ریال)" />
                                        <input type="number" name="max_cost" value={formData.max_cost} onChange={handleChange} min="0"
                                               style={fieldStyle()} placeholder="۰"
                                               onFocus={e => onFocus(e, false)} onBlur={e => onBlur(e, false)} />
                                    </div>

                                    <div>
                                        <L text="هزینه پایه (ریال)" />
                                        <input type="number" name="base_amount" value={formData.base_amount} onChange={handleChange} min="0"
                                               style={fieldStyle()} placeholder="۰"
                                               onFocus={e => onFocus(e, false)} onBlur={e => onBlur(e, false)} />
                                    </div>

                                    {/* ⭐ گروه مکانیزم — الان required، دیگه "اختیاری" نیست */}
                                    <div>
                                        <L text="گروه مکانیزم" required />
                                        <Select
                                            options={pmGroupOptions}
                                            value={pmGroupOptions.find(o => o.value === formData.mechanism_group_id) || null}
                                            onChange={opt => { setFormData(p => ({ ...p, mechanism_group_id: opt?.value || null })); setErrors(p => ({ ...p, mechanism_group_id: '' })) }}
                                            placeholder={pmGroups.length === 0 ? 'در حال بارگذاری...' : 'انتخاب گروه مکانیزم...'}
                                            isClearable isSearchable
                                            noOptionsMessage={() => 'گروهی یافت نشد'}
                                            styles={{ ...selectStyles, control: (b, s) => ({ ...selectStyles.control(b, s), borderColor: errors.mechanism_group_id ? 'var(--danger)' : s.isFocused ? 'var(--primary)' : 'var(--border)' }) }}
                                            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                            menuPosition="fixed"
                                        />
                                        <ErrorMsg error={errors.mechanism_group_id} />
                                    </div>

                                    <div>
                                        <L text="وضعیت" />
                                        <select name="is_active" value={formData.is_active} onChange={handleChange}
                                                style={fieldStyle()} onFocus={e => onFocus(e, false)} onBlur={e => onBlur(e, false)}>
                                            <option value="Y">فعال</option>
                                            <option value="N">غیرفعال</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-5 p-3 rounded-xl text-sm"
                                     style={{ background: 'var(--info-light)', border: '1px solid var(--info)33' }}>
                                    <span style={{ color: 'var(--info)' }}>
                                        ℹ️ فیلدهای علامت‌دار با <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>*</span> الزامی هستند.
                                    </span>
                                </div>

                                <div className="mt-6 flex justify-end gap-3">
                                    <button type="button" onClick={() => router.back()} className="btn btn-ghost">انصراف</button>
                                    <button type="submit" disabled={loading} className="btn btn-success">
                                        {loading
                                            ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />در حال ثبت...</>
                                            : <><FontAwesomeIcon icon={faSave} className="w-4 h-4" />ثبت کد تعمیر</>
                                        }
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </div>
    )
}