'use client'

import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faSave, faFileInvoice, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { useRouter, useParams } from 'next/navigation'
import Select from 'react-select'
import DashboardLayout from '@/app/dashboard/Dashboardlayout'
import PersianDatePicker from '@/app/components/shared/PersianDatePicker'
import { useEditFinalStatement } from './_hooks/useEditFinalStatement'
import { selectStyles } from '../../_components/selectStyles'

export default function EditFinalStatementPage() {
    const router = useRouter()
    const { id } = useParams()
    const { loading, loadingData, formData, handleChange, handleShopChange, handleSubmit, selectedDate, setSelectedDate, shopOptions, loadingShops } = useEditFinalStatement(id)

    if (loadingData) return (
        <DashboardLayout>
            <div className="w-full min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
                <div className="card text-center p-12">
                    <FontAwesomeIcon icon={faSpinner} className="w-12 h-12 animate-spin mb-5" style={{ color: 'var(--primary)' }} />
                    <p className="font-bold" style={{ color: 'var(--text)' }}>در حال بارگذاری...</p>
                </div>
            </div>
        </DashboardLayout>
    )

    return (
        <DashboardLayout>
            <div className="w-full min-h-screen" style={{ background: 'var(--bg)' }}>
                <div className="page-header-bar">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                                <FontAwesomeIcon icon={faFileInvoice} className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-white leading-none">ویرایش صورت وضعیت</h1>
                                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>شماره: {formData.number}</p>
                            </div>
                        </div>
                        <button onClick={() => router.back()} className="btn btn-back btn-sm">
                            <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" />بازگشت
                        </button>
                    </div>
                </div>
                <div className="page-content max-w-4xl">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
                        <form onSubmit={handleSubmit}>
                            <div className="card-body">
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="form-label">عنوان</label>
                                        <input type="text" name="title" value={formData.title} onChange={handleChange} className="form-input" placeholder="عنوان صورت وضعیت" />
                                    </div>
                                    <div>
                                        <label className="form-label">شماره</label>
                                        <input type="number" name="number" value={formData.number} onChange={handleChange} className="form-input" placeholder="شماره صورت وضعیت" />
                                    </div>
                                    <PersianDatePicker value={selectedDate?.jDate || ''} onChange={setSelectedDate} label="تاریخ" />
                                    <div>
                                        <label className="form-label">شاپ</label>
                                        <Select value={shopOptions.find(o => o.value === parseInt(formData.shop_id)) || null}
                                                onChange={handleShopChange} options={shopOptions} styles={selectStyles}
                                                placeholder="انتخاب شاپ..." isClearable isLoading={loadingShops}
                                                menuPortalTarget={typeof document !== 'undefined' ? document.body : null} menuPosition="fixed" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="form-label">توضیحات</label>
                                        <textarea name="description" value={formData.description} onChange={handleChange}
                                                  rows={4} placeholder="توضیحات صورت وضعیت..." className="form-textarea" />
                                    </div>
                                </div>
                            </div>
                            <div className="card-footer flex justify-end gap-3">
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
        </DashboardLayout>
    )
}