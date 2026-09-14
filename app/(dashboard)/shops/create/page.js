// app/shops/create/page.js
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave, faArrowLeft, faExclamationCircle, faSpinner } from '@fortawesome/free-solid-svg-icons'
import Swal from '@/app/utils/swal'
import { shopsApi } from '@/app/api/client/shopsApi'
import { shopsCache } from '@/app/hooks/useShops'

const ErrorMsg = ({ error }) => error ? (
    <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="form-error">
        <FontAwesomeIcon icon={faExclamationCircle} className="w-3.5 h-3.5 ml-1" />
        {error}
    </motion.p>
) : null

export default function CreateShop() {
    const router = useRouter()
    const [formData, setFormData] = useState({ name: '', code: '', type: 'inside', fee: '', description: '' })
    const [loading, setLoading]   = useState(false)
    const [errors,  setErrors]    = useState({})

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
    }

    const validate = () => {
        const errs = {}
        if (!formData.name.trim()) errs.name = 'نام شاپ الزامی است'
        if (!formData.code.trim()) errs.code = 'کد شاپ الزامی است'
        setErrors(errs)
        return !Object.keys(errs).length
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validate()) return

        setLoading(true)
        try {
            const payload = {
                name: formData.name.trim(),
                code: formData.code.trim(),
                type: formData.type,
                ...(formData.fee         && { fee: Number(formData.fee) }),
                ...(formData.description && { description: formData.description.trim() }),
            }
            const result = await shopsApi.create(payload)

            // ⭐ cache رو به روز کن نه invalidate — تا تغییرات قبلی حفظ بشه
            const newShop = result.data?.shop
            if (newShop) shopsCache.prepend(newShop)

            await Swal.fire({ title: 'موفق!', text: 'شاپ با موفقیت ایجاد شد', icon: 'success', timer: 2000, showConfirmButton: false })
            router.push('/shops')
        } catch (err) {
            await Swal.fire({ title: 'خطا', text: err.message || 'مشکلی رخ داد', icon: 'error' })
        } finally {
            setLoading(false)
        }
    }

    return (
            <div className="w-full min-h-screen" style={{ background: 'var(--bg)' }}>
                <div className="page-header-bar">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-black text-white mb-0.5">افزودن شاپ جدید</h1>
                            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>ثبت اطلاعات شاپ جدید</p>
                        </div>
                        <button onClick={() => router.back()} className="btn btn-back">
                            <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
                            بازگشت
                        </button>
                    </div>
                </div>

                <div className="p-6 max-w-4xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card">
                        <form onSubmit={handleSubmit}>
                            <div className="card-body">
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="form-label"><span style={{ color: 'var(--danger)' }}>* </span>نام شاپ</label>
                                        <input type="text" name="name" value={formData.name} onChange={handleChange}
                                               placeholder="مثال: شاپ تهران"
                                               className={`form-input ${errors.name ? 'error' : ''}`} />
                                        <ErrorMsg error={errors.name} />
                                    </div>
                                    <div>
                                        <label className="form-label"><span style={{ color: 'var(--danger)' }}>* </span>کد شاپ</label>
                                        <input type="text" name="code" value={formData.code} onChange={handleChange}
                                               placeholder="مثال: THR001"
                                               className={`form-input ${errors.code ? 'error' : ''}`} />
                                        <ErrorMsg error={errors.code} />
                                    </div>
                                    <div>
                                        <label className="form-label">نوع</label>
                                        <select name="type" value={formData.type} onChange={handleChange} className="form-select">
                                            <option value="inside">داخلی</option>
                                            <option value="outside">خارجی</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="form-label">هزینه (ریال)</label>
                                        <input type="number" name="fee" value={formData.fee} onChange={handleChange}
                                               min="0" step="1000" placeholder="مثال: 1000000" className="form-input" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="form-label">توضیحات</label>
                                        <textarea name="description" value={formData.description} onChange={handleChange}
                                                  rows={4} placeholder="توضیحات اضافی..." className="form-textarea" />
                                    </div>
                                </div>
                                <div className="mt-5 alert alert-info">
                                    فیلدهای علامت‌دار با <span style={{ color: 'var(--danger)' }}>*</span> الزامی هستند.
                                </div>
                            </div>
                            <div className="card-footer flex gap-3 justify-end">
                                <button type="button" onClick={() => router.back()} className="btn btn-ghost">انصراف</button>
                                <button type="submit" disabled={loading} className="btn btn-success">
                                    <FontAwesomeIcon icon={loading ? faSpinner : faSave} className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                    {loading ? 'در حال ذخیره...' : 'ذخیره شاپ'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </div>
    )
}