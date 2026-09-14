'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendar, faTimes, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import moment from 'moment-jalaali'

export default function PersianDatePicker({
                                              value = '',
                                              onChange,
                                              placeholder = 'انتخاب تاریخ شمسی',
                                              required = false,
                                              label = 'تاریخ'
                                          }) {
    const [showModal, setShowModal] = useState(false)
    const [selectedYear, setSelectedYear] = useState(1404)
    const [selectedMonth, setSelectedMonth] = useState(1)
    const [selectedDay, setSelectedDay] = useState(null)

    useEffect(() => {
        if (value) {
            const parts = value.split('/')
            if (parts.length === 3) {
                setSelectedYear(parseInt(parts[0]))
                setSelectedMonth(parseInt(parts[1]))
                setSelectedDay(parseInt(parts[2]))
            }
        } else {
            const today = moment()
            setSelectedYear(parseInt(today.format('jYYYY')))
            setSelectedMonth(parseInt(today.format('jM')))
        }
    }, [value])

    const persianMonths = [
        'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
        'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
    ]
    const weekDays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']

    const getDaysInMonth = (year, month) => {
        if (month <= 6) return 31
        if (month <= 11) return 30
        const isLeap = ((year - 1) % 33 * 8 + 21) % 128 < 32
        return isLeap ? 30 : 29
    }

    const getFirstDayOfMonth = (year, month) => {
        return moment(`${year}/${month}/1`, 'jYYYY/jM/jD').day()
    }

    const generateCalendarDays = () => {
        const daysInMonth = getDaysInMonth(selectedYear, selectedMonth)
        const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth)
        const days = []
        for (let i = 0; i < firstDay; i++) days.push(null)
        for (let i = 1; i <= daysInMonth; i++) days.push(i)
        return days
    }

    const goToPreviousMonth = () => {
        if (selectedMonth === 1) { setSelectedMonth(12); setSelectedYear(selectedYear - 1) }
        else setSelectedMonth(selectedMonth - 1)
    }
    const goToNextMonth = () => {
        if (selectedMonth === 12) { setSelectedMonth(1); setSelectedYear(selectedYear + 1) }
        else setSelectedMonth(selectedMonth + 1)
    }

    const handleDaySelect = (day) => {
        setSelectedDay(day)
        const jDate = `${selectedYear}/${selectedMonth}/${day}`
        const isoDate = moment(jDate, 'jYYYY/jM/jD').format('YYYY-MM-DD')
        const isoDateTime = moment(`${jDate} 12:00:00`, 'jYYYY/jM/jD HH:mm:ss').format('YYYY-MM-DDTHH:mm:ss')
        if (onChange) onChange({ jDate, isoDate, isoDateTime, year: selectedYear, month: selectedMonth, day })
        setShowModal(false)
    }

    const handleClear = () => {
        setSelectedDay(null)
        if (onChange) onChange(null)
        setShowModal(false)
    }

    const getDisplayDate = () => {
        if (!selectedDay) return placeholder
        return `${selectedYear}/${selectedMonth}/${selectedDay}`
    }

    return (
        <>
            <div>
                {label && (
                    <label className="form-label">
                        {required && <span style={{ color: 'var(--danger)' }}>* </span>}
                        {label}
                    </label>
                )}
                {/* دکمه باز کردن تقویم */}
                <button
                    type="button"
                    onClick={() => setShowModal(true)}
                    className="w-full h-12 px-4 rounded-lg text-sm flex items-center justify-between transition-all"
                    style={{
                        background: 'var(--surface)',
                        color: selectedDay ? 'var(--text)' : 'var(--muted)',
                        border: '1.5px solid var(--border)',
                        fontWeight: selectedDay ? 500 : 400,
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(84,76,207,0.15)' }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
                >
                    <span>{getDisplayDate()}</span>
                    <FontAwesomeIcon icon={faCalendar} className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                </button>
            </div>

            {/* مودال تقویم */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            className="w-full max-w-md rounded-2xl overflow-hidden"
                            style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}
                        >
                            {/* هدر */}
                            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FontAwesomeIcon icon={faCalendar} className="w-5 h-5 text-white" />
                                    <h3 className="text-lg font-bold text-white">انتخاب تاریخ شمسی</h3>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-white transition-colors"
                                    style={{ background: 'rgba(255,255,255,0.2)' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                                >
                                    <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
                                </button>
                            </div>

                            {/* بدنه تقویم */}
                            <div className="p-6">
                                {/* ناوبری ماه */}
                                <div className="flex items-center justify-between mb-4">
                                    <button type="button" onClick={goToPreviousMonth}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                                            style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-subtle)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'var(--primary-light)'}>
                                        <FontAwesomeIcon icon={faChevronRight} className="w-4 h-4" />
                                    </button>
                                    <div className="text-center font-bold" style={{ color: 'var(--text)' }}>
                                        {persianMonths[selectedMonth - 1]} {selectedYear}
                                    </div>
                                    <button type="button" onClick={goToNextMonth}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                                            style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-subtle)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'var(--primary-light)'}>
                                        <FontAwesomeIcon icon={faChevronLeft} className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* نام روزهای هفته */}
                                <div className="grid grid-cols-7 gap-1 mb-2">
                                    {weekDays.map((day, i) => (
                                        <div key={i} className="text-center text-xs font-bold p-2"
                                             style={{ color: 'var(--text-muted)' }}>
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* روزها */}
                                <div className="grid grid-cols-7 gap-1">
                                    {generateCalendarDays().map((day, index) => {
                                        if (!day) return <div key={index} className="p-2" />
                                        const isSelected = selectedDay === day
                                        const dayOfWeek = (getFirstDayOfMonth(selectedYear, selectedMonth) + day - 1) % 7
                                        const isFriday = dayOfWeek === 5
                                        return (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => handleDaySelect(day)}
                                                className="p-2 text-sm font-medium rounded-lg transition-all"
                                                style={{
                                                    background: isSelected ? 'var(--primary)' : 'transparent',
                                                    color: isSelected ? 'var(--surface)' : isFriday ? 'var(--danger)' : 'var(--text)',
                                                    boxShadow: isSelected ? '0 2px 8px rgba(84,76,207,0.4)' : 'none',
                                                }}
                                                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--surface-2)' }}
                                                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
                                            >
                                                {day}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* فوتر */}
                            <div className="px-6 py-4 flex gap-3 justify-end"
                                 style={{ borderTop: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                                <button type="button" onClick={handleClear}
                                        className="px-4 py-2 rounded-lg font-bold text-sm transition-colors"
                                        style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}
                                        onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                                    پاک کردن
                                </button>
                                <button type="button" onClick={() => setShowModal(false)}
                                        className="px-6 py-2 rounded-lg font-bold text-sm transition-colors"
                                        style={{ background: 'var(--primary)', color: 'var(--surface)' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-hover)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'var(--primary)'}>
                                    تایید
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}