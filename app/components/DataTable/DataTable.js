'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faTimes, faFilter, faMagnifyingGlass, faLayerGroup, faCheck, faSliders } from '@fortawesome/free-solid-svg-icons'
import { motion, AnimatePresence } from 'framer-motion'
import Select from 'react-select'

const makeSelectStyles = () => ({
    control: (base, state) => ({
        ...base, minHeight: '32px', height: '32px',
        background: 'var(--surface)',
        borderColor: state.isFocused ? 'var(--primary)' : 'var(--border)',
        borderWidth: '1.5px', borderRadius: '8px',
        boxShadow: state.isFocused ? '0 0 0 3px rgba(84,76,207,0.15)' : 'none',
        '&:hover': { borderColor: 'var(--border-strong)' },
        flexWrap: 'nowrap', cursor: 'pointer',
    }),
    valueContainer: (base) => ({ ...base, padding: '0 6px', flexWrap: 'nowrap' }),
    placeholder:    (base) => ({ ...base, fontSize: '11px', color: 'var(--muted)', whiteSpace: 'nowrap' }),
    singleValue:    (base) => ({ ...base, fontSize: '11px', color: 'var(--text)', fontWeight: '600' }),
    input:          (base) => ({ ...base, fontSize: '11px', color: 'var(--text)', margin: 0, padding: 0 }),
    menu:           (base) => ({ ...base, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden', boxShadow: 'var(--shadow-md)', zIndex: 9999 }),
    menuList:       (base) => ({ ...base, padding: '4px', background: 'var(--surface)' }),
    option: (base, state) => ({
        ...base,
        background: state.isSelected ? 'var(--primary)' : state.isFocused ? 'var(--surface-2)' : 'transparent',
        color: state.isSelected ? '#fff' : 'var(--text)',
        fontSize: '11px', fontWeight: state.isSelected ? '700' : '500',
        borderRadius: '6px', margin: '2px 0', cursor: 'pointer',
    }),
    indicatorSeparator: () => ({ display: 'none' }),
    dropdownIndicator:  (base) => ({ ...base, padding: '0 4px', color: 'var(--muted)' }),
    clearIndicator:     (base) => ({ ...base, padding: '0 2px', color: 'var(--muted)' }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
})

const PaginationBtn = ({ onClick, disabled, children }) => (
    <button onClick={onClick} disabled={disabled}
            className="px-3 py-1.5 rounded-lg text-sm font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-soft)' }}
            onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = 'var(--surface-2)' }}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}>
        {children}
    </button>
)

// ── ⭐ اینپوت جستجو — حداقل ۲ کاراکتر + تیک تایید ──────
function SearchInput({ colKey, colLabel, committedValue, onCommit }) {
    const [draft, setDraft] = useState(committedValue ?? '')

    useEffect(() => { if (!committedValue) setDraft('') }, [committedValue])

    const commit = () => { if (draft.trim().length >= 2) onCommit(colKey, draft.trim()) }
    const clear  = () => { setDraft(''); onCommit(colKey, '') }

    const isApplied = !!(committedValue && committedValue === draft)
    const canApply  = draft.trim().length >= 2 && draft.trim() !== committedValue

    return (
        <div className="flex items-center gap-1">
            <div className="relative flex-1">
                <FontAwesomeIcon icon={faMagnifyingGlass}
                                 className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none"
                                 style={{ color: isApplied ? 'var(--primary)' : 'var(--muted)' }} />
                <input type="text" value={draft}
                       placeholder={`حداقل دو کاراکتر وارد کنید...`}
                       onChange={e => setDraft(e.target.value)}
                       onKeyDown={e => { if (e.key === 'Enter') commit() }}
                       style={{
                           width: '100%', height: '32px',
                           paddingRight: '22px', paddingLeft: '6px',
                           fontSize: '11px', borderRadius: '8px', outline: 'none',
                           background: 'var(--surface)', color: 'var(--text)',
                           border: `1.5px solid ${isApplied ? 'var(--primary)' : 'var(--border)'}`,
                           boxShadow: isApplied ? '0 0 0 3px rgba(84,76,207,0.12)' : 'none',
                           transition: 'all 0.15s',
                       }}
                       onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(84,76,207,0.12)' }}
                       onBlur={e => { if (!isApplied) { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' } }}
                />
            </div>

            {/* تیک — فقط وقتی ≥۲ کاراکتر و هنوز اعمال نشده */}
            <AnimatePresence>
                {canApply && (
                    <motion.button initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }}
                                   onClick={commit} title="اعمال فیلتر"
                                   style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, border: 'none', cursor: 'pointer', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FontAwesomeIcon icon={faCheck} style={{ width: 11, height: 11 }} />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* X — وقتی فیلتر اعمال شده */}
            <AnimatePresence>
                {isApplied && (
                    <motion.button initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }}
                                   onClick={clear} title="پاک کردن"
                                   style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, border: 'none', cursor: 'pointer', background: 'var(--danger-light)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FontAwesomeIcon icon={faTimes} style={{ width: 11, height: 11 }} />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    )
}

// ── ⭐ Select با تیک تایید ───────────────────────────────
function SelectInput({ colKey, colLabel, placeholder, options, committedValue, onCommit }) {
    const [draft, setDraft] = useState(committedValue ?? null)
    const compactStyles = useMemo(() => makeSelectStyles(), [])

    useEffect(() => { if (!committedValue) setDraft(null) }, [committedValue])

    const isApplied = !!(committedValue && draft && committedValue.value === draft.value)
    const canApply  = draft && (!committedValue || committedValue.value !== draft.value)

    const commit = () => { if (draft) onCommit(colKey, draft) }
    const clear  = () => { setDraft(null); onCommit(colKey, null) }

    return (
        <div className="flex items-center gap-1">
            <div className="flex-1" style={{ minWidth: 0 }}>
                <Select
                    instanceId={`sel-${colKey}`}
                    value={draft}
                    onChange={opt => setDraft(opt)}
                    options={options}
                    isClearable
                    placeholder={placeholder || `${colLabel}...`}
                    styles={{
                        ...compactStyles,
                        control: (base, state) => ({
                            ...compactStyles.control(base, state),
                            borderColor: isApplied ? 'var(--primary)' : state.isFocused ? 'var(--primary)' : 'var(--border)',
                            boxShadow: isApplied ? '0 0 0 3px rgba(84,76,207,0.12)' : state.isFocused ? '0 0 0 3px rgba(84,76,207,0.15)' : 'none',
                        }),
                    }}
                    noOptionsMessage={() => 'یافت نشد'}
                    menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                    menuPosition="fixed"
                    onChange={opt => {
                        setDraft(opt)
                        // اگه clear کرد مستقیم اعمال کن
                        if (!opt) onCommit(colKey, null)
                    }}
                />
            </div>

            {/* تیک — وقتی آپشن انتخاب شده ولی هنوز اعمال نشده */}
            <AnimatePresence>
                {canApply && (
                    <motion.button initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }}
                                   onClick={commit} title="اعمال فیلتر"
                                   style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, border: 'none', cursor: 'pointer', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FontAwesomeIcon icon={faCheck} style={{ width: 11, height: 11 }} />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    )
}

// ── پاپاپ فیلترهای فعال ──────────────────────────────────
function ActiveFiltersPopup({ filters, searches, columns, onClearOne, onClearAll }) {
    const [open, setOpen] = useState(false)
    const ref = useRef(null)

    const activeList = useMemo(() => {
        const list = []
        columns.forEach(col => {
            if (filters[col.key])  list.push({ key: col.key, label: col.label, value: filters[col.key].label ?? String(filters[col.key].value), type: 'select' })
            if (searches[col.key]) list.push({ key: col.key, label: col.label, value: searches[col.key], type: 'search' })
        })
        return list
    }, [filters, searches, columns])

    useEffect(() => {
        const handleOut = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
        document.addEventListener('mousedown', handleOut)
        return () => document.removeEventListener('mousedown', handleOut)
    }, [])

    if (activeList.length === 0) return null

    return (
        <div ref={ref} className="relative">
            <button onClick={() => setOpen(p => !p)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
                    style={{ background: 'var(--warning-light)', color: 'var(--warning)', border: '1.5px solid var(--warning)' }}>
                <FontAwesomeIcon icon={faSliders} className="w-3 h-3" />
                {activeList.length} فیلتر فعال
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -8, scale: 0.96 }} transition={{ duration: 0.15 }}
                                style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 9999, minWidth: 270, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: 'var(--shadow-lg)', overflow: 'hidden' }}>
                        <div className="flex items-center justify-between px-4 py-3"
                             style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                            <span className="text-xs font-black" style={{ color: 'var(--text)' }}>فیلترهای اعمال شده</span>
                            <button onClick={() => { onClearAll(); setOpen(false) }}
                                    className="text-xs font-bold px-2 py-1 rounded-lg"
                                    style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
                                پاک کردن همه
                            </button>
                        </div>
                        <div className="p-2 space-y-1">
                            {activeList.map((item, i) => (
                                <div key={i} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg"
                                     style={{ background: 'var(--surface-2)' }}>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[10px] font-semibold mb-0.5" style={{ color: 'var(--text-muted)' }}>
                                            {item.label}
                                            <span className="mr-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold"
                                                  style={{ background: item.type === 'select' ? 'var(--primary-light)' : 'var(--info-light)', color: item.type === 'select' ? 'var(--primary)' : 'var(--info)' }}>
                                                {item.type === 'select' ? 'انتخاب' : 'حداقل دو کاراکتر وارد کنید...'}
                                            </span>
                                        </p>
                                        <p className="text-xs font-bold truncate" style={{ color: 'var(--text)' }}>{item.value}</p>
                                    </div>
                                    <button onClick={() => onClearOne(item.key, item.type)}
                                            style={{ width: 24, height: 24, borderRadius: 7, border: 'none', cursor: 'pointer', flexShrink: 0, background: 'var(--danger-light)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <FontAwesomeIcon icon={faTimes} style={{ width: 10, height: 10 }} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

function LiveCountIcon({ count, isFiltered }) {
    return (
        <div className="relative flex items-center justify-center" style={{ width: 36, height: 36 }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                        style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid transparent', borderTopColor: isFiltered ? 'var(--warning)' : 'var(--primary)', borderRightColor: isFiltered ? 'var(--warning)' : 'var(--primary)', opacity: 0.5 }} />
            <motion.div animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0, 0.4] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                        style={{ position: 'absolute', inset: 2, borderRadius: '50%', background: isFiltered ? 'var(--warning)' : 'var(--primary)', opacity: 0.15 }} />
            <motion.div key={count} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 600, damping: 25 }}
                        style={{ width: 26, height: 26, borderRadius: '50%', background: isFiltered ? 'var(--warning-light)' : 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                <FontAwesomeIcon icon={faLayerGroup} style={{ width: 12, height: 12, color: isFiltered ? 'var(--warning)' : 'var(--primary)' }} />
            </motion.div>
        </div>
    )
}

// ══════════════════════════════════════════════════════════
export default function DataTable({
                                      data = [], columns = [], loading = false,
                                      emptyMessage = 'داده‌ای یافت نشد',
                                      disablePagination = false, title = null, titleIcon = null,
                                  }) {
    const [currentPage, setCurrentPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [filters,  setFilters]  = useState({})
    const [searches, setSearches] = useState({})

    const filteredData = useMemo(() => data.filter(row =>
        columns.every(col => {
            if (col.filter?.type === 'select' && filters[col.key])
                return String(row[col.key]) === String(filters[col.key].value)
            if (searches[col.key]) {
                const val = String(row[col.key] ?? '').toLowerCase()
                return val.includes(searches[col.key].toLowerCase())
            }
            return true
        })
    ), [data, columns, filters, searches])

    const paginatedData = disablePagination
        ? filteredData
        : filteredData.slice(currentPage * rowsPerPage, currentPage * rowsPerPage + rowsPerPage)

    const totalPages = Math.ceil(filteredData.length / rowsPerPage)

    // ⭐ select هم فقط بعد از تیک اعمال میشه
    const handleSelectCommit = (key, opt) => {
        setFilters(p => {
            const next = { ...p }
            if (opt) next[key] = opt
            else delete next[key]
            return next
        })
        setCurrentPage(0)
    }

    const handleSearchCommit = (key, value) => {
        setSearches(p => {
            const next = { ...p }
            if (value) next[key] = value
            else delete next[key]
            return next
        })
        setCurrentPage(0)
    }

    const clearOneFilter = (key, type) => {
        if (type === 'select') setFilters(p => { const n = { ...p }; delete n[key]; return n })
        if (type === 'search') setSearches(p => { const n = { ...p }; delete n[key]; return n })
        setCurrentPage(0)
    }

    const clearAllFilters = () => { setFilters({}); setSearches({}); setCurrentPage(0) }
    const hasActiveFilters = Object.keys(filters).length > 0 || Object.keys(searches).length > 0
    const handlePageChange = (page) => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }) }

    const renderPageNumbers = () => {
        const pages = [], maxVisible = 5
        let start = Math.max(0, currentPage - Math.floor(maxVisible / 2))
        let end   = Math.min(totalPages - 1, start + maxVisible - 1)
        if (end - start < maxVisible - 1) start = Math.max(0, end - maxVisible + 1)
        for (let i = start; i <= end; i++) {
            const active = i === currentPage
            pages.push(
                <button key={i} onClick={() => handlePageChange(i)}
                        className="px-3 py-1.5 rounded-lg text-sm font-bold transition-all"
                        style={{ background: active ? 'var(--primary)' : 'var(--surface)', color: active ? '#fff' : 'var(--text-soft)', border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`, boxShadow: active ? '0 2px 6px rgba(84,76,207,0.3)' : 'none' }}>
                    {i + 1}
                </button>
            )
        }
        return pages
    }

    return (
        <div className="rounded-2xl overflow-hidden"
             style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>

            {/* نوار بالا */}
            <div className="flex items-center gap-3 px-5 py-3 flex-wrap"
                 style={{ borderBottom: '2px solid var(--border)', background: 'var(--surface-2)' }}>
                {(titleIcon || title) && (
                    <div className="flex items-center gap-2">
                        {titleIcon && (
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary-light)' }}>
                                <FontAwesomeIcon icon={titleIcon} className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                            </div>
                        )}
                        {title && <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>{title}</span>}
                    </div>
                )}
                <div className="flex-1" />
                <ActiveFiltersPopup filters={filters} searches={searches} columns={columns}
                                    onClearOne={clearOneFilter} onClearAll={clearAllFilters} />
                <AnimatePresence>
                    {hasActiveFilters && (
                        <motion.button initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }}
                                       onClick={clearAllFilters}
                                       className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
                                       style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
                            <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />پاک کردن همه
                        </motion.button>
                    )}
                </AnimatePresence>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                     style={{ background: hasActiveFilters ? 'var(--warning-light)' : 'var(--primary-light)', border: `1.5px solid ${hasActiveFilters ? 'var(--warning)' : 'var(--primary)'}` }}>
                    <LiveCountIcon count={filteredData.length} isFiltered={hasActiveFilters} />
                    <div className="flex flex-col leading-none">
                        <span className="text-[10px] font-semibold" style={{ color: hasActiveFilters ? 'var(--warning)' : 'var(--primary)', opacity: 0.85 }}>
                            {hasActiveFilters ? 'نتایج فیلتر' : 'کل رکوردها'}
                        </span>
                        <motion.span key={filteredData.length} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                                     transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                                     className="text-lg font-black leading-none mt-0.5"
                                     style={{ color: hasActiveFilters ? 'var(--warning)' : 'var(--primary)' }}>
                            {filteredData.length}
                            {hasActiveFilters && data.length !== filteredData.length && (
                                <span className="text-xs font-normal opacity-60 mr-1">از {data.length}</span>
                            )}
                        </motion.span>
                    </div>
                </div>
            </div>

            {/* جدول */}
            <div className="overflow-x-auto">
                <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                    <thead>
                    {/* ردیف فیلترها */}
                    <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                        {columns.map((col, i) => (
                            <th key={i} className="px-2 py-2"
                                style={{ borderLeft: i < columns.length - 1 ? '1px solid var(--border)' : 'none', minWidth: '90px' }}>
                                {col.filter?.type === 'select' ? (
                                    /* ⭐ select هم با تیک تایید */
                                    <SelectInput
                                        colKey={col.key}
                                        colLabel={col.label}
                                        placeholder={col.filter.placeholder}
                                        options={col.filter.options(data)}
                                        committedValue={filters[col.key] ?? null}
                                        onCommit={handleSelectCommit}
                                    />
                                ) : col.searchable !== false ? (
                                    /* ⭐ text با min 2 کاراکتر + تیک */
                                    <SearchInput
                                        colKey={col.key}
                                        colLabel={col.label}
                                        committedValue={searches[col.key]}
                                        onCommit={handleSearchCommit}
                                    />
                                ) : null}
                            </th>
                        ))}
                    </tr>
                    {/* هدر ستون‌ها */}
                    <tr style={{ background: 'var(--primary)' }}>
                        {columns.map((col, i) => (
                            <th key={i} className="px-4 py-3 text-center text-sm font-bold"
                                style={{ color: '#fff', borderLeft: i < columns.length - 1 ? '1px solid rgba(255,255,255,0.15)' : 'none', whiteSpace: 'nowrap' }}>
                                {col.label}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {loading ? (
                        <tr><td colSpan={columns.length} className="py-16 text-center">
                            <FontAwesomeIcon icon={faSpinner} className="w-8 h-8 animate-spin mb-3" style={{ color: 'var(--primary)' }} />
                            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>در حال بارگذاری...</p>
                        </td></tr>
                    ) : paginatedData.length === 0 ? (
                        <tr><td colSpan={columns.length} className="py-14 text-center">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: 'var(--surface-2)' }}>
                                <FontAwesomeIcon icon={faFilter} className="w-5 h-5" style={{ color: 'var(--muted)' }} />
                            </div>
                            <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>
                                {hasActiveFilters ? 'نتیجه‌ای با این فیلتر یافت نشد' : emptyMessage}
                            </p>
                            {hasActiveFilters && (
                                <button onClick={clearAllFilters} className="text-xs font-bold px-3 py-1.5 rounded-lg"
                                        style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                                    پاک کردن فیلترها
                                </button>
                            )}
                        </td></tr>
                    ) : (
                        paginatedData.map((row, rowIndex) => (
                            <motion.tr key={row.id ?? rowIndex}
                                       initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                       transition={{ delay: Math.min(rowIndex * 0.025, 0.25) }}
                                       style={{ borderBottom: '1px solid var(--border)' }}
                                       onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-subtle)'}
                                       onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                {columns.map((col, colIndex) => (
                                    <td key={colIndex} className="px-4 py-3 text-center text-sm"
                                        style={{ color: 'var(--text)', verticalAlign: 'middle', borderLeft: colIndex < columns.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                        {col.render ? col.render(row) : row[col.key]}
                                    </td>
                                ))}
                            </motion.tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {!loading && !disablePagination && totalPages > 1 && (
                <div className="px-4 py-3 flex items-center justify-between flex-wrap gap-3"
                     style={{ borderTop: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-soft)' }}>
                        صفحه <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{currentPage + 1}</span>
                        {' '}از <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{totalPages}</span>
                        &nbsp;·&nbsp;
                        <span style={{ color: 'var(--text)', fontWeight: 700 }}>{paginatedData.length}</span> رکورد در این صفحه
                        {hasActiveFilters && data.length !== filteredData.length && (
                            <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> (از {filteredData.length} نتیجه)</span>
                        )}
                    </p>
                    <div className="flex gap-1.5 items-center flex-wrap">
                        <PaginationBtn onClick={() => handlePageChange(0)}               disabled={currentPage === 0}>««</PaginationBtn>
                        <PaginationBtn onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0}>«</PaginationBtn>
                        {renderPageNumbers()}
                        <PaginationBtn onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages - 1}>»</PaginationBtn>
                        <PaginationBtn onClick={() => handlePageChange(totalPages - 1)}  disabled={currentPage >= totalPages - 1}>»»</PaginationBtn>
                    </div>
                    <select value={rowsPerPage} onChange={e => { setRowsPerPage(parseInt(e.target.value)); setCurrentPage(0) }}
                            className="form-select" style={{ width: 'auto', height: '34px', padding: '0 28px 0 8px', fontSize: '13px' }}>
                        <option value={10}>۱۰ ردیف</option>
                        <option value={25}>۲۵ ردیف</option>
                        <option value={50}>۵۰ ردیف</option>
                        <option value={100}>۱۰۰ ردیف</option>
                    </select>
                </div>
            )}
        </div>
    )
}