// app/header/_hooks/useHeader.js
'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function useHeader() {
    const router = useRouter()
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [notifOpen,    setNotifOpen]    = useState(false)
    const dropdownRef = useRef(null)
    const notifRef    = useRef(null)

    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false)
            if (notifRef.current    && !notifRef.current.contains(e.target))    setNotifOpen(false)
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    function logout() {
        document.cookie = 'token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        setDropdownOpen(false)
        router.push('/login')
    }

    const toggleDropdown = () => { setDropdownOpen(p => !p); setNotifOpen(false) }
    const toggleNotif    = () => { setNotifOpen(p => !p); setDropdownOpen(false) }

    return { router, dropdownOpen, notifOpen, dropdownRef, notifRef, logout, toggleDropdown, toggleNotif, setDropdownOpen, setNotifOpen }
}