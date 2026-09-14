'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileInvoiceDollar, faSave, faArrowLeft, faSpinner,
    faBox, faTrash, faHashtag, faUser, faCircleQuestion,
    faTimes, faCircleCheck, faCircleXmark, faPen, faMoneyBill } from '@fortawesome/free-solid-svg-icons'
import Swal from '@/app/utils/swal'
import { ENV, getHeaders } from '@/app/config/env'

const BASE    = ENV.API_WAREHOUSE_FACTORS

const STATUS_MAP = {
    'pre-invoice': { label: 'پیش‌فاکتور', badge: 'badge-warning' },
    'invoice':     { label: 'فاکتور',     badge: 'badge-primary' },
    'confirmed':   { label: 'تأیید شده',  badge: 'badge-success' },
    'canceled':    { label: 'لغو شده',    badge: 'badge-danger'  },
}

// ── ترجمه خطاهای API ─────────────────────────────
const translateError = (key, msg) => {
    const map = {
        'items.0.product_id':  'آیتم اول: محصول الزامی است',
        'items.0.count':       'آیتم اول: تعداد الزامی است',
        'items.0.single_amount':'آیتم اول: قیمت واحد الزامی است',
        'factor_number':       'شماره فاکتور نامعتبر است',
        'customer_id':         'مشتری الزامی است',
    }
    // pattern پویا: items.N.field
    const match = key.match(/^items\.(\d+)\.(.+)$/)
    if (match) {
        const idx   = parseInt(match[1]) + 1
        const field = match[2]
        const fieldNames = { product_id: 'محصول', count: 'تعداد', single_amount: 'قیمت واحد', discount: 'تخفیف', id: 'شناسه آیتم' }
        return `آیتم ${idx}: ${fieldNames[field] || field} الزامی است`
    }
    return map[key] || msg
}

// ── راهنمای کار با فاکتور ────────────────────────
const GUIDE_STEPS = [
    { icon: faFileInvoiceDollar, color: 'var(--primary)', bg: 'var(--primary-light)',
        title: '۱. ایجاد فاکتور',
        desc: 'فاکتور جدید با انتخاب مشتری و شماره فاکتور ساخته میشه. وضعیت اولیه «پیش‌فاکتور» است.' },
    { icon: faCircleCheck, color: 'var(--success)', bg: 'var(--success-light)',
        title: '۳. تأیید فاکتور',
        desc: 'بعد از ویرایش، از صفحه نمایش دکمه «تأیید» بزنید. فاکتور تأیید شده قابل پرداخت است.' },
    { icon: faMoneyBill, color: 'var(--success)', bg: 'var(--success-light)',
        title: '۴. ثبت پرداخت',
        desc: 'پرداخت رو از طریق کارت، نقد یا چک ثبت کنید. مانده بدهی به‌صورت خودکار محاسبه میشه.' },
    { icon: faCircleXmark, color: 'var(--danger)', bg: 'var(--danger-light)',
        title: '۵. لغو / مرجوع',
        desc: 'اگه نیاز بود فاکتور رو لغو کنید یا آیتم‌های مرجوعی رو ثبت کنید. بعد از لغو قابل بازگشت نیست.' },
]

// ── ردیف ویرایش آیتم ─────────────────────────────
function EditItemRow({ item, index, onUpdate }) {
    const [toDelete, setToDelete] = useState(item._delete || false)

    const toggle = () => {
        const next = !toDelete
        setToDelete(next)
        onUpdate(index, '_delete', next)
    }

    const total = (item.single_amount || 0) * (item.count || 0)
    const net   = total - (item.discount || 0)

    return (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl mb-3 transition-all"
                    style={{
                        background: toDelete ? 'var(--danger-light)' : 'var(--surface-2)',
                        border: `1.5px solid ${toDelete ? 'var(--danger)' : 'var(--border)'}`,
                        opacity: toDelete ? 0.6 : 1,
                    }}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-lg"
                          style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                        آیتم {index + 1}
                    </span>
                    {item.product_id && (
                        <span className="text-xs font-mono badge badge-muted">محصول #{item.product_id}</span>
                    )}
                    {item.status && (
                        <span className={`badge text-xs ${item.status === 'sold' ? 'badge-success' : 'badge-warning'}`}>
                            {item.status === 'sold' ? 'فروخته شده' : item.status}
                        </span>
                    )}
                </div>
                <button type="button" onClick={toggle}
                        className={`btn btn-sm ${toDelete ? 'btn-secondary' : 'btn-danger'}`}
                        style={{ height: '28px', padding: '0 10px', fontSize: '11px' }}>
                    <FontAwesomeIcon icon={toDelete ? faTimes : faTrash} className="w-3 h-3" />
                    {toDelete ? 'لغو حذف' : 'حذف'}
                </button>
            </div>

            {toDelete ? (
                <p className="text-sm font-bold text-center py-2" style={{ color: 'var(--danger)' }}>
                    ⚠ این آیتم با ذخیره حذف خواهد شد
                </p>
            ) : (
                <div className="grid grid-cols-3 gap-3">
                    <div>
                        <label className="form-label">قیمت واحد (ریال)</label>
                        <input type="number" min="0" value={item.single_amount}
                               onChange={e => onUpdate(index, 'single_amount', parseFloat(e.target.value) || 0)}
                               className="form-input" />
                    </div>
                    <div>
                        <label className="form-label">تعداد</label>
                        <input type="number" min="1" value={item.count}
                               onChange={e => onUpdate(index, 'count', parseInt(e.target.value) || 1)}
                               className="form-input" />
                    </div>
                    <div>
                        <label className="form-label">تخفیف (ریال)</label>
                        <input type="number" min="0" value={item.discount}
                               onChange={e => onUpdate(index, 'discount', parseFloat(e.target.value) || 0)}
                               className="form-input" />
                    </div>
                    <div className="col-span-3 flex justify-between items-center px-1 pt-2"
                         style={{ borderTop: '1px solid var(--border)' }}>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            جمع: {total.toLocaleString('fa-IR')} ﷼
                        </span>
                        <span className="text-xs font-bold" style={{ color: 'var(--success)' }}>
                            خالص: {net.toLocaleString('fa-IR')} ﷼
                        </span>
                    </div>
                </div>
            )}
        </motion.div>
    )
}

// ── Modal راهنما ─────────────────────────────────
function GuideModal({ onClose }) {
    return (
        <div className="fixed inset-0 flex items-center justify-center p-4"
             style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', zIndex: 50 }}
             onClick={e => { if (e.target === e.currentTarget) onClose() }}>
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 16 }}
                        className="card w-full max-w-lg overflow-y-auto"
                        style={{ maxHeight: '85vh', zIndex: 51 }}
                        onClick={e => e.stopPropagation()}>
                <div className="card-header">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary-light)' }}>
                            <FontAwesomeIcon icon={faCircleQuestion} className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
                        </div>
                        <p className="card-title">راهنمای کار با فاکتور</p>
                    </div>
                    <button onClick={onClose} className="action-btn action-btn-delete w-7 h-7">
                        <FontAwesomeIcon icon={faTimes} className="w-3.5 h-3.5" />
                    </button>
                </div>
                <div className="card-body space-y-4">
                    {GUIDE_STEPS.map((step, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.06 }}
                                    className="flex items-start gap-3 p-3 rounded-xl"
                                    style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                                 style={{ background: step.bg }}>
                                <FontAwesomeIcon icon={step.icon} className="w-4 h-4" style={{ color: step.color }} />
                            </div>
                            <div>
                                <p className="text-sm font-black mb-1" style={{ color: 'var(--text)' }}>{step.title}</p>
                                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{step.desc}</p>
                            </div>
                        </motion.div>
                    ))}



                    <button onClick={onClose} className="btn btn-primary w-full">متوجه شدم</button>
                </div>
            </motion.div>
        </div>
    )
}

// ═══════════════════════════════════════════════════
export default function FactorEditPage() {
    const router      = useRouter()
    const { id }      = useParams()
    const queryClient = useQueryClient()

    const [fetching,     setFetching]     = useState(true)
    const [savedData,    setSavedData]    = useState(null)
    const [factorNumber, setFactorNumber] = useState('')
    const [items,        setItems]        = useState([])
    const [errors,       setErrors]       = useState({})
    const [showGuide,    setShowGuide]    = useState(false)

    // GET /factors/{id} — این endpoint هم ممکنه 500 بده
    // از cache لیست fallback میکنیم
    useEffect(() => {
        fetch(`${BASE}/${id}`, { headers: getHeaders() })
            .then(r => r.json())
            .then(res => {
                const f = res.data?.factor
                if (f) {
                    setSavedData(f)
                    setFactorNumber(f.factor_number ?? '')
                    setItems((f.items || []).map(it => ({
                        id:            it.id,
                        product_id:    it.product_id,   // ⭐ حفظ product_id
                        storehouse_id: it.storehouse_id,
                        single_amount: it.single_amount,
                        count:         it.count,
                        discount:      it.discount || 0,
                        status:        it.status,
                        _delete:       false,
                    })))
                } else {
                    // fallback از cache لیست
                    const cached = queryClient.getQueryData(['warehouseFactors'])
                    if (cached?.pages) {
                        for (const page of cached.pages) {
                            const found = (page.data || []).find(f => String(f.id) === String(id))
                            if (found) { setSavedData(found); setFactorNumber(found.factor_number ?? ''); break }
                        }
                    }
                }
            })
            .catch(() => {
                // fallback از cache
                const cached = queryClient.getQueryData(['warehouseFactors'])
                if (cached?.pages) {
                    for (const page of cached.pages) {
                        const found = (page.data || []).find(f => String(f.id) === String(id))
                        if (found) { setSavedData(found); setFactorNumber(found.factor_number ?? ''); break }
                    }
                }
            })
            .finally(() => setFetching(false))
    }, [id, queryClient])

    const mutation = useMutation({
        mutationFn: (body) =>
            fetch(`${BASE}/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(body) }).then(r => r.json()),
        onSuccess: (res) => {
            if (res.data?.factor || (res.message?.[0] === 'عملیات با موفقیت انجام شد') || (res.message && !res.errors && typeof res.message === 'string' && res.message.includes('موفق'))) {
                queryClient.invalidateQueries({ queryKey: ['warehouseFactors'] })
                Swal.fire({ title: 'ذخیره شد!', icon: 'success', timer: 2000, showConfirmButton: false })
                router.push(`/warehouse/factors/${id}`)
            } else {
                // ترجمه خطاهای API به فارسی
                const errMap = {}
                // res.errors باید یه object باشه
                if (res.errors && typeof res.errors === 'object' && !Array.isArray(res.errors)) {
                    Object.entries(res.errors).forEach(([k, v]) => {
                        errMap[k] = translateError(k, Array.isArray(v) ? v[0] : v)
                    })
                }
                // اگه خطایی در errMap نبود، از message استفاده میکنیم
                const rawMsg = Array.isArray(res.message) ? res.message[0] : (res.message || '')
                const friendlyMsg = rawMsg.includes('SQLSTATE') || rawMsg.includes('Integrity')
                    ? 'خطای پایگاه داده: اطمینان حاصل کنید همه فیلدهای اجباری آیتم‌ها پر شده باشند'
                    : rawMsg || 'خطایی رخ داد'
                if (Object.keys(errMap).length === 0) {
                    errMap['_general'] = friendlyMsg
                }
                setErrors(errMap)
                Swal.fire({ icon: 'error', title: 'خطا در ذخیره', text: Object.values(errMap)[0] })
            }
        },
        onError: () => Swal.fire('خطا!', 'مشکل در اتصال به سرور', 'error'),
    })

    const updateItem = (i, key, val) => setItems(p => p.map((it, idx) => idx === i ? { ...it, [key]: val } : it))

    const activeItems   = items.filter(it => !it._delete)
    const deletedCount  = items.filter(it => it._delete).length
    const numberChanged = factorNumber !== (savedData?.factor_number ?? '')
    const changedItems  = items.filter((it, i) => {
        if (it._delete) return true
        const orig = savedData?.items?.[i]
        if (!orig) return false
        return it.single_amount !== orig.single_amount || it.count !== orig.count || it.discount !== (orig.discount || 0)
    })

    const totals = activeItems.reduce((acc, it) => {
        const t = (it.single_amount || 0) * (it.count || 0)
        const d = it.discount || 0
        return { total: acc.total + t, discount: acc.discount + d, net: acc.net + t - d }
    }, { total: 0, discount: 0, net: 0 })

    const handleSubmit = (e) => {
        e.preventDefault()

        // validation محلی — product_id الزامیه
        const localErrors = {}
        items.forEach((it, i) => {
            if (!it._delete && !it.product_id) {
                localErrors[`items.${i}.product_id`] = `آیتم ${i+1}: محصول مشخص نشده — لطفاً از صفحه ایجاد فاکتور آیتم اضافه کنید`
            }
        })
        if (Object.keys(localErrors).length) {
            setErrors(localErrors)
            Swal.fire({ icon: 'warning', title: 'خطا در آیتم‌ها', text: Object.values(localErrors)[0] })
            return
        }

        const body = {}
        if (numberChanged) body.factor_number = factorNumber

        // ⭐ product_id رو حفظ میکنیم — API بهش نیاز داره
        body.items = items.map(it => ({
            id:            it.id,
            product_id:    it.product_id,
            ...(it.storehouse_id != null ? { storehouse_id: it.storehouse_id } : {}),
            single_amount: it.single_amount,
            count:         it.count,
            discount:      it.discount || 0,
            _delete:       it._delete,
        }))
        mutation.mutate(body)
    }

    if (fetching) return (
            <div className="w-full min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card text-center p-12">
                    <FontAwesomeIcon icon={faSpinner} className="w-12 h-12 animate-spin mb-4" style={{ color: 'var(--primary)' }} />
                    <p className="font-bold" style={{ color: 'var(--text)' }}>در حال بارگذاری...</p>
                </motion.div>
            </div>
    )

    const statusInfo = STATUS_MAP[savedData?.status] || { label: savedData?.status, badge: 'badge-muted' }

    return (
            <div className="w-full min-h-screen" style={{ background: 'var(--bg)' }}>

                <div className="page-header-bar">
                    <div className="max-w-5xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                 style={{ background: 'rgba(255,255,255,0.2)' }}>
                                <FontAwesomeIcon icon={faFileInvoiceDollar} className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-xl font-black text-white leading-none">
                                        ویرایش فاکتور #{savedData?.factor_number || id}
                                    </h1>
                                    {savedData && <span className={`badge text-xs ${statusInfo.badge}`}>{statusInfo.label}</span>}
                                </div>
                                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
                                    {savedData?.customer?.name
                                        ? `مشتری: ${savedData.customer.name} ${savedData.customer.family || ''}`
                                        : `مشتری #${savedData?.customer_id || '—'}`}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* ⭐ دکمه راهنما */}
                            <button onClick={() => setShowGuide(true)}
                                    className="btn btn-sm"
                                    style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>
                                <FontAwesomeIcon icon={faCircleQuestion} className="w-3.5 h-3.5" />
                                راهنما
                            </button>
                            <button onClick={() => router.back()} className="btn btn-back btn-sm">
                                <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" />بازگشت
                            </button>
                        </div>
                    </div>
                </div>

                <div className="page-content max-w-5xl">

                    {/* نوار تغییرات */}
                    <AnimatePresence>
                        {(changedItems.length > 0 || numberChanged) && (
                            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                                        className="alert alert-warning flex items-center justify-between mb-5">
                                <span className="font-bold text-sm">
                                    {numberChanged && 'شماره فاکتور تغییر کرده — '}
                                    {changedItems.length > 0 && `${changedItems.length} آیتم تغییر کرده`}
                                    {deletedCount > 0 && ` (${deletedCount} در انتظار حذف)`}
                                </span>
                                <span className="text-xs" style={{ color: 'var(--warning)' }}>فراموش نکنید ذخیره کنید</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* نمایش خطاها */}
                    <AnimatePresence>
                        {Object.keys(errors).length > 0 && (
                            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                        className="card mb-5" style={{ borderRight: '4px solid var(--danger)' }}>
                                <div className="card-body space-y-1.5">
                                    <p className="text-sm font-black mb-2" style={{ color: 'var(--danger)' }}>خطاهای ذخیره:</p>
                                    {Object.entries(errors).map(([k, v]) => (
                                        <div key={k} className="flex items-start gap-2 text-sm" style={{ color: 'var(--danger)' }}>
                                            <span className="mt-0.5">•</span>
                                            <span>{typeof v === 'string' ? v : JSON.stringify(v)}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                            {/* ستون چپ */}
                            <div className="lg:col-span-2 space-y-4">

                                {/* شماره فاکتور */}
                                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card">
                                    <div className="card-header">
                                        <p className="card-title">اطلاعات پایه</p>
                                        <span className="badge badge-primary">#{id}</span>
                                    </div>
                                    <div className="card-body">
                                        <label className="form-label flex items-center gap-1.5">
                                            <FontAwesomeIcon icon={faHashtag} className="w-3 h-3" style={{ color: 'var(--info)' }} />
                                            شماره فاکتور
                                        </label>
                                        <input value={factorNumber} onChange={e => setFactorNumber(e.target.value)}
                                               maxLength={50} placeholder="شماره فاکتور" className="form-input"
                                               style={numberChanged ? { borderColor: 'var(--warning)' } : {}} />
                                        {numberChanged && (
                                            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                                                قبلاً: <span className="line-through">{savedData?.factor_number}</span>
                                            </p>
                                        )}
                                        {errors.factor_number && (
                                            <p className="text-xs mt-1 font-medium" style={{ color: 'var(--danger)' }}>{errors.factor_number}</p>
                                        )}
                                    </div>
                                </motion.div>

                                {/* آیتم‌ها */}
                                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                                            className="card">
                                    <div className="card-header">
                                        <p className="card-title flex items-center gap-2">
                                            <FontAwesomeIcon icon={faBox} className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                                            ویرایش آیتم‌ها
                                        </p>
                                        <div className="flex items-center gap-2">
                                            {deletedCount > 0 && <span className="badge badge-danger">{deletedCount} حذف</span>}
                                            <span className="badge badge-primary">{items.length} آیتم</span>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        {items.length === 0 ? (
                                            <div className="py-8 text-center space-y-3">
                                                <FontAwesomeIcon icon={faBox} className="w-10 h-10 opacity-30" style={{ color: 'var(--muted)' }} />
                                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>این فاکتور آیتمی ندارد</p>
                                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                                    برای افزودن آیتم، از صفحه ایجاد فاکتور اقدام کنید
                                                </p>
                                            </div>
                                        ) : (
                                            items.map((item, i) => (
                                                <EditItemRow key={item.id || i} item={item} index={i} onUpdate={updateItem} />
                                            ))
                                        )}
                                        {/* نمایش خطاهای items */}
                                        {Object.entries(errors).filter(([k]) => k.startsWith('items.')).map(([k, v]) => (
                                            <div key={k} className="mt-2 px-3 py-2 rounded-lg text-xs font-medium"
                                                 style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
                                                {v}
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            </div>

                            {/* ستون راست */}
                            <div className="space-y-4">
                                <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 }}
                                            className="card">
                                    <div className="card-header">
                                        <p className="card-title text-sm">پیش‌بینی مالی</p>
                                        <span className="badge badge-muted text-xs">بعد از ذخیره</span>
                                    </div>
                                    <div className="card-body">
                                        {[
                                            { label: 'جمع کل',    value: totals.total,    color: 'var(--text)'    },
                                            { label: 'تخفیف',     value: totals.discount, color: 'var(--danger)'  },
                                            { label: 'مبلغ خالص', value: totals.net,      color: 'var(--success)' },
                                        ].map(({ label, value, color }) => (
                                            <div key={label} className="flex justify-between py-2.5"
                                                 style={{ borderBottom: '1px solid var(--border)' }}>
                                                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}</span>
                                                <span className="text-sm font-bold font-mono" style={{ color }}>
                                                    {value.toLocaleString('fa-IR')} ﷼
                                                </span>
                                            </div>
                                        ))}
                                        {deletedCount > 0 && (
                                            <p className="text-xs mt-2 pt-2 font-medium" style={{ color: 'var(--danger)', borderTop: '1px dashed var(--border)' }}>
                                                ⚠ {deletedCount} آیتم در انتظار حذف
                                            </p>
                                        )}
                                    </div>
                                    <div className="card-footer">
                                        <button type="submit" disabled={mutation.isPending} className="btn btn-primary w-full">
                                            {mutation.isPending
                                                ? <><FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />در حال ذخیره...</>
                                                : <><FontAwesomeIcon icon={faSave} className="w-4 h-4" />ذخیره تغییرات</>
                                            }
                                        </button>
                                    </div>
                                </motion.div>

                                {/* وضعیت فعلی */}
                                {savedData && (
                                    <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 }}
                                                className="card">
                                        <div className="card-header">
                                            <p className="card-title text-sm">وضعیت فعلی</p>
                                        </div>
                                        <div className="card-body space-y-2">
                                            <div className="flex items-center justify-between py-1.5"
                                                 style={{ borderBottom: '1px solid var(--border)' }}>
                                                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>وضعیت</span>
                                                <span className={`badge text-xs ${statusInfo.badge}`}>{statusInfo.label}</span>
                                            </div>
                                            {savedData.customer && (
                                                <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'var(--surface-2)' }}>
                                                    <FontAwesomeIcon icon={faUser} className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
                                                    <div>
                                                        <p className="text-xs font-bold" style={{ color: 'var(--text)' }}>
                                                            {savedData.customer.name} {savedData.customer.family || ''}
                                                        </p>
                                                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{savedData.customer.phone}</p>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex justify-between py-1.5" style={{ borderBottom: '1px solid var(--border)' }}>
                                                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>مانده بدهی</span>
                                                <span className="text-xs font-bold font-mono"
                                                      style={{ color: savedData.amount_owed > 0 ? 'var(--danger)' : 'var(--success)' }}>
                                                    {Number(savedData.amount_owed).toLocaleString('fa-IR')} ﷼
                                                </span>
                                            </div>
                                            {/* دکمه راهنما در پنل */}
                                            <button type="button" onClick={() => setShowGuide(true)}
                                                    className="btn btn-secondary w-full btn-sm mt-2">
                                                <FontAwesomeIcon icon={faCircleQuestion} className="w-3.5 h-3.5" />
                                                راهنمای فاکتور
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </form>
                </div>

                {/* Modal راهنما */}
                <AnimatePresence>
                    {showGuide && <GuideModal onClose={() => setShowGuide(false)} />}
                </AnimatePresence>
            </div>
    )
}