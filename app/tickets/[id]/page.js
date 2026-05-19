'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faTicket, faArrowLeft, faPaperPlane, faHeadset,
    faUser, faCircle, faClock, faTag, faFile, faPaperclip
} from '@fortawesome/free-solid-svg-icons'
import { useRouter, useParams } from 'next/navigation'
import DashboardLayout from '@/app/dashboard/Dashboardlayout'

const MOCK_TICKET = {
    id: 1, title: 'خطا در ثبت بارنامه', category: 'فنی', priority: 'high',
    status: 'in_progress', date: '۱۴۰۴/۱۱/۲۰',
    messages: [
        { id: 1, sender: 'user',    name: 'علی محمدی',    text: 'سلام، وقتی می‌خوام بارنامه جدید ثبت کنم با خطای ۵۰۰ مواجه میشم. این مشکل از دیروز شروع شده.',                                       time: '۱۴۰۴/۱۱/۲۰ - ۱۰:۲۳' },
        { id: 2, sender: 'support', name: 'پشتیبانی ویرا', text: 'سلام علی عزیز، ممنون که با ما در تماس هستید. لطفاً اسکرین‌شات از خطا بفرستید و همچنین بگویید از کدام مرورگر استفاده می‌کنید.',  time: '۱۴۰۴/۱۱/۲۰ - ۱۱:۰۵' },
        { id: 3, sender: 'user',    name: 'علی محمدی',    text: 'از Chrome نسخه ۱۲۰ استفاده می‌کنم. خطا اینه: "Failed to submit: Internal Server Error"',                                            time: '۱۴۰۴/۱۱/۲۰ - ۱۱:۳۰' },
        { id: 4, sender: 'support', name: 'پشتیبانی ویرا', text: 'متشکرم. مشکل شناسایی شد و تیم فنی در حال بررسی است. ظرف ۲ ساعت آینده برطرف خواهد شد.',                                          time: '۱۴۰۴/۱۱/۲۰ - ۱۲:۱۵' },
    ]
}

const STATUS_MAP = {
    open:        { label: 'باز',           cls: 'badge-info'    },
    in_progress: { label: 'در حال بررسی', cls: 'badge-warning' },
    closed:      { label: 'بسته شد',      cls: 'badge-muted'   },
    answered:    { label: 'پاسخ داده شد', cls: 'badge-success' },
}
const PRIORITY_MAP = {
    high:   { label: 'بالا',  color: 'var(--danger)'  },
    medium: { label: 'متوسط', color: 'var(--warning)' },
    low:    { label: 'پایین', color: 'var(--success)' },
}

export default function TicketShowPage() {
    const router = useRouter()
    const { id } = useParams()
    const [ticket,  setTicket]  = useState(MOCK_TICKET)
    const [reply,   setReply]   = useState('')
    const [sending, setSending] = useState(false)
    const bottomRef = useRef(null)

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [ticket.messages])

    const sendReply = async () => {
        if (!reply.trim()) return
        setSending(true)
        await new Promise(r => setTimeout(r, 600))
        const newMsg = {
            id:     ticket.messages.length + 1,
            sender: 'user', name: 'علی محمدی',
            text:   reply, time: 'همین الان'
        }
        setTicket(prev => ({ ...prev, messages: [...prev.messages, newMsg] }))
        setReply('')
        setSending(false)
    }

    const st = STATUS_MAP[ticket.status]   || STATUS_MAP.open
    const pr = PRIORITY_MAP[ticket.priority] || PRIORITY_MAP.medium

    return (
        <DashboardLayout>
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
                                <h1 className="text-xl font-black text-white leading-none">{ticket.title}</h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`badge ${st.cls}`} style={{ fontSize: '10px', padding: '2px 8px' }}>{st.label}</span>
                                    <span className="text-xs font-bold" style={{ color: pr.color }}>
                                        <FontAwesomeIcon icon={faCircle} className="w-2 h-2 ml-1" />
                                        اولویت {pr.label}
                                    </span>
                                </div>
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

                        {/* ── چت ── */}
                        <div className="lg:col-span-2 flex flex-col gap-4">

                            {/* پنجره پیام‌ها */}
                            <div className="card flex flex-col" style={{ minHeight: '480px' }}>
                                {/* هدر چت */}
                                <div className="card-header">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                             style={{ background: 'var(--primary-light)' }}>
                                            <FontAwesomeIcon icon={faHeadset} className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>گفتگوی تیکت #{id}</p>
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full" style={{ background: 'var(--success)' }} />
                                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>پشتیبانی آنلاین</p>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{ticket.messages.length} پیام</span>
                                </div>

                                {/* بدنه پیام‌ها */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ background: 'var(--surface-2)', maxHeight: '380px' }}>
                                    {ticket.messages.map((msg, i) => {
                                        const isUser = msg.sender === 'user'
                                        return (
                                            <motion.div key={msg.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                                                        className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                                                {!isUser && (
                                                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                                         style={{ background: 'var(--primary-light)' }}>
                                                        <FontAwesomeIcon icon={faHeadset} className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
                                                    </div>
                                                )}
                                                <div className={`max-w-sm ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                                                    <p className="text-xs font-bold px-1" style={{ color: 'var(--text-muted)' }}>{msg.name}</p>
                                                    <div className="px-4 py-2.5 text-sm leading-relaxed"
                                                         style={{
                                                             background:   isUser ? 'var(--primary)' : 'var(--surface)',
                                                             color:        isUser ? '#fff' : 'var(--text)',
                                                             borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                                             border:       isUser ? 'none' : '1px solid var(--border)',
                                                             boxShadow:    'var(--shadow-sm)',
                                                         }}>
                                                        {msg.text}
                                                    </div>
                                                    <p className="text-[10px] px-1" style={{ color: 'var(--text-muted)' }}>
                                                        <FontAwesomeIcon icon={faClock} className="w-2.5 h-2.5 ml-1" />
                                                        {msg.time}
                                                    </p>
                                                </div>
                                                {isUser && (
                                                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-black text-sm text-white flex-shrink-0"
                                                         style={{ background: 'var(--primary-hover)' }}>ع</div>
                                                )}
                                            </motion.div>
                                        )
                                    })}
                                    <div ref={bottomRef} />
                                </div>

                                {/* ورودی ریپلای */}
                                <div className="card-footer">
                                    <div className="flex gap-3 items-end">
                                        <textarea value={reply} onChange={e => setReply(e.target.value)}
                                                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply() } }}
                                                  rows={2} placeholder="پیام خود را بنویسید... (Enter برای ارسال)"
                                                  className="form-textarea flex-1" style={{ minHeight: 'unset', resize: 'none', padding: '10px 12px' }} />
                                        <button onClick={sendReply} disabled={!reply.trim() || sending}
                                                className="btn btn-primary btn-sm flex-shrink-0" style={{ height: '48px', width: '48px', padding: 0, borderRadius: '12px' }}>
                                            <FontAwesomeIcon icon={faPaperPlane} className={`w-4 h-4 ${sending ? 'animate-pulse' : ''}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── ستون کناری ── */}
                        <div className="lg:col-span-1 space-y-4">
                            <div className="card">
                                <div className="card-header">
                                    <p className="card-title text-sm">اطلاعات تیکت</p>
                                </div>
                                <div className="card-body space-y-3">
                                    {[
                                        { label: 'شماره',      value: `#${ticket.id}`,    icon: faTag      },
                                        { label: 'دسته‌بندی', value: ticket.category,      icon: faTicket   },
                                        { label: 'تاریخ',      value: ticket.date,          icon: faClock    },
                                        { label: 'وضعیت',      value: st.label,             icon: faCircle   },
                                    ].map(({ label, value, icon }) => (
                                        <div key={label} className="flex items-center gap-2.5 p-2.5 rounded-xl"
                                             style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                                            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                                 style={{ background: 'var(--primary-light)' }}>
                                                <FontAwesomeIcon icon={icon} className="w-3 h-3" style={{ color: 'var(--primary)' }} />
                                            </div>
                                            <div>
                                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
                                                <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="card">
                                <div className="card-header">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                                             style={{ background: 'var(--success-light)' }}>
                                            <FontAwesomeIcon icon={faHeadset} className="w-3.5 h-3.5" style={{ color: 'var(--success)' }} />
                                        </div>
                                        <p className="card-title text-sm">پشتیبانی</p>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                             style={{ background: 'var(--primary-light)' }}>
                                            <FontAwesomeIcon icon={faHeadset} className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>تیم پشتیبانی ویرا</p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <span className="w-2 h-2 rounded-full" style={{ background: 'var(--success)' }} />
                                                <p className="text-xs" style={{ color: 'var(--success)' }}>آنلاین</p>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xs mt-3 p-2.5 rounded-xl" style={{ color: 'var(--text-muted)', background: 'var(--surface-2)' }}>
                                        ⏱ میانگین پاسخ: ۲–۴ ساعت کاری
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}