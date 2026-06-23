// app/config/routes.js

/**
 * مسیرهای مرکزی برنامه
 * استفاده: import { ROUTES } from '@/app/config/routes'
 */

export const ROUTES = {
    // صفحه اصلی
    HOME: '/',
    DASHBOARD: '/dashboard',

    // شاپ‌ها
    SHOPS: {
        LIST: '/shops',
        CREATE: '/shops/create',
        SHOW: (id) => `/shops/${id}`,
        EDIT: (id) => `/shops/${id}?edit=true`,
    },

    // کدهای تعمیر (TM Codes)
    TMCODES: {
        LIST: '/tmcodes',
        CREATE: '/tmcodes/create',
        SHOW: (id) => `/tmcodes/${id}`,
        EDIT: (id) => `/tmcodes/${id}?edit=true`,
    },

    // درخواست‌ها (وقتی API آماده شد)
    REQUESTS: {
        LIST: '/requests/list',
        CREATE: '/requests/create',
        SHOW: (id) => `/requests/${id}`,
        EDIT: (id) => `/requests/edit/${id}`,
    },

    // پذیرش مستقیم
    REPAIR_REQUEST: '/components/RepairRequest',

    // عمومی
    PUBLIC: '/public',
}

/**
 * دریافت URL با پارامتر
 * @example getRoute(ROUTES.SHOPS.EDIT, 123) => '/shops/123?edit=true'
 */
export const getRoute = (routeFn, ...params) => {
    if (typeof routeFn === 'function') {
        return routeFn(...params)
    }
    return routeFn
}

/**
 * چک کردن فعال بودن route
 * @example isActive(pathname, ROUTES.SHOPS.LIST)
 */
export const isActive = (currentPath, route) => {
    if (typeof route === 'function') return false
    return currentPath === route || currentPath.startsWith(route)
}