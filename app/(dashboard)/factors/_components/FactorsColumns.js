'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faEye, faCheck, faBan, faCreditCard, faPen,
    faFileInvoiceDollar,
} from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'

export const STATUS_MAP = {
    'pre-invoice': { label: 'پیش‌فاکتور', badge: 'badge-warning' },
    'invoice':     { label: 'فاکتور',     badge: 'badge-primary' },
    'confirmed':   { label: 'تأیید شده',  badge: 'badge-success' },
    'canceled':    { label: 'لغو شده',    badge: 'badge-danger'  },
}

export function getFactorsColumns({ handleConfirm, handleCancel }) {
    return [
        {
            key: 'factor_number', label: 'شماره فاکتور',
            filter: { type: 'text', placeholder: 'جستجو...' },
            render: (row) => (
                <div className="flex items-center justify-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                         style={{ background: 'var(--primary-light)' }}>
                        <FontAwesomeIcon icon={faFileInvoiceDollar} className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
                    </div>
                    <span className="font-bold font-mono" style={{ color: 'var(--primary)' }}>#{row.factor_number}</span>
                </div>
            )
        },
        {
            key: 'status', label: 'وضعیت',
            filter: { type: 'select', placeholder: 'وضعیت...', options: () => Object.entries(STATUS_MAP).map(([v, { label }]) => ({ value: v, label })) },
            render: (row) => {
                const s = STATUS_MAP[row.status] || { label: row.status, badge: 'badge-muted' }
                return (
                    <div className="flex justify-center gap-1">
                        <span className={`badge ${s.badge}`}>{s.label}</span>
                        {row.is_canceled && <span className="badge badge-danger">لغو</span>}
                    </div>
                )
            }
        },
        {
            key: 'customer_id', label: 'مشتری',
            render: (row) => (
                <div className="text-center">
                    <span className="badge badge-muted text-xs">مشتری #{row.customer_id}</span>
                </div>
            )
        },
        {
            key: 'total_amount_with_discount', label: 'مبلغ',
            render: (row) => (
                <div className="text-center">
                    <p className="font-bold text-sm" style={{ color: 'var(--success)' }}>
                        {Number(row.total_amount_with_discount).toLocaleString('fa-IR')} ﷼
                    </p>
                    {row.total_discount > 0 && (
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            تخفیف: {Number(row.total_discount).toLocaleString('fa-IR')}
                        </p>
                    )}
                </div>
            )
        },
        {
            key: 'amount_owed', label: 'مانده',
            render: (row) => (
                <div className="text-center">
                    <span className={`badge ${row.amount_owed > 0 ? 'badge-danger' : 'badge-success'}`}>
                        {Number(row.amount_owed).toLocaleString('fa-IR')} ﷼
                    </span>
                </div>
            )
        },
        {
            key: 'actions', label: 'عملیات',
            render: (row) => (
                <div className="flex items-center justify-center gap-1">
                    <Link href={`/warehouse/factors/${row.id}/edit`}>
                        <button className="action-btn" title="ویرایش"
                                style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}>
                            <FontAwesomeIcon icon={faPen} className="w-3.5 h-3.5" />
                        </button>
                    </Link>
                    <Link href={`/warehouse/factors/${row.id}`}>
                        <button className="action-btn action-btn-view" title="مشاهده">
                            <FontAwesomeIcon icon={faEye} className="w-3.5 h-3.5" />
                        </button>
                    </Link>
                    <Link href={`/warehouse/factors/${row.id}/payment`}>
                        <button className="action-btn" title="پرداخت"
                                style={{ background: 'var(--info-light)', color: 'var(--info)' }}>
                            <FontAwesomeIcon icon={faCreditCard} className="w-3.5 h-3.5" />
                        </button>
                    </Link>
                    {!row.is_canceled && row.status !== 'confirmed' && (
                        <button className="action-btn action-btn-toggle-off" title="تأیید"
                                onClick={() => handleConfirm(row)}>
                            <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5" />
                        </button>
                    )}
                    {!row.is_canceled && row.status !== 'canceled' && (
                        <button className="action-btn action-btn-delete" title="لغو"
                                onClick={() => handleCancel(row)}>
                            <FontAwesomeIcon icon={faBan} className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            )
        }
    ]
}