// app/login/_components/ForgotForm.js
'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import styles from '../login.module.css'

export function ForgotForm({ formData, errors, loading, updateField, onSubmit, onSwitchMode }) {
    return (
        <form onSubmit={onSubmit} className={styles['glass-form']}>
            <div className={styles['form-input-group']}>
                <div className={styles['input-wrapper']}>
                    <FontAwesomeIcon icon={faEnvelope} className={styles['input-icon']} />
                    <input type="email" placeholder="ایمیل" value={formData.email}
                           className={errors.email ? styles['has-error'] : ''}
                           onChange={e => updateField('email', e.target.value)} />
                </div>
                {errors.email && <span className={styles['form-error']}>{errors.email}</span>}
            </div>

            <button type="submit" disabled={loading}
                    className={`${styles['glass-submit-btn']} ${loading ? styles.loading : ''}`}>
                {loading ? 'در حال پردازش...' : 'ارسال لینک بازیابی'}
            </button>

            <div className={styles['forgot-link']}>
                <button type="button"
                        onClick={() => typeof onSwitchMode === 'function' && onSwitchMode('login')}
                        className={styles['switch-btn']}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                    <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" />
                    بازگشت به ورود
                </button>
            </div>
        </form>
    )
}