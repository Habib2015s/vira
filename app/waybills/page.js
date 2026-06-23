'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faPlus, faEdit, faEye, faFileLines,
    faSpinner, faTrash
} from '@fortawesome/free-solid-svg-icons'
import DashboardLayout from "@/app/dashboard/Dashboardlayout"
import WaybillTypeModal from "@/app/modals/Waybilltypemodal"
import DataTable from "@/app/components/DataTable/DataTable"

// داده موک — بعداً از API میاد
const MOCK_WAYBILLS = [
    { id: 1395, date: '۱۴۰۴/۱۱/۲۰', sender: 'شرکت الف', receiver: 'شرکت ب', type: 'ملکی-شرکتی',        status: 'delivered' },
    { id: 1394, date: '۱۴۰۴/۱۱/۱۹', sender: 'شرکت پ',   receiver: 'شرکت ت', type: 'ملکی-غیرشرکتی',     status: 'transit'   },
    { id: 1393, date: '۱۴۰۴/۱۱/۱۸', sender: 'شرکت ج',   receiver: 'شرکت چ', type: 'غیرملکی-شرکتی',     status: 'pending'   },
    { id: 1392, date: '۱۴۰۴/۱۱/۱۷', sender: 'شرکت ح',   receiver: 'شرکت خ', type: 'بارنامه شهری',      status: 'delivered' },
]

const STATUS_MAP = {
    delivered: { label: 'تحویل داده شد', cls: 'badge-success' },
    transit:   { label: 'در مسیر',        cls: 'badge-info'    },
    pending:   { label: 'در انتظار',      cls: 'badge-warning' },
}

// ── دکمه عملیات ──────────────────────────────────────
const ActionBtn = ({ onClick, icon, colorVar, bgVar, title }) => (
    <button onClick={onClick} title={title}
            className="w-9 h-9 flex items-center justify-center rounded-lg transition-all"
            style={{ color: colorVar, background: bgVar }}
            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.88)'}
            onMouseLeave={e => e.currentTarget.style.filter = 'none'}>
        <FontAwesomeIcon icon={icon} className="w-4 h-4" />
    </button>
)

export default function WaybillsPage() {
    const router = useRouter()
    const [modalOpen, setModalOpen] = useState(false)
    const [waybills]  = useState(MOCK_WAYBILLS)

    const handleTypeSelect = (type) => { setModalOpen(false); router.push(type.path) }

    const columns = [
        {
            key: 'id', label: 'شماره بارنامه',
            render: (row) => (
                <span className="font-mono font-black" style={{ color: 'var(--primary)' }}>
                    BL-{row.id}
                </span>
            )
        },
        {
            key: 'date', label: 'تاریخ',
            render: (row) => <span style={{ color: 'var(--text-soft)' }}>{row.date}</span>
        },
        {
            key: 'sender', label: 'فرستنده',
            render: (row) => <span className="font-semibold" style={{ color: 'var(--text)' }}>{row.sender}</span>
        },
        {
            key: 'receiver', label: 'گیرنده',
            render: (row) => <span className="font-semibold" style={{ color: 'var(--text)' }}>{row.receiver}</span>
        },
        {
            key: 'type', label: 'نوع',
            filter: {
                type: 'select', placeholder: 'نوع...',
                options: (data) => [...new Set(data.map(r => r.type))].map(t => ({ value: t, label: t }))
            },
            render: (row) => <span className="badge badge-primary">{row.type}</span>
        },
        {
            key: 'status', label: 'وضعیت',
            filter: {
                type: 'select', placeholder: 'وضعیت...',
                options: () => [
                    { value: 'delivered', label: 'تحویل داده شد' },
                    { value: 'transit',   label: 'در مسیر'       },
                    { value: 'pending',   label: 'در انتظار'      },
                ]
            },
            render: (row) => {
                const s = STATUS_MAP[row.status] || STATUS_MAP.pending
                return <span className={`badge ${s.cls}`}>{s.label}</span>
            }
        },
        {
            key: 'actions', label: 'عملیات', searchable: false,
            render: (row) => (
                <div className="flex gap-1.5 justify-center">
                    <ActionBtn onClick={() => router.push(`/waybills/show/${row.id}`)}
                               icon={faEye}   colorVar="var(--info)"    bgVar="var(--info-light)"    title="نمایش" />
                    <ActionBtn onClick={() => router.push(`/waybills/edit/${row.id}`)}
                               icon={faEdit}  colorVar="var(--warning)" bgVar="var(--warning-light)" title="ویرایش" />
                    <ActionBtn onClick={() => {}}
                               icon={faTrash} colorVar="var(--danger)"  bgVar="var(--danger-light)"  title="حذف" />
                </div>
            )
        }
    ]

    return (
        <DashboardLayout>
            <div className="w-full min-h-screen" style={{ background: 'var(--bg)' }}>

                {/* ── هدر ── */}
                <div className="page-header-bar">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                 style={{ background: 'rgba(255,255,255,0.2)' }}>
                                <FontAwesomeIcon icon={faFileLines} className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-white leading-none">مدیریت بارنامه‌ها</h1>
                                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
                                    لیست و مدیریت بارنامه‌ها
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setModalOpen(true)} className="btn btn-success">
                            <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
                            افزودن بارنامه
                        </button>
                    </div>
                </div>

                {/* ── محتوا ── */}
                <div className="page-content max-w-7xl">
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                        <DataTable
                            data={waybills}
                            columns={columns}
                            emptyMessage="بارنامه‌ای یافت نشد"
                            title="لیست بارنامه‌ها"
                            titleIcon={faFileLines}
                        />
                    </motion.div>
                </div>

                <WaybillTypeModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSelect={handleTypeSelect} />
            </div>
        </DashboardLayout>
    )
}