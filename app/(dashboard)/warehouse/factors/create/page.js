'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileInvoiceDollar, faSave, faArrowLeft, faSpinner, faPlus,
    faTrash, faBox, faUser, faHashtag } from '@fortawesome/free-solid-svg-icons'
import Select from 'react-select'
import Swal from '@/app/utils/swal'
import { ENV, getHeaders } from '@/app/config/env'

const BASE    = ENV.API_WAREHOUSE_FACTORS

const selectStyles = {
    control: (b, s) => ({
        ...b, minHeight: '40px', background: 'var(--surface)',
        borderColor: s.isFocused ? 'var(--primary)' : 'var(--border)',
        borderWidth: '1.5px', borderRadius: 'var(--radius)',
        boxShadow: s.isFocused ? '0 0 0 3px rgba(84,76,207,0.1)' : 'none',
        '&:hover': { borderColor: 'var(--border-strong)' },
    }),
    menu:        (b) => ({ ...b, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', zIndex: 9999, boxShadow: 'var(--shadow-lg)' }),
    menuList:    (b) => ({ ...b, padding: '4px', background: 'var(--surface)' }),
    option:      (b, s) => ({ ...b, borderRadius: '6px', background: s.isSelected ? 'var(--primary)' : s.isFocused ? 'var(--surface-2)' : 'transparent', color: s.isSelected ? 'var(--surface)' : 'var(--text)', fontSize: '13.5px' }),
    singleValue: (b) => ({ ...b, color: 'var(--text)', fontSize: '13.5px' }),
    placeholder: (b) => ({ ...b, color: 'var(--muted)', fontSize: '13.5px' }),
    input:       (b) => ({ ...b, color: 'var(--text)' }),
    menuPortal:  (b) => ({ ...b, zIndex: 9999 }),
}

// ردیف آیتم فاکتور
function ItemRow({ item, index, products, storehouses, onUpdate, onRemove }) {
    const selectedProduct   = products.find(p => p.id == item.product_id) || null
    const selectedStorehouse= storehouses.find(s => s.id == item.storehouse_id) || null

    const productOptions    = products.map(p => ({ value: p.id, label: `${p.name} (کد: ${p.code})`, product: p }))
    const storehouseOptions = storehouses.map(s => ({ value: s.id, label: `${s.name} (${s.code})` }))

    const total = (item.single_amount || 0) * (item.count || 0)
    const net   = total - (item.discount || 0)

    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl mb-3"
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold px-2 py-0.5 rounded-lg"
                      style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                    آیتم {index + 1}
                </span>
                <button type="button" onClick={() => onRemove(index)}
                        className="action-btn action-btn-delete w-7 h-7">
                    <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                    <label className="form-label">محصول *</label>
                    <Select options={productOptions}
                            value={productOptions.find(o => o.value == item.product_id) || null}
                            onChange={opt => {
                                onUpdate(index, 'product_id', opt?.value || '')
                                if (opt?.product?.single_amount) onUpdate(index, 'single_amount', opt.product.single_amount)
                            }}
                            styles={selectStyles} placeholder="انتخاب محصول..."
                            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                            menuPosition="fixed"
                            noOptionsMessage={() => 'محصولی یافت نشد'} />
                </div>
                <div>
                    <label className="form-label">انبار</label>
                    <Select options={storehouseOptions}
                            value={storehouseOptions.find(o => o.value == item.storehouse_id) || null}
                            onChange={opt => onUpdate(index, 'storehouse_id', opt?.value || '')}
                            styles={selectStyles} placeholder="انتخاب انبار..."
                            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                            menuPosition="fixed"
                            isClearable />
                </div>
                <div>
                    <label className="form-label">قیمت واحد *</label>
                    <input type="number" min="0" value={item.single_amount}
                           onChange={e => onUpdate(index, 'single_amount', parseFloat(e.target.value) || 0)}
                           className="form-input" placeholder="0" />
                </div>
                <div>
                    <label className="form-label">تعداد *</label>
                    <input type="number" min="1" value={item.count}
                           onChange={e => onUpdate(index, 'count', parseInt(e.target.value) || 1)}
                           className="form-input" placeholder="1" />
                </div>
                <div>
                    <label className="form-label">تخفیف</label>
                    <input type="number" min="0" value={item.discount}
                           onChange={e => onUpdate(index, 'discount', parseFloat(e.target.value) || 0)}
                           className="form-input" placeholder="0" />
                </div>
            </div>
            {/* خلاصه مالی آیتم */}
            <div className="mt-3 flex items-center justify-between px-2 py-1.5 rounded-lg"
                 style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>جمع: {total.toLocaleString('fa-IR')}</span>
                <span className="text-xs font-bold" style={{ color: 'var(--success)' }}>خالص: {net.toLocaleString('fa-IR')}</span>
            </div>
        </motion.div>
    )
}

export default function FactorCreatePage() {
    const router      = useRouter()
    const queryClient = useQueryClient()
    const [customer,     setCustomer]     = useState(null)
    const [factorNumber, setFactorNumber] = useState('')
    const [items,        setItems]        = useState([{ product_id: '', storehouse_id: '', single_amount: 0, count: 1, discount: 0 }])
    const [errors,       setErrors]       = useState({})

    const { data: customers  = [] } = useQuery({ queryKey: ['warehouseCustomers'],   queryFn: () => fetch(ENV.API_WAREHOUSE_CUSTOMERS,   { headers: getHeaders() }).then(r => r.json()).then(r => r.data?.customers?.data   || []), staleTime: 10 * 60 * 1000 })
    const { data: products   = [] } = useQuery({ queryKey: ['warehouseProducts'],    queryFn: () => fetch(ENV.API_WAREHOUSE_PRODUCTS,    { headers: getHeaders() }).then(r => r.json()).then(r => r.data?.products?.data    || []), staleTime: 10 * 60 * 1000 })
    const { data: storehouses= [] } = useQuery({ queryKey: ['warehouseStorehouses'], queryFn: () => fetch(ENV.API_WAREHOUSE_STOREHOUSES, { headers: getHeaders() }).then(r => r.json()).then(r => r.data?.storehouses?.data || []), staleTime: 10 * 60 * 1000 })

    const mutation = useMutation({
        mutationFn: (body) => fetch(BASE, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(r => r.json()),
        onSuccess: (res) => {
            if (res.data?.factor) {
                queryClient.invalidateQueries({ queryKey: ['warehouseFactors'] })
                Swal.fire({ title: 'فاکتور ثبت شد!', icon: 'success', timer: 2000, showConfirmButton: false })
                router.push('/warehouse/factors')
            } else {
                const errMap = {}
                if (res.errors) Object.entries(res.errors).forEach(([k, v]) => { errMap[k] = Array.isArray(v) ? v[0] : v })
                setErrors(errMap)
                Swal.fire({ icon: 'error', title: 'خطا', text: Object.values(errMap)[0] || 'خطایی رخ داد' })
            }
        },
        onError: () => Swal.fire('خطا!', 'مشکل در اتصال', 'error'),
    })

    const addItem = () => setItems(p => [...p, { product_id: '', storehouse_id: '', single_amount: 0, count: 1, discount: 0 }])
    const removeItem = (i) => setItems(p => p.filter((_, idx) => idx !== i))
    const updateItem = (i, key, val) => setItems(p => p.map((item, idx) => idx === i ? { ...item, [key]: val } : item))

    const totals = items.reduce((acc, it) => {
        const t = (it.single_amount || 0) * (it.count || 0)
        const d = it.discount || 0
        return { total: acc.total + t, discount: acc.discount + d, net: acc.net + t - d }
    }, { total: 0, discount: 0, net: 0 })

    const handleSubmit = (e) => {
        e.preventDefault()
        const err = {}
        if (!customer) err.customer_id = 'انتخاب مشتری الزامی است'
        const validItems = items.filter(it => it.product_id)
        if (validItems.length === 0) err.items = 'حداقل یک آیتم با محصول الزامی است'
        if (Object.keys(err).length) return setErrors(err)

        mutation.mutate({
            customer_id:   customer.value,
            ...(factorNumber && { factor_number: factorNumber }),
            items: validItems.map(it => ({
                product_id:    it.product_id,
                ...(it.storehouse_id && { storehouse_id: it.storehouse_id }),
                single_amount: it.single_amount,
                count:         it.count,
                ...(it.discount > 0 && { discount: it.discount }),
            }))
        })
    }

    const customerOptions = customers.map(c => ({ value: c.id, label: `${c.name} ${c.family || ''} — ${c.phone || ''}`, customer: c }))

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
                                <h1 className="text-xl font-black text-white leading-none">فاکتور جدید</h1>
                                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>ثبت فاکتور فروش</p>
                            </div>
                        </div>
                        <button onClick={() => router.back()} className="btn btn-back btn-sm">
                            <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" />بازگشت
                        </button>
                    </div>
                </div>

                <div className="page-content max-w-5xl">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                            {/* ── ستون چپ: آیتم‌ها ── */}
                            <div className="lg:col-span-2 space-y-4">

                                {/* اطلاعات پایه */}
                                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card">
                                    <div className="card-header">
                                        <p className="card-title">اطلاعات فاکتور</p>
                                    </div>
                                    <div className="card-body grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className="form-label">
                                                <FontAwesomeIcon icon={faUser} className="w-3 h-3 ml-1" style={{ color: 'var(--primary)' }} />
                                                مشتری *
                                            </label>
                                            <Select options={customerOptions} value={customer}
                                                    onChange={opt => { setCustomer(opt); setErrors(p => ({ ...p, customer_id: null })) }}
                                                    styles={selectStyles} placeholder="جستجو مشتری..."
                                                    menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                                    menuPosition="fixed" isClearable
                                                    noOptionsMessage={() => 'مشتری یافت نشد'} />
                                            {errors.customer_id && <p className="text-xs mt-1.5 font-medium" style={{ color: 'var(--danger)' }}>{errors.customer_id}</p>}
                                        </div>
                                        <div>
                                            <label className="form-label">
                                                <FontAwesomeIcon icon={faHashtag} className="w-3 h-3 ml-1" style={{ color: 'var(--info)' }} />
                                                شماره فاکتور
                                            </label>
                                            <input value={factorNumber} onChange={e => setFactorNumber(e.target.value)}
                                                   maxLength={50} placeholder="اختیاری — اتوماتیک اگه خالی باشه"
                                                   className="form-input" />
                                        </div>
                                    </div>
                                </motion.div>

                                {/* آیتم‌ها */}
                                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                                            className="card">
                                    <div className="card-header">
                                        <p className="card-title">
                                            <FontAwesomeIcon icon={faBox} className="w-4 h-4 ml-2" style={{ color: 'var(--primary)' }} />
                                            آیتم‌های فاکتور
                                        </p>
                                        <span className="badge badge-primary">{items.length} آیتم</span>
                                    </div>
                                    <div className="card-body">
                                        {errors.items && (
                                            <div className="alert alert-danger mb-4">{errors.items}</div>
                                        )}
                                        {items.map((item, i) => (
                                            <ItemRow key={i} item={item} index={i}
                                                     products={products} storehouses={storehouses}
                                                     onUpdate={updateItem} onRemove={removeItem} />
                                        ))}
                                        <button type="button" onClick={addItem}
                                                className="w-full py-3 rounded-xl border-2 border-dashed font-bold text-sm transition-all flex items-center justify-center gap-2"
                                                style={{ borderColor: 'var(--border-strong)', color: 'var(--text-muted)' }}
                                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)' }}
                                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-muted)' }}>
                                            <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" />
                                            افزودن آیتم
                                        </button>
                                    </div>
                                </motion.div>
                            </div>

                            {/* ── ستون راست: خلاصه ── */}
                            <div className="space-y-4">
                                <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 }}
                                            className="card">
                                    <div className="card-header">
                                        <p className="card-title text-sm">خلاصه مالی</p>
                                    </div>
                                    <div className="card-body space-y-3">
                                        {[
                                            { label: 'جمع کل',     value: totals.total,    color: 'var(--text)'    },
                                            { label: 'تخفیف',      value: totals.discount, color: 'var(--danger)'  },
                                            { label: 'مبلغ خالص',  value: totals.net,      color: 'var(--success)' },
                                        ].map(({ label, value, color }) => (
                                            <div key={label} className="flex items-center justify-between py-1.5"
                                                 style={{ borderBottom: '1px solid var(--border)' }}>
                                                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}</span>
                                                <span className="text-sm font-bold" style={{ color }}>
                                                    {value.toLocaleString('fa-IR')} ﷼
                                                </span>
                                            </div>
                                        ))}
                                        {customer && (
                                            <div className="mt-3 p-3 rounded-xl flex items-center gap-2"
                                                 style={{ background: 'var(--primary-subtle)', border: '1px solid var(--primary-light)' }}>
                                                <FontAwesomeIcon icon={faUser} className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                                                <div>
                                                    <p className="text-xs font-bold" style={{ color: 'var(--text)' }}>
                                                        {customer.customer.name} {customer.customer.family || ''}
                                                    </p>
                                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{customer.customer.phone}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="card-footer">
                                        <button type="submit" disabled={mutation.isPending} className="btn btn-success w-full">
                                            {mutation.isPending
                                                ? <><FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />در حال ثبت...</>
                                                : <><FontAwesomeIcon icon={faSave} className="w-4 h-4" />ثبت فاکتور</>
                                            }
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
    )
}