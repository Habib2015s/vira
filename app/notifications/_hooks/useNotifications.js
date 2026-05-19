// app/notifications/_hooks/useNotifications.js
'use client'

import { useState, useMemo } from 'react'
import { MOCK_NOTIFS } from '../_data/notifConfig'
import { applyFilterSort, groupByDay } from '../_data/notifHelpers'

export function useNotifications() {
    const [notifs,       setNotifs]  = useState(MOCK_NOTIFS)
    const [activeFilter, setFilter]  = useState('all')
    const [activeSort,   setSort]    = useState('newest')

    const unreadCount = notifs.filter(n => n.unread).length

    const processed = useMemo(
        () => applyFilterSort(notifs, activeFilter, activeSort),
        [notifs, activeFilter, activeSort]
    )

    const grouped = useMemo(() => groupByDay(processed), [processed])

    const markRead    = (id) => setNotifs(p => p.map(n => n.id === id ? { ...n, unread: false } : n))
    const markAllRead = ()   => setNotifs(p => p.map(n => ({ ...n, unread: false })))
    const deleteNotif = (id) => setNotifs(p => p.filter(n => n.id !== id))

    const filterCount = (filterId) => {
        if (filterId === 'all')    return notifs.length
        if (filterId === 'unread') return notifs.filter(n => n.unread).length
        return notifs.filter(n => n.type === filterId).length
    }

    return {
        notifs, processed, grouped, unreadCount,
        activeFilter, setFilter,
        activeSort,   setSort,
        markRead, markAllRead, deleteNotif, filterCount,
    }
}