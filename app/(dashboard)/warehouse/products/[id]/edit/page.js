'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave, faArrowLeft, faBox, faSpinner, faExclamationCircle } from '@fortawesome/free-solid-svg-icons'
import Swal from 'sweetalert2'
import { ENV, getHeaders } from '@/app/config/env'
import PersianDatePicker from '@/app/components/shared/PersianDatePicker'


const ErrorMsg = ({ error }) => {
    if (!error) return null
    return (
        <p className="text-xs mt-1.5 flex items-center gap-1 font-medium" style={{ color: 'var(--danger)' }}>
            <FontAwesomeIcon icon={faExclamationCircle} className="w-3 h-3" />
            {error}
        </p>
    )
}

const Section = ({ title, colorVar = 'var(--primary)', children }) => (
    <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-5 rounded-full" style={{ background: colorVar }} />
            <p className="text-sm font-black" style={{ color: 'var(--text)' }}>{title}</p>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        </div>
        <div className="grid grid-cols-2 gap-4">{children}</div>
    </div>
)

export default function EditProductPage() {
    const router = useRouter()
    const { id } = useParams()

    const [loading,     setLoading]     = useState(false)
    const [fetching,    setFetching]    = useState(true)
    const [storehouses, setStorehouses] = useState([])
    const [units,       setUnits]       = useState([])
    const [errors,      setErrors]      = useState({})
    const [savedData,   setSavedData]   = useState(null)

    const [form, setForm] = useState({
        code: '', name: '', storehouse_id: '', unit_id: '',
        technical_description: '', length: '', width: '', height: '',
        weight: '', color: '', count: '', single_amount: '',
        purchase_date: '', order_threshold: '',
        fa_description: '', en_description: '',
    })

    useEffect(() => {
        Promise.all([
            fetch(`${ENV.API_WAREHOUSE_PRODUCTS}/${id}`, { headers: getHeaders() }).then(r => r.json()),
            fetch(ENV.API_WAREHOUSE_STOREHOUSES,         { headers: getHeaders() }).then(r => r.json()),
            fetch(ENV.API_WAREHOUSE_UNITS,               { headers: getHeaders() }).then(r => r.json()),
        ]).then(([prod, sh, un]) => {
            setStorehouses(sh.data?.storehouses?.data || [])
            setUnits(un.data?.units?.data || [])
            const p = prod.data?.product
            if (p) {
                setSavedData(p)
                setForm({
                    code:                  p.code                  ?? '',
                    name:                  p.name                  ?? '',
                    storehouse_id:         p.storehouse_id         ?? '',
                    unit_id:               p.unit_id               ?? '',
                    technical_description: p.technical_description ?? '',
                    length:                p.length                ?? '',
                    width:                 p.width                 ?? '',
                    height:                p.height                ?? '',
                    weight:                p.weight                ?? '',
                    color:                 p.color                 ?? '',
                    count:                 p.count                 ?? '',
                    single_amount:         p.single_amount         ?? '',
                    purchase_date:         p.purchase_date         ?? '',
                    order_threshold:       p.order_threshold       ?? '',
                    fa_description:        p.fa_description        ?? '',
                    en_description:        p.en_description        ?? '',
                })
            }
        })
            .catch(() => Swal.fire({ icon: 'error', title: 'خطا', text: 'دریافت اطلاعات ناموفق بود' }))
            .finally(() => setFetching(false))
    }, [id])

    const set = (k, v) => {
        setForm(p => ({ ...p, [k]: v }))
        setErrors(p => ({ ...p, [k]: null }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const err = {}
        if (!form.code?.trim()) err.code = 'کد الزامی است'
        if (!form.name?.trim()) err.name = 'نام الزامی است'
        if (Object.keys(err).length) { setErrors(err); return }

        setLoading(true)
        try {
            const body = {}
            const strFields = ['code', 'name', 'storehouse_id', 'unit_id', 'technical_description', 'color', 'purchase_date', 'fa_description', 'en_description']
            const numFields = ['length', 'width', 'height', 'weight', 'count', 'order_threshold']
            const intFields = ['single_amount']
            strFields.forEach(k => { if (form[k] !== '') body[k] = form[k] })
            numFields.forEach(k => { if (form[k] !== '') body[k] = parseFloat(form[k]) })
            intFields.forEach(k => { if (form[k] !== '') body[k] = parseInt(form[k]) })

            const res    = await fetch(`${ENV.API_WAREHOUSE_PRODUCTS}/${id}`, {
                method: 'PUT', headers: getHeaders(), body: JSON.stringify(body)
            })
            const result = await res.json()

            if (!res.ok) {
                const errMap = {}
                if (result.errors) Object.entries(result.errors).forEach(([k, v]) => { errMap[k] = Array.isArray(v) ? v[0] : v })
                setErrors(errMap)
                Swal.fire({ icon: 'error', title: 'خطا', text: result.message || Object.values(errMap)[0] || 'خطایی رخ داد' })
                return
            }
            if (result.data?.product) setSavedData(result.data.product)
            await Swal.fire({ title: 'ذخیره شد!', icon: 'success', timer: 2000, showConfirmButton: false })
            router.push('/warehouse/products')
        } catch {
            Swal.fire({ icon: 'error', title: 'خطا', text: 'مشکل در اتصال به سرور' })
        } finally {
            setLoading(false)
        }
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

                {/* هدر */}
                <div className="page-header-bar">
                    <div className="max-w-5xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                 style={{ background: 'rgba(255,255,255,0.2)' }}>
                                <FontAwesomeIcon icon={faBox} className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-white leading-none">ویرایش محصول</h1>
                                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
                                    {savedData?.name || `محصول #${id}`}
                                    {savedData?.code && ` — کد: ${savedData.code}`}
                                </p>
                            </div>
                        </div>
                        <button onClick={() => router.back()} className="btn btn-back btn-sm">
                            <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" />
                            بازگشت
                        </button>
                    </div>
                </div>

                <div className="page-content max-w-5xl">
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card">
                        <div className="card-header">
                            <p className="card-title">ویرایش اطلاعات محصول</p>
                            {savedData && (
                                <div className="flex items-center gap-2">
                                    <span className={`badge ${savedData.count <= savedData.order_threshold ? 'badge-danger' : 'badge-success'}`}>
                                        موجودی: {savedData.count}
                                    </span>
                                    <span className="badge badge-primary">#{savedData.id}</span>
                                </div>
                            )}
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>

                                {/* اطلاعات اصلی */}
                                <Section title="اطلاعات اصلی">
                                    <div>
                                        <label className="form-label"><span style={{ color: 'var(--danger)' }}>* </span>کد محصول</label>
                                        <input value={form.code} onChange={e => set('code', e.target.value)}
                                               className={`form-input ${errors.code ? 'error' : ''}`} placeholder="مثال: PRD001" />
                                        <ErrorMsg error={errors.code} />
                                    </div>
                                    <div>
                                        <label className="form-label"><span style={{ color: 'var(--danger)' }}>* </span>نام محصول</label>
                                        <input value={form.name} onChange={e => set('name', e.target.value)}
                                               className={`form-input ${errors.name ? 'error' : ''}`} placeholder="نام محصول" />
                                        <ErrorMsg error={errors.name} />
                                    </div>
                                    <div>
                                        <label className="form-label">انبار</label>
                                        <select value={form.storehouse_id} onChange={e => set('storehouse_id', e.target.value)} className="form-select">
                                            <option value="">انتخاب انبار</option>
                                            {storehouses.map(s => <option key={s.id} value={s.id}>{s.name} {s.code ? `(${s.code})` : ''}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="form-label">واحد</label>
                                        <select value={form.unit_id} onChange={e => set('unit_id', e.target.value)} className="form-select">
                                            <option value="">انتخاب واحد</option>
                                            {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="form-label">رنگ</label>
                                        <input value={form.color} onChange={e => set('color', e.target.value)}
                                               className="form-input" placeholder="مثال: آبی" />
                                    </div>
                                </Section>

                                {/* مالی و موجودی */}
                                <Section title="مالی و موجودی" colorVar="var(--success)">
                                    <div>
                                        <label className="form-label">موجودی</label>
                                        <input type="number" step="0.01" value={form.count}
                                               onChange={e => set('count', e.target.value)} className="form-input" />
                                    </div>
                                    <div>
                                        <label className="form-label">قیمت واحد (ریال)</label>
                                        <input type="number" value={form.single_amount}
                                               onChange={e => set('single_amount', e.target.value)}
                                               className={`form-input ${errors.single_amount ? 'error' : ''}`} />
                                        <ErrorMsg error={errors.single_amount} />
                                    </div>
                                    <div>
                                        <label className="form-label">حد سفارش</label>
                                        <input type="number" step="0.01" value={form.order_threshold}
                                               onChange={e => set('order_threshold', e.target.value)}
                                               className="form-input" placeholder="حداقل موجودی" />
                                    </div>
                                    <div>
                                        <PersianDatePicker
                                            value={form.purchase_date ? form.purchase_date.split(' ')[0] : ''}
                                            onChange={(date) => set('purchase_date', date?.isoDateTime || '')}
                                            label="تاریخ خرید"
                                        />
                                        <ErrorMsg error={errors.purchase_date} />
                                    </div>
                                </Section>

                                {/* ابعاد */}
                                <Section title="ابعاد و وزن (اختیاری)" colorVar="var(--warning)">
                                    <div>
                                        <label className="form-label">طول (cm)</label>
                                        <input type="number" step="0.01" value={form.length} onChange={e => set('length', e.target.value)} className="form-input" />
                                    </div>
                                    <div>
                                        <label className="form-label">عرض (cm)</label>
                                        <input type="number" step="0.01" value={form.width} onChange={e => set('width', e.target.value)} className="form-input" />
                                    </div>
                                    <div>
                                        <label className="form-label">ارتفاع (cm)</label>
                                        <input type="number" step="0.01" value={form.height} onChange={e => set('height', e.target.value)} className="form-input" />
                                    </div>
                                    <div>
                                        <label className="form-label">وزن (kg)</label>
                                        <input type="number" step="0.01" value={form.weight} onChange={e => set('weight', e.target.value)} className="form-input" />
                                    </div>
                                </Section>

                                {/* توضیحات */}
                                <div className="mb-4">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-1 h-5 rounded-full" style={{ background: 'var(--info)' }} />
                                        <p className="text-sm font-black" style={{ color: 'var(--text)' }}>توضیحات</p>
                                        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="form-label">شرح فنی</label>
                                            <textarea value={form.technical_description} rows={2}
                                                      onChange={e => set('technical_description', e.target.value)}
                                                      className="form-textarea" maxLength={100} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="form-label">توضیحات فارسی</label>
                                                <textarea value={form.fa_description} rows={3}
                                                          onChange={e => set('fa_description', e.target.value)}
                                                          className="form-textarea" placeholder="توضیحات فارسی" />
                                            </div>
                                            <div>
                                                <label className="form-label">توضیحات انگلیسی</label>
                                                <textarea value={form.en_description} rows={3}
                                                          onChange={e => set('en_description', e.target.value)}
                                                          className="form-textarea" placeholder="English description"
                                                          style={{ direction: 'ltr', textAlign: 'left' }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-4"
                                     style={{ borderTop: '1px solid var(--border)' }}>
                                    <button type="button" onClick={() => router.back()} className="btn btn-ghost">انصراف</button>
                                    <button type="submit" disabled={loading} className="btn btn-success btn-lg">
                                        {loading
                                            ? <><FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />در حال ذخیره...</>
                                            : <><FontAwesomeIcon icon={faSave} className="w-4 h-4" />ذخیره تغییرات</>
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