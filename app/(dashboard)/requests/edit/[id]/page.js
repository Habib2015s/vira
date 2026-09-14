'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTrash, faArrowLeft, faSave, faSearch, faSpinner, faWrench } from '@fortawesome/free-solid-svg-icons'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'
import Select from 'react-select'
import { ENV } from '@/app/config/env'

// ── react-select استایل با CSS variable — دارک مود safe ──
const buildSelectStyles = () => ({
    control: (base, state) => ({
        ...base,
        minHeight: '40px', height: '40px',
        borderRadius: 'var(--radius)',
        background: 'var(--surface)',
        borderColor: state.isFocused ? 'var(--primary)' : 'var(--border)',
        borderWidth: '1.5px',
        boxShadow: state.isFocused ? '0 0 0 3px rgba(84,76,207,0.1)' : 'none',
        '&:hover': { borderColor: 'var(--border-strong)' },
        transition: 'border-color 0.15s, box-shadow 0.15s',
    }),
    menu: (base) => ({
        ...base, background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)', zIndex: 9999, boxShadow: 'var(--shadow-lg)',
    }),
    menuList:   (base) => ({ ...base, padding: '6px', background: 'var(--surface)' }),
    option:     (base, state) => ({
        ...base, borderRadius: 'var(--radius-sm)', margin: '2px 0', cursor: 'pointer', fontSize: '13.5px',
        background: state.isSelected ? 'var(--primary)' : state.isFocused ? 'var(--surface-2)' : 'transparent',
        color: state.isSelected ? '#fff' : 'var(--text)',
    }),
    singleValue:        (base) => ({ ...base, color: 'var(--text)', fontSize: '13.5px' }),
    placeholder:        (base) => ({ ...base, color: 'var(--muted)', fontSize: '13.5px' }),
    input:              (base) => ({ ...base, color: 'var(--text)' }),
    indicatorSeparator: (base) => ({ ...base, background: 'var(--border)' }),
    dropdownIndicator:  (base) => ({ ...base, color: 'var(--muted)' }),
    valueContainer:     (base) => ({ ...base, padding: '0 12px' }),
    noOptionsMessage:   (base) => ({ ...base, color: 'var(--text-muted)', fontSize: '13px' }),
    loadingMessage:     (base) => ({ ...base, color: 'var(--text-muted)', fontSize: '13px' }),
})

export default function EditRequestPage({ params }) {
    const router = useRouter()

    const [shops,           setShops]           = useState([])
    const [loadingShops,    setLoadingShops]    = useState(false)
    const [selectedShop,    setSelectedShop]    = useState(null)
    const [tmCodes,         setTmCodes]         = useState([])
    const [selectedTmCode,  setSelectedTmCode]  = useState(null)
    const [searchTerm,      setSearchTerm]      = useState('')
    const [showDropdown,    setShowDropdown]    = useState(false)
    const [loading,         setLoading]         = useState(false)
    const [loadingMore,     setLoadingMore]     = useState(false)
    const [nextCursor,      setNextCursor]      = useState(null)
    const [hasMore,         setHasMore]         = useState(false)
    const [rows,            setRows]            = useState([])
    const dropdownRef = useRef(null)

    const selectStyles = buildSelectStyles()

    useEffect(() => { fetchShops() }, [])

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target))
                setShowDropdown(false)
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const fetchShops = async () => {
        setLoadingShops(true)
        try {
            const res    = await fetch(ENV.API_SHOPS, { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } })
            const result = await res.json()
            setShops(result.data.shops.data || [])
        } catch (err) { console.error('Error fetching shops:', err) }
        finally { setLoadingShops(false) }
    }

    const fetchTmCodesForShop = async (shop) => {
        setLoading(true)
        try {
            const res    = await fetch(ENV.API_TM_CODES, { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } })
            const result = await res.json()
            const data   = result.data.tmCodes
            setTmCodes(data.data || [])
            setNextCursor(data.next_cursor)
            setHasMore(!!data.next_cursor)
        } catch (err) { console.error('Error fetching TM codes:', err); setTmCodes([]) }
        finally { setLoading(false) }
    }

    const fetchMoreTmCodes = async () => {
        if (!nextCursor || loadingMore) return
        setLoadingMore(true)
        try {
            const res    = await fetch(`${ENV.API_TM_CODES}?cursor=${nextCursor}`, { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' } })
            const result = await res.json()
            const data   = result.data.tmCodes
            setTmCodes(prev => [...prev, ...data.data])
            setNextCursor(data.next_cursor)
            setHasMore(!!data.next_cursor)
        } catch (err) { console.error('Error:', err) }
        finally { setLoadingMore(false) }
    }

    // ── تبدیل shops به آپشن‌های react-select ──
    const shopOptions = shops.map(s => ({ value: s.id, label: `${s.name} (${s.code})`, shop: s }))

    // ── هندل تغییر شاپ از react-select ──
    const handleShopChange = (option) => {
        const shop = option?.shop || null
        setSelectedShop(shop)
        setSelectedTmCode(null)
        setSearchTerm('')
        setTmCodes([])
        if (shop) fetchTmCodesForShop(shop)
    }

    const handleSearchChange = (e) => {
        const val = e.target.value
        setSearchTerm(val)
        setShowDropdown(selectedShop && (val.length >= 2 || val.length === 0))
    }

    const handleSelectTmCode = (tmCode) => {
        setSelectedTmCode(tmCode)
        setSearchTerm(`${tmCode.code} - ${tmCode.title}`)
        setShowDropdown(false)
    }

    const addRow = () => {
        if (!selectedShop)   { Swal.fire('خطا', 'لطفاً ابتدا شاپ را انتخاب کنید', 'error'); return }
        if (!selectedTmCode) { Swal.fire('خطا', 'لطفاً کد تعمیر را انتخاب کنید', 'error'); return }

        const newRow = {
            id:       rows.length > 0 ? Math.max(...rows.map(r => r.id)) + 1 : 1,
            shopId:   selectedShop.id,
            shopName: selectedShop.name,
            tmCodeId: selectedTmCode.id,
            tmCode:   selectedTmCode.code,
            tmTitle:  selectedTmCode.title,
            count:    '1',
            type:     selectedTmCode.type        || 'CM',
            hours:    selectedTmCode.hours       || '',
            fee:      selectedTmCode.base_amount || '',
            notes:    ''
        }
        setRows(prev => [...prev, newRow])
        Swal.fire({ title: 'موفق!', text: 'ردیف جدید اضافه شد', icon: 'success', timer: 1500, showConfirmButton: false })
    }

    const removeRow = (id) => {
        Swal.fire({
            title: 'حذف ردیف', text: 'آیا مطمئن هستید؟', icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#64748b',
            confirmButtonText: 'بله، حذف شود', cancelButtonText: 'انصراف'
        }).then(r => { if (r.isConfirmed) setRows(prev => prev.filter(row => row.id !== id)) })
    }

    const updateRow = (id, field, value) =>
        setRows(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row))

    const filteredTmCodes = searchTerm.length >= 2
        ? tmCodes.filter(tm =>
            tm.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tm.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : tmCodes

    const typeBadgeStyle = (type) => {
        const map = {
            CM: { background: 'var(--info-light)',    color: 'var(--info)'    },
            PM: { background: 'var(--success-light)', color: 'var(--success)' },
            EM: { background: 'var(--primary-light)', color: 'var(--primary)' },
        }
        return map[type] || { background: 'var(--surface-2)', color: 'var(--text-muted)' }
    }

    return (
            <div className="w-full min-h-screen" style={{ background: 'var(--bg)' }}>

                {/* ── هدر ── */}
                <div className="page-header-bar">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                 style={{ background: 'rgba(255,255,255,0.2)' }}>
                                <FontAwesomeIcon icon={faWrench} className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-white leading-none">ویرایش درخواست تعمیر</h1>
                                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
                                    شماره: {params?.id}
                                </p>
                            </div>
                        </div>
                        <button onClick={() => router.back()} className="btn btn-back">
                            <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
                            بازگشت
                        </button>
                    </div>
                </div>

                <div className="page-content max-w-7xl">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="card">

                            {/* card header */}
                            <div className="card-header">
                                <h2 className="card-title flex items-center gap-2">
                                    <FontAwesomeIcon icon={faWrench} className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                                    لیست تعمیرات
                                </h2>
                                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                               onClick={addRow} className="btn btn-success btn-sm">
                                    <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" />
                                    افزودن ردیف
                                </motion.button>
                            </div>

                            <div className="card-body">

                                {/* ── فرم انتخاب ── */}
                                <div className="rounded-xl p-5 mb-6"
                                     style={{ background: 'var(--primary-subtle)', border: '1.5px solid var(--primary-light)' }}>
                                    <div className="grid grid-cols-2 gap-5">

                                        {/* ⭐ شاپ — react-select با جستجوی ۲ کاراکتر */}
                                        <div>
                                            <label className="form-label">
                                                <span style={{ color: 'var(--danger)' }}>* </span>شاپ
                                            </label>
                                            <Select
                                                value={shopOptions.find(o => o.value === selectedShop?.id) || null}
                                                onChange={handleShopChange}
                                                options={shopOptions}
                                                styles={selectStyles}
                                                placeholder="جستجو نام یا کد شاپ..."
                                                isClearable
                                                isLoading={loadingShops}
                                                loadingMessage={() => 'در حال بارگذاری...'}
                                                noOptionsMessage={({ inputValue }) =>
                                                    inputValue.length > 0 && inputValue.length < 2
                                                        ? 'حداقل ۲ کاراکتر وارد کنید'
                                                        : inputValue.length >= 2
                                                            ? 'شاپی یافت نشد'
                                                            : 'برای جستجو تایپ کنید'
                                                }
                                                filterOption={(option, inputValue) => {
                                                    // کمتر از ۲ کاراکتر → هیچ نتیجه‌ای نشان نده
                                                    if (inputValue.length > 0 && inputValue.length < 2) return false
                                                    // ۰ کاراکتر → همه نشان بده
                                                    if (inputValue.length === 0) return true
                                                    // ۲+ کاراکتر → فیلتر کن
                                                    const q = inputValue.toLowerCase()
                                                    return (
                                                        option.data.shop.name.toLowerCase().includes(q) ||
                                                        option.data.shop.code.toLowerCase().includes(q)
                                                    )
                                                }}
                                            />
                                            {selectedShop && (
                                                <p className="text-xs mt-1.5 font-semibold" style={{ color: 'var(--primary)' }}>
                                                    ✓ شاپ انتخاب شد: {selectedShop.name}
                                                </p>
                                            )}
                                        </div>

                                        {/* کد تعمیر — dropdown سفارشی */}
                                        <div className="relative" ref={dropdownRef}>
                                            <label className="form-label">
                                                <span style={{ color: 'var(--danger)' }}>* </span>کد تعمیر
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={searchTerm}
                                                    onChange={handleSearchChange}
                                                    onFocus={() => selectedShop && setShowDropdown(true)}
                                                    placeholder={selectedShop ? 'جستجو کد یا عنوان...' : 'ابتدا شاپ انتخاب کنید'}
                                                    disabled={!selectedShop}
                                                    className="form-input"
                                                    style={{ paddingLeft: '40px' }}
                                                />
                                                <FontAwesomeIcon
                                                    icon={loading ? faSpinner : faSearch}
                                                    className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                                                    style={{ color: 'var(--muted)' }} />

                                                <AnimatePresence>
                                                    {showDropdown && selectedShop && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                                                            transition={{ duration: 0.15 }}
                                                            className="absolute z-50 w-full mt-1 rounded-xl overflow-hidden"
                                                            style={{ background: 'var(--surface)', border: '1.5px solid var(--primary)', boxShadow: 'var(--shadow-lg)', maxHeight: '300px', overflowY: 'auto' }}>

                                                            {loading && filteredTmCodes.length === 0 ? (
                                                                <div className="p-6 text-center">
                                                                    <FontAwesomeIcon icon={faSpinner} className="animate-spin w-5 h-5 mb-2" style={{ color: 'var(--primary)' }} />
                                                                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>در حال بارگذاری...</p>
                                                                </div>
                                                            ) : filteredTmCodes.length === 0 ? (
                                                                <div className="p-6 text-center">
                                                                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                                                        {searchTerm.length === 1 ? 'حداقل ۲ کاراکتر وارد کنید' : 'کد تعمیری یافت نشد'}
                                                                    </p>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    {filteredTmCodes.map(tm => (
                                                                        <button key={tm.id} onClick={() => handleSelectTmCode(tm)}
                                                                                className="w-full px-4 py-3 text-right transition-all"
                                                                                style={{ borderBottom: '1px solid var(--border)' }}
                                                                                onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-subtle)'}
                                                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                                            <div className="flex items-center justify-between gap-3">
                                                                                <div>
                                                                                    <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{tm.code}</p>
                                                                                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{tm.title}</p>
                                                                                </div>
                                                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                                                    <span className="badge" style={typeBadgeStyle(tm.type)}>{tm.type}</span>
                                                                                    {tm.hours && (
                                                                                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{tm.hours}h</span>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </button>
                                                                    ))}
                                                                    {hasMore && (
                                                                        <div className="p-3 text-center" style={{ borderTop: '1px solid var(--border)' }}>
                                                                            <button onClick={fetchMoreTmCodes} disabled={loadingMore}
                                                                                    className="text-sm font-bold disabled:opacity-50"
                                                                                    style={{ color: 'var(--primary)' }}>
                                                                                {loadingMore
                                                                                    ? <><FontAwesomeIcon icon={faSpinner} className="animate-spin w-3.5 h-3.5 ml-1" />بارگذاری...</>
                                                                                    : 'بارگذاری بیشتر ↓'
                                                                                }
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    </div>

                                    {!selectedShop && (
                                        <div className="mt-4 alert alert-info">
                                            برای افزودن ردیف، ابتدا شاپ و کد تعمیر را انتخاب کنید
                                        </div>
                                    )}
                                </div>

                                {/* ── جدول ردیف‌ها ── */}
                                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                                    <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                                        <thead style={{ background: 'var(--primary)' }}>
                                        <tr>
                                            {['شاپ', 'کد تعمیر', 'عنوان', 'تعداد', 'نوع', 'ساعت', 'هزینه', 'توضیحات', 'عملیات'].map((h, i, arr) => (
                                                <th key={h} className="px-3 py-3 text-center text-xs font-bold text-white"
                                                    style={{ borderLeft: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.15)' : 'none' }}>
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                        </thead>
                                        <tbody>
                                        <AnimatePresence>
                                            {rows.length === 0 ? (
                                                <tr>
                                                    <td colSpan="9" className="py-14 text-center">
                                                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                                                             style={{ background: 'var(--surface-2)' }}>
                                                            <FontAwesomeIcon icon={faWrench} className="w-5 h-5" style={{ color: 'var(--muted)' }} />
                                                        </div>
                                                        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>هیچ ردیفی اضافه نشده</p>
                                                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>شاپ و کد تعمیر را انتخاب کنید</p>
                                                    </td>
                                                </tr>
                                            ) : (
                                                rows.map((row) => (
                                                    <motion.tr key={row.id}
                                                               initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                                                               exit={{ opacity: 0, x: -10 }}
                                                               style={{ borderBottom: '1px solid var(--border)' }}
                                                               onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-subtle)'}
                                                               onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                        <td className="px-2 py-2.5 text-center">
                                                            <span className="badge badge-primary text-xs">{row.shopName}</span>
                                                        </td>
                                                        <td className="px-2 py-2.5 text-center">
                                                            <span className="font-mono font-bold text-sm" style={{ color: 'var(--primary)' }}>{row.tmCode}</span>
                                                        </td>
                                                        <td className="px-2 py-2.5 text-center text-xs" style={{ color: 'var(--text-soft)' }}>
                                                            {row.tmTitle}
                                                        </td>
                                                        <td className="px-2 py-2.5">
                                                            <input type="number" value={row.count}
                                                                   onChange={(e) => updateRow(row.id, 'count', e.target.value)}
                                                                   className="form-input text-center"
                                                                   style={{ height: '34px', minWidth: '60px' }} />
                                                        </td>
                                                        <td className="px-2 py-2.5 text-center">
                                                            <span className="badge" style={typeBadgeStyle(row.type)}>{row.type}</span>
                                                        </td>
                                                        <td className="px-2 py-2.5 text-center text-sm" style={{ color: 'var(--text-soft)' }}>
                                                            {row.hours || '—'}
                                                        </td>
                                                        <td className="px-2 py-2.5">
                                                            <input type="text" value={row.fee}
                                                                   onChange={(e) => updateRow(row.id, 'fee', e.target.value)}
                                                                   className="form-input"
                                                                   style={{ height: '34px', minWidth: '80px' }} />
                                                        </td>
                                                        <td className="px-2 py-2.5">
                                                            <input type="text" value={row.notes}
                                                                   onChange={(e) => updateRow(row.id, 'notes', e.target.value)}
                                                                   className="form-input"
                                                                   style={{ height: '34px' }} />
                                                        </td>
                                                        <td className="px-2 py-2.5 text-center">
                                                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                                                           onClick={() => removeRow(row.id)}
                                                                           className="action-btn action-btn-delete">
                                                                <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5" />
                                                            </motion.button>
                                                        </td>
                                                    </motion.tr>
                                                ))
                                            )}
                                        </AnimatePresence>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {rows.length > 0 && (
                                <div className="card-footer flex justify-end">
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                                   className="btn btn-primary btn-lg">
                                        <FontAwesomeIcon icon={faSave} className="w-4 h-4" />
                                        ذخیره تغییرات
                                    </motion.button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
    )
}