'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default function Waybilltabs({ tabs, activeTab, onTabChange }) {
    return (
        <div className="mb-6 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 pb-2 min-w-max">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            data-tab-id={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className="relative px-5 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap"
                            style={{
                                background: isActive
                                    ? 'linear-gradient(to right, #2563eb, #4f46e5)'
                                    : 'var(--surface-2)',
                                color: isActive ? '#ffffff' : 'var(--text-soft)',
                                boxShadow: isActive ? '0 4px 12px rgba(79,70,229,0.35)' : 'none',
                                transform: isActive ? 'scale(1.05)' : 'scale(1)',
                                border: isActive ? 'none' : '1px solid var(--border)',
                            }}
                            onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--border)' }}
                            onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'var(--surface-2)' }}
                        >
                            <div className="flex items-center gap-2">
                                {tab.icon && (
                                    <FontAwesomeIcon
                                        icon={tab.icon}
                                        className="w-4 h-4"
                                        style={{ color: isActive ? '#ffffff' : 'var(--text-muted)' }}
                                    />
                                )}
                                <span>{tab.label}</span>
                                {tab.required && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-black"
                                          style={{
                                              background: isActive ? '#ef4444' : 'var(--danger-light)',
                                              color: isActive ? '#ffffff' : 'var(--danger)',
                                          }}>
                                        *
                                    </span>
                                )}
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}