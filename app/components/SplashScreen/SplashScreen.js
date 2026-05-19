'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

export default function SplashScreen({ onDone }) {
    const [phase, setPhase] = useState('enter')

    useEffect(() => {
        const t1 = setTimeout(() => setPhase('hold'), 350)
        const t2 = setTimeout(() => setPhase('exit'), 1000)
        const t3 = setTimeout(() => onDone?.(), 1380)
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
    }, [])

    return (
        <AnimatePresence>
            {phase !== 'done' && (
                <motion.div
                    key="splash"
                    initial={{ x: '-100%' }}
                    animate={phase === 'exit' ? { x: '100%' } : { x: 0 }}
                    transition={{ duration: 0.42, ease: [0.4, 0, 0.2, 1] }}
                    className="fixed inset-0 z-[9999] overflow-hidden flex flex-col items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>

                    {/* ذرات */}
                    {[...Array(18)].map((_, i) => (
                        <motion.div key={i} className="absolute rounded-full pointer-events-none"
                                    style={{
                                        width:      `${6 + (i % 5) * 8}px`,
                                        height:     `${6 + (i % 5) * 8}px`,
                                        left:       `${(i * 17 + 5) % 95}%`,
                                        top:        `${(i * 23 + 10) % 90}%`,
                                        background: i % 3 === 0 ? 'rgba(124,114,224,0.25)' : i % 3 === 1 ? 'rgba(56,189,248,0.18)' : 'rgba(255,255,255,0.08)',
                                        filter:     'blur(1px)',
                                    }}
                                    animate={{ y: [0, -18 - (i % 4) * 6, 0], opacity: [0.3, 0.8, 0.3], scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2.5 + (i % 5) * 0.5, repeat: Infinity, delay: (i * 0.17) % 2, ease: 'easeInOut' }} />
                    ))}

                    {/* حلقه‌ها + لوگو */}
                    <div className="relative flex items-center justify-center mb-8">
                        {[180, 140, 105].map((size, i) => (
                            <motion.div key={i} className="absolute rounded-full"
                                        style={{
                                            width: size, height: size, border: `${1.5 - i * 0.4}px solid`,
                                            borderColor: i === 0 ? 'rgba(124,114,224,0.25)' : i === 1 ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.12)',
                                        }}
                                        animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.9, 0.4] }}
                                        transition={{ duration: 2 + i * 0.4, repeat: Infinity, delay: i * 0.25, ease: 'easeInOut' }} />
                        ))}
                        <motion.div initial={{ scale: 0.5, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
                                    transition={{ delay: 0.08, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}>
                            <motion.div className="relative w-24 h-24 flex items-center justify-center rounded-3xl"
                                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', boxShadow: '0 0 40px rgba(124,114,224,0.4), 0 0 80px rgba(56,189,248,0.15), inset 0 1px 0 rgba(255,255,255,0.2)' }}
                                        animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
                                <Image src="/IMG_20260420_095352_613.png" alt="logo" width={72} height={72}
                                       className="object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.5)]" priority />
                                <div className="absolute top-2 right-2 w-2 h-2 rounded-full"
                                     style={{ background: 'rgba(255,255,255,0.6)', filter: 'blur(1px)' }} />
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* متن */}
                    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.4 }} className="text-center px-8">
                        <h1 className="font-black text-white leading-tight mb-1"
                            style={{ fontSize: 'clamp(22px, 5vw, 30px)', letterSpacing: '-0.02em' }}>
                            سیستم مدیریت حمل و نقل
                        </h1>
                        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                                    transition={{ delay: 0.35, duration: 0.4 }}
                                    className="mx-auto my-3 h-px w-32 origin-center"
                                    style={{ background: 'linear-gradient(90deg, transparent, rgba(124,114,224,0.8), rgba(56,189,248,0.8), transparent)' }} />
                        <p className="font-bold text-lg" style={{ color: 'rgba(165,180,252,0.9)' }}>سامانه ویرا</p>
                    </motion.div>

                    {/* progress — یه بار کامل میره چون مدت مشخصه */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                                className="mt-12 flex flex-col items-center gap-3">
                        <div className="relative w-52 h-1 rounded-full overflow-hidden"
                             style={{ background: 'rgba(255,255,255,0.1)' }}>
                            <motion.div className="h-full rounded-full"
                                        style={{ background: 'linear-gradient(90deg, #7c72e0, #38bdf8)' }}
                                        initial={{ width: '0%' }}
                                        animate={{ width: '100%' }}
                                        transition={{ duration: 0.9, delay: 0.15, ease: 'easeInOut' }} />
                            <motion.div className="absolute inset-0 rounded-full"
                                        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)', width: '40%' }}
                                        animate={{ x: ['-100%', '300%'] }}
                                        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }} />
                        </div>
                        <div className="flex items-center gap-1.5">
                            {[0, 1, 2].map(i => (
                                <motion.div key={i} className="w-1.5 h-1.5 rounded-full"
                                            style={{ background: 'rgba(255,255,255,0.4)' }}
                                            animate={{ scale: [1, 1.6, 1], opacity: [0.4, 1, 0.4] }}
                                            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }} />
                            ))}
                        </div>
                    </motion.div>

                    {/* نوار پایین */}
                    <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.12, duration: 0.6 }}
                                className="absolute bottom-0 left-0 right-0 h-1 origin-right"
                                style={{ background: 'linear-gradient(90deg, #38bdf8, #7c72e0, #a78bfa)' }} />
                </motion.div>
            )}
        </AnimatePresence>
    )
}