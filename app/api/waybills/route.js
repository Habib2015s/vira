// app/api/waybills/route.js
import { NextResponse } from 'next/server'

const BASE         = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://viratest2.ir'
const WAYBILLS_URL = `${BASE}/api/v1/waybills`


// ── GET /api/waybills ─────────────────────────────────
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const cursor  = searchParams.get('cursor')
        const perPage = searchParams.get('per_page') || '20'

        const url = cursor
            ? `${WAYBILLS_URL}?cursor=${cursor}&per_page=${perPage}`
            : `${WAYBILLS_URL}?per_page=${perPage}`

        const res    = await fetch(url, { headers: HEADERS })
        const result = await res.json()

        if (!res.ok)
            return NextResponse.json({ error: result.message || 'خطا در دریافت بارنامه‌ها' }, { status: res.status })

        return NextResponse.json(result)

    } catch (err) {
        console.error('❌ GET /api/waybills:', err)
        return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
    }
}

// ── POST /api/waybills ────────────────────────────────
export async function POST(request) {
    try {
        const body = await request.json()

        const res    = await fetch(WAYBILLS_URL, {
            method:  'POST',
            headers: HEADERS,
            body:    JSON.stringify(body),
        })
        const result = await res.json()

        if (!res.ok)
            return NextResponse.json({ error: result.message || 'خطا در ثبت بارنامه' }, { status: res.status })

        return NextResponse.json(result)

    } catch (err) {
        console.error('❌ POST /api/waybills:', err)
        return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
    }
}