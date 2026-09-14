'use client'

import { useState, useEffect, useRef } from 'react'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faUserShield, faTrash, faSpinner, faPlus,
    faWarehouse, faUser, faCalendar,
    faXmark, faSave, faHashtag, faTriangleExclamation
} from '@fortawesome/free-solid-svg-icons'
import Select from 'react-select'
import Swal from '@/app/utils/swal'
import DataTable from '@/app/components/DataTable/DataTable'
import { ENV, getHeaders } from '@/app/config/env'

const BASE    = ENV.API_WAREHOUSE_STOREHOUSE_USERS

// ── hook تشخیص دارک مود ────────────────────────────
function useIsDark() {
    const [isDark, setIsDark] = useState(false)
    useEffect(() => {
        const check = () => setIsDark(
            document.documentElement.classList.contains('dark') ||
            document.documentElement.getAttribute('data-theme') === 'dark'
        )
        check()
        const obs = new MutationObserver(check)
        obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] })
        return () => obs.disconnect()
    }, [])
    return isDark
}

// ── react-select styles تم‌aware ────────────────────
const makeSelectStyles = (isDark) => ({
    control: (b, s) => ({
        ...b, minHeight: '40px',
        background:  isDark ? 'var(--surface)' : 'var(--surface)',
        borderColor: s.isFocused ? 'var(--primary)' : 'var(--border)',
        borderWidth: '1.5px', borderRadius: 'var(--radius)',
        boxShadow:   s.isFocused ? '0 0 0 3px rgba(24,24,27,0.15)' : 'none',
        '&:hover':   { borderColor: 'var(--border-strong)' },
    }),
    menu:        (b) => ({ ...b, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)' }),
    menuList:    (b) => ({ ...b, padding: '4px', background: 'var(--surface)' }),
    option:      (b, s) => ({
        ...b, borderRadius: 'var(--radius-sm)', cursor: 'pointer',
        background:  s.isSelected ? 'var(--primary)' : s.isFocused ? 'var(--surface-2)' : 'transparent',
        color:       s.isSelected ? 'var(--surface)' : 'var(--text)',
        fontSize:    '13.5px',
        '&:active':  { background: 'var(--primary)' }
    }),
    singleValue:      (b) => ({ ...b, color: 'var(--text)',       fontSize: '13.5px' }),
    multiValue:       (b) => ({ ...b, background: 'var(--primary-light)', borderRadius: '6px' }),
    multiValueLabel:  (b) => ({ ...b, color: 'var(--primary)',    fontSize: '12px', fontWeight: 700 }),
    multiValueRemove: (b) => ({ ...b, color: 'var(--primary)',    '&:hover': { background: 'var(--danger-light)', color: 'var(--danger)' } }),
    placeholder:      (b) => ({ ...b, color: 'var(--muted)',      fontSize: '13.5px' }),
    input:            (b) => ({ ...b, color: 'var(--text)' }),
    noOptionsMessage: (b) => ({ ...b, color: 'var(--text-muted)', fontSize: '13px' }),
    menuPortal:       (b) => ({ ...b, zIndex: 9999 }),
})

const fetchStorehouseUsers = async ({ pageParam = null }) => {
    let url = BASE
    if (pageParam) url += `?cursor=${pageParam}`
    const res = await fetch(url, { headers: getHeaders() })
    if (!res.ok) throw new Error('خطا در دریافت')
    return (await res.json()).data.storehouseUsers
}

// ⭐⭐ اضافه شد: تابع جدا با error handling درست برای گرفتن لیست انبارها.
// قبلاً اگه بک‌اند خطا می‌داد (مثلاً 500)، کد بی‌سروصدا [] برمی‌گردوند
// و هیچ نشونه‌ای از خطا نبود - انگار اصلاً درخواستی رد نشده.
const fetchStorehouses = async () => {
    const res = await fetch(ENV.API_WAREHOUSE_STOREHOUSES, { headers: getHeaders() })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
        // ⭐ خطای واقعی بک‌اند رو پرتاب می‌کنیم تا useQuery اون رو به‌عنوان error بشناسه
        throw new Error(json?.message || json?.errors || `خطای سرور (${res.status}) در دریافت لیست انبارها`)
    }
    return json.data?.storehouses?.data || []
}

// ── Modal افزودن دسترسی ─────────────────────────────
function AddModal({ open, onClose, onSuccess, storehouses, existingUserIds, storehousesError }) {
    const isDark    = useIsDark()
    const styles    = makeSelectStyles(isDark)
    const [userOpt,      setUserOpt]      = useState(null)
    const [storehouse,   setStorehouse]   = useState(null)
    const [customUserId, setCustomUserId] = useState('')
    const [showCustom,   setShowCustom]   = useState(false)
    const [errors,       setErrors]       = useState({})

    // ⭐ گزینه‌های کاربر = user_idهای موجود + امکان وارد کردن ID جدید
    const userOptions = [
        ...existingUserIds.map(uid => ({
            value: uid,
            label: `کاربر #${uid}`,
            isExisting: true,
        })),
        { value: '__custom__', label: '+ وارد کردن شناسه جدید...', isNew: true },
    ]

    const storeOptions = storehouses.map(s => ({
        value: s.id,
        label: `${s.name} (${s.code})`,
        store: s,
    }))

    const mutation = useMutation({
        mutationFn: (body) =>
            fetch(BASE, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(r => r.json()),
        onSuccess: (res) => {
            if (res.data?.storehouseUser) {
                Swal.fire({ title: 'افزوده شد!', icon: 'success', timer: 1800, showConfirmButton: false })
                setUserOpt(null); setStorehouse(null); setCustomUserId(''); setShowCustom(false); setErrors({})
                onSuccess()
                onClose()
            } else {
                const errMap = {}
                if (res.errors) Object.entries(res.errors).forEach(([k, v]) => { errMap[k] = Array.isArray(v) ? v[0] : v })
                else errMap.general = res.message || 'خطایی رخ داد'
                setErrors(errMap)
            }
        },
        onError: () => Swal.fire('خطا!', 'مشکل در اتصال', 'error'),
    })

    const handleUserChange = (opt) => {
        setErrors(p => ({ ...p, user_id: null }))
        if (!opt) { setUserOpt(null); setShowCustom(false); return }
        if (opt.value === '__custom__') { setShowCustom(true); setUserOpt(opt) }
        else { setUserOpt(opt); setShowCustom(false) }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const err = {}
        let finalUserId = null
        if (showCustom) {
            if (!customUserId || isNaN(parseInt(customUserId)) || parseInt(customUserId) < 1)
                err.user_id = 'شناسه کاربر معتبر وارد کنید'
            else finalUserId = parseInt(customUserId)
        } else {
            if (!userOpt || userOpt.value === '__custom__') err.user_id = 'انتخاب کاربر الزامی است'
            else finalUserId = userOpt.value
        }
        if (!storehouse) err.storehouse_id = 'انتخاب انبار الزامی است'
        if (Object.keys(err).length) return setErrors(err)

        mutation.mutate({ user_id: finalUserId, storehouse_id: storehouse.value })
    }

    if (!open) return null

    return (
        <div className="fixed inset-0 flex items-center justify-center p-4"
             style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', zIndex: 50 }}
             onClick={e => { if (e.target === e.currentTarget) onClose() }}>
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 16 }}
                        className="card w-full max-w-md"
                        style={{ zIndex: 51, position: 'relative' }}
                        onClick={e => e.stopPropagation()}>

                <div className="card-header">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                             style={{ background: 'var(--primary-light)' }}>
                            <FontAwesomeIcon icon={faUserShield} className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                        </div>
                        <p className="card-title">افزودن دسترسی به انبار</p>
                    </div>
                    <button onClick={onClose} className="icon-action danger w-7 h-7">
                        <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
                    </button>
                </div>

                <div className="card-body">
                    {/* ⭐⭐ اضافه شد: اگه گرفتن لیست انبارها خطا داشت، به‌جای خالی بودن ساکت دراپ‌داون، اینجا واضح نشون بده */}
                    {storehousesError && (
                        <div className="mb-4 p-3 rounded-xl flex items-start gap-2.5 text-xs"
                             style={{ background: 'var(--danger-light)', border: '1px solid var(--danger)', color: 'var(--danger)' }}>
                            <FontAwesomeIcon icon={faTriangleExclamation} className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold mb-1">دریافت لیست انبارها با خطا مواجه شد</p>
                                <p>{storehousesError}</p>
                                <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
                                    این یعنی درخواست به سرور رفته ولی سرور خطا برگردونده (نه اینکه درخواستی نرفته). احتمالاً هنوز انباری در دیتابیس ثبت نشده یا endpoint بک‌اند مشکل داره.
                                </p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* ── انتخاب کاربر ── */}
                        <div>
                            <label className="form-label flex items-center gap-1.5">
                                <div className="w-5 h-5 rounded flex items-center justify-center"
                                     style={{ background: 'var(--primary-light)' }}>
                                    <FontAwesomeIcon icon={faUser} className="w-2.5 h-2.5" style={{ color: 'var(--primary)' }} />
                                </div>
                                <span style={{ color: 'var(--danger)' }}>*</span>
                                کاربر
                            </label>
                            <Select
                                options={userOptions}
                                value={userOpt}
                                onChange={handleUserChange}
                                styles={{
                                    ...styles,
                                    option: (b, s) => ({
                                        ...styles.option(b, s),
                                        ...(s.data?.isNew ? {
                                            color:      'var(--primary)',
                                            fontWeight: 700,
                                            fontStyle:  'italic',
                                            borderTop:  '1px solid var(--border)',
                                            marginTop:  '4px',
                                        } : {}),
                                    })
                                }}
                                placeholder="جستجو یا انتخاب کاربر..."
                                isClearable
                                noOptionsMessage={() => 'کاربری یافت نشد'}
                                menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                menuPosition="fixed"
                                formatOptionLabel={(opt) => opt.isNew
                                    ? <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{opt.label}</span>
                                    : (
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                                                 style={{
                                                     background: 'var(--surface-2)',
                                                     color:      'var(--text-soft)',
                                                     border: '1px solid var(--border)',
                                                 }}>
                                                <FontAwesomeIcon icon={faUser} className="w-3 h-3" />
                                            </div>
                                            <span>{opt.label}</span>
                                        </div>
                                    )
                                }
                            />
                            {errors.user_id && (
                                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                                          className="text-xs mt-1.5 font-medium" style={{ color: 'var(--danger)' }}>
                                    {errors.user_id}
                                </motion.p>
                            )}
                        </div>

                        {/* ── اگه "وارد کردن شناسه جدید" انتخاب شد ── */}
                        <AnimatePresence>
                            {showCustom && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}>
                                    <label className="form-label flex items-center gap-1.5">
                                        <div className="w-5 h-5 rounded flex items-center justify-center"
                                             style={{ background: 'var(--info-light)' }}>
                                            <FontAwesomeIcon icon={faHashtag} className="w-2.5 h-2.5" style={{ color: 'var(--info)' }} />
                                        </div>
                                        شناسه کاربر جدید
                                    </label>
                                    <input
                                        type="number" min="1"
                                        value={customUserId}
                                        onChange={e => { setCustomUserId(e.target.value); setErrors(p => ({ ...p, user_id: null })) }}
                                        placeholder="مثال: 42"
                                        className={`form-input ${errors.user_id ? 'error' : ''}`}
                                        autoFocus
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* ── انتخاب انبار ── */}
                        <div>
                            <label className="form-label flex items-center gap-1.5">
                                <div className="w-5 h-5 rounded flex items-center justify-center"
                                     style={{ background: 'var(--info-light)' }}>
                                    <FontAwesomeIcon icon={faWarehouse} className="w-2.5 h-2.5" style={{ color: 'var(--info)' }} />
                                </div>
                                <span style={{ color: 'var(--danger)' }}>*</span>
                                انبار
                            </label>
                            <Select
                                options={storeOptions}
                                value={storehouse}
                                onChange={(opt) => { setStorehouse(opt); setErrors(p => ({ ...p, storehouse_id: null })) }}
                                styles={styles}
                                placeholder={storehouses.length === 0 ? 'انباری موجود نیست' : 'جستجو یا انتخاب انبار...'}
                                isClearable
                                isDisabled={storehouses.length === 0}
                                noOptionsMessage={() => 'انباری یافت نشد'}
                                menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                menuPosition="fixed"
                                filterOption={(opt, input) => {
                                    if (!input) return true
                                    const q = input.toLowerCase()
                                    return opt.data.store.name.toLowerCase().includes(q) ||
                                        opt.data.store.code.toLowerCase().includes(q)
                                }}
                                formatOptionLabel={(opt) => (
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                                             style={{
                                                 background: 'var(--surface-2)',
                                                 color:      'var(--text-soft)',
                                                 border: '1px solid var(--border)',
                                             }}>
                                            <FontAwesomeIcon icon={faWarehouse} className="w-3 h-3" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold leading-none">{opt.store.name}</p>
                                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{opt.store.code}</p>
                                        </div>
                                    </div>
                                )}
                            />
                            {errors.storehouse_id && (
                                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                                          className="text-xs mt-1.5 font-medium" style={{ color: 'var(--danger)' }}>
                                    {errors.storehouse_id}
                                </motion.p>
                            )}
                            {errors.general && (
                                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                                          className="text-xs mt-1.5 font-medium" style={{ color: 'var(--danger)' }}>
                                    {errors.general}
                                </motion.p>
                            )}
                        </div>

                        {/* پیش‌نمایش */}
                        <AnimatePresence>
                            {(userOpt || storehouse) && (
                                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                            className="p-3 rounded-xl flex items-center gap-3"
                                            style={{ background: 'var(--primary-subtle)', border: '1.5px dashed var(--primary-light)' }}>
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                         style={{ background: 'var(--primary-light)' }}>
                                        <FontAwesomeIcon icon={faUserShield} className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                                    </div>
                                    <div className="text-xs" style={{ color: 'var(--primary)' }}>
                                        <p className="font-bold">
                                            {showCustom
                                                ? `کاربر #${customUserId || '—'}`
                                                : userOpt && !userOpt.isNew ? userOpt.label : 'کاربر انتخاب نشده'
                                            }
                                        </p>
                                        <p style={{ color: 'var(--text-muted)' }}>
                                            {storehouse ? `انبار: ${storehouse.store.name}` : 'انبار انتخاب نشده'}
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex justify-end gap-3 pt-2"
                             style={{ borderTop: '1px solid var(--border)' }}>
                            <button type="button" onClick={onClose} className="btn btn-ghost btn-sm">انصراف</button>
                            <button type="submit" disabled={mutation.isPending} className="btn btn-success btn-sm">
                                {mutation.isPending
                                    ? <><FontAwesomeIcon icon={faSpinner} className="w-3.5 h-3.5 animate-spin" />در حال افزودن...</>
                                    : <><FontAwesomeIcon icon={faSave} className="w-3.5 h-3.5" />افزودن دسترسی</>
                                }
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    )
}

// ══════════════════════════════════════════════════════
export default function StorehouseUsersPage() {
    const observerTarget = useRef(null)
    const queryClient    = useQueryClient()
    const isDark         = useIsDark()
    const styles         = makeSelectStyles(isDark)
    const [modalOpen, setModalOpen] = useState(false)

    // ⭐⭐ تغییر اصلی: از fetchStorehouses جدید استفاده می‌کنیم که خطای واقعی رو throw می‌کنه
    const { data: storehouses = [], error: storehousesQueryError } = useQuery({
        queryKey: ['warehouseStorehouses'],
        queryFn: fetchStorehouses,
        staleTime: 10 * 60 * 1000,
        retry: 1,
    })
    const storehousesError = storehousesQueryError?.message || null

    const storeMap = Object.fromEntries(storehouses.map(s => [s.id, s]))

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
        queryKey: ['storehouseUsers'],
        queryFn:  fetchStorehouseUsers,
        initialPageParam: null,
        getNextPageParam: (p) => p?.next_cursor ?? undefined,
        staleTime: 5 * 60 * 1000,
    })

    const deleteMutation = useMutation({
        mutationFn: (id) => fetch(`${BASE}/${id}`, { method: 'DELETE', headers: getHeaders() }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['storehouseUsers'] })
            Swal.fire({ title: 'حذف شد!', icon: 'success', timer: 2000, showConfirmButton: false })
        },
        onError: () => Swal.fire('خطا!', 'حذف انجام نشد', 'error'),
    })

    useEffect(() => {
        const observer = new IntersectionObserver(
            e => { if (e[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage() },
            { threshold: 0.5 }
        )
        if (observerTarget.current) observer.observe(observerTarget.current)
        return () => { if (observerTarget.current) observer.unobserve(observerTarget.current) }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage])

    const handleDelete = (row) =>
        Swal.fire({
            title: 'حذف دسترسی',
            html: `دسترسی کاربر <strong>#${row.user_id}</strong> از انبار <strong>${storeMap[row.storehouse_id]?.name || row.storehouse_id}</strong> حذف شود؟`,
            icon: 'warning', showCancelButton: true,
            confirmButtonColor: 'var(--danger)', cancelButtonColor: 'var(--muted)',
            confirmButtonText: 'بله، حذف شود', cancelButtonText: 'انصراف'
        }).then(r => { if (r.isConfirmed) deleteMutation.mutate(row.id) })

    const allData = data?.pages.flatMap(p => p.data) ?? []

    // ⭐ user_idهای یکتا از لیست موجود
    const existingUserIds = [...new Set(allData.map(d => d.user_id))].sort((a, b) => a - b)

    const columns = [
        {
            key: 'id', label: '#',
            render: (row) => <span className="badge badge-muted text-xs">#{row.id}</span>
        },
        {
            key: 'user_id', label: 'کاربر',
            render: (row) => (
                <div className="flex items-center gap-2.5">

                    <div>
                        <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>کاربر #{row.user_id}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>user_id: {row.user_id}</p>
                    </div>
                </div>
            )
        },
        {
            key: 'storehouse_id', label: 'انبار',
            render: (row) => {
                const s = storeMap[row.storehouse_id]
                return (
                    <div className="flex items-center gap-2">

                        <div>
                            <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>
                                {s ? s.name : `انبار #${row.storehouse_id}`}
                            </p>
                            {s && <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{s.code}</p>}
                        </div>
                    </div>
                )
            }
        },
        {
            key: 'created_at', label: 'تاریخ اتصال',
            render: (row) => (
                <div className="flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faCalendar} className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                    <span className="text-sm" style={{ color: 'var(--text-soft)' }}>
                        {new Date(row.created_at).toLocaleDateString('fa-IR')}
                    </span>
                </div>
            )
        },
        {
            key: 'actions', label: 'عملیات',
            render: (row) => (
                <button className="icon-action danger" title="حذف دسترسی"
                        onClick={() => handleDelete(row)} disabled={deleteMutation.isPending}>
                    <FontAwesomeIcon icon={deleteMutation.isPending ? faSpinner : faTrash}
                                     className={`w-3.5 h-3.5 ${deleteMutation.isPending ? 'animate-spin' : ''}`} />
                </button>
            )
        }
    ]

    return (
            <div className="w-full min-h-screen" style={{ background: 'var(--bg)' }}>

                <div className="page-header-bar">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                 style={{ background: 'rgba(255,255,255,0.2)' }}>
                                <FontAwesomeIcon icon={faUserShield} className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-white leading-none">کاربران انبار</h1>
                                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.75)' }}>
                                    مدیریت دسترسی‌ها ({allData.length} مورد)
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setModalOpen(true)} className="btn btn-success">
                            <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
                            افزودن دسترسی
                        </button>
                    </div>
                </div>

                <div className="page-content max-w-7xl">

                    {/* ⭐⭐ اضافه شد: بنر هشدار در خود صفحه هم (نه فقط داخل مودال) اگه انبارها لود نشدن */}
                    {storehousesError && (
                        <div className="mb-4 p-3 rounded-xl flex items-center gap-2.5 text-sm"
                             style={{ background: 'var(--danger-light)', border: '1px solid var(--danger)', color: 'var(--danger)' }}>
                            <FontAwesomeIcon icon={faTriangleExclamation} className="w-4 h-4 flex-shrink-0" />
                            <span><strong>خطا در دریافت لیست انبارها:</strong> {storehousesError}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-3 gap-4 mb-5">
                        {[
                            { label: 'کل دسترسی‌ها',  value: allData.length,          icon: faUserShield, color: 'var(--primary)', bg: 'var(--primary-light)' },
                            { label: 'کاربران یکتا',   value: existingUserIds.length,  icon: faUser,       color: 'var(--success)', bg: 'var(--success-light)' },
                            { label: 'انبارهای فعال',  value: new Set(allData.map(d => d.storehouse_id)).size, icon: faWarehouse, color: 'var(--info)', bg: 'var(--info-light)' },
                        ].map(({ label, value, icon, color, bg }) => (
                            <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                        className="card p-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                                    <FontAwesomeIcon icon={icon} className="w-4 h-4" style={{ color }} />
                                </div>
                                <div>
                                    <p className="text-xl font-black" style={{ color }}>{value}</p>
                                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                        <DataTable data={allData} columns={columns}
                                   loading={isLoading && allData.length === 0}
                                   emptyMessage="هیچ دسترسی‌ای تعریف نشده" disablePagination={true} />
                        {hasNextPage && (
                            <div ref={observerTarget} className="py-8 flex items-center justify-center gap-3">
                                <FontAwesomeIcon icon={faSpinner} className="w-5 h-5 animate-spin" style={{ color: 'var(--primary)' }} />
                                <span className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>بارگذاری...</span>
                            </div>
                        )}
                    </motion.div>
                </div>

                <AnimatePresence>
                    {modalOpen && (
                        <AddModal
                            open={modalOpen}
                            onClose={() => setModalOpen(false)}
                            onSuccess={() => queryClient.invalidateQueries({ queryKey: ['storehouseUsers'] })}
                            storehouses={storehouses}
                            existingUserIds={existingUserIds}
                            storehousesError={storehousesError}
                        />
                    )}
                </AnimatePresence>
            </div>
    )
}