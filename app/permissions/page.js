'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faKey, faSpinner, faSyncAlt, faCheck, faSearch } from '@fortawesome/free-solid-svg-icons'
import DashboardLayout from '@/app/dashboard/Dashboardlayout'
import PageCrumb from '@/app/components/PageHeader/PageCrumb'
import Swal from 'sweetalert2'
import { ENV, getHeaders } from '@/app/config/env'

export default function PermissionsPage() {
    const queryClient = useQueryClient()
    const [search, setSearch] = useState('')

    const { data: permsData, isLoading, error: permsError } = useQuery({
        queryKey: ['permissionsList'],
        queryFn: async () => {
            // ⭐⭐ تغییر اصلی: از ENV.API_PERMISSIONS (مسیر پایه، بدون /list) استفاده می‌کنیم.
            // چون `/permissions/list` روی بک‌اند اصلاً وجود نداره (404 Route Not Found)،
            // و طبق الگوی همه endpoint های دیگه (shops, tmCodes, repairmen و...)،
            // لیست گرفتن همیشه با GET ساده به مسیر پایه انجام میشه، نه یه مسیر جدا با پسوند /list.
            const res  = await fetch(ENV.API_PERMISSIONS, { headers: getHeaders() })
            const json = await res.json().catch(() => ({}))
            console.log('Permissions API response:', json)

            if (!res.ok || json.success === false) {
                // ⭐ خطا رو throw می‌کنیم (نه فقط [] برگردونیم) تا useQuery اون رو بشناسه
                // و بتونیم پیام واقعی خطا رو تو UI نشون بدیم، نه اینکه ساکت خالی بمونه
                throw new Error(json?.message || `خطای ${res.status} در دریافت دسترسی‌ها`)
            }

            const list = json?.data?.permissions?.data
                ?? json?.data?.permissions
                ?? json?.data
                ?? []
            return Array.isArray(list) ? list : []
        },
        staleTime: 5 * 60 * 1000,
        retry: 1,
    })

    const permissions = (Array.isArray(permsData) ? permsData : []).filter(p =>
        !search || p.name?.toLowerCase().includes(search.toLowerCase())
    )

    // ⭐ دکمه Upgrade — رفرش permissions از سرور
    const upgradeMutation = useMutation({
        mutationFn: () => fetch(ENV.API_PERMISSIONS_UPGRADE, { method: 'POST', headers: getHeaders() }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['permissionsList'] })
            Swal.fire({ title: 'بروزرسانی شد!', text: 'لیست دسترسی‌ها از سرور بارگذاری شد', icon: 'success', timer: 2000, showConfirmButton: false })
        },
        onError: () => Swal.fire('خطا!', 'بروزرسانی انجام نشد', 'error'),
    })

    // گروه‌بندی بر اساس پیشوند
    const grouped = permissions.reduce((acc, p) => {
        const prefix = p.name?.split('.')[0] ?? 'other'
        if (!acc[prefix]) acc[prefix] = []
        acc[prefix].push(p)
        return acc
    }, {})

    return (
        <DashboardLayout>
            <div className="w-full min-h-screen" style={{ background: 'var(--bg)' }}>
                <div className="page-content">

                    <div className="flex items-center justify-between gap-3 flex-wrap mb-1">
                        <PageCrumb
                            icon={faKey}
                            root="مدیریت سیستم"
                            current="دسترسی‌ها"
                        />
                        <button onClick={() => upgradeMutation.mutate()} disabled={upgradeMutation.isPending}
                                className="btn btn-primary">
                            <FontAwesomeIcon icon={upgradeMutation.isPending ? faSpinner : faSyncAlt}
                                             className={`w-4 h-4 ${upgradeMutation.isPending ? 'animate-spin' : ''}`} />
                            {upgradeMutation.isPending ? 'در حال بروزرسانی...' : 'بروزرسانی دسترسی‌ها'}
                        </button>
                    </div>

                    {/* ⭐⭐ اضافه شد: اگه واقعاً خطایی بود (مثلاً هنوز 404/500)، حالا به‌جای خالی به نظر رسیدن، واضح نشون داده میشه */}
                    {permsError && (
                        <div className="mb-4 p-3 rounded-xl text-sm" style={{ background: 'var(--danger-light)', border: '1px solid var(--danger)', color: 'var(--danger)' }}>
                            <strong>خطا در دریافت دسترسی‌ها:</strong> {permsError.message}
                        </div>
                    )}

                    {/* جستجو */}
                    <div className="mb-5 relative">
                        <FontAwesomeIcon icon={faSearch} className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted)' }} />
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                               placeholder="جستجو در دسترسی‌ها..." className="form-input pr-10" />
                    </div>

                    {isLoading ? (
                        <div className="py-16 flex justify-center"><FontAwesomeIcon icon={faSpinner} className="w-8 h-8 animate-spin" style={{ color: 'var(--primary)' }} /></div>
                    ) : Object.keys(grouped).length === 0 ? (
                        <div className="card py-12 text-center" style={{ color: 'var(--text-muted)' }}>هیچ دسترسی‌ای یافت نشد</div>
                    ) : (
                        <div className="space-y-4">
                            {Object.entries(grouped).map(([prefix, perms], gi) => (
                                <motion.div key={prefix} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.05 }}
                                            className="card overflow-hidden">
                                    <div className="card-header">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                                                 style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                                                <FontAwesomeIcon icon={faKey} className="w-3.5 h-3.5" style={{ color: 'var(--text-soft)' }} />
                                            </div>
                                            <h3 className="card-title">{prefix}</h3>
                                            <span className="badge badge-muted text-xs">{perms.length}</span>
                                        </div>
                                    </div>
                                    <div className="p-4 flex flex-wrap gap-2">
                                        {perms.map(p => (
                                            <span key={p.id ?? p.name} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
                                                  style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                                                <FontAwesomeIcon icon={faCheck} className="w-3 h-3" />
                                                {p.name}
                                            </span>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}