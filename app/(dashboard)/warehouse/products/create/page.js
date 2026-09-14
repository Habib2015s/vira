'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave, faArrowLeft, faExclamationCircle, faBox } from '@fortawesome/free-solid-svg-icons'
import Swal from '@/app/utils/swal'
import { ENV } from '@/app/config/env'
import PersianDatePicker from '@/app/components/shared/PersianDatePicker'
const ErrorMsg = ({ error }) => {
    if (!error) return null
    return (
        <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="form-error flex items-center gap-1 text-red-600 text-sm mt-1">
            <FontAwesomeIcon icon={faExclamationCircle} className="w-3.5 h-3.5" />
            {error}
        </motion.p>
    )
}

export default function CreateProduct() {
    const [selectedDate, setSelectedDate] = useState(null)
    const router = useRouter()
    const [formData, setFormData] = useState({
        code: '', name: '', storehouse_id: '', unit_id: '', count: '', single_amount: '', purchase_date: '', order_threshold: '',
        color: '', length: '', width: '', height: '', weight: '', technical_description: '', fa_description: '', en_description: ''
    })
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})
    const [storehouses, setStorehouses] = useState([])
    const [units, setUnits] = useState([])
    const [loadingStorehouses, setLoadingStorehouses] = useState(false)
    const [loadingUnits, setLoadingUnits] = useState(false)

    useEffect(() => {
        fetchStorehouses()
        fetchUnits()
    }, [])

    const fetchStorehouses = async () => {
        setLoadingStorehouses(true)
        try {
            const res = await fetch(`${ENV.API_WAREHOUSE_STOREHOUSES}`)
            const data = await res.json()
            setStorehouses(data.data?.storehouses?.data || [])
        } catch (e) { console.error(e) }
        finally { setLoadingStorehouses(false) }
    }

    const fetchUnits = async () => {
        setLoadingUnits(true)
        try {
            const res = await fetch(`${ENV.API_WAREHOUSE_UNITS}`)
            const data = await res.json()
            setUnits(data.data?.units?.data || [])
        } catch (e) { console.error(e) }
        finally { setLoadingUnits(false) }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
    }

    const validate = () => {
        const errs = {}
        const requiredFields = ['code','name','storehouse_id','unit_id','count','single_amount','purchase_date','order_threshold']
        requiredFields.forEach(f => { if (!formData[f]?.toString().trim()) errs[f]='این فیلد الزامی است' })
        setErrors(errs)
        return Object.keys(errs).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validate()) { Swal.fire({ title:'خطا!', text:'لطفاً فیلدهای الزامی را پر کنید', icon:'error' }); return }

        setLoading(true)
        try {
            const payload = {
                code: formData.code.trim(),
                name: formData.name.trim(),
                storehouse_id: formData.storehouse_id,
                unit_id: formData.unit_id,
                count: parseFloat(formData.count),
                single_amount: parseFloat(formData.single_amount),
                purchase_date: formData.purchase_date,
                order_threshold: parseFloat(formData.order_threshold),
                color: formData.color,
                length: parseFloat(formData.length) || 0,
                width: parseFloat(formData.width) || 0,
                height: parseFloat(formData.height) || 0,
                weight: parseFloat(formData.weight) || 0,
                technical_description: formData.technical_description,
                fa_description: formData.fa_description,
                en_description: formData.en_description
            }

            const res = await fetch(`${ENV.API_WAREHOUSE_PRODUCTS}`, {
                method:'POST',
                headers:{ 'Content-Type':'application/json', 'Accept':'application/json' },
                body: JSON.stringify(payload)
            })
            const result = await res.json()
            if (!res.ok) throw new Error(result.message || 'خطا در ایجاد محصول')

            await Swal.fire({ title:'موفق!', text:'محصول با موفقیت ایجاد شد', icon:'success', timer:2000, showConfirmButton:false })
            router.push('/warehouse/products')
        } catch (err) {
            await Swal.fire({ title:'خطا', text:err.message, icon:'error' })
        } finally { setLoading(false) }
    }

    return (
            <div className="w-full min-h-screen" style={{ background: 'var(--bg)' }}>

                {/* Header */}
                <div className="page-header-bar">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-black text-white mb-0.5 flex items-center gap-2">
                                <FontAwesomeIcon icon={faBox} className="w-5 h-5"/>
                                افزودن محصول جدید
                            </h1>
                            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>ثبت محصول در انبار</p>
                        </div>
                        <button onClick={() => router.back()} className="btn btn-back ">
                            <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
                            بازگشت
                        </button>
                    </div>
                </div>

                <div className="p-6 max-w-4xl mx-auto">
                    <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className="card">
                        <form onSubmit={handleSubmit}>
                            <div className="card-body grid grid-cols-2 gap-5">

                                {/* کد محصول */}
                                <div>
                                    <label className="form-label"><span style={{ color: 'var(--danger)' }}>* </span>کد محصول</label>
                                    <input type="text" name="code" value={formData.code} onChange={handleChange} className={`form-input ${errors.code?'error':''}`} placeholder="مثال: PRD001"/>
                                    <ErrorMsg error={errors.code}/>
                                </div>

                                {/* نام محصول */}
                                <div>
                                    <label className="form-label"><span style={{ color: 'var(--danger)' }}>* </span>نام محصول</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} className={`form-input ${errors.name?'error':''}`} placeholder="مثال: پیچ 6 میلی"/>
                                    <ErrorMsg error={errors.name}/>
                                </div>

                                {/* انبار */}
                                <div>
                                    <label className="form-label"><span style={{ color: 'var(--danger)' }}>* </span>انبار</label>
                                    <select name="storehouse_id" value={formData.storehouse_id} onChange={handleChange} className="form-select">
                                        <option value="">انتخاب انبار</option>
                                        {loadingStorehouses ? <option disabled>در حال بارگذاری...</option> : storehouses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                    <ErrorMsg error={errors.storehouse_id}/>
                                </div>

                                {/* واحد */}
                                <div>
                                    <label className="form-label"><span style={{ color: 'var(--danger)' }}>* </span>واحد</label>
                                    <select name="unit_id" value={formData.unit_id} onChange={handleChange} className="form-select">
                                        <option value="">انتخاب واحد</option>
                                        {loadingUnits ? <option disabled>در حال بارگذاری...</option> : units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </select>
                                    <ErrorMsg error={errors.unit_id}/>
                                </div>

                                {/* موجودی */}
                                <div>
                                    <label className="form-label"><span style={{ color: 'var(--danger)' }}>* </span>موجودی</label>
                                    <input type="number" name="count" value={formData.count} onChange={handleChange} className={`form-input ${errors.count?'error':''}`} placeholder="مثال: 100"/>
                                    <ErrorMsg error={errors.count}/>
                                </div>

                                {/* قیمت واحد */}
                                <div>
                                    <label className="form-label"><span style={{ color: 'var(--danger)' }}>* </span>قیمت واحد (ریال)</label>
                                    <input type="number" name="single_amount" value={formData.single_amount} onChange={handleChange} className={`form-input ${errors.single_amount?'error':''}`} placeholder="مثال: 50000"/>
                                    <ErrorMsg error={errors.single_amount}/>
                                </div>

                                {/* تاریخ خرید */}
                                <div>
                                    <div>
                                        <PersianDatePicker
                                            value={selectedDate?.jDate || ''}
                                            onChange={(date) => {
                                                setSelectedDate(date)
                                                setFormData(prev => ({
                                                    ...prev,
                                                    purchase_date: date?.isoDateTime || ''
                                                }))
                                            }}
                                            required
                                            label="تاریخ خرید"
                                        />
                                        <ErrorMsg error={errors.purchase_date}/>
                                    </div>
                                    <ErrorMsg error={errors.purchase_date}/>
                                </div>

                                {/* حد سفارش */}
                                <div>
                                    <label className="form-label"><span style={{ color: 'var(--danger)' }}>* </span>حد سفارش</label>
                                    <input type="number" name="order_threshold" value={formData.order_threshold} onChange={handleChange} className={`form-input ${errors.order_threshold?'error':''}`} placeholder="مثال: 10"/>
                                    <ErrorMsg error={errors.order_threshold}/>
                                </div>

                                {/* رنگ */}
                                <div>
                                    <label className="form-label">رنگ</label>
                                    <input type="text" name="color" value={formData.color} onChange={handleChange} className="form-input" placeholder="مثال: آبی"/>
                                </div>

                                {/* طول */}
                                <div>
                                    <label className="form-label">طول (سانتی‌متر)</label>
                                    <input type="number" name="length" value={formData.length} onChange={handleChange} className="form-input"/>
                                </div>

                                {/* عرض */}
                                <div>
                                    <label className="form-label">عرض (سانتی‌متر)</label>
                                    <input type="number" name="width" value={formData.width} onChange={handleChange} className="form-input"/>
                                </div>

                                {/* ارتفاع */}
                                <div>
                                    <label className="form-label">ارتفاع (سانتی‌متر)</label>
                                    <input type="number" name="height" value={formData.height} onChange={handleChange} className="form-input"/>
                                </div>

                                {/* وزن */}
                                <div>
                                    <label className="form-label">وزن (کیلوگرم)</label>
                                    <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="form-input"/>
                                </div>

                                {/* توضیحات فنی */}
                                <div className="col-span-2">
                                    <label className="form-label">شرح فنی</label>
                                    <textarea name="technical_description" value={formData.technical_description} onChange={handleChange} rows={3} className="form-textarea"/>
                                </div>

                                {/* توضیحات فارسی و انگلیسی */}
                                <div className="col-span-2 grid grid-cols-2 gap-5">
                                    <textarea name="fa_description" value={formData.fa_description} onChange={handleChange} rows={3} className="form-textarea" placeholder="توضیحات فارسی"/>
                                    <textarea name="en_description" value={formData.en_description} onChange={handleChange} rows={3} className="form-textarea" placeholder="English description"/>
                                </div>

                            </div>

                            <div className="mt-5 p-4 rounded-xl alert alert-info col-span-2">
                                فیلدهای علامت‌دار با <span style={{ color: 'var(--danger)' }}>*</span> الزامی هستند.
                            </div>

                            {/* Footer */}
                            <div className="card-footer flex gap-3 justify-end mt-4">
                                <button type="button" onClick={() => router.back()} className="btn btn-ghost">انصراف</button>
                                <button type="submit" disabled={loading} className="btn btn-success flex items-center gap-2">
                                    <FontAwesomeIcon icon={loading?faExclamationCircle:faSave} className={`w-4 h-4 ${loading?'animate-spin':''}`} />
                                    {loading?'در حال ذخیره...':'ذخیره محصول'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </div>
    )
}