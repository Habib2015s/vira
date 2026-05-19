'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faKey, faSpinner, faSyncAlt, faCheck, faSearch, faShield, faUser } from '@fortawesome/free-solid-svg-icons'
import DashboardLayout from '@/app/dashboard/Dashboardlayout'
import Swal from 'sweetalert2'
import { ENV, getHeaders } from '@/app/config/env'

export default function PermissionsPage() {
    const queryClient = useQueryClient()
    const [search, setSearch] = useState('')

    // لیست permissions
    const { data: permsData, isLoading } = useQuery({
        queryKey: ['permissionsList'],
        queryFn: () => fetch(ENV.API_PERMISSIONS_LIST, { headers: getHeaders() }).then(r => r.json()).then(r => r.data?.permissions ?? r.data ?? []),
        staleTime: 5 * 60 * 1000,
    })
    const permissions = (permsData ?? []).filter(p =>
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
                <div className="page-header-bar">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                                <FontAwesomeIcon icon={faKey} className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-white leading-none">دسترسی‌ها</h1>
                                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.75)' }}>{permissions.length} دسترسی</p>
                            </div>
                        </div>
                        {/* ⭐ دکمه Upgrade */}
                        <button onClick={() => upgradeMutation.mutate()} disabled={upgradeMutation.isPending}
                                className="btn btn-warning">
                            <FontAwesomeIcon icon={upgradeMutation.isPending ? faSpinner : faSyncAlt}
                                             className={`w-4 h-4 ${upgradeMutation.isPending ? 'animate-spin' : ''}`} />
                            {upgradeMutation.isPending ? 'در حال بروزرسانی...' : 'بروزرسانی دسترسی‌ها'}
                        </button>
                    </div>
                </div>

                <div className="page-content max-w-4xl">
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
                                                 style={{ background: `hsl(${(gi * 67) % 360}, 65%, 88%)` }}>
                                                <FontAwesomeIcon icon={faKey} className="w-3.5 h-3.5" style={{ color: `hsl(${(gi * 67) % 360}, 55%, 38%)` }} />
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