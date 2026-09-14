'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faTicket, faArrowLeft, faPaperPlane, faFile, faXmark,
    faHeadset, faUser, faCircle, faClock, faTag, faAlignLeft,
    faPaperclip, faCheckCircle
} from '@fortawesome/free-solid-svg-icons'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import Swal from '@/app/utils/swal'
import { ENV, getHeaders } from '@/app/config/env'

const TABS = [
    { id: 'info',    label: 'اطلاعات تیکت', icon: faTag       },
    { id: 'message', label: 'پیام',          icon: faAlignLeft },
    { id: 'attach',  label: 'پیوست',         icon: faPaperclip },
]

const CATEGORIES = ['فنی', 'مالی', 'عمومی', 'پشتیبانی', 'درخواست امکانات']
const PRIORITIES = [
    { value: 'low',    label: 'پایین',  color: 'var(--success)', bg: 'var(--success-light)'  },
    { value: 'medium', label: 'متوسط', color: 'var(--warning)', bg: 'var(--warning-light)'  },
    { value: 'high',   label: 'بالا',   color: 'var(--danger)',  bg: 'var(--danger-light)'   },
]

export default function CreateTicketPage() {
    const router       = useRouter()
    const queryClient  = useQueryClient()
    const [activeTab,  setActiveTab]  = useState('info')
    const [direction,  setDirection]  = useState(1)
    const [submitting, setSubmitting] = useState(false)
    const [files,      setFiles]      = useState([])
    const fileRef = useRef(null)

    const [form, setForm] = useState({
        title: '', category: '', priority: 'medium', message: '',
    })

    const set = (k) => (v) => setForm(prev => ({ ...prev, [k]: v }))

    const filledInfo    = form.title && form.category && form.priority
    const filledMessage = form.message.trim().length > 10

    function changeTab(id) {
        const ci = TABS.findIndex(t => t.id === activeTab)
        const ni = TABS.findIndex(t => t.id === id)
        setDirection(ni > ci ? 1 : -1)
        setActiveTab(id)
    }

    const handleFile = (e) => {
        const newFiles = Array.from(e.target.files).map(f => ({ name: f.name, size: f.size, file: f }))
        setFiles(prev => [...prev, ...newFiles])
    }
    const removeFile = (i) => setFiles(prev => prev.filter((_, idx) => idx !== i))

    const handleSubmit = async () => {
        if (!filledInfo)    { changeTab('info');    return Swal.fire({ icon: 'warning', title: 'اطلاعات ناقص', text: 'عنوان و دسته‌بندی را پر کنید' }) }
        if (!filledMessage) { changeTab('message'); return Swal.fire({ icon: 'warning', title: 'پیام خالی',    text: 'متن پیام را وارد کنید' }) }

        // ⭐⭐ اگه فایل پیوست شده ولی بک‌اند برای آپلود فایل مسیر جدایی نداره
        // (تو مستندات routes چیزی برای آپلود فایل دیده نشد)، فعلاً به کاربر هشدار می‌دیم
        if (files.length > 0) {
            const confirm = await Swal.fire({
                icon: 'info',
                title: 'توجه',
                text: 'در حال حاضر امکان آپلود فایل پیوست پیاده‌سازی نشده و فایل‌های انتخابی ارسال نخواهند شد. ادامه می‌دهید؟',
                showCancelButton: true,
                confirmButtonText: 'بله، بدون پیوست ادامه بده',
                cancelButtonText: 'انصراف',
            })
            if (!confirm.isConfirmed) return
        }

        setSubmitting(true)
        try {
            // ⭐⭐ تغییر اصلی: قبلاً اینجا فقط یه setTimeout الکی بود و هیچ درخواستی
            // به سرور نمی‌رفت! الان واقعاً POST به ENV.API_TICKETS می‌زنیم.
            // ⭐ نکته: بک‌اند فیلد رو 'content' می‌خواد، نه 'message' — طبق مستندات routes
            const res = await fetch(ENV.API_TICKETS, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({
                    title:    form.title,
                    content:  form.message,      // ⭐ map شدن message → content
                    priority: form.priority,
                    category: form.category || undefined,
                }),
            })
            const result = await res.json().catch(() => ({}))

            if (!res.ok) {
                const msg =
                    (result?.errors && typeof result.errors === 'object' && Object.values(result.errors)[0]?.[0]) ||
                    (typeof result?.errors === 'string' ? result.errors : null) ||
                    result?.message ||
                    'ثبت تیکت ناموفق بود'
                throw new Error(msg)
            }

            queryClient.invalidateQueries({ queryKey: ['tickets'] })
            await Swal.fire({ icon: 'success', title: 'تیکت ثبت شد!', text: 'تیم پشتیبانی در اسرع وقت پاسخ خواهد داد.', timer: 2500, showConfirmButton: false })
            router.push('/tickets')
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'خطا', text: err.message || 'مشکلی رخ داد' })
        } finally {
            setSubmitting(false)
        }
    }

    const tabVariants = {
        enter:  (d) => ({ opacity: 0, x: d > 0 ? 32 : -32 }),
        center:       { opacity: 1, x: 0 },
        exit:   (d) => ({ opacity: 0, x: d > 0 ? -32 : 32 }),
    }

    return (
            <div className="w-full min-h-screen" style={{ background: 'var(--bg)' }}>

                {/* هدر */}
                <div className="page-header-bar">
                    <div className="max-w-5xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                 style={{ background: 'rgba(255,255,255,0.2)' }}>
                                <FontAwesomeIcon icon={faTicket} className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-white leading-none">ثبت تیکت جدید</h1>
                                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
                                    تیم پشتیبانی ویرا در کنار شماست
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
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* ── ستون اصلی (فرم) ── */}
                        <div className="lg:col-span-2 space-y-5">

                            {/* تب‌بار */}
                            <div className="flex gap-1 p-1 rounded-xl w-fit"
                                 style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                                {TABS.map(tab => {
                                    const done = tab.id === 'info' ? filledInfo : tab.id === 'message' ? filledMessage : files.length > 0
                                    return (
                                        <button key={tab.id} onClick={() => changeTab(tab.id)}
                                                className="relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                                                style={{ color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)' }}>
                                            {activeTab === tab.id && (
                                                <motion.div layoutId="ticket-tab-pill" className="absolute inset-0 rounded-lg"
                                                            style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-sm)' }}
                                                            transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                                            )}
                                            <span className="relative z-10 flex items-center gap-2">
                                                <FontAwesomeIcon icon={tab.icon} className="w-3.5 h-3.5" />
                                                {tab.label}
                                                {done && tab.id !== activeTab && (
                                                    <FontAwesomeIcon icon={faCheckCircle} className="w-3 h-3" style={{ color: 'var(--success)' }} />
                                                )}
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>

                            {/* محتوای تب */}
                            <div className="card overflow-visible">
                                <div className="card-body">
                                    <AnimatePresence mode="wait" custom={direction}>
                                        <motion.div key={activeTab} custom={direction} variants={tabVariants}
                                                    initial="enter" animate="center" exit="exit"
                                                    transition={{ duration: 0.18, ease: 'easeInOut' }}>

                                            {/* ── تب اطلاعات ── */}
                                            {activeTab === 'info' && (
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="form-label">
                                                            <span style={{ color: 'var(--danger)' }}>* </span>عنوان تیکت
                                                        </label>
                                                        <input value={form.title} onChange={e => set('title')(e.target.value)}
                                                               maxLength={50}
                                                               className="form-input" placeholder="موضوع تیکت را بنویسید..." />
                                                    </div>

                                                    <div>
                                                        <label className="form-label">
                                                            <span style={{ color: 'var(--danger)' }}>* </span>دسته‌بندی
                                                        </label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {CATEGORIES.map(cat => (
                                                                <button key={cat} type="button" onClick={() => set('category')(cat)}
                                                                        className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                                                                        style={{
                                                                            background: form.category === cat ? 'var(--primary)' : 'var(--surface-2)',
                                                                            color:      form.category === cat ? '#fff' : 'var(--text-soft)',
                                                                            border:     `1.5px solid ${form.category === cat ? 'var(--primary)' : 'var(--border)'}`,
                                                                        }}>
                                                                    {cat}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="form-label">اولویت</label>
                                                        <div className="flex gap-3">
                                                            {PRIORITIES.map(p => (
                                                                <button key={p.value} type="button" onClick={() => set('priority')(p.value)}
                                                                        className="flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                                                                        style={{
                                                                            background: form.priority === p.value ? p.bg : 'var(--surface-2)',
                                                                            color:      form.priority === p.value ? p.color : 'var(--text-muted)',
                                                                            border:     `1.5px solid ${form.priority === p.value ? p.color : 'var(--border)'}`,
                                                                        }}>
                                                                    <FontAwesomeIcon icon={faCircle} className="w-2 h-2" />
                                                                    {p.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* ── تب پیام (ظاهر چتی) ── */}
                                            {activeTab === 'message' && (
                                                <div className="space-y-4">
                                                    {/* پیش‌نمایش چت */}
                                                    <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--surface-2)', minHeight: '160px' }}>
                                                        {form.message ? (
                                                            <div className="flex items-end gap-2 justify-end">
                                                                <div className="max-w-xs px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm leading-relaxed"
                                                                     style={{ background: 'var(--primary)', color: '#fff' }}>
                                                                    {form.message}
                                                                </div>
                                                                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 font-black text-xs text-white"
                                                                     style={{ background: 'var(--primary-hover)' }}>ع</div>
                                                            </div>
                                                        ) : (
                                                            <div className="h-full flex items-center justify-center py-6">
                                                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                                                    پیش‌نمایش پیام شما اینجا نمایش داده می‌شود
                                                                </p>
                                                            </div>
                                                        )}

                                                        <div className="flex items-end gap-2">
                                                            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                                                                 style={{ background: 'var(--primary-light)' }}>
                                                                <FontAwesomeIcon icon={faHeadset} className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
                                                            </div>
                                                            <div className="max-w-xs px-4 py-2.5 rounded-2xl rounded-br-sm text-sm leading-relaxed"
                                                                 style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-soft)' }}>
                                                                تیم پشتیبانی پاسخ خواهد داد...
                                                                <span className="mr-2 inline-flex gap-0.5">
                                                                    {[0,1,2].map(i => (
                                                                        <motion.span key={i} animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                                                                                     className="w-1 h-1 rounded-full inline-block"
                                                                                     style={{ background: 'var(--muted)' }} />
                                                                    ))}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="form-label">
                                                            <span style={{ color: 'var(--danger)' }}>* </span>متن پیام
                                                        </label>
                                                        <textarea value={form.message} onChange={e => set('message')(e.target.value)}
                                                                  rows={5} placeholder="مشکل یا درخواست خود را با جزئیات کامل بنویسید..."
                                                                  className="form-textarea" />
                                                        <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
                                                            {form.message.length} کاراکتر — حداقل ۱۰ کاراکتر
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* ── تب پیوست ── */}
                                            {activeTab === 'attach' && (
                                                <div className="space-y-4">
                                                    <div className="rounded-xl p-3 text-xs" style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}>
                                                        ⚠️ آپلود فایل هنوز از سمت سرور پیاده‌سازی نشده — فایل‌های انتخابی فعلاً ارسال نمی‌شوند.
                                                    </div>
                                                    <div className="rounded-2xl p-8 text-center cursor-pointer transition-all"
                                                         style={{ border: '2px dashed var(--border)', background: 'var(--surface-2)' }}
                                                         onClick={() => fileRef.current?.click()}
                                                         onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--primary-subtle)' }}
                                                         onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)';   e.currentTarget.style.background = 'var(--surface-2)' }}>
                                                        <FontAwesomeIcon icon={faPaperclip} className="w-8 h-8 mb-3" style={{ color: 'var(--primary)' }} />
                                                        <p className="font-bold text-sm mb-1" style={{ color: 'var(--text)' }}>
                                                            فایل را اینجا رها کنید یا کلیک کنید
                                                        </p>
                                                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                                            PNG، JPG، PDF — حداکثر ۵ مگابایت
                                                        </p>
                                                        <input ref={fileRef} type="file" multiple className="hidden" onChange={handleFile} />
                                                    </div>

                                                    {files.length > 0 && (
                                                        <div className="space-y-2">
                                                            {files.map((f, i) => (
                                                                <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                                                                            className="flex items-center gap-3 p-3 rounded-xl"
                                                                            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                                                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                                                         style={{ background: 'var(--primary-light)' }}>
                                                                        <FontAwesomeIcon icon={faFile} className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{f.name}</p>
                                                                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                                                            {(f.size / 1024).toFixed(1)} KB
                                                                        </p>
                                                                    </div>
                                                                    <button onClick={() => removeFile(i)}
                                                                            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                                                            style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
                                                                        <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
                                                                    </button>
                                                                </motion.div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {files.length === 0 && (
                                                        <p className="text-center text-sm py-2" style={{ color: 'var(--text-muted)' }}>
                                                            هنوز فایلی انتخاب نشده (اختیاری)
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </motion.div>
                                    </AnimatePresence>
                                </div>

                                {/* footer فرم */}
                                <div className="card-footer flex items-center justify-between gap-3">
                                    <div className="flex gap-2">
                                        {TABS.findIndex(t => t.id === activeTab) > 0 && (
                                            <button type="button" className="btn btn-secondary btn-sm"
                                                    onClick={() => changeTab(TABS[TABS.findIndex(t => t.id === activeTab) - 1].id)}>
                                                ← قبلی
                                            </button>
                                        )}
                                        {TABS.findIndex(t => t.id === activeTab) < TABS.length - 1 && (
                                            <button type="button" className="btn btn-primary btn-sm"
                                                    onClick={() => changeTab(TABS[TABS.findIndex(t => t.id === activeTab) + 1].id)}>
                                                بعدی →
                                            </button>
                                        )}
                                    </div>
                                    <button onClick={handleSubmit} disabled={submitting} className="btn btn-success">
                                        <FontAwesomeIcon icon={submitting ? faClock : faPaperPlane}
                                                         className={`w-4 h-4 ${submitting ? 'animate-pulse' : ''}`} />
                                        {submitting ? 'در حال ارسال...' : 'ارسال تیکت'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ── ستون کناری (راهنما) ── */}
                        <div className="lg:col-span-1 space-y-4">

                            <div className="card">
                                <div className="card-header">
                                    <p className="card-title text-sm">خلاصه تیکت</p>
                                </div>
                                <div className="card-body space-y-3">
                                    {[
                                        { label: 'عنوان',      value: form.title    || '—',                              icon: faTag       },
                                        { label: 'دسته‌بندی', value: form.category  || '—',                              icon: faTicket    },
                                        { label: 'اولویت',    value: PRIORITIES.find(p => p.value === form.priority)?.label || '—', icon: faCircle },
                                        { label: 'پیوست',     value: files.length > 0 ? `${files.length} فایل` : 'ندارد', icon: faPaperclip },
                                    ].map(({ label, value, icon }) => (
                                        <div key={label} className="flex items-center gap-2.5">
                                            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                                 style={{ background: 'var(--primary-light)' }}>
                                                <FontAwesomeIcon icon={icon} className="w-3 h-3" style={{ color: 'var(--primary)' }} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
                                                <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="card">
                                <div className="card-header">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                                             style={{ background: 'var(--info-light)' }}>
                                            <FontAwesomeIcon icon={faHeadset} className="w-3.5 h-3.5" style={{ color: 'var(--info)' }} />
                                        </div>
                                        <p className="card-title text-sm">راهنما</p>
                                    </div>
                                </div>
                                <div className="card-body space-y-3">
                                    {[
                                        { step: '۱', text: 'عنوان و دسته‌بندی را وارد کنید' },
                                        { step: '۲', text: 'مشکل را با جزئیات کامل شرح دهید' },
                                        { step: '۳', text: 'در صورت نیاز فایل پیوست کنید' },
                                        { step: '۴', text: 'تیکت را ارسال کنید' },
                                    ].map(({ step, text }) => (
                                        <div key={step} className="flex items-start gap-3">
                                            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 text-white"
                                                  style={{ background: 'var(--primary)' }}>{step}</span>
                                            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-soft)' }}>{text}</p>
                                        </div>
                                    ))}
                                    <div className="mt-3 p-3 rounded-xl" style={{ background: 'var(--success-light)' }}>
                                        <p className="text-xs font-semibold" style={{ color: 'var(--success)' }}>
                                            ⏱ میانگین زمان پاسخ: ۲–۴ ساعت کاری
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    )
}