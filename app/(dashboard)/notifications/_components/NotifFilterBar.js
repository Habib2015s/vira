// app/notifications/_components/NotifFilterBar.js
'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFilter } from '@fortawesome/free-solid-svg-icons'
import { FILTERS, SORTS } from '../_data/notifConfig'

export function NotifFilterBar({ activeFilter, activeSort, onFilter, onSort, filterCount }) {
    return (
        <div className="card">
            <div className="card-body" style={{ padding: '12px 16px' }}>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {FILTERS.map(f => {
                            const count  = filterCount(f.id)
                            const active = activeFilter === f.id
                            if (count === 0 && f.id !== 'all') return null
                            return (
                                <button key={f.id} onClick={() => onFilter(f.id)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                                        style={{
                                            background: active ? 'var(--primary)' : 'var(--surface-2)',
                                            color:      active ? '#fff' : 'var(--text-soft)',
                                            border:     `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
                                        }}>
                                    {f.label}
                                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black"
                                          style={{ background: active ? 'rgba(255,255,255,0.25)' : 'var(--border)' }}>
                                        {count}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                    <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faFilter} className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                        <select value={activeSort} onChange={e => onSort(e.target.value)}
                                className="form-select text-xs" style={{ height: '32px', width: 'auto', minWidth: '130px' }}>
                            {SORTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    )
}