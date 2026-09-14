// app/login/page.js
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import styles from './login.module.css'
import SplashScreen from '@/app/components/SplashScreen/SplashScreen'
import { useLogin }   from './_hooks/useLogin'
import { LoginForm }  from './_components/LoginForm'
import { ForgotForm } from './_components/ForgotForm'

const slideVariants = {
    enterFromRight: { x: '60px',  opacity: 0 },
    enterFromLeft:  { x: '-60px', opacity: 0 },
    center:         { x: 0,       opacity: 1 },
    exitToLeft:     { x: '-60px', opacity: 0 },
    exitToRight:    { x: '60px',  opacity: 0 },
}

export default function LoginPage() {
    const {
        mode, direction, formData, errors, loading, showSplash,
        showPassword, setShowPassword, savedCreds, selectSavedCred,
        switchMode, updateField, handleSubmit, handleSplashDone,
    } = useLogin()

    return (
        <>
            {showSplash && <SplashScreen onDone={handleSplashDone} />}

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: showSplash ? 0 : 1 }}
                        transition={{ duration: 0.2 }} className={styles['login-wrapper']}>
                <div className={styles['login-background']} />

                <motion.div initial={{ opacity: 0, x: 120 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7 }} className={styles['login-glass-box']}>

                    {/* لوگو */}
                    <motion.div animate={{ scale: [1, 1.06, 1] }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                                className="flex justify-center m-2">
                        <Image src="/IMG_20260420_095352_613.png" alt="logo" width={92} height={92}
                               className="object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.35)]" priority />
                    </motion.div>

                    <div className="mb-5">
                        <h1 className="font-black bg-gradient-to-r from-indigo-200 via-white to-indigo-300 bg-clip-text text-transparent"
                            style={{ fontSize: 'clamp(20px, 5.5vw, 30px)' }}>
                            سیستم مدیریت حمل و نقل ویرا
                        </h1>
                    </div>

                    <div style={{ overflow: 'hidden', width: '100%' }}>
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.div key={mode} variants={slideVariants}
                                        initial={direction === 'forward' ? 'enterFromRight' : 'enterFromLeft'}
                                        animate="center"
                                        exit={direction === 'forward' ? 'exitToLeft' : 'exitToRight'}
                                        transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
                                        style={{ width: '100%' }}>

                                <div className={styles['login-header']}>
                                    <h2 className={styles['login-title']}>
                                        {mode === 'login' ? 'ورود به حساب' : 'بازیابی رمز عبور'}
                                    </h2>
                                    {mode === 'forgot' && (
                                        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                                            ایمیل خود را وارد کنید تا لینک بازیابی ارسال شود
                                        </p>
                                    )}
                                </div>

                                {mode === 'login' ? (
                                    <LoginForm
                                        formData={formData} errors={errors} loading={loading}
                                        updateField={updateField} onSubmit={handleSubmit}
                                        onSwitchMode={switchMode}
                                        showPassword={showPassword} setShowPassword={setShowPassword}
                                        savedCreds={savedCreds} selectSavedCred={selectSavedCred}
                                    />
                                ) : (
                                    <ForgotForm
                                        formData={formData} errors={errors} loading={loading}
                                        updateField={updateField} onSubmit={handleSubmit}
                                        onSwitchMode={switchMode}
                                    />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </motion.div>
            </motion.div>
        </>
    )
}