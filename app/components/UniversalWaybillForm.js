'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave, faArrowLeft, faSpinner, faCheckCircle, faForward, faFileLines } from '@fortawesome/free-solid-svg-icons'
import DashboardLayout from "@/app/dashboard/Dashboardlayout"
import WaybillTabs from "@/app/components/shared/Waybilltabs"
import DataDisplayList from '@/app/components/shared/DataDisplayList'
import DynamicField from '@/app/components/shared/DynamicField'
import { getWaybillType, WAYBILL_TYPES } from '@/app/config/waybillRegistry'
import { useWaybillForm }                   from "@/app/hooks/Usewaybillform"
import { useNonCompanyWaybillForm }         from "@/app/hooks/useNonCompanyWaybillForm"
import { useNonOwnedCompanyWaybillForm }    from "@/app/hooks/Usenonownedcompanywaybillform"
import { useNonOwnedNonCompanyWaybillForm } from "@/app/hooks/useNonOwnedNonCompanyWaybillForm"
import { useOwnedNonCompanyWaybillForm }    from "@/app/hooks/Useownednoncompanywaybillform"
import { useOwnedStripWaybillForm }         from "@/app/hooks/Useownedstripwaybillform"
import { useCityWaybillForm }               from "@/app/hooks/Usecitywaybillform"
// ⭐ مستقیم از API client استفاده میکنیم — نه Next.js route
// چون Next.js server نمیتونه به viratest2.ir وصل بشه
import { waybillsApi } from "@/app/api/client/waybillsApi"
import Swal from 'sweetalert2'

export default function UniversalWaybillForm({ waybillType, mode = 'create', waybillId = null }) {
    const [loading,     setLoading]     = useState(mode === 'edit')
    const [initialData, setInitialData] = useState(null)
    const [activeTab,   setActiveTab]   = useState(null)
    const [dataLoaded,  setDataLoaded]  = useState(false)
    const [mounted,     setMounted]     = useState(false)
    const tabsContainerRef = useRef(null)
    const router = useRouter()

    useEffect(() => { setMounted(true) }, [])

    const waybillInfo = getWaybillType(waybillType)
    const config      = waybillInfo.config
    const colors      = waybillInfo.color
    const isEdit      = mode === 'edit'

    useEffect(() => {
        if (mounted && config.tabs.length > 0 && !activeTab)
            setActiveTab(config.tabs[0].id)
    }, [config, activeTab, mounted])

    useEffect(() => {
        if (activeTab && tabsContainerRef.current) {
            const el = tabsContainerRef.current.querySelector(`[data-tab-id="${activeTab}"]`)
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
        }
    }, [activeTab])

    const getHookData = () => {
        switch (waybillType) {
            case WAYBILL_TYPES.COMPANY_OWNED:           return useWaybillForm(null, isEdit)
            case WAYBILL_TYPES.NON_COMPANY_OWNED:       return useNonCompanyWaybillForm(null, isEdit)
            case WAYBILL_TYPES.NON_OWNED_COMPANY:       return useNonOwnedCompanyWaybillForm(null, isEdit)
            case WAYBILL_TYPES.NON_OWNED_NON_COMPANY:   return useNonOwnedNonCompanyWaybillForm(null, isEdit)
            case WAYBILL_TYPES.OWNED_NON_COMPANY:       return useOwnedNonCompanyWaybillForm(null, isEdit)
            case WAYBILL_TYPES.OWNED_STRIP:             return useOwnedStripWaybillForm(null, isEdit)
            case WAYBILL_TYPES.CITY:                    return useCityWaybillForm(null, isEdit)
            default:                                    return useWaybillForm(null, isEdit)
        }
    }
    const hookData = getHookData()

    const getStateData = () => {
        const stateData = {}, setterData = {}, updateData = {}
        waybillInfo.sections.forEach(s => {
            stateData[s]  = hookData[s]
            setterData[s] = hookData[`set${s.charAt(0).toUpperCase() + s.slice(1)}`]
            updateData[s] = hookData[`update${s.charAt(0).toUpperCase() + s.slice(1)}`]
        })
        return { stateData, setterData, updateData }
    }
    const { stateData, setterData, updateData } = getStateData()

    // ── fetch مستقیم از API خارجی (client-side) ──────────
    useEffect(() => {
        if (!mounted || !isEdit || !waybillId) return

        const fetchWaybill = async () => {
            try {
                setLoading(true)
                setDataLoaded(false)

                // ⭐ waybillsApi.getOne مستقیم از مرورگر به viratest2.ir وصل میشه
                // و response رو به sections (camelCase) تبدیل میکنه
                const apiData = await waybillsApi.getOne(waybillId)

                const formattedData = {}
                waybillInfo.sections.forEach(section => {
                    formattedData[section] = apiData[section] || {}
                })

                setInitialData(formattedData)
                setDataLoaded(true)
            } catch (err) {
                console.error('❌ fetchWaybill:', err)
                Swal.fire({
                    icon: 'error', title: 'خطا در بارگذاری',
                    text: 'دریافت اطلاعات بارنامه ناموفق بود', confirmButtonText: 'باشه'
                })
                setLoading(false)
            }
        }
        fetchWaybill()
    }, [mode, waybillId, waybillType, mounted])

    // ── پر کردن فرم بعد از دریافت داده ──────────────────
    useEffect(() => {
        if (!mounted || !initialData || !dataLoaded || !isEdit) return
        waybillInfo.sections.forEach(s => {
            if (setterData[s] && initialData[s]) setterData[s](initialData[s])
        })
        setLoading(false)
    }, [initialData, dataLoaded, mode, mounted])

    // ── submit مستقیم به API خارجی ───────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault()
        const waybillData = {}
        waybillInfo.sections.forEach(s => { waybillData[s] = stateData[s] })
        try {
            if (isEdit)
                await waybillsApi.update(waybillId, waybillData)
            else
                await waybillsApi.create(waybillData)

            Swal.fire({
                icon: 'success',
                title: isEdit ? 'ویرایش شد!' : 'ثبت شد!',
                text:  isEdit ? 'بارنامه با موفقیت ویرایش شد' : 'بارنامه با موفقیت ثبت شد',
                confirmButtonText: 'باشه', timer: 2500, timerProgressBar: true,
            })
            router.push('/waybills')
        } catch (err) {
            console.error('❌ submit:', err)
            Swal.fire({ icon: 'error', title: 'خطا!', text: 'ثبت بارنامه با مشکل مواجه شد', confirmButtonText: 'متوجه شدم' })
        }
    }

    // ── helper‌ها ─────────────────────────────────────────
    const findFieldSection = (fieldName) => {
        const MAP = {
            basic: 'cargoBase', sender: 'cargoBase', receiver: 'cargoBase',
            vehicle: 'cargoBase', driver: 'cargoBase', cargo: 'cargoDetails',
            route: 'cargoDetails', income: 'financialIncome',
            expenses: 'financialExpense', account: 'accountInfo', documents: 'cargoBase',
        }
        for (const tabId in config.fields)
            for (const f of config.fields[tabId])
                if (f.name === fieldName) return f.section || MAP[tabId] || 'cargoBase'
        return 'cargoBase'
    }

    const getFieldValue = (field) => stateData[field.section || findFieldSection(field.name)]?.[field.name]
    const updateField   = (field, value) => {
        const fn = updateData[field.section || findFieldSection(field.name)]
        if (fn) fn(field.name, value)
    }
    const getCurrentTabFields = () => config.fields[activeTab] || []
    const tabIdx = activeTab ? config.tabs.findIndex(t => t.id === activeTab) : -1

    const handleNextRequired = () => {
        for (let i = tabIdx + 1; i < config.tabs.length; i++) {
            if (config.tabs[i].required) {
                setActiveTab(config.tabs[i].id)
                window.scrollTo({ top: 0, behavior: 'smooth' })
                return
            }
        }
    }

    if (!mounted) return null

    // ── Loading ──────────────────────────────────────────
    if (loading) return (
        <DashboardLayout>
            <div className="w-full min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card text-center p-12">
                    <FontAwesomeIcon icon={faSpinner} className="w-14 h-14 animate-spin mb-5" style={{ color: 'var(--primary)' }} />
                    <p className="text-xl font-black mb-1" style={{ color: 'var(--text)' }}>در حال بارگذاری...</p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>بارنامه #{waybillId}</p>
                </motion.div>
            </div>
        </DashboardLayout>
    )

    return (
        <DashboardLayout>
            <div className="w-full min-h-screen" style={{ background: 'var(--bg)' }}>

                {/* ── هدر ── */}
                <div className="page-header-bar">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                 style={{ background: 'rgba(255,255,255,0.2)' }}>
                                <FontAwesomeIcon icon={faFileLines} className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2.5">
                                    <h1 className="text-xl font-black text-white leading-none">
                                        {isEdit ? 'ویرایش بارنامه' : 'افزودن بارنامه'}
                                    </h1>
                                    <span className="px-2.5 py-1 rounded-full text-xs font-black"
                                          style={{ background: 'rgba(255,255,255,0.22)', color: '#fff' }}>
                                        {waybillInfo.name}
                                    </span>
                                    {isEdit && waybillId && (
                                        <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                                              style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)' }}>
                                            #{waybillId}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.65)' }}>
                                    {isEdit ? 'ویرایش اطلاعات بارنامه' : 'فرم ثبت بارنامه جدید'}
                                </p>
                            </div>
                        </div>
                        <button onClick={() => router.back()} className="btn btn-back">
                            <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
                            بازگشت
                        </button>
                    </div>
                </div>

                <div className="page-content max-w-7xl">

                    {/* نوار موفقیت بارگذاری */}
                    {dataLoaded && isEdit && (
                        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
                                    className="alert alert-success flex items-center gap-3 mb-5">
                            <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 flex-shrink-0" />
                            <div>
                                <p className="font-bold">اطلاعات بارنامه #{waybillId} بارگذاری شد</p>
                                <p className="text-xs opacity-80">همه فیلدها به صورت خودکار پر شده‌اند</p>
                            </div>
                        </motion.div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* فرم */}
                        <div className="lg:col-span-2">
                            <form onSubmit={handleSubmit} className="card">
                                {activeTab && (
                                    <div className="card-header" style={{ padding: '12px 16px' }}>
                                        <div ref={tabsContainerRef} className="w-full">
                                            <WaybillTabs tabs={config.tabs} activeTab={activeTab} onTabChange={setActiveTab} />
                                        </div>
                                    </div>
                                )}

                                <div className="card-body">
                                    <div className="min-h-[420px]">
                                        <AnimatePresence mode="wait">
                                            {activeTab && (
                                                <motion.div key={activeTab}
                                                            initial={{ opacity: 0, x: 20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            exit={{ opacity: 0, x: -20 }}
                                                            transition={{ duration: 0.18 }}>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        {getCurrentTabFields().map(field => (
                                                            <DynamicField key={field.name} field={field}
                                                                          value={getFieldValue(field)}
                                                                          onChange={(_, value) => updateField(field, value)}
                                                                          allData={stateData} />
                                                        ))}
                                                    </div>
                                                    {getCurrentTabFields().length === 0 && (
                                                        <div className="py-16 text-center">
                                                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                                                این بخش هنوز فیلدی ندارد
                                                            </p>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <div className="card-footer flex items-center justify-between gap-3">
                                    <div className="flex gap-2">
                                        {tabIdx > 0 && (
                                            <button type="button" className="btn btn-secondary btn-sm"
                                                    onClick={() => setActiveTab(config.tabs[tabIdx - 1].id)}>
                                                ← قبلی
                                            </button>
                                        )}
                                        {tabIdx >= 0 && tabIdx < config.tabs.length - 1 && (
                                            <button type="button" className="btn btn-primary btn-sm"
                                                    onClick={() => setActiveTab(config.tabs[tabIdx + 1].id)}>
                                                بعدی →
                                            </button>
                                        )}
                                        <button type="button" className="btn btn-warning btn-sm"
                                                onClick={handleNextRequired}>
                                            <FontAwesomeIcon icon={faForward} className="w-3 h-3" />
                                            تب الزامی بعدی
                                        </button>
                                    </div>
                                    <button type="submit" className="btn btn-success">
                                        <FontAwesomeIcon icon={faSave} className="w-4 h-4" />
                                        {isEdit ? 'ذخیره تغییرات' : 'ثبت بارنامه'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* پنل نمایش داده */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24">
                                <DataDisplayList allData={stateData} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}