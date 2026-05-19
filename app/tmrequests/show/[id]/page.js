'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClipboardList, faSpinner, faArrowLeft, faPen, faCog, faUser,
    faListCheck, faFileLines, faTimes, faClock, faTruck, faRotateLeft,
    faWrench, faTrash, faLink, faFileContract } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import DashboardLayout from "@/app/dashboard/Dashboardlayout"
import Swal from 'sweetalert2'
import { ENV } from '@/app/config/env'
import Select from 'react-select'

const BASE    = ENV.API_TM_REQUESTS
const HEADERS = { 'Content-Type': 'application/json', 'Accept': 'application/json' }

const STATUS_LABEL = { request: 'درخواست', waiting: 'در انتظار', accepted: 'پذیرفته', rejected: 'رد شده', departure: 'ترخیص' }
const STATUS_BADGE = { request: 'badge-muted', waiting: 'badge-warning', accepted: 'badge-success', rejected: 'badge-danger', departure: 'badge-info' }
const TYPE_BADGE   = { CM: 'badge-info', PM: 'badge-success', EM: 'badge-danger' }

const InfoRow = ({ label, value }) => (
    <div className="flex items-center justify-between py-2.5 gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{label}</span>
        <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>{value ?? '—'}</span>
    </div>
)

export default function TmRequestShowPage() {
    const router      = useRouter()
    const { id }      = useParams()
    const queryClient = useQueryClient()
    const [data,    setData]    = useState(null)
    const [loading, setLoading] = useState(true)
    const [fsModal,   setFsModal]   = useState(false)
    const [fsId, setFsId] = useState(null)
    const [orderNums, setOrderNums] = useState('')

    const load = () => {
        setLoading(true)
        fetch(`${BASE}/${id}`, { headers: HEADERS })
            .then(r => r.json())
            .then(res => { setData(res.data?.tmrequest || null); setLoading(false) })
            .catch(() => { Swal.fire({ icon: 'error', title: 'خطا', text: 'دریافت ناموفق' }); setLoading(false) })
    }
    useEffect(() => { load() }, [id])

    // fetch repairmen برای نمایش نام مکانیزم و راننده
    const { data: repairmenData = [] } = useQuery({
        queryKey: ['repairmen'],
        queryFn: () => fetch(ENV.API_REPAIRMEN, { headers: HEADERS }).then(r => r.json()).then(r => r.data?.repairmen?.data || []),
        staleTime: 10 * 60 * 1000,
    })
    const repairmanMap = Object.fromEntries(repairmenData.map(r => [r.id, `${r.name} ${r.family || ''}`]))

    const statusMutation = useMutation({
        mutationFn: (action) => fetch(`${BASE}/${id}/${action}`, { method: 'PATCH', headers: HEADERS }).then(r => r.json()),
        onSuccess: (_, action) => {
            const labels = { reject: 'رد شد', toWaiting: 'به انتظار رفت', toDeparture: 'ترخیص شد', rollbackToAccepted: 'بازگشت به پذیرفته' }
            Swal.fire({ title: labels[action] || 'انجام شد', icon: 'success', timer: 1800, showConfirmButton: false })
            load()
        },
        onError: () => Swal.fire('خطا!', 'عملیات انجام نشد', 'error'),
    })
    const deleteMutation = useMutation({
        mutationFn: () => fetch(`${BASE}/${id}`, { method: 'DELETE', headers: HEADERS }).then(r => r.json()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tmRequests'] })
            Swal.fire({ title: 'حذف شد!', icon: 'success', timer: 1800, showConfirmButton: false })
            router.push('/tmrequests')
        },
        onError: () => Swal.fire('خطا!', 'حذف ناموفق', 'error'),
    })
    const deleteInfoMutation = useMutation({
        mutationFn: (infoId) =>
            fetch(`https://viratest2.ir/api/v1/repairshops/tmRequests/info/${infoId}/deleteInfo`,
                { method: 'DELETE', headers: HEADERS }).then(r => r.json()),
        onSuccess: () => { Swal.fire({ title: 'قلم حذف شد!', icon: 'success', timer: 1800, showConfirmButton: false }); load() },
        onError: () => Swal.fire('خطا!', 'حذف قلم ناموفق', 'error'),
    })
    const setFsMutation = useMutation({
        mutationFn: (body) => fetch(ENV.API_TM_REQUESTS_SET_FINAL_STATEMENT, { method: 'POST', headers: HEADERS, body: JSON.stringify(body) }).then(r => r.json()),
        onSuccess: (res) => {
            if (res.data || res.message) { setFsModal(false); Swal.fire({ title: 'صورت وضعیت ست شد!', icon: 'success', timer: 2000, showConfirmButton: false }); load() }
            else Swal.fire({ icon: 'error', title: 'خطا', text: res.message || 'خطایی رخ داد' })
        },
        onError: () => Swal.fire('خطا!', 'عملیات ناموفق', 'error'),
    })
// ❗ اینو بیار بالا قبل از if ها
    const { data: finalStatements = [] } = useQuery({
        queryKey: ['finalStatements'],
        queryFn: () =>
            fetch(ENV.API_FINAL_STATEMENTS, { headers: HEADERS })
                .then(r => r.json())
                .then(r => r.data?.finalStatements?.data || []),
        staleTime: 10 * 60 * 1000,
    })
    const finalStatementOptions = finalStatements.map(fs => ({
        value: fs.id,
        label: `#${fs.id} - ${fs.title || fs.description || 'بدون عنوان'}`,
    }))
    const handleStatus = (action) =>
        Swal.fire({ title: 'تأیید عملیات؟', icon: 'question', showCancelButton: true, confirmButtonText: 'بله', cancelButtonText: 'انصراف' })
            .then(r => { if (r.isConfirmed) statusMutation.mutate(action) })

    const handleDelete = () =>
        Swal.fire({ title: 'حذف درخواست؟', icon: 'warning', showCancelButton: true, confirmButtonColor: 'var(--danger)', confirmButtonText: 'حذف', cancelButtonText: 'انصراف' })
            .then(r => { if (r.isConfirmed) deleteMutation.mutate() })

    const handleSetFs = (e) => {
        e.preventDefault()
        if (!fsId || !orderNums.trim()) return
        setFsMutation.mutate({ final_statement_id: fsId, work_order_numbers: orderNums.split(',').map(n => n.trim()).filter(Boolean) })
    }

    if (loading) return (
        <DashboardLayout>
            <div className="w-full min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card text-center p-12">
                    <FontAwesomeIcon icon={faSpinner} className="w-14 h-14 animate-spin mb-5" style={{ color: 'var(--primary)' }} />
                    <p className="font-bold" style={{ color: 'var(--text)' }}>در حال بارگذاری...</p>
                </motion.div>
            </div>
        </DashboardLayout>
    )

    if (!data) return (
        <DashboardLayout>
            <div className="w-full min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
                <div className="card text-center p-12">
                    <p className="font-bold mb-4" style={{ color: 'var(--text)' }}>درخواست یافت نشد</p>
                    <button onClick={() => router.back()} className="btn btn-back"><FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" /> بازگشت</button>
                </div>
            </div>
        </DashboardLayout>
    )

    const { infos = [], mechanism, user } = data
    const s = data.status

    return (
        <DashboardLayout>
            <div className="w-full min-h-screen" style={{ background: 'var(--bg)' }}>
                <div className="page-header-bar">
                    <div className="max-w-5xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.2)' }}>
                                <FontAwesomeIcon icon={faClipboardList} className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-xl font-black text-white leading-none">درخواست #{data.request_number || id}</h1>
                                    {data.type && <span className={`badge text-xs ${TYPE_BADGE[data.type] || 'badge-muted'}`}>{data.type}</span>}
                                    <span className={`badge text-xs ${STATUS_BADGE[s] || 'badge-muted'}`}>{STATUS_LABEL[s] ?? s}</span>
                                </div>
                                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.65)' }}>
                                    مکانیزم: {repairmanMap[data.mechanism_id] || data.mechanism_id} — راننده: {repairmanMap[data.driver_id] || data.driver_id}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap justify-end">
                            <Link href={`/tmrequests/edit/${id}`}>
                                <button className="btn btn-warning btn-sm"><FontAwesomeIcon icon={faPen} className="w-3.5 h-3.5" />ویرایش</button>
                            </Link>
                            <button onClick={() => setFsModal(true)} className="btn btn-sm" style={{ background: 'var(--info)', color: '#fff' }}>
                                <FontAwesomeIcon icon={faFileContract} className="w-3.5 h-3.5" />صورت وضعیت
                            </button>
                            {s === 'accepted' && <button onClick={() => handleStatus('reject')} disabled={statusMutation.isPending} className="btn btn-danger btn-sm"><FontAwesomeIcon icon={faTimes} className="w-3.5 h-3.5" />رد</button>}
                            {(s === 'request' || s === 'rejected') && <button onClick={() => handleStatus('toWaiting')} disabled={statusMutation.isPending} className="btn btn-warning btn-sm"><FontAwesomeIcon icon={faClock} className="w-3.5 h-3.5" />انتظار</button>}
                            {s === 'accepted' && <button onClick={() => handleStatus('toDeparture')} disabled={statusMutation.isPending} className="btn btn-success btn-sm"><FontAwesomeIcon icon={faTruck} className="w-3.5 h-3.5" />ترخیص</button>}
                            {s === 'departure' && <button onClick={() => handleStatus('rollbackToAccepted')} disabled={statusMutation.isPending} className="btn btn-sm" style={{ background: 'var(--primary)', color: '#fff' }}><FontAwesomeIcon icon={faRotateLeft} className="w-3.5 h-3.5" />بازگشت</button>}
                            <button onClick={handleDelete} disabled={deleteMutation.isPending} className="btn btn-danger btn-sm">
                                <FontAwesomeIcon icon={deleteMutation.isPending ? faSpinner : faTrash} className={`w-3.5 h-3.5 ${deleteMutation.isPending ? 'animate-spin' : ''}`} />حذف
                            </button>
                            <button onClick={() => router.back()} className="btn btn-back btn-sm"><FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" />بازگشت</button>
                        </div>
                    </div>
                </div>

                <div className="page-content max-w-5xl">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        <div className="lg:col-span-2 space-y-5">

                            {/* مکانیزم */}
                            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card">
                                <div className="card-header">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--info-light)' }}>
                                            <FontAwesomeIcon icon={faCog} className="w-3.5 h-3.5" style={{ color: 'var(--info)' }} />
                                        </div>
                                        <p className="card-title">اطلاعات مکانیزم</p>
                                    </div>
                                </div>
                                <div className="card-body">
                                    {mechanism && Object.keys(mechanism).length > 0
                                        ? Object.entries(mechanism).map(([k, v]) => <InfoRow key={k} label={k} value={v !== null ? String(v) : '—'} />)
                                        : <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>اطلاعات مکانیزم ثبت نشده</p>
                                    }
                                </div>
                            </motion.div>

                            {/* کاربر */}
                            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }} className="card">
                                <div className="card-header">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--success-light)' }}>
                                            <FontAwesomeIcon icon={faUser} className="w-3.5 h-3.5" style={{ color: 'var(--success)' }} />
                                        </div>
                                        <p className="card-title">کاربر ثبت‌کننده</p>
                                    </div>
                                </div>
                                <div className="card-body">
                                    {user && Object.keys(user).length > 0
                                        ? Object.entries(user).map(([k, v]) => <InfoRow key={k} label={k} value={v !== null ? String(v) : '—'} />)
                                        : <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>کاربر ثبت نشده</p>
                                    }
                                </div>
                            </motion.div>
                        </div>

                        {/* اقلام */}
                        <div>
                            <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 }} className="card">
                                <div className="card-header">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--warning-light)' }}>
                                            <FontAwesomeIcon icon={faListCheck} className="w-3.5 h-3.5" style={{ color: 'var(--warning)' }} />
                                        </div>
                                        <p className="card-title">اقلام</p>
                                    </div>
                                    <span className="badge badge-primary">{infos.length}</span>
                                </div>
                                <div className="card-body p-0">
                                    {infos.length === 0
                                        ? <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}><FontAwesomeIcon icon={faFileLines} className="w-8 h-8 mb-2 opacity-30" /><p className="text-sm">اقلامی ثبت نشده</p></div>
                                        : infos.map((info, i) => (
                                            <motion.div key={info.id || i} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.04 }}
                                                        className="p-3" style={{ borderBottom: i < infos.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: 'var(--primary-light)' }}>
                                                            <FontAwesomeIcon icon={faWrench} className="w-2.5 h-2.5" style={{ color: 'var(--primary)' }} />
                                                        </div>
                                                        <span className="text-xs font-bold" style={{ color: 'var(--text)' }}>قلم {i+1}</span>
                                                        {info.id && <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>#{info.id}</span>}
                                                    </div>
                                                    {info.id && (
                                                        <button onClick={() => Swal.fire({ title: 'حذف قلم؟', icon: 'warning', showCancelButton: true, confirmButtonColor: 'var(--danger)', confirmButtonText: 'حذف', cancelButtonText: 'انصراف' })
                                                            .then(r => { if (r.isConfirmed) deleteInfoMutation.mutate(info.id) })}
                                                                className="action-btn action-btn-delete w-6 h-6" disabled={deleteInfoMutation.isPending}>
                                                            <FontAwesomeIcon icon={deleteInfoMutation.isPending ? faSpinner : faTrash} className={`w-2.5 h-2.5 ${deleteInfoMutation.isPending ? 'animate-spin' : ''}`} />
                                                        </button>
                                                    )}
                                                </div>
                                                {Object.entries(info).filter(([k]) => k !== 'id').map(([k, v]) => {
                                                    const FIELD_LABELS = {
                                                        tm_code_id: 'کد تعمیر', shop_id: 'شاپ',
                                                        mechanism_id: 'مکانیزم', driver_id: 'راننده',
                                                        status: 'وضعیت', type_code: 'نوع کد',
                                                        cost: 'هزینه', tm_code_count: 'تعداد', description: 'توضیحات',
                                                    }
                                                    const INFO_STATUS = {
                                                        request: 'درخواست', waiting: 'در انتظار', accepted: 'پذیرفته',
                                                        rejected: 'رد شده', departure: 'ترخیص',
                                                        not_accepted: 'تایید نشده', all: 'همه',
                                                    }
                                                    const displayVal = k === 'status' ? (INFO_STATUS[v] ?? v) : (v !== null && v !== undefined ? String(v) : '—')
                                                    return (
                                                        <div key={k} className="flex justify-between py-1 text-xs" style={{ borderBottom: '1px solid var(--border)' }}>
                                                            <span style={{ color: 'var(--text-muted)' }}>{FIELD_LABELS[k] ?? k}</span>
                                                            <span className="font-semibold" style={{ color: 'var(--text)' }}>{displayVal}</span>
                                                        </div>
                                                    )
                                                })}
                                            </motion.div>
                                        ))
                                    }
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Modal صورت وضعیت */}
                <AnimatePresence>
                    {fsModal && (
                        <div className="fixed inset-0 flex items-center justify-center p-4"
                             style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 50 }}
                             onClick={e => { if (e.target === e.currentTarget) setFsModal(false) }}>
                            <motion.div initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 16 }}
                                        className="card w-full max-w-md" style={{ zIndex: 51 }} onClick={e => e.stopPropagation()}>
                                <div className="card-header">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--info-light)' }}>
                                            <FontAwesomeIcon icon={faFileContract} className="w-3.5 h-3.5" style={{ color: 'var(--info)' }} />
                                        </div>
                                        <p className="card-title">ست کردن صورت وضعیت</p>
                                    </div>
                                    <button onClick={() => setFsModal(false)} className="action-btn action-btn-delete w-7 h-7">
                                        <FontAwesomeIcon icon={faTimes} className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <div className="card-body">
                                    <form onSubmit={handleSetFs} className="space-y-4">
                                        <div>
                                            <label className="form-label"><span style={{ color: 'var(--danger)' }}>* </span>شناسه صورت وضعیت</label>
                                            <Select
                                                options={finalStatementOptions}
                                                value={finalStatementOptions.find(o => o.value === fsId) || null}
                                                onChange={(opt) => setFsId(opt?.value || null)}
                                                placeholder="انتخاب صورت وضعیت..."
                                                isClearable
                                                isSearchable
                                                noOptionsMessage={() => 'موردی یافت نشد'}
                                                styles={{
                                                    control: (base, state) => ({
                                                        ...base,
                                                        backgroundColor: 'var(--surface)',
                                                        borderColor: state.isFocused ? 'var(--primary)' : 'var(--border)',
                                                        boxShadow: state.isFocused ? '0 0 0 3px rgba(84,76,207,0.15)' : 'none',
                                                        '&:hover': { borderColor: 'var(--border-strong)' },
                                                        minHeight: '40px'
                                                    }),
                                                    menu: (base) => ({
                                                        ...base,
                                                        backgroundColor: 'var(--surface)',
                                                        border: '1px solid var(--border)',
                                                        zIndex: 50
                                                    }),
                                                    option: (base, state) => ({
                                                        ...base,
                                                        backgroundColor: state.isFocused
                                                            ? 'var(--surface-2)'
                                                            : state.isSelected
                                                                ? 'var(--primary)'
                                                                : 'transparent',
                                                        color: state.isSelected ? '#fff' : 'var(--text)',
                                                        cursor: 'pointer'
                                                    }),
                                                    singleValue: (base) => ({
                                                        ...base,
                                                        color: 'var(--text)'
                                                    }),
                                                    input: (base) => ({
                                                        ...base,
                                                        color: 'var(--text)'
                                                    }),
                                                    placeholder: (base) => ({
                                                        ...base,
                                                        color: 'var(--muted)'
                                                    })
                                                }}
                                            />                                  </div>
                                        <div>
                                            <label className="form-label"><span style={{ color: 'var(--danger)' }}>* </span>شماره‌های کاری (با کاما)</label>
                                            <input type="text" value={orderNums} onChange={e => setOrderNums(e.target.value)} placeholder="مثال: WO-001, WO-002" className="form-input" />
                                            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>چند شماره را با کاما جدا کنید</p>
                                        </div>
                                        <div className="flex justify-end gap-3 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                                            <button type="button" onClick={() => setFsModal(false)} className="btn btn-ghost btn-sm">انصراف</button>
                                            <button type="submit" disabled={setFsMutation.isPending || !fsId || !orderNums} className="btn btn-success btn-sm">
                                                {setFsMutation.isPending
                                                    ? <><FontAwesomeIcon icon={faSpinner} className="w-3.5 h-3.5 animate-spin" />در حال ثبت...</>
                                                    : <><FontAwesomeIcon icon={faLink} className="w-3.5 h-3.5" />ست کردن</>
                                                }
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </DashboardLayout>
    )
}