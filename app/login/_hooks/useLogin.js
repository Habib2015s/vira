// app/login/_hooks/useLogin.js
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ENV } from '@/app/config/env'

const LOGIN_HEADERS = { 'Content-Type': 'application/json', 'Accept': 'application/json' }
const CREDS_KEY     = 'vira-saved-credentials'

export function useLogin() {
    const router = useRouter()

    const [mode,         setMode]         = useState('login')
    const [prevMode,     setPrevMode]     = useState(null)
    const [formData,     setFormData]     = useState({ username: '', password: '', email: '', remember: false })
    const [errors,       setErrors]       = useState({})
    const [loading,      setLoading]      = useState(false)
    const [showSplash,   setShowSplash]   = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [savedCreds,   setSavedCreds]   = useState([])

    useEffect(() => {
        try {
            const raw = localStorage.getItem(CREDS_KEY)
            if (raw) setSavedCreds(JSON.parse(raw))
        } catch { setSavedCreds([]) }
    }, [])

    const direction   = prevMode === 'login' && mode === 'forgot' ? 'forward' : 'backward'
    const switchMode  = (next) => { setPrevMode(mode); setMode(next); setErrors({}) }
    const updateField = (field, value) => {
        setFormData(p => ({ ...p, [field]: value }))
        if (errors[field]) setErrors(p => ({ ...p, [field]: '' }))
    }
    const selectSavedCred = (cred) => {
        setFormData(p => ({ ...p, username: cred.username, password: cred.password }))
        setErrors({})
    }

    const validate = () => {
        const e = {}
        if (mode === 'login') {
            if (!formData.username.trim()) e.username = 'نام کاربری الزامی است'
            if (!formData.password.trim()) e.password = 'رمز عبور الزامی است'
        }
        if (mode === 'forgot') {
            if (!formData.email) e.email = 'ایمیل الزامی است'
            else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'فرمت ایمیل صحیح نیست'
        }
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validate()) return
        setLoading(true)

        if (mode === 'forgot') {
            setTimeout(() => { setLoading(false); setErrors({ email: 'این قابلیت هنوز فعال نشده' }) }, 800)
            return
        }

        try {
            // ⭐ login بدون Authorization — هنوز توکن نداریم
            const res  = await fetch(ENV.API_AUTH_LOGIN, {
                method: 'POST',
                headers: LOGIN_HEADERS,
                body: JSON.stringify({ credential: formData.username, password: formData.password }),
            })
            const data = await res.json()

            if (!res.ok) {
                const msg = Array.isArray(data.message) ? data.message[0]
                    : typeof data.errors === 'object' ? Object.values(data.errors).flat()[0]
                        : data.message || 'اطلاعات وارد شده اشتباه است'
                throw new Error(msg)
            }

            const token = data.data?.token
            if (!token) throw new Error('توکن از سرور دریافت نشد')

            // ⭐ ذخیره توکن در cookie
            const maxAge = formData.remember ? 2592000 : 86400
            document.cookie = `token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`

            // ذخیره اطلاعات کاربر
            const u = data.data?.user || {}
            localStorage.setItem('vira-user', JSON.stringify({
                id:            u.id            || null,
                name:          u.full_name      || u.username || formData.username,
                username:      u.username       || formData.username,
                phone:         u.phone          || '',
                nationalCode:  u.national_code  || '',
                personnelCode: u.personnel_code || '',
                role:          'کاربر',
            }))

            // ذخیره اعتبارنامه برای پیشنهاد دفعه بعد
            const prev    = JSON.parse(localStorage.getItem(CREDS_KEY) || '[]')
            const updated = [
                { username: formData.username, password: formData.password },
                ...prev.filter(c => c.username !== formData.username),
            ].slice(0, 3)
            localStorage.setItem(CREDS_KEY, JSON.stringify(updated))

            setShowSplash(true)

        } catch (err) {
            setErrors({ password: err.message })
        } finally {
            setLoading(false)
        }
    }

    const handleSplashDone = () => router.push('/dashboard')

    return {
        mode, direction, formData, errors, loading, showSplash,
        showPassword, setShowPassword,
        savedCreds, selectSavedCred,
        switchMode, updateField, handleSubmit, handleSplashDone,
    }
}