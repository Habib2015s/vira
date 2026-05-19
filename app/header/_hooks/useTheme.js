// app/header/_hooks/useTheme.js
'use client'

import { useState, useEffect } from 'react'

export function useTheme() {
    const [isDark, setIsDark] = useState(false)

    useEffect(() => {
        const saved       = localStorage.getItem('vira-theme')
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        const dark        = saved ? saved === 'dark' : prefersDark
        setIsDark(dark)
        document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
        if (dark) document.documentElement.classList.add('dark')
        else      document.documentElement.classList.remove('dark')
    }, [])

    const toggleTheme = () => {
        const next = !isDark
        setIsDark(next)
        document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
        if (next) document.documentElement.classList.add('dark')
        else      document.documentElement.classList.remove('dark')
        localStorage.setItem('vira-theme', next ? 'dark' : 'light')
    }

    return { isDark, toggleTheme }
}