// app/login/_components/LoginForm.js
'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { motion, AnimatePresence } from 'framer-motion'
import styles from '../login.module.css'

export function LoginForm({ formData, errors, loading, updateField, onSubmit, onSwitchMode, showPassword, setShowPassword, savedCreds, selectSavedCred }) {
    return (
        <form onSubmit={onSubmit} className={styles['glass-form']}>

            {/* ── پیشنهاد ورود سریع ── */}
            <AnimatePresence>
                {savedCreds.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className="mb-4 space-y-1.5">
                        <p className="text-xs font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>ورود سریع:</p>
                        {savedCreds.map((cred, i) => (
                            <motion.button key={i} type="button"
                                           initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                           transition={{ delay: i * 0.06 }}
                                           onClick={() => selectSavedCred(cred)}
                                           className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-right"
                                           style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                                           onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.14)'}
                                           onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}>
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                     style={{ background: 'rgba(84,76,207,0.4)' }}>
                                    <FontAwesomeIcon icon={faUser} className="w-3.5 h-3.5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0 text-right">
                                    <p className="text-sm font-bold text-white truncate">{cred.username}</p>
                                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{'•'.repeat(Math.min(cred.password.length, 8))}</p>
                                </div>
                                <span className="text-xs flex-shrink-0" style={{ color: 'rgba(255,255,255,0.35)' }}>کلیک</span>
                            </motion.button>
                        ))}
                        <div className="h-px mt-3" style={{ background: 'rgba(255,255,255,0.1)' }} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* نام کاربری */}
            <div className={styles['form-input-group']}>
                <div className={styles['input-wrapper']}>
                    <FontAwesomeIcon icon={faUser} className={styles['input-icon']} />
                    <input type="text" placeholder="نام کاربری" value={formData.username}
                           className={errors.username ? styles['has-error'] : ''}
                           onChange={e => updateField('username', e.target.value)} />
                </div>
                {errors.username && <span className={styles['form-error']}>{errors.username}</span>}
            </div>

            {/* ⭐ رمز عبور — قفل سمت چپ (input-icon)، چشم سمت راست */}
            <div className={styles['form-input-group']}>
                <div className={styles['input-wrapper']}>
                    {/* آیکون قفل — سمت چپ، همون input-icon اصلی */}
                    <FontAwesomeIcon icon={faLock} className={styles['input-icon']} />

                    {/* ⭐ چشم — سمت راست input، مخالف قفل */}
                    <button
                        type="button"
                        onClick={() => setShowPassword(p => !p)}
                        style={{
                            position: 'absolute',
                            right: '16px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            zIndex: 2,
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            lineHeight: 1,
                            color: showPassword ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.4)',
                            transition: 'color 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.9)'}
                        onMouseLeave={e => e.currentTarget.style.color = showPassword ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.4)'}
                    >
                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} style={{ width: 16, height: 16 }} />
                    </button>

                    {/* padding-right اضافه تا متن با چشم تداخل نداشته باشه */}
                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="رمز عبور"
                        value={formData.password}
                        className={errors.password ? styles['has-error'] : ''}
                        style={{ paddingRight: '46px' }}
                        onChange={e => updateField('password', e.target.value)}
                    />
                </div>
                {errors.password && <span className={styles['form-error']}>{errors.password}</span>}
            </div>

            {/* مرا به خاطر بسپار */}
            <div className={styles['remember-row']}>
                <label className={styles['remember-label']}>
                    <input type="checkbox" checked={formData.remember}
                           onChange={e => updateField('remember', e.target.checked)} />
                    <span>مرا به خاطر بسپار</span>
                </label>
            </div>

            <button type="submit" disabled={loading}
                    className={`${styles['glass-submit-btn']} ${loading ? styles.loading : ''}`}>
                {loading ? 'در حال پردازش...' : 'ورود'}
            </button>

            <div className={styles['forgot-link']}>
                <button type="button" onClick={() => onSwitchMode('forgot')} className={styles['switch-btn']}>
                    فراموشی رمز عبور؟
                </button>
            </div>
        </form>
    )
}