// app/header/_hooks/useUser.js
'use client'

import { useState, useEffect } from 'react'

const DEFAULT_USER = { name: 'کاربر', email: '', role: 'کاربر', credential: '' }

export function useUser() {
    const [user, setUser] = useState(DEFAULT_USER)

    useEffect(() => {
        const load = () => {
            try {
                const raw = localStorage.getItem('vira-user')
                if (raw) setUser(JSON.parse(raw))
            } catch { setUser(DEFAULT_USER) }
        }
        load()
        // اگه در تب دیگه‌ای logout شد sync بشه
        window.addEventListener('storage', load)
        return () => window.removeEventListener('storage', load)
    }, [])

    return { user }
}