'use client'

import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faSave, faFileInvoice, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { useRouter, useParams } from 'next/navigation'
import Select from 'react-select'
import PersianDatePicker from '@/app/components/shared/PersianDatePicker'
import { useEditFactor } from './_hooks/useEditFactor'
import { selectStyles } from '../../_components/selectStyles'

export default function EditFactorPage() {
    const router    = useRouter()
    const { factorId } = useParams()
    const { loading, loadingData, formData, handleChange, handleSubmit, statementOptions, loadingStatements, setFormData } = useEditFactor(factorId)

    if (loadingData) return (
            <div className="w-full min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
                <div className="text-center">
                    <FontAwesomeIcon icon={faSpinner} className="w-10 h-10 animate-spin mb-4" style={{ color: 'var(--primary)' }} />
                    <p style={{ color: 'var(--text-muted)' }}>در حال بارگذاری...</p>
                </div>
            </div>
    )

    return (
            <div className="w-full min-h-screen" style={{ background: 'var(--bg)' }}>
                <div className="page-header-bar">
                    <div className="max-w-2xl mx-auto flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-black text-white flex items-center gap-2">
                                <FontAwesomeIcon icon={faFileInvoice} className="w-5 h-5" />
                                ویرایش فاکتور
                            </h1>
                            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
                                {formData.name || `فاکتور #${factorId}`}
                            </p>
                        </div>
                        <button onClick={() => router.back()} className="btn btn-back btn-sm">
                            <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" />بازگشت
                        </button>
                    </div>
                </div>

                <div className="page-content" style={{ maxWidth: '672px' }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
                        <form onSubmit={handleSubmit}>
                            <div className="card-body space-y-5">
                                <div>
                                    <label className="form-label">نام فاکتور</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange}
                                           className="form-input" placeholder="مثال: فاکتور شماره ۱" />
                                </div>
                                <div>
                                    <label className="form-label">شماره</label>
                                    <input type="number" name="number" value={formData.number} onChange={handleChange}
                                           className="form-input" placeholder="مثال: ۱۰۰۱" />
                                </div>
                                <PersianDatePicker
                                    value={formData.date || ''}
                                    onChange={date => setFormData(p => ({ ...p, date: date?.isoDateTime || '' }))}
                                    label="تاریخ"
                                />
                                <div>
                                    <label className="form-label">صورت وضعیت</label>
                                    <Select
                                        value={statementOptions.find(o => o.value === parseInt(formData.final_statement_id)) || null}
                                        onChange={opt => handleChange({ target: { name: 'final_statement_id', value: opt?.value || '' } })}
                                        options={statementOptions} styles={selectStyles}
                                        placeholder="انتخاب صورت وضعیت..." isClearable isLoading={loadingStatements}
                                        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                        menuPosition="fixed"
                                        noOptionsMessage={() => 'یافت نشد'}
                                    />
                                </div>
                            </div>
                            <div className="card-footer flex gap-3 justify-end">
                                <button type="button" onClick={() => router.back()} className="btn btn-ghost">انصراف</button>
                                <button type="submit" disabled={loading} className="btn btn-success">
                                    {loading
                                        ? <><FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />در حال ذخیره...</>
                                        : <><FontAwesomeIcon icon={faSave} className="w-4 h-4" />ذخیره تغییرات</>
                                    }
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </div>
    )
}