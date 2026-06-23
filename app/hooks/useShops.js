// app/hooks/useShops.js
import { useState, useCallback } from 'react'
import Swal from 'sweetalert2'
import { shopsApi } from '@/app/api/client/shopsApi'

const CACHE_KEY    = 'vira_shops'
const CACHE_TTL_MS = 5 * 60 * 1000

const transform = (s) => ({
    id: s.id, name: s.name, code: s.code, type: s.type,
    fee: s.fee, is_active: s.is_active, description: s.description,
    created_at: s.created_at, updated_at: s.updated_at,
})

// ── cache API — export میشه تا create/edit هم بتونن استفاده کنن ──
export const shopsCache = {
    read() {
        try {
            const raw = sessionStorage.getItem(CACHE_KEY)
            if (!raw) return null
            const p = JSON.parse(raw)
            if (Date.now() - p.ts > CACHE_TTL_MS) { sessionStorage.removeItem(CACHE_KEY); return null }
            return p
        } catch { return null }
    },
    write(shops, nextCursor = null, hasMore = false) {
        try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ shops, nextCursor, hasMore, ts: Date.now() })) } catch {}
    },
    clear() { try { sessionStorage.removeItem(CACHE_KEY) } catch {} },

    // ⭐ ایجاد جدید → اضافه به ابتدای لیست
    prepend(apiShop) {
        const c = this.read()
        if (!c) return  // cache نیست، دفعه بعد از API می‌خونه
        this.write([transform(apiShop), ...c.shops], c.nextCursor, c.hasMore)
    },

    // ⭐ ویرایش → آپدیت یه ردیف
    updateOne(shopId, apiShop) {
        const c = this.read()
        if (!c) return
        this.write(
            c.shops.map(s => s.id === shopId ? { ...s, ...transform(apiShop) } : s),
            c.nextCursor, c.hasMore
        )
    },
}

// ════════════════════════════════════════════════════════
export function useShops() {
    const [shops,      setShops]      = useState([])
    const [nextCursor, setNextCursor] = useState(null)
    const [hasMore,    setHasMore]    = useState(false)
    const [loading,    setLoading]    = useState(false)

    // helper: آپدیت state + cache با هم
    const apply = useCallback((updater) => {
        setShops(prev => {
            const next = updater(prev)
            const c = shopsCache.read()
            shopsCache.write(next, c?.nextCursor ?? null, c?.hasMore ?? false)
            return next
        })
    }, [])

    // بارگذاری: cache اول، API بعد
    const load = useCallback(async () => {
        const cached = shopsCache.read()
        if (cached) {
            setShops(cached.shops)
            setNextCursor(cached.nextCursor)
            setHasMore(cached.hasMore)
            return
        }
        setLoading(true)
        try {
            const res   = await shopsApi.getAll()
            const data  = res.data.shops
            const items = data.data.map(transform)
            setShops(items)
            setNextCursor(data.next_cursor)
            setHasMore(!!data.next_cursor)
            shopsCache.write(items, data.next_cursor, !!data.next_cursor)
        } finally { setLoading(false) }
    }, [])

    const loadMore = useCallback(async () => {
        if (!nextCursor || loading) return
        setLoading(true)
        try {
            const res   = await shopsApi.getAll(nextCursor)
            const data  = res.data.shops
            const items = data.data.map(transform)
            apply(prev => [...prev, ...items])
            setNextCursor(data.next_cursor)
            setHasMore(!!data.next_cursor)
        } finally { setLoading(false) }
    }, [nextCursor, loading, apply])

    const toggle = useCallback(async (shop) => {
        const newStatus = shop.is_active === 'active' ? 'inactive' : 'active'
        try {
            const res     = await shopsApi.toggleStatus(shop.id, newStatus)
            const updated = res.data?.shop
            apply(prev => prev.map(s =>
                s.id === shop.id
                    ? { ...s, is_active: updated?.is_active ?? newStatus, updated_at: updated?.updated_at }
                    : s
            ))
            Swal.fire({ title: 'موفق!', text: 'وضعیت تغییر کرد', icon: 'success', timer: 1500, showConfirmButton: false })
        } catch {
            Swal.fire('خطا', 'مشکل در تغییر وضعیت', 'error')
        }
    }, [apply])

    const remove = useCallback(async (shopId) => {
        const ok = await Swal.fire({
            title: 'حذف شاپ', text: 'آیا مطمئن هستید؟', icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#64748b',
            confirmButtonText: 'بله، حذف شود', cancelButtonText: 'انصراف',
        })
        if (!ok.isConfirmed) return
        try {
            await shopsApi.remove(shopId)
            apply(prev => prev.filter(s => s.id !== shopId))
            Swal.fire({ title: 'حذف شد!', icon: 'success', timer: 1800, showConfirmButton: false })
        } catch {
            Swal.fire('خطا', 'مشکل در حذف', 'error')
        }
    }, [apply])

    return { shops, loading, hasMore, load, loadMore, toggle, remove }
}