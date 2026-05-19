// app/notifications/page.js
'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell, faCheckDouble, faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/app/dashboard/Dashboardlayout'
import { useNotifications }  from './_hooks/useNotifications'
import { NotifFilterBar }    from './_components/NotifFilterBar'
import { NotifGroup }        from './_components/NotifGroup'
import { NotifEmpty }        from './_components/NotifEmpty'

export default function NotificationsPage() {
    const router = useRouter()
    const {
        notifs, processed, grouped, unreadCount,
        activeFilter, setFilter,
        activeSort,   setSort,
        markRead, markAllRead, deleteNotif, filterCount,
    } = useNotifications()

    return (
        <DashboardLayout>
            <div className="w-full min-h-screen" style={{ background: 'var(--bg)' }}>

                {/* هدر */}
                <div className="page-header-bar">
                    <div className="max-w-3xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                 style={{ background: 'rgba(255,255,255,0.2)' }}>
                                <FontAwesomeIcon icon={faBell} className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-white leading-none">اعلان‌ها</h1>
                                {unreadCount > 0 && (
                                    <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
                                        {unreadCount} مورد خوانده نشده
                                    </p>
                                )}
                            </div>
                            {unreadCount > 0 && (
                                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white"
                                      style={{ background: 'var(--danger)' }}>
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button onClick={markAllRead} className="btn btn-sm"
                                        style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)' }}>
                                    <FontAwesomeIcon icon={faCheckDouble} className="w-3.5 h-3.5" />
                                    خواندن همه
                                </button>
                            )}
                            <button onClick={() => router.back()} className="btn btn-back btn-sm">
                                <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" />بازگشت
                            </button>
                        </div>
                    </div>
                </div>

                <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">

                    <NotifFilterBar
                        activeFilter={activeFilter} activeSort={activeSort}
                        onFilter={setFilter} onSort={setSort} filterCount={filterCount}
                    />

                    {grouped.length === 0 ? (
                        <NotifEmpty />
                    ) : (
                        <div className="space-y-5">
                            {grouped.map(({ label, items }) => (
                                <NotifGroup key={label} label={label} items={items}
                                            onRead={markRead} onDelete={deleteNotif} />
                            ))}
                        </div>
                    )}

                    {processed.length > 0 && (
                        <div className="text-center py-2">
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                نمایش {processed.length} از {notifs.length} اعلان
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}