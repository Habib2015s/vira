'use client'

import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faSave, faFileInvoice, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { useRouter } from 'next/navigation'
import Select from 'react-select'
import DashboardLayout from '@/app/dashboard/Dashboardlayout'
import PersianDatePicker from '@/app/components/shared/PersianDatePicker'
import { useCreateFinalStatement } from './_hooks/useCreateFinalStatement'
import { selectStyles } from '../_components/selectStyles'

export default function CreateFinalStatementPage() {
    const router = useRouter()
    const { loading, formData, handleChange, handleShopChange, handleSubmit, selectedDate, setSelectedDate, shopOptions, loadingShops } = useCreateFinalStatement()

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
                                <h1 className="text-xl font-black text-white leading-none">ایجاد صورت وضعیت جدید</h1>
                                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>ثبت صورت وضعیت نهایی</p>
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
                                        <label className="form-label"><span style={{ color: 'var(--danger)' }}>* </span>عنوان</label>
                                        <input type="text" name="title" value={formData.title} onChange={handleChange} className="form-input" placeholder="مثال: صورت وضعیت دی ماه" />
                                    </div>
                                    <div>
                                        <label className="form-label"><span style={{ color: 'var(--danger)' }}>* </span>شماره</label>
                                        <input type="number" name="number" value={formData.number} onChange={handleChange} className="form-input" placeholder="مثال: ۱۰۰۱" />
                                    </div>
                                    <PersianDatePicker value={selectedDate?.jDate || ''} onChange={setSelectedDate} label="تاریخ" required />
                                    <div>
                                        <label className="form-label"><span style={{ color: 'var(--danger)' }}>* </span>شاپ</label>
                                        <Select value={shopOptions.find(o => o.value === parseInt(formData.shop_id)) || null}
                                                onChange={handleShopChange} options={shopOptions} styles={selectStyles}
                                                placeholder="انتخاب شاپ..." isClearable isLoading={loadingShops}
                                                menuPortalTarget={typeof document !== 'undefined' ? document.body : null} menuPosition="fixed" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="form-label"><span style={{ color: 'var(--danger)' }}>* </span>توضیحات</label>
                                        <textarea name="description" value={formData.description} onChange={handleChange}
                                                  rows={4} placeholder="توضیحات صورت وضعیت..." className="form-textarea" />
                                    </div>
                                </div>
                                <div className="alert alert-info mt-5">
                                    فیلدهای علامت‌دار با <span style={{ color: 'var(--danger)' }}>*</span> الزامی هستند.
                                </div>
                            </div>
                            <div className="card-footer flex justify-end gap-3">
                                <button type="button" onClick={() => router.back()} className="btn btn-ghost">انصراف</button>
                                <button type="submit" disabled={loading} className="btn btn-success">
                                    <FontAwesomeIcon icon={loading ? faSpinner : faSave} className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                    {loading ? 'در حال ذخیره...' : 'ذخیره صورت وضعیت'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </div>
        </DashboardLayout>
    )
}