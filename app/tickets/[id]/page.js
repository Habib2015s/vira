'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faArrowLeft, faTicket, faPaperPlane, faSpinner, faHeadset,
    faUser, faXmark, faCircle, faTag, faClock
} from '@fortawesome/free-solid-svg-icons'
import DashboardLayout from '@/app/dashboard/Dashboardlayout'
import Swal from 'sweetalert2'
import { ENV, getHeaders } from '@/app/config/env'

const STATUS_LABEL = { open: 'باز', closed: 'بسته', pending: 'در انتظار' }
const STATUS_STYLE = {
    open:    { background: 'var(--success-light)', color: 'var(--success)' },
    closed:  { background: 'var(--danger-light)',  color: 'var(--danger)'  },
    pending: { background: 'var(--warning-light)', color: 'var(--warning)' },
}
const PRIORITY_LABEL = { low: 'پایین', medium: 'متوسط', high: 'بالا' }
const PRIORITY_STYLE = {
    low:    { background: 'var(--info-light)',    color: 'var(--info)'    },
    medium: { background: 'var(--warning-light)', color: 'var(--warning)' },
    high:   { background: 'var(--danger-light)',  color: 'var(--danger)'  },
}

export default function TicketDetailPage() {
    const { id }       = useParams()
    const router        = useRouter()
    const queryClient   = useQueryClient()
    const [replyText, setReplyText] = useState('')

    const { data: ticket, isLoading, error } = useQuery({
        queryKey: ['ticket', id],
        queryFn: async () => {
            const r   = await fetch(`${ENV.API_TICKETS}/${id}`, { headers: getHeaders() })
            const res = await r.json().catch(() => ({}))
            if (!r.ok) throw new Error(res?.message || `خطای ${r.status}`)
            // ⭐ شکل دقیق پاسخ این endpoint تأیید نشده — چند حالت رایج رو پوشش می‌دیم
            return res.data?.ticket ?? res.data ?? null
        },
        enabled: !!id,
        retry: 1,
    })

    // ⭐ لیست پاسخ‌ها — اسم فیلد دقیق تأیید نشده، چند احتمال رایج رو چک می‌کنیم
    const replies = ticket?.replies ?? ticket?.messages ?? ticket?.ticket_replies ?? []

    const replyMutation = useMutation({
        mutationFn: (content) =>
            fetch(`${ENV.API_TICKETS}/${id}/reply`, {
                method: 'POST', headers: getHeaders(), body: JSON.stringify({ content }),
            }).then(async r => {
                const res = await r.json().catch(() => ({}))
                if (!r.ok) throw new Error(res?.message || 'ارسال پاسخ ناموفق بود')
                return res
            }),
        onSuccess: () => {
            setReplyText('')
            queryClient.invalidateQueries({ queryKey: ['ticket', id] })
        },
        onError: (err) => Swal.fire('خطا!', err.message, 'error'),
    })

    const closeMutation = useMutation({
        mutationFn: () => fetch(`${ENV.API_TICKETS}/${id}/close`, { method: 'POST', headers: getHeaders() })
            .then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ticket', id] })
            queryClient.invalidateQueries({ queryKey: ['tickets'] })
            Swal.fire({ title: 'بسته شد!', icon: 'success', timer: 1800, showConfirmButton: false })
        },
        onError: () => Swal.fire('خطا!', 'عملیات انجام نشد', 'error'),
    })

    const handleSendReply = () => {
        if (replyText.trim().length === 0) return
        replyMutation.mutate(replyText.trim())
    }

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="w-full min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
                    <FontAwesomeIcon icon={faSpinner} className="w-8 h-8 animate-spin" style={{ color: 'var(--primary)' }} />
                </div>
            </DashboardLayout>
        )
    }

    if (error || !ticket) {
        return (
            <DashboardLayout>
                <div className="w-full min-h-screen flex flex-col items-center justify-center gap-3" style={{ background: 'var(--bg)' }}>
                    <p style={{ color: 'var(--danger)' }}>{error?.message || 'تیکت پیدا نشد'}</p>
                    <button onClick={() => router.push('/tickets')} className="btn btn-back btn-sm">بازگشت به لیست</button>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <div className="w-full min-h-screen" style={{ background: 'var(--bg)' }}>

                <div className="page-header-bar">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                 style={{ background: 'rgba(255,255,255,0.2)' }}>
                                <FontAwesomeIcon icon={faTicket} className="w-5 h-5 text-white" />
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-xl font-black text-white leading-none truncate">{ticket.title}</h1>
                                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>تیکت #{ticket.id}</p>
                            </div>
                        </div>
                        <button onClick={() => router.push('/tickets')} className="btn btn-back btn-sm flex-shrink-0">
                            <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" />بازگشت
                        </button>
                    </div>
                </div>

                <div className="page-content max-w-4xl">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* ── ستون اصلی: گفتگو ── */}
                        <div className="lg:col-span-2">
                            <div className="card flex flex-col" style={{ height: '560px' }}>

                                {/* پیام اول (خود تیکت) + پاسخ‌ها */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {/* پیام اصلی تیکت */}
                                    <div className="flex items-end gap-2 justify-end">
                                        <div className="max-w-md px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm leading-relaxed"
                                             style={{ background: 'var(--primary)', color: '#fff' }}>
                                            {ticket.content}
                                        </div>
                                        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 font-black text-xs text-white"
                                             style={{ background: 'var(--primary-hover)' }}>
                                            <FontAwesomeIcon icon={faUser} className="w-3 h-3" />
                                        </div>
                                    </div>

                                    {/* تاریخ پیام اصلی */}
                                    <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                                        {ticket.created_at && new Date(ticket.created_at).toLocaleString('fa-IR')}
                                    </p>

                                    {/* پاسخ‌ها */}
                                    {replies.length === 0 ? (
                                        <p className="text-center text-xs py-6" style={{ color: 'var(--text-muted)' }}>
                                            هنوز پاسخی ثبت نشده
                                        </p>
                                    ) : (
                                        replies.map((reply, i) => {
                                            const isSupport = reply.is_support || reply.sender === 'support' || reply.user_type === 'admin'
                                            return (
                                                <div key={reply.id ?? i}
                                                     className={`flex items-end gap-2 ${isSupport ? '' : 'justify-end'}`}>
                                                    {isSupport && (
                                                        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                                                             style={{ background: 'var(--primary-light)' }}>
                                                            <FontAwesomeIcon icon={faHeadset} className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
                                                        </div>
                                                    )}
                                                    <div className={`max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isSupport ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
                                                         style={isSupport
                                                             ? { background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }
                                                             : { background: 'var(--primary)', color: '#fff' }}>
                                                        {reply.content}
                                                    </div>
                                                    {!isSupport && (
                                                        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 font-black text-xs text-white"
                                                             style={{ background: 'var(--primary-hover)' }}>
                                                            <FontAwesomeIcon icon={faUser} className="w-3 h-3" />
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })
                                    )}
                                </div>

                                {/* باکس پاسخ */}
                                {ticket.status !== 'closed' ? (
                                    <div className="p-3 flex items-center gap-2" style={{ borderTop: '1px solid var(--border)' }}>
                                        <input
                                            value={replyText}
                                            onChange={e => setReplyText(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter' && !replyMutation.isPending) handleSendReply() }}
                                            placeholder="پاسخ خود را بنویسید..."
                                            className="form-input flex-1"
                                        />
                                        <button onClick={handleSendReply} disabled={replyMutation.isPending || !replyText.trim()}
                                                className="btn btn-primary flex-shrink-0">
                                            <FontAwesomeIcon icon={replyMutation.isPending ? faSpinner : faPaperPlane}
                                                             className={`w-4 h-4 ${replyMutation.isPending ? 'animate-spin' : ''}`} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="p-3 text-center text-xs" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                                        این تیکت بسته شده و امکان پاسخ‌دهی وجود ندارد
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── ستون کناری: اطلاعات ── */}
                        <div className="lg:col-span-1 space-y-4">
                            <div className="card">
                                <div className="card-header"><p className="card-title text-sm">اطلاعات تیکت</p></div>
                                <div className="card-body space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>وضعیت</span>
                                        <span className="badge" style={STATUS_STYLE[ticket.status] ?? {}}>
                                            {STATUS_LABEL[ticket.status] ?? ticket.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>اولویت</span>
                                        <span className="badge" style={PRIORITY_STYLE[ticket.priority] ?? {}}>
                                            {PRIORITY_LABEL[ticket.priority] ?? ticket.priority}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>دسته‌بندی</span>
                                        <span className="badge badge-muted">{ticket.category || '—'}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>تاریخ ثبت</span>
                                        <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
                                            {ticket.created_at && new Date(ticket.created_at).toLocaleDateString('fa-IR')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {ticket.status !== 'closed' && (
                                <button onClick={() => Swal.fire({
                                    title: 'بستن تیکت؟', icon: 'question', showCancelButton: true,
                                    confirmButtonColor: 'var(--danger)', confirmButtonText: 'بله، ببند', cancelButtonText: 'انصراف',
                                }).then(r => r.isConfirmed && closeMutation.mutate())}
                                        disabled={closeMutation.isPending}
                                        className="btn btn-danger w-full">
                                    <FontAwesomeIcon icon={closeMutation.isPending ? faSpinner : faXmark}
                                                     className={`w-4 h-4 ${closeMutation.isPending ? 'animate-spin' : ''}`} />
                                    بستن تیکت
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}