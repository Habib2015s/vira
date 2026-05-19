// app/header/_components/LordIcon.js
'use client'

import { useState, useEffect } from 'react'

export function LordIcon({ src, trigger = 'hover', colors, size = 26 }) {
    const [mounted, setMounted] = useState(false)
    useEffect(() => { setMounted(true) }, [])
    if (!mounted) return <div style={{ width: size, height: size }} />
    return (
        <div suppressHydrationWarning>
            <lord-icon src={src} trigger={trigger} colors={colors}
                       style={{ width: `${size}px`, height: `${size}px` }} />
        </div>
    )
}