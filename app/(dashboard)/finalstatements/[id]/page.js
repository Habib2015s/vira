'use client'

import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faFileInvoice, faSpinner, faPen, faHashtag, faStore, faCalendar, faUser, faClock, faFileLines } from '@fortawesome/free-solid-svg-icons'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useViewFinalStatement } from './_hooks/useViewFinalStatement'
import { InfoCard } from './_components/InfoCard'

export default function ViewFinalStatementPage() {
    const router = useRouter()
    const { id } = useParams()
    const { loading, statement } = useViewFinalStatement(id)

    if (loading) return (
            <div className="w-full min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
                <div className="card text-center p-12">
                    <FontAwesomeIcon icon={faSpinner} className="w-12 h-12 animate-spin mb-5" style={{ color: 'var(--primary)' }} />
                    <p className="font-bold" style={{ color: 'var(--text)' }}>در حال بارگذاری...</p>
                </div>
            </div>
    )

    if (!statement) return (
            <div className="w-full min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
                <div className="card text-center p-12">
                    <p className="font-bold mb-4" style={{ color: 'var(--text)' }}>صورت وضعیت یافت نشد</p>
                    <button onClick={() => router.back()} className="btn btn-back">
                        <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />بازگشت
                    </button>
                </div>
            </div>
    )

    return (
            <div className="w-full min-h-screen" style={{ background: 'var(--bg)' }}>
                <div className="page-header-bar">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                                <FontAwesomeIcon icon={faFileInvoice} className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-white leading-none">جزئیات صورت وضعیت</h1>
                                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>شماره {statement.number}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link href={`/finalstatements/edit/${id}`}>
                                <button className="btn btn-warning btn-sm">
                                    <FontAwesomeIcon icon={faPen} className="w-3.5 h-3.5" />ویرایش
                                </button>
                            </Link>
                            <button onClick={() => router.back()} className="btn btn-back btn-sm">
                                <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" />بازگشت
                            </button>
                        </div>
                    </div>
                </div>
                <div className="page-content max-w-7xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        <InfoCard icon={faFileLines} label="عنوان"              value={statement.title}        i={0} />
                        <InfoCard icon={faHashtag}   label="شماره"              value={`#${statement.number}`} i={1} />
                        <InfoCard icon={faStore}     label="شاپ"                value={statement.shop_name}    i={2} />
                        <InfoCard icon={faCalendar}  label="تاریخ"              value={statement.date ? new Date(statement.date).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }) : null} i={3} />
                        <InfoCard icon={faUser}      label="شناسه ایجاد کننده" value={statement.creator_id}   i={4} />
                        <InfoCard icon={faClock}     label="آخرین بروزرسانی"   value={statement.updated_at ? new Date(statement.updated_at).toLocaleDateString('fa-IR') : null} i={5} />
                    </div>
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card">
                        <div className="card-header">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary-light)' }}>
                                    <FontAwesomeIcon icon={faFileLines} className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                                </div>
                                <h2 className="card-title">توضیحات</h2>
                            </div>
                        </div>
                        <div className="card-body">
                            <p className="leading-8" style={{ color: 'var(--text-soft)' }}>
                                {statement.description || 'توضیحاتی ثبت نشده است.'}
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
    )
}