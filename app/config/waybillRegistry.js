// app/config/waybillRegistry.js
// رجیستری مرکزی برای همه انواع بارنامه‌ها

import { waybillFormConfig }                   from './waybillFormConfig'
import { nonCompanyWaybillFormConfig }          from './nonCompanyWaybillFormConfig'
import { nonOwnedCompanyWaybillFormConfig }     from './nonOwnedCompanyWaybillFormConfig'
import { nonOwnedNonCompanyWaybillFormConfig }  from './nonOwnedNonCompanyWaybillFormConfig'
import { ownedNonCompanyWaybillFormConfig }     from './Ownednoncompanywaybillformconfig'
import { ownedStripWaybillFormConfig }          from './ownedStripWaybillFormConfig'
import { cityWaybillFormConfig }                from '@/app/config/Citywaybillformconfig'
import { ENV }                                  from '@/app/config/env'

export const WAYBILL_TYPES = {
    COMPANY_OWNED:          'company-owned',
    NON_COMPANY_OWNED:      'non-company-owned',
    NON_OWNED_COMPANY:      'non-owned-company',
    NON_OWNED_NON_COMPANY:  'non-owned-non-company',
    OWNED_NON_COMPANY:      'owned-non-company',
    OWNED_STRIP:            'owned-strip',
    CITY:                   'city',
}

// ── color schema ──────────────────────────────────────────
// هر نوع بارنامه رنگ متمایز داره
// color.header  → گرادیان هدر فرم (CSS)
// color.badge   → رنگ badge در لیست
// color.badgeBg → بک‌گراند badge در لیست
// ─────────────────────────────────────────────────────────

export const waybillRegistry = {

    [WAYBILL_TYPES.COMPANY_OWNED]: {
        id:      WAYBILL_TYPES.COMPANY_OWNED,
        name:    'ملکی-شرکتی',
        nameEn:  'Company Owned',
        config:  waybillFormConfig,
        hook:    'useWaybillForm',
        color: {
            header:   'linear-gradient(135deg, var(--primary) 0%, #0284c7 100%)',
            badge:    'var(--primary)',
            badgeBg:  'var(--primary-light)',
        },
        sections:    ['cargoBase', 'cargoDetails', 'financialIncome', 'financialExpense'],
        apiEndpoint: ENV.API_WAYBILLS,
    },

    [WAYBILL_TYPES.NON_COMPANY_OWNED]: {
        id:      WAYBILL_TYPES.NON_COMPANY_OWNED,
        name:    'ملکی-غیرشرکتی',
        nameEn:  'Non-Company Owned',
        config:  nonCompanyWaybillFormConfig,
        hook:    'useNonCompanyWaybillForm',
        color: {
            header:   'linear-gradient(135deg, var(--info) 0%, #0ea5e9 100%)',
            badge:    'var(--info)',
            badgeBg:  'var(--info-light)',
        },
        sections:    ['cargoBase', 'cargoDetails', 'financialIncome', 'financialExpense'],
        apiEndpoint: ENV.API_WAYBILLS,
    },

    [WAYBILL_TYPES.NON_OWNED_COMPANY]: {
        id:      WAYBILL_TYPES.NON_OWNED_COMPANY,
        name:    'غیرملکی-شرکتی',
        nameEn:  'Non-Owned Company',
        config:  nonOwnedCompanyWaybillFormConfig,
        hook:    'useNonOwnedCompanyWaybillForm',
        color: {
            header:   'linear-gradient(135deg, var(--success) 0%, #10b981 100%)',
            badge:    'var(--success)',
            badgeBg:  'var(--success-light)',
        },
        sections:    ['cargoBase', 'cargoDetails', 'financialIncome', 'accountInfo'],
        apiEndpoint: ENV.API_WAYBILLS,
    },

    [WAYBILL_TYPES.NON_OWNED_NON_COMPANY]: {
        id:      WAYBILL_TYPES.NON_OWNED_NON_COMPANY,
        name:    'غیرملکی-غیرشرکتی',
        nameEn:  'Non-Owned Non-Company',
        config:  nonOwnedNonCompanyWaybillFormConfig,
        hook:    'useNonOwnedNonCompanyWaybillForm',
        color: {
            header:   'linear-gradient(135deg, var(--warning) 0%, #f59e0b 100%)',
            badge:    'var(--warning)',
            badgeBg:  'var(--warning-light)',
        },
        sections:    ['cargoBase', 'cargoDetails', 'financialIncome', 'accountInfo'],
        apiEndpoint: ENV.API_WAYBILLS,
    },

    [WAYBILL_TYPES.OWNED_NON_COMPANY]: {
        id:      WAYBILL_TYPES.OWNED_NON_COMPANY,
        name:    'ملکی-بدون بارنامه (با بار)',
        nameEn:  'Owned Non-Company',
        config:  ownedNonCompanyWaybillFormConfig,
        hook:    'useOwnedNonCompanyWaybillForm',
        color: {
            header:   'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
            badge:    '#7c3aed',
            badgeBg:  '#ede9fe',
        },
        sections:    ['cargoBase', 'cargoDetails', 'financialIncome', 'financialExpense', 'accountInfo'],
        apiEndpoint: ENV.API_WAYBILLS,
    },

    [WAYBILL_TYPES.OWNED_STRIP]: {
        id:      WAYBILL_TYPES.OWNED_STRIP,
        name:    'ملکی-استریپ',
        nameEn:  'Owned Strip',
        config:  ownedStripWaybillFormConfig,
        hook:    'useOwnedStripWaybillForm',
        color: {
            header:   'linear-gradient(135deg, var(--danger) 0%, #f87171 100%)',
            badge:    'var(--danger)',
            badgeBg:  'var(--danger-light)',
        },
        sections:    ['cargoBase', 'cargoDetails', 'financialIncome', 'financialExpense', 'accountInfo'],
        apiEndpoint: ENV.API_WAYBILLS,
    },

    [WAYBILL_TYPES.CITY]: {
        id:      WAYBILL_TYPES.CITY,
        name:    'بارنامه شهری',
        nameEn:  'City Waybill',
        config:  cityWaybillFormConfig,
        hook:    'useCityWaybillForm',
        color: {
            header:   'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
            badge:    '#0d9488',
            badgeBg:  '#ccfbf1',
        },
        sections:    ['cargoBase', 'cargoDetails', 'financialIncome', 'financialExpense', 'accountInfo'],
        apiEndpoint: ENV.API_WAYBILLS,
    },
}

// ── Helper Functions ──────────────────────────────────────
export const getWaybillType    = (typeId) => waybillRegistry[typeId] || waybillRegistry[WAYBILL_TYPES.COMPANY_OWNED]
export const getWaybillConfig  = (typeId) => getWaybillType(typeId).config
export const getWaybillColor   = (typeId) => getWaybillType(typeId).color
export const getWaybillSections = (typeId) => getWaybillType(typeId).sections
export const getAllWaybillTypes = ()       => Object.values(waybillRegistry)