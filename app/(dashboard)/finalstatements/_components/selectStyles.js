// app/finalstatements/_components/selectStyles.js
export const selectStyles = {
    control: (b, s) => ({
        ...b, minHeight: '40px', height: '40px',
        borderRadius: 'var(--radius)', background: 'var(--surface)',
        borderColor: s.isFocused ? 'var(--primary)' : 'var(--border)', borderWidth: '1.5px',
        boxShadow: s.isFocused ? '0 0 0 3px rgba(84,76,207,0.1)' : 'none',
        '&:hover': { borderColor: 'var(--border-strong)' },
        transition: 'border-color 0.15s, box-shadow 0.15s',
    }),
    menu:       (b) => ({ ...b, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', zIndex: 9999, boxShadow: 'var(--shadow-lg)' }),
    menuList:   (b) => ({ ...b, padding: '6px', background: 'var(--surface)' }),
    menuPortal: (b) => ({ ...b, zIndex: 9999 }),
    option:     (b, s) => ({ ...b, borderRadius: 'var(--radius-sm)', margin: '2px 0', cursor: 'pointer', fontSize: '13.5px', background: s.isSelected ? 'var(--primary)' : s.isFocused ? 'var(--surface-2)' : 'transparent', color: s.isSelected ? '#fff' : 'var(--text)' }),
    singleValue:        (b) => ({ ...b, color: 'var(--text)', fontSize: '13.5px' }),
    placeholder:        (b) => ({ ...b, color: 'var(--muted)', fontSize: '13.5px' }),
    input:              (b) => ({ ...b, color: 'var(--text)' }),
    indicatorSeparator: (b) => ({ ...b, background: 'var(--border)' }),
    dropdownIndicator:  (b) => ({ ...b, color: 'var(--muted)' }),
    valueContainer:     (b) => ({ ...b, padding: '0 12px' }),
}