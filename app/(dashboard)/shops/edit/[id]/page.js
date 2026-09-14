// app/shops/edit/[id]/page.js
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faSave, faSpinner } from '@fortawesome/free-solid-svg-icons'
import Swal from '@/app/utils/swal'
import { shopsApi } from '@/app/api/client/shopsApi'
import { shopsCache } from '@/app/hooks/useShops'

export default function EditShop() {
    const { id: shopId } = useParams()
    const router = useRouter()
    const [loading,     setLoading]     = useState(false)
    const [loadingData, setLoadingData] = useState(true)
    const [formData,    setFormData]    = useState({ name: '', code: '', type: 'inside', fee: '', is_active: 'active', description: '' })

    useEffect(() => {
        shopsApi.getOne(shopId)
            .then(r => {
                const s = r.data.shop
                setFormData({ name: s.name || '', code: s.code || '', type: s.type || 'inside', fee: s.fee || '', is_active: s.is_active || 'active', description: s.description || '' })
            })
            .catch(() => { Swal.fire('خطا', 'مشکلی در دریافت اطلاعات رخ داد', 'error'); router.push('/shops') })
            .finally(() => setLoadingData(false))
    }, [shopId])

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.name || !formData.code) { Swal.fire('خطا', 'نام و کد الزامی است', 'error'); return }

        setLoading(true)
        try {
            const payload = {
                name:      formData.name,
                code:      formData.code,
                type:      formData.type,
                is_active: formData.is_active,
                ...(formData.fee         && { fee: parseFloat(formData.fee) }),
                ...(formData.description && { description: formData.description }),
            }
            const result = await shopsApi.update(shopId, payload)

            // ⭐ cache رو به روز کن
            const updated = result.data?.shop
            if (updated) shopsCache.updateOne(Number(shopId), updated)

            await Swal.fire({ title: 'موفق!', text: 'شاپ با موفقیت ویرایش شد', icon: 'success', timer: 2000, showConfirmButton: false })
            router.push('/shops')
        } catch (err) {
            await Swal.fire('خطا', err.message, 'error')
        } finally {
            setLoading(false)
        }
    }

    if (loadingData) return (
            <div className="w-full min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
                <FontAwesomeIcon icon={faSpinner} className="w-10 h-10 animate-spin" style={{ color: 'var(--primary)' }} />
            </div>
    )

    return (
            <div className="w-full min-h-screen" style={{ background: 'var(--bg)' }}>
                <div className="page-header-bar">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-black text-white mb-0.5">ویرایش شاپ</h1>
                            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>{formData.name}</p>
                        </div>
                        <button onClick={() => router.back()} className="btn btn-back">
                            <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
                            بازگشت
                        </button>
                    </div>
                </div>

                <div className="page-content max-w-4xl">
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card">
                        <form onSubmit={handleSubmit}>
                            <div className="card-body">
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="form-label"><span style={{ color: 'var(--danger)' }}>* </span>نام شاپ</label>
                                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-input" placeholder="مثال: شاپ تعمیرات مرکزی" />
                                    </div>
                                    <div>
                                        <label className="form-label"><span style={{ color: 'var(--danger)' }}>* </span>کد شاپ</label>
                                        <input type="text" name="code" value={formData.code} onChange={handleChange} className="form-input" placeholder="مثال: SHP001" />
                                    </div>
                                    <div>
                                        <label className="form-label"><span style={{ color: 'var(--danger)' }}>* </span>نوع</label>
                                        <select name="type" value={formData.type} onChange={handleChange} className="form-select">
                                            <option value="inside">داخلی</option>
                                            <option value="outside">خارجی</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="form-label">هزینه (ریال)</label>
                                        <input type="number" name="fee" value={formData.fee} onChange={handleChange} className="form-input" placeholder="مثال: 50000" />
                                    </div>
                                    <div>
                                        <label className="form-label"><span style={{ color: 'var(--danger)' }}>* </span>وضعیت</label>
                                        <select name="is_active" value={formData.is_active} onChange={handleChange} className="form-select">
                                            <option value="active">فعال</option>
                                            <option value="inactive">غیرفعال</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="form-label">توضیحات</label>
                                        <textarea name="description" value={formData.description} onChange={handleChange} className="form-textarea" placeholder="توضیحات شاپ..." />
                                    </div>
                                </div>
                            </div>
                            <div className="card-footer flex gap-3 justify-end">
                                <button type="button" onClick={() => router.back()} className="btn btn-ghost">انصراف</button>
                                <button type="submit" disabled={loading} className="btn btn-success">
                                    <FontAwesomeIcon icon={loading ? faSpinner : faSave} className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                    {loading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </div>
    )
}