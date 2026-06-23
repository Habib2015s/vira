// ========== API Functions for Live Search ==========

export const loadSenders = (inputValue, callback) => {
    if (!inputValue) {
        callback([])
        return
    }
    setTimeout(async () => {
        try {
            const response = await fetch(`/api/search/senders?q=${inputValue}`)
            const data = await response.json()
            callback(data.map(item => ({ value: item.id, label: item.name })))
        } catch (error) {
            console.error('Error loading senders:', error)
            callback([])
        }
    }, 300)
}
export const loadCompanies = (inputValue, callback) => {
    if (!inputValue) {
        callback([])
        return
    }
    setTimeout(async () => {
        try {
            const response = await fetch(`/api/search/companies?q=${inputValue}`)
            const data = await response.json()
            callback(data.map(item => ({ value: item.id, label: item.name })))
        } catch (error) {
            console.error('Error loading companies:', error)
            callback([])
        }
    }, 300)
}
export const loadReceivers = (inputValue, callback) => {
    if (!inputValue) {
        callback([])
        return
    }
    setTimeout(async () => {
        try {
            const response = await fetch(`/api/search/receivers?q=${inputValue}`)
            const data = await response.json()
            callback(data.map(item => ({ value: item.id, label: item.name })))
        } catch (error) {
            console.error('Error loading receivers:', error)
            callback([])
        }
    }, 300)
}

export const loadDrivers = (inputValue, callback) => {
    if (!inputValue) {
        callback([])
        return
    }
    setTimeout(async () => {
        try {
            const response = await fetch(`/api/search/drivers?q=${inputValue}`)
            const data = await response.json()
            callback(data.map(item => ({ value: item.id, label: item.name })))
        } catch (error) {
            console.error('Error loading drivers:', error)
            callback([])
        }
    }, 300)
}

export const loadExpenseCenters = (inputValue, callback) => {
    if (!inputValue) {
        callback([])
        return
    }
    setTimeout(async () => {
        try {
            const response = await fetch(`/api/search/expense-centers?q=${inputValue}`)
            const data = await response.json()
            callback(data.map(item => ({ value: item.id, label: item.name })))
        } catch (error) {
            console.error('Error loading expense centers:', error)
            callback([])
        }
    }, 300)
}

export const loadDriverTypes = (inputValue, callback) => {
    if (!inputValue) {
        callback([])
        return
    }
    setTimeout(async () => {
        try {
            const response = await fetch(`/api/search/driver-types?q=${inputValue}`)
            const data = await response.json()
            callback(data.map(item => ({ value: item.id, label: item.name })))
        } catch (error) {
            console.error('Error loading driver types:', error)
            callback([])
        }
    }, 300)
}

export const loadCargoTypes = (inputValue, callback) => {
    if (!inputValue) {
        callback([])
        return
    }
    setTimeout(async () => {
        try {
            const response = await fetch(`/api/search/cargo-types?q=${inputValue}`)
            const data = await response.json()
            callback(data.map(item => ({ value: item.id, label: item.name })))
        } catch (error) {
            console.error('Error loading cargo types:', error)
            callback([])
        }
    }, 300)
}

export const loadPackaging = (inputValue, callback) => {
    if (!inputValue) {
        callback([])
        return
    }
    setTimeout(async () => {
        try {
            const response = await fetch(`/api/search/packaging?q=${inputValue}`)
            const data = await response.json()
            callback(data.map(item => ({ value: item.id, label: item.name })))
        } catch (error) {
            console.error('Error loading packaging:', error)
            callback([])
        }
    }, 300)
}

export const loadCities = (inputValue, callback) => {
    if (!inputValue) {
        callback([])
        return
    }
    setTimeout(async () => {
        try {
            const response = await fetch(`/api/search/cities?q=${inputValue}`)
            const data = await response.json()
            callback(data.map(item => ({ value: item.id, label: item.name })))
        } catch (error) {
            console.error('Error loading cities:', error)
            callback([])
        }
    }, 300)
}

export const loadBanks = (inputValue, callback) => {
    if (!inputValue) {
        callback([])
        return
    }
    setTimeout(async () => {
        try {
            const response = await fetch(`/api/search/banks?q=${inputValue}`)
            const data = await response.json()
            callback(data.map(item => ({ value: item.id, label: item.name })))
        } catch (error) {
            console.error('Error loading banks:', error)
            callback([])
        }
    }, 300)
}

export const loadCertificatePlaces = (inputValue, callback) => {
    if (!inputValue) {
        callback([])
        return
    }
    setTimeout(async () => {
        try {
            const response = await fetch(`/api/search/cities?q=${inputValue}`)
            const data = await response.json()
            callback(data.map(item => ({ value: item.id, label: item.name })))
        } catch (error) {
            console.error('Error loading certificate places:', error)
            callback([])
        }
    }, 300)
}

// ========== Custom Styles for AsyncSelect ==========
export const selectStyles = {
    control: (base, state) => ({
        ...base,
        minHeight: '44px',
        borderRadius: '12px',
        borderWidth: '2px',
        borderColor: state.isFocused ? '#3b82f6' : '#e2e8f0',
        boxShadow: state.isFocused ? '0 0 0 4px rgba(59, 130, 246, 0.1)' : 'none',
        backgroundColor: 'white',
        transition: 'all 0.2s',
        '&:hover': {
            borderColor: '#3b82f6'
        }
    }),
    menu: (base) => ({
        ...base,
        borderRadius: '12px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        zIndex: 9999
    }),
    menuList: (base) => ({
        ...base,
        padding: '6px'
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected
            ? '#3b82f6'
            : state.isFocused
                ? '#eff6ff'
                : 'white',
        color: state.isSelected ? 'white' : '#1e293b',
        fontSize: '14px',
        padding: '10px 14px',
        cursor: 'pointer',
        borderRadius: '8px',
        margin: '2px 0',
        fontWeight: state.isSelected ? '600' : '400',
        transition: 'all 0.15s',
        '&:active': {
            backgroundColor: state.isSelected ? '#2563eb' : '#dbeafe'
        }
    }),
    placeholder: (base) => ({
        ...base,
        color: '#94a3b8',
        fontSize: '14px',
        fontWeight: '400'
    }),
    singleValue: (base) => ({
        ...base,
        fontSize: '14px',
        color: '#1e293b',
        fontWeight: '500'
    }),
    input: (base) => ({
        ...base,
        fontSize: '14px',
        color: '#1e293b'
    }),
    loadingMessage: (base) => ({
        ...base,
        fontSize: '14px',
        color: '#64748b',
        padding: '12px'
    }),
    noOptionsMessage: (base) => ({
        ...base,
        fontSize: '14px',
        color: '#64748b',
        padding: '12px'
    })
}