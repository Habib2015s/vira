// app/notifications/_data/notifHelpers.js
import { DAY_ORDER } from './notifConfig'

export function timeLabel(date) {
    const diff = Date.now() - date.getTime()
    const m = Math.floor(diff / 60000)
    const h = Math.floor(diff / 3600000)
    const d = Math.floor(diff / 86400000)
    if (m < 1)   return 'همین الان'
    if (m < 60)  return `${m} دقیقه پیش`
    if (h < 24)  return `${h} ساعت پیش`
    if (d === 1) return 'دیروز'
    if (d < 7)   return `${d} روز پیش`
    return date.toLocaleDateString('fa-IR', { month: 'long', day: 'numeric' })
}

export function dayKey(date) {
    const d = Math.floor((Date.now() - date.getTime()) / 86400000)
    if (d === 0) return 'امروز'
    if (d === 1) return 'دیروز'
    if (d < 7)   return 'این هفته'
    if (d < 30)  return 'این ماه'
    return 'قدیمی‌تر'
}

export function groupByDay(list) {
    const map = {}
    list.forEach(n => {
        const key = dayKey(n.time)
        if (!map[key]) map[key] = []
        map[key].push(n)
    })
    return DAY_ORDER.filter(k => map[k]).map(k => ({ label: k, items: map[k] }))
}

export function applyFilterSort(notifs, activeFilter, activeSort) {
    let list = notifs.filter(n => {
        if (activeFilter === 'all')    return true
        if (activeFilter === 'unread') return n.unread
        return n.type === activeFilter
    })
    if (activeSort === 'newest') list = [...list].sort((a, b) => b.time - a.time)
    if (activeSort === 'oldest') list = [...list].sort((a, b) => a.time - b.time)
    if (activeSort === 'unread') list = [...list].sort((a, b) => (b.unread ? 1 : 0) - (a.unread ? 1 : 0) || b.time - a.time)
    return list
}