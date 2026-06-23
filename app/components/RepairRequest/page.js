'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import DashboardLayout from "@/app/dashboard/Dashboardlayout"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons'

const centers = [
    { code: '101', name: 'مرکز هزینه 101' },
    { code: '102', name: 'مرکز هزینه 102' },
    { code: '103', name: 'مرکز هزینه 103' },
    { code: '104', name: 'مرکز هزینه 104' },
    { code: '105', name: 'مرکز هزینه 105' },
]

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

    const filteredCenters = centerSearch.length >= 2
        ? centers.filter(c => c.name.includes(centerSearch) || c.code.includes(centerSearch))
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

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!validateForm()) return
        if (canDirectAccept) {
            alert('پذیرش مستقیم با موفقیت ثبت شد')
            router.push('/requests')
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
        e.target.style.boxShadow   = `0 0 0 3px ${err ? 'rgba(220,38,38,0.12)' : 'rgba(84,76,207,0.15)'}`
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
                <div className="bg-gradient-to-r mx-10 from-blue-600 to-indigo-600 px-8 rounded-t-lg py-6 shadow-xl"
                     style={{ border: '1px solid var(--border)' }}>
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

                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* مرکز هزینه */}
                            <div className="relative" ref={dropdownRef}>
                                <label style={labelStyle}>
                                    مرکز هزینه <span style={{ color: 'var(--danger)' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    value={centerSearch || formData.centerCode}
                                    placeholder="حداقل 2 حرف وارد کنید..."
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
                                                <li key={center.code}
                                                    onClick={() => {
                                                        setFormData({ ...formData, centerCode: center.code })
                                                        setCenterSearch(center.name)
                                                        setShowDropdown(false)
                                                    }}
                                                    className="px-4 py-2.5 cursor-pointer text-sm transition-colors"
                                                    style={{ color: 'var(--text)' }}
                                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    {center.name} ({center.code})
                                                </li>
                                            ))}
                                        </motion.ul>
                                    )}
                                </AnimatePresence>
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
                                               className="flex-1 h-14 text-white rounded-xl font-bold text-lg shadow-lg transition-all"
                                               style={{
                                                   background: canDirectAccept
                                                       ? 'linear-gradient(135deg, #10b981, #059669)'
                                                       : 'linear-gradient(135deg, #059669, #047857)',
                                               }}>
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