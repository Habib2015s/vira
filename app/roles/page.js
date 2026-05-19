'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faShield, faPlus, faTrash, faSpinner, faXmark, faSave, faSyncAlt } from '@fortawesome/free-solid-svg-icons'
import DashboardLayout from '@/app/dashboard/Dashboardlayout'
import Swal from 'sweetalert2'
import { ENV, getHeaders } from '@/app/config/env'

const BASE = ENV.API_ROLES

export default function RolesPage() {
    const queryClient = useQueryClient()
    const [showCreate, setShowCreate] = useState(false)
    const [newName, setNewName]       = useState('')

    const { data, isLoading } = useQuery({
        queryKey: ['roles'],
        queryFn: () => fetch(BASE, { headers: getHeaders() }).then(r => r.json()).then(r => r.data?.roles ?? []),
        staleTime: 5 * 60 * 1000,
    })
    const roles = data ?? []

    const createMutation = useMutation({
        mutationFn: (name) => fetch(BASE, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ name }) }).then(r => r.json()),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['roles'] }); setNewName(''); setShowCreate(false); Swal.fire({ title: 'ایجاد شد!', icon: 'success', timer: 1800, showConfirmButton: false }) },
        onError: () => Swal.fire('خطا!', 'ایجاد انجام نشد', 'error'),
    })

    const deleteMutation = useMutation({
        mutationFn: (id) => fetch(`${BASE}/${id}`, { method: 'DELETE', headers: getHeaders() }).then(r => r.json()),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['roles'] }); Swal.fire({ title: 'حذف شد!', icon: 'success', timer: 1800, showConfirmButton: false }) },
        onError: () => Swal.fire('خطا!', 'حذف انجام نشد', 'error'),
    })

    const handleDelete = (role) => Swal.fire({
        title: 'حذف نقش', html: `نقش <strong>${role.name}</strong> حذف شود؟`,
        icon: 'warning', showCancelButton: true, confirmButtonColor: 'var(--danger)',
        confirmButtonText: 'بله، حذف شود', cancelButtonText: 'انصراف'
    }).then(r => { if (r.isConfirmed) deleteMutation.mutate(role.id) })

    return (
        <DashboardLayout>
            <div className="w-full min-h-screen" style={{ background: 'var(--bg)' }}>
                <div className="page-header-bar">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                                <FontAwesomeIcon icon={faShield} className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-white leading-none">نقش‌ها</h1>
                                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.75)' }}>مدیریت نقش‌های سیستم ({roles.length} نقش)</p>
                            </div>
                        </div>
                        <button onClick={() => setShowCreate(p => !p)} className="btn btn-success">
                            <FontAwesomeIcon icon={showCreate ? faXmark : faPlus} className="w-4 h-4" />
                            {showCreate ? 'انصراف' : 'نقش جدید'}
                        </button>
                    </div>
                </div>

                <div className="page-content max-w-4xl">
                    {/* فرم ایجاد */}
                    <AnimatePresence>
                        {showCreate && (
                            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                                        className="card mb-5">
                                <div className="card-header"><h3 className="card-title">ایجاد نقش جدید</h3></div>
                                <div className="card-body">
                                    <div className="flex gap-3">
                                        <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
                                               placeholder="نام نقش (مثال: admin, editor)" className="form-input flex-1"
                                               onKeyDown={e => { if (e.key === 'Enter' && newName.trim()) createMutation.mutate(newName.trim()) }} />
                                        <button onClick={() => newName.trim() && createMutation.mutate(newName.trim())}
                                                disabled={createMutation.isPending || !newName.trim()} className="btn btn-primary">
                                            {createMutation.isPending ? <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" /> : <><FontAwesomeIcon icon={faSave} className="w-4 h-4" />ایجاد</>}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* لیست نقش‌ها */}
                    <div className="card overflow-hidden">
                        <div className="card-header"><h3 className="card-title">لیست نقش‌ها</h3></div>
                        {isLoading ? (
                            <div className="py-12 flex justify-center"><FontAwesomeIcon icon={faSpinner} className="w-8 h-8 animate-spin" style={{ color: 'var(--primary)' }} /></div>
                        ) : roles.length === 0 ? (
                            <div className="py-12 text-center" style={{ color: 'var(--text-muted)' }}>هیچ نقشی تعریف نشده</div>
                        ) : (
                            roles.map((role, i) => (
                                <motion.div key={role.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                                            className="flex items-center justify-between px-5 py-4"
                                            style={{ borderBottom: i < roles.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `hsl(${(role.id * 47) % 360}, 65%, 88%)` }}>
                                            <FontAwesomeIcon icon={faShield} className="w-4 h-4" style={{ color: `hsl(${(role.id * 47) % 360}, 55%, 38%)` }} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>{role.name}</p>
                                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>ID: {role.id}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleDelete(role)} className="action-btn action-btn-delete" disabled={deleteMutation.isPending}>
                                            <FontAwesomeIcon icon={deleteMutation.isPending ? faSpinner : faTrash} className={`w-3.5 h-3.5 ${deleteMutation.isPending ? 'animate-spin' : ''}`} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}