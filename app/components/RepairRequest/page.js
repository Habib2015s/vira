'use client'

import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import DashboardLayout from "@/app/dashboard/Dashboardlayout"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationCircle, faSpinner, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import Swal from 'sweetalert2'
import { ENV, getHeaders } from '@/app/config/env'

// ⭐⭐⭐ نکته: مطمئن نیستیم مرکز هزینه دقیقاً همین endpoint هست یا نه.
// اگه بعد از تست معلوم شد endpoint درستی نیست، فقط همین یک خط رو عوض کن:
const COST_CENTER_ENDPOINT = ENV.API_ACCOUNT_SIDES

export default function DirectRequestPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const dropdownRef = useRef(null)

    const [formData, setFormData] = useState({
        centerCode: searchParams.get('centerCode') || '',
        kmBefore:   searchParams.get('kmBefore')   || '',
        km:         searchParams.get('km')          || ''
    })
    const [errors, setErrors]               = useState({})
    const [canDirectAccept, setCanDirectAccept] = useState(false)
    const [centerSearch, setCenterSearch]   = useState('')
    const [showDropdown, setShowDropdown]   = useState(false)

    const { data: centers = [], isLoading: centersLoading, error: centersError } = useQuery({
        queryKey: ['costCenters'],
        queryFn: async () => {
            const r   = await fetch(COST_CENTER_ENDPOINT, { headers: getHeaders() })
            const res = await r.json().catch(() => ({}))
            if (!r.ok) throw new Error(res?.message || `خطای ${r.status} در دریافت مراکز هزینه`)
            const list =
                res.data?.accountSides?.data ??
                res.data?.accountSides ??
                res.data?.data ??
                res.data ??
                []
            return Array.isArray(list) ? list : []
        },
        staleTime: 5 * 60 * 1000,
        retry: 1,
    })

    const filteredCenters = centerSearch.length >= 2
        ? centers.filter(c =>
            (c.name || c.title || '').includes(centerSearch) ||
            (c.code || '').toString().includes(centerSearch)
        )
        : []

    useEffect(() => {
        setCanDirectAccept(!!(formData.centerCode && formData.kmBefore && formData.km))
    }, [formData])

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false)
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const validateForm = () => {
        const newErrors = {}
        if (!formData.centerCode) newErrors.centerCode = 'انتخاب مرکز هزینه الزامی است'
        if (!formData.kmBefore)   newErrors.kmBefore   = 'وارد کردن کیلومتر قبل الزامی است'
        if (!formData.km)         newErrors.km         = 'وارد کردن کیلومتر فعلی الزامی است'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validateForm()) return

        if (canDirectAccept) {
            // ⭐⭐ تغییر اصلی ۱: alert() ساده مرورگر به Swal.fire تبدیل شد
            await Swal.fire({
                icon: 'success',
                title: 'پذیرش مستقیم ثبت شد',
                text: 'استعلام با موفقیت انجام شد.',
                timer: 2000,
                showConfirmButton: false,
            })
            // ⭐⭐ تغییر اصلی ۲: مسیر قبلی '/requests' وجود نداشت (404 → صفحه سفید).
            // این مسیر رو با /requests/list جایگزین کردیم چون این الگویی است
            // که بقیه صفحات پروژه (مثل CreateTmCodePage) بعد از ثبت موفق ازش استفاده می‌کنن.
            router.push('/requests/list')
        } else {
            router.push(`/requests/edit/new?centerCode=${formData.centerCode}&kmBefore=${formData.kmBefore}&km=${formData.km}`)
        }
    }

    // استایل یکپارچه input
    const inputStyle = (hasError) => ({
        width: '100%', height: '56px', padding: '0 16px',
        borderRadius: '12px', fontSize: '14px', outline: 'none',
        background: 'var(--surface)',
        color: 'var(--text)',
        border: `2px solid ${hasError ? 'var(--danger)' : 'var(--border)'}`,
        transition: 'border-color 0.15s, box-shadow 0.15s',
        fontFamily: 'var(--font)',
    })
    const onFocus = (e, err) => {
        e.target.style.borderColor = err ? 'var(--danger)' : 'var(--primary)'
        e.target.style.boxShadow   = `0 0 0 3px ${err ? 'rgba(220,38,38,0.12)' : 'rgba(24,24,27,0.15)'}`
    }
    const onBlur = (e, err) => {
        e.target.style.borderColor = err ? 'var(--danger)' : 'var(--border)'
        e.target.style.boxShadow   = 'none'
    }

    const ErrorMessage = ({ error }) => {
        if (!error) return null
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="mt-1.5 text-sm flex items-center gap-1.5"
                        style={{ color: 'var(--danger)' }}>
                <FontAwesomeIcon icon={faExclamationCircle} className="w-3.5 h-3.5" />
                {error}
            </motion.div>
        )
    }

    const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-soft)', marginBottom: '8px' }

    return (
        <DashboardLayout>
            <div className="w-full p-6 pt-16" style={{ background: 'var(--bg)' }}>

                {/* هدر */}
                <div className="mx-10 px-8 rounded-t-lg py-6 shadow-xl"
                     style={{ background: 'var(--primary)', border: '1px solid var(--border)' }}>
                    <h1 className="text-xl font-bold text-white">ثبت درخواست تعمیر</h1>
                </div>

                <div className="p-6 flex items-center justify-center min-h-[calc(100vh-200px)]">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="rounded-3xl shadow-2xl p-8 w-full max-w-3xl"
                        style={{
                            background: 'var(--surface)',
                            border: '2px solid var(--border)',
                        }}
                    >
                        {/* عنوان فرم */}
                        <div className="rounded-2xl p-6 mb-6 text-center"
                             style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>
                                فرم پذیرش {canDirectAccept ? 'مستقیم' : 'تعمیر'}
                            </h2>
                            {canDirectAccept ? (
                                <p className="font-medium" style={{ color: 'var(--success)' }}>
                                    ✓ شرایط پذیرش مستقیم برقرار است
                                </p>
                            ) : (
                                <p className="font-medium" style={{ color: 'var(--warning)' }}>
                                    ! برای ثبت درخواست، اطلاعات الزامی را تکمیل کنید
                                </p>
                            )}
                        </div>

                        {centersError && (
                            <div className="mb-4 p-3 rounded-xl flex items-start gap-2.5 text-sm"
                                 style={{ background: 'var(--danger-light)', border: '1px solid var(--danger)', color: 'var(--danger)' }}>
                                <FontAwesomeIcon icon={faTriangleExclamation} className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold">دریافت لیست مراکز هزینه ناموفق بود: {centersError.message}</p>
                                    <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
                                        اگه این خطا ادامه داشت، احتمالاً endpoint واقعی «مرکز هزینه» با account-sides فرق داره — باید از بک‌اند بپرسی مسیر درست چیه.
                                    </p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* مرکز هزینه */}
                            <div className="relative" ref={dropdownRef}>
                                <label style={labelStyle}>
                                    مرکز هزینه <span style={{ color: 'var(--danger)' }}>*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={centerSearch || formData.centerCode}
                                        placeholder={centersLoading ? 'در حال بارگذاری مراکز هزینه...' : 'حداقل 2 حرف وارد کنید...'}
                                        disabled={centersLoading || !!centersError}
                                        onChange={(e) => {
                                            setCenterSearch(e.target.value)
                                            setShowDropdown(e.target.value.length >= 2)
                                            if (errors.centerCode) setErrors({ ...errors, centerCode: '' })
                                        }}
                                        onFocus={(e) => {
                                            if (centerSearch.length >= 2) setShowDropdown(true)
                                            onFocus(e, !!errors.centerCode)
                                        }}
                                        onBlur={(e) => onBlur(e, !!errors.centerCode)}
                                        style={inputStyle(!!errors.centerCode)}
                                    />
                                    {centersLoading && (
                                        <FontAwesomeIcon icon={faSpinner}
                                                         className="animate-spin absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
                                                         style={{ color: 'var(--muted)' }} />
                                    )}
                                </div>
                                <ErrorMessage error={errors.centerCode} />

                                <AnimatePresence>
                                    {showDropdown && filteredCenters.length > 0 && (
                                        <motion.ul
                                            initial={{ opacity: 0, y: -8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            className="absolute z-50 w-full rounded-xl overflow-hidden mt-1"
                                            style={{
                                                background: 'var(--surface)',
                                                border: '1.5px solid var(--border)',
                                                boxShadow: 'var(--shadow-lg)',
                                                maxHeight: '240px',
                                                overflowY: 'auto',
                                            }}
                                        >
                                            {filteredCenters.map(center => (
                                                <li key={center.code || center.id}
                                                    onClick={() => {
                                                        setFormData({ ...formData, centerCode: center.code || center.id })
                                                        setCenterSearch(center.name || center.title)
                                                        setShowDropdown(false)
                                                    }}
                                                    className="px-4 py-2.5 cursor-pointer text-sm transition-colors"
                                                    style={{ color: 'var(--text)' }}
                                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    {center.name || center.title} ({center.code || center.id})
                                                </li>
                                            ))}
                                        </motion.ul>
                                    )}
                                </AnimatePresence>

                                {showDropdown && centerSearch.length >= 2 && filteredCenters.length === 0 && !centersLoading && !centersError && (
                                    <div className="absolute z-50 w-full rounded-xl mt-1 px-4 py-3 text-sm"
                                         style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', color: 'var(--text-muted)' }}>
                                        نتیجه‌ای برای «{centerSearch}» پیدا نشد
                                    </div>
                                )}
                            </div>

                            {/* کیلومترها */}
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label style={labelStyle}>
                                        کیلومتر پذیرش قبل <span style={{ color: 'var(--danger)' }}>*</span>
                                    </label>
                                    <input type="text" value={formData.kmBefore} placeholder="مثال: 50000"
                                           onChange={(e) => { setFormData({ ...formData, kmBefore: e.target.value }); if (errors.kmBefore) setErrors({ ...errors, kmBefore: '' }) }}
                                           style={inputStyle(!!errors.kmBefore)}
                                           onFocus={e => onFocus(e, !!errors.kmBefore)} onBlur={e => onBlur(e, !!errors.kmBefore)} />
                                    <ErrorMessage error={errors.kmBefore} />
                                </div>
                                <div>
                                    <label style={labelStyle}>
                                        کیلومتر <span style={{ color: 'var(--danger)' }}>*</span>
                                    </label>
                                    <input type="text" value={formData.km} placeholder="مثال: 52000"
                                           onChange={(e) => { setFormData({ ...formData, km: e.target.value }); if (errors.km) setErrors({ ...errors, km: '' }) }}
                                           style={inputStyle(!!errors.km)}
                                           onFocus={e => onFocus(e, !!errors.km)} onBlur={e => onBlur(e, !!errors.km)} />
                                    <ErrorMessage error={errors.km} />
                                </div>
                            </div>

                            {/* دکمه‌ها */}
                            <div className="flex gap-4 pt-2">
                                <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                               onClick={() => router.back()}
                                               className="flex-1 h-14 btn-back rounded-xl font-bold text-lg shadow-lg">
                                    بازگشت
                                </motion.button>
                                <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                               className="flex-1 h-14 text-white rounded-xl font-bold text-lg shadow-lg transition-all btn-success">
                                    {canDirectAccept ? 'استعلام (پذیرش مستقیم)' : 'ادامه به ثبت درخواست'}
                                </motion.button>
                            </div>
                        </form>

                        <div className="mt-6 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                            نسخه ۱.۰.۰ - سیستم مدیریت ویـــرا
                        </div>
                    </motion.div>
                </div>
            </div>
        </DashboardLayout>
    )
}