// app/shops/_components/ShopsColumns.js
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faEye, faEdit, faPowerOff, faTrash } from '@fortawesome/free-solid-svg-icons'

const ActionBtn = ({ onClick, disabled, colorVar, bgVar, title, icon, spinning }) => (
    <button onClick={onClick} disabled={disabled} title={title}
            className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors disabled:opacity-50"
            style={{ color: colorVar, background: bgVar }}
            onMouseEnter={e => { if (!disabled) e.currentTarget.style.filter = 'brightness(0.92)' }}
            onMouseLeave={e => e.currentTarget.style.filter = 'none'}>
        <FontAwesomeIcon icon={spinning ? faSpinner : icon}
                         className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} />
    </button>
)

export const getShopsColumns = ({ onView, onEdit, onToggle, onDelete, togglingId }) => [
    {
        key: 'name', label: 'نام',
        render: (row) => <span className="font-bold" style={{ color: 'var(--text)' }}>{row.name}</span>
    },
    {
        key: 'code', label: 'کد',
        render: (row) => <span className="font-mono text-sm" style={{ color: 'var(--text-soft)' }}>{row.code}</span>
    },
    {
        key: 'type', label: 'نوع',
        filter: {
            type: 'select', placeholder: 'نوع...',
            options: () => [{ value: 'inside', label: 'داخلی' }, { value: 'outside', label: 'خارجی' }]
        },
        render: (row) => (
            <span className="badge" style={
                row.type === 'inside'
                    ? { background: 'var(--info-light)', color: 'var(--info)' }
                    : { background: 'var(--primary-light)', color: 'var(--primary)' }
            }>
                {row.type === 'inside' ? 'داخلی' : 'خارجی'}
            </span>
        )
    },
    {
        key: 'fee', label: 'هزینه',
        render: (row) => (
            <span className="font-bold" style={{ color: 'var(--primary)' }}>
                {row.fee ? `${parseFloat(row.fee).toLocaleString('fa-IR')} ریال` : '—'}
            </span>
        )
    },
    {
        key: 'is_active', label: 'وضعیت',
        filter: {
            type: 'select', placeholder: 'وضعیت...',
            options: () => [{ value: 'active', label: 'فعال' }, { value: 'inactive', label: 'غیرفعال' }]
        },
        render: (row) => (
            <span className="badge" style={
                row.is_active === 'active'
                    ? { background: 'var(--success-light)', color: 'var(--success)' }
                    : { background: 'var(--surface-2)', color: 'var(--text-muted)' }
            }>
                {row.is_active === 'active' ? '● فعال' : '○ غیرفعال'}
            </span>
        )
    },
    {
        key: 'actions', label: 'عملیات', searchable: false,
        render: (row) => (
            <div className="flex gap-1.5 justify-center">
                <ActionBtn onClick={() => onView(row.id)}   icon={faEye}   colorVar="var(--info)"    bgVar="var(--info-light)"    title="نمایش" />
                <ActionBtn onClick={() => onEdit(row.id)}   icon={faEdit}  colorVar="var(--warning)" bgVar="var(--warning-light)" title="ویرایش" />
                <ActionBtn
                    onClick={() => onToggle(row)}
                    disabled={togglingId === row.id}
                    spinning={togglingId === row.id}
                    icon={faPowerOff}
                    colorVar={row.is_active === 'active' ? 'var(--warning)' : 'var(--success)'}
                    bgVar={row.is_active === 'active'    ? 'var(--warning-light)' : 'var(--success-light)'}
                    title={row.is_active === 'active' ? 'غیرفعال کردن' : 'فعال کردن'}
                />
                <ActionBtn onClick={() => onDelete(row.id)} icon={faTrash} colorVar="var(--danger)"  bgVar="var(--danger-light)"  title="حذف" />
            </div>
        )
    }
]