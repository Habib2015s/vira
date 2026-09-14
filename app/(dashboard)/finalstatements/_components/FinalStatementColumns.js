
// app/finalstatements/_components/FinalStatementColumns.js
'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faTrash, faSpinner, faEye } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'

export function getFinalStatementColumns({ handleDelete, isDeleting }) {
    return [
        {
            key: 'number', label: 'شماره',
            filter: {
                type: 'select', placeholder: 'شماره...',
                options: (data) => [...new Set(data.map(s => s.number))].sort((a, b) => a - b).map(n => ({ value: n, label: n }))
            },
            render: (row) => <span className="badge badge-primary">{row.number}</span>
        },
        {
            key: 'title', label: 'عنوان',
            filter: {
                type: 'select', placeholder: 'عنوان...',
                options: (data) => [...new Set(data.map(s => s.title))].map(t => ({ value: t, label: t })).sort((a, b) => a.label.localeCompare(b.label))
            },
            render: (row) => <span className="font-bold" style={{ color: 'var(--text)' }}>{row.title}</span>
        },
        {
            key: 'shop_name', label: 'شاپ',
            filter: {
                type: 'select', placeholder: 'شاپ...',
                options: (data) => [...new Set(data.map(s => s.shop_name).filter(Boolean))].map(s => ({ value: s, label: s })).sort((a, b) => a.label.localeCompare(b.label))
            },
            render: (row) => <span style={{ color: 'var(--text-soft)' }}>{row.shop_name || '—'}</span>
        },
        {
            key: 'date', label: 'تاریخ',
            render: (row) => (
                <span style={{ color: 'var(--text-soft)' }}>
                    {row.date ? new Date(row.date).toLocaleDateString('fa-IR') : '—'}
                </span>
            )
        },
        {
            key: 'description', label: 'توضیحات',
            render: (row) => (
                <span className="truncate max-w-xs block" style={{ color: 'var(--text-soft)' }}>
                    {row.description || '—'}
                </span>
            )
        },
        {
            key: 'actions', label: 'عملیات',
            render: (row) => (
                <div className="flex items-center justify-center gap-1.5">
                    <Link href={`/finalstatements/${row.id}`}>
                        <button className="action-btn action-btn-view" title="مشاهده">
                            <FontAwesomeIcon icon={faEye} className="w-3.5 h-3.5" />
                        </button>
                    </Link>
                    <Link href={`/finalstatements/edit/${row.id}`}>
                        <button className="action-btn action-btn-edit" title="ویرایش">
                            <FontAwesomeIcon icon={faPen} className="w-3.5 h-3.5" />
                        </button>
                    </Link>
                    <button className="action-btn action-btn-delete" title="حذف"
                            disabled={isDeleting} onClick={() => handleDelete(row)}>
                        <FontAwesomeIcon icon={isDeleting ? faSpinner : faTrash}
                                         className={`w-3.5 h-3.5 ${isDeleting ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            )
        }
    ]
}