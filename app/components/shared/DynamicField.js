'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import Select from 'react-select'
import PersianDatePicker from '@/app/components/shared/PersianDatePicker'
import * as apiLoaders from '@/app/utils/Waybillapi'

// استایل react-select با دارک مود کامل
const select2Styles = {
    control: (base, state) => ({
        ...base,
        height: '40px',
        minHeight: '40px',
        borderRadius: '8px',
        borderWidth: '1.5px',
        background: 'var(--surface)',
        borderColor: state.isFocused ? 'var(--primary)' : 'var(--border)',
        boxShadow: state.isFocused ? '0 0 0 3px rgba(84,76,207,0.15)' : 'none',
        '&:hover': { borderColor: 'var(--border-strong)' }
    }),
    valueContainer: (base) => ({
        ...base,
        padding: '0 12px',
        fontSize: '13.5px',
        fontWeight: '500',
        background: 'transparent',
    }),
    input:              (base) => ({ ...base, color: 'var(--text)', margin: 0 }),
    singleValue:        (base) => ({ ...base, color: 'var(--text)', fontSize: '13.5px', fontWeight: '500' }),
    placeholder:        (base) => ({ ...base, color: 'var(--muted)', fontSize: '13.5px' }),
    menu:               (base) => ({ ...base, background: 'var(--surface)', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)', zIndex: 9999 }),
    menuList:           (base) => ({ ...base, padding: '6px', background: 'var(--surface)' }),
    option:             (base, state) => ({
        ...base,
        background: state.isSelected ? 'var(--primary)' : state.isFocused ? 'var(--surface-2)' : 'transparent',
        color: state.isSelected ? 'var(--surface)' : 'var(--text)',
        padding: '10px 16px',
        cursor: 'pointer',
        fontSize: '13.5px',
        fontWeight: state.isSelected ? '600' : '500',
        borderRadius: '6px',
        margin: '2px 0',
        '&:active': { background: 'var(--primary)' }
    }),
    indicatorSeparator: (base) => ({ ...base, background: 'var(--border)' }),
    dropdownIndicator:  (base) => ({ ...base, padding: '0 4px', color: 'var(--muted)' }),
    clearIndicator:     (base) => ({ ...base, padding: '0 4px', color: 'var(--muted)' }),
    loadingMessage:     (base) => ({ ...base, color: 'var(--text-muted)', fontSize: '13px' }),
    noOptionsMessage:   (base) => ({ ...base, color: 'var(--text-muted)', fontSize: '13px' }),
}

export default function DynamicField({ field, value, onChange, allData }) {
    const renderField = () => {
        switch (field.type) {

            case 'date':
                return (
                    <PersianDatePicker
                        value={value?.jDate || ''}
                        onChange={(dateObj) => onChange(field.name, dateObj)}
                        required={field.required}
                        label=""
                        placeholder={field.placeholder || 'انتخاب تاریخ شمسی'}
                    />
                )

            case 'text':
                return (
                    <input
                        type="text"
                        value={value || ''}
                        onChange={(e) => onChange(field.name, e.target.value)}
                        placeholder={field.placeholder || ''}
                        className="form-input"
                    />
                )

            case 'select':
                return (
                    <select
                        value={value || ''}
                        onChange={(e) => onChange(field.name, e.target.value)}
                        className="form-select"
                    >
                        {field.options?.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                )

            case 'select2':
                const loadOptions = field.loadOptions ? apiLoaders[field.loadOptions] : null
                return (
                    <Select
                        cacheOptions
                        value={value}
                        loadOptions={loadOptions}
                        onChange={(option) => onChange(field.name, option)}
                        placeholder={field.placeholder || 'جستجو کنید...'}
                        loadingMessage={() => 'در حال جستجو...'}
                        noOptionsMessage={() => 'نتیجه‌ای یافت نشد'}
                        isClearable
                        styles={select2Styles}
                        isAsync={!!loadOptions}
                        options={field.options}
                    />
                )

            case 'textarea':
                return (
                    <textarea
                        value={value || ''}
                        onChange={(e) => onChange(field.name, e.target.value)}
                        placeholder={field.placeholder || ''}
                        rows={field.rows || 3}
                        className="form-textarea"
                    />
                )

            default:
                return null
        }
    }

    return (
        <div className={field.fullWidth ? 'col-span-2' : ''}>
            {field.type !== 'date' && (
                <label className="form-label">
                    {field.required && <span style={{ color: 'var(--danger)' }}>* </span>}
                    {field.type === 'select2' && (
                        <FontAwesomeIcon icon={faSearch} className="w-3 h-3 ml-1" style={{ color: 'var(--primary)' }} />
                    )}
                    {field.label}
                </label>
            )}

            {field.type === 'date' && (
                <div className="mb-[-8px]">
                    <label className="form-label">
                        {field.required && <span style={{ color: 'var(--danger)' }}>* </span>}
                        {field.label}
                    </label>
                </div>
            )}

            {renderField()}

            {field.showZeroText && (
                <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>صفر ریال</p>
            )}
        </div>
    )
}