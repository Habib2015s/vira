'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faXmark, faTruck, faBuilding, faRoad,
    faCity, faBoxOpen, faFileLines, faChevronLeft
} from '@fortawesome/free-solid-svg-icons'

const waybillTypes = [
    { id: 'company-owned',         label: 'ماشین ملکی — بارنامه شرکتی',          path: '/waybills/create/company-owned',         icon: faTruck    },
    { id: 'non-company-owned',     label: 'ماشین ملکی — بارنامه غیرشرکتی',       path: '/waybills/create/non-company-owned',     icon: faTruck    },
    { id: 'non-owned-company',     label: 'ماشین غیرملکی — بارنامه شرکتی',       path: '/waybills/create/non-owned-company',     icon: faBuilding },
    { id: 'non-owned-non-company', label: 'ماشین غیرملکی — بارنامه غیرشرکتی',    path: '/waybills/create/non-owned-non-company', icon: faBuilding },
    { id: 'internet-owned',        label: 'ماشین استریپ ملکی',                    path: '/waybills/create/Owned-strip',           icon: faRoad     },
    { id: 'city',                  label: 'بارنامه شهری',                         path: '/waybills/create/City-waybill',          icon: faCity     },
    { id: 'internet-non-owned',    label: 'ماشین ملکی با بار — بدون بارنامه',     path: '/waybills/create/owned-non-company',     icon: faBoxOpen  },
]

export default function WaybillTypeModal({ isOpen, onClose, onSelect }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* overlay */}
                    <motion.div key="overlay"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onClick={onClose}
                                className="fixed inset-0 z-50"
                                style={{ background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)' }} />

                    {/* modal */}
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <motion.div key="modal"
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1,    y: 0  }}
                                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                    transition={{ duration: 0.2, ease: 'easeOut' }}
                                    className="w-full max-w-lg card"
                                    style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>

                            {/* header */}
                            <div className="card-header">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                         style={{ background: 'var(--primary-light)' }}>
                                        <FontAwesomeIcon icon={faFileLines} className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                                    </div>
                                    <h2 className="card-title">انتخاب نوع بارنامه</h2>
                                </div>
                                <button onClick={onClose}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
                                        style={{ color: 'var(--text-muted)', background: 'var(--surface-2)' }}
                                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-light)'; e.currentTarget.style.color = 'var(--danger)' }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text-muted)' }}>
                                    <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
                                </button>
                            </div>

                            {/* body */}
                            <div className="card-body overflow-y-auto">
                                <p className="text-sm text-center mb-4" style={{ color: 'var(--text-muted)' }}>
                                    نوع بارنامه مورد نظر را انتخاب کنید
                                </p>

                                <div className="space-y-2">
                                    {waybillTypes.map((type, idx) => (
                                        <motion.button key={type.id}
                                                       initial={{ opacity: 0, x: 16 }}
                                                       animate={{ opacity: 1, x: 0 }}
                                                       transition={{ delay: idx * 0.04 }}
                                                       onClick={() => !type.disabled && onSelect(type)}
                                                       disabled={type.disabled}
                                                       className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-right transition-all"
                                                       style={{
                                                           background:  type.disabled ? 'var(--surface-2)' : 'var(--primary-subtle)',
                                                           border:      `1.5px solid ${type.disabled ? 'var(--border)' : 'var(--primary-light)'}`,
                                                           color:       type.disabled ? 'var(--muted)' : 'var(--primary)',
                                                           cursor:      type.disabled ? 'not-allowed' : 'pointer',
                                                           opacity:     type.disabled ? 0.55 : 1,
                                                       }}
                                                       onMouseEnter={e => { if (!type.disabled) { e.currentTarget.style.background = 'var(--primary-light)'; e.currentTarget.style.borderColor = 'var(--primary)' } }}
                                                       onMouseLeave={e => { if (!type.disabled) { e.currentTarget.style.background = 'var(--primary-subtle)'; e.currentTarget.style.borderColor = 'var(--primary-light)' } }}>

                                            {/* آیکون */}
                                            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                                 style={{ background: type.disabled ? 'var(--border)' : 'var(--primary-light)' }}>
                                                <FontAwesomeIcon icon={type.icon} className="w-4 h-4"
                                                                 style={{ color: type.disabled ? 'var(--muted)' : 'var(--primary)' }} />
                                            </div>

                                            <span className="flex-1 text-sm font-semibold text-right">{type.label}</span>

                                            {type.disabled ? (
                                                <span className="badge badge-muted" style={{ fontSize: '11px' }}>به زودی</span>
                                            ) : (
                                                <FontAwesomeIcon icon={faChevronLeft} className="w-3 h-3 opacity-40" />
                                            )}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* footer */}
                            <div className="card-footer flex justify-center">
                                <button onClick={onClose} className="btn btn-ghost btn-sm">
                                    <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
                                    بستن
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}