// app/config/env.js
const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://viratest2.ir'
const RS   = `${BASE}/api/v1/repairshops`
const WH   = `${BASE}/api/v1/warehouse`
const V1   = `${BASE}/api/v1`

export function getHeaders() {
    let token = null
    if (typeof document !== 'undefined') {
        const match = document.cookie.split('; ').find(r => r.startsWith('token='))
        token = match ? match.split('=')[1] : null
    }
    return {
        'Content-Type': 'application/json',
        'Accept':       'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    }
}

export const ENV = {
    APP_NAME:    process.env.NEXT_PUBLIC_APP_NAME    || 'سامانه ویرا',
    APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    APP_URL:     process.env.NEXT_PUBLIC_APP_URL     || 'http://localhost:3000',

    API_AUTH_LOGIN: `${V1}/auth/login`,

    // repairshops
    API_REPAIRSHOPS:                     `${RS}`,
    API_SHOPS:                           `${RS}/shops`,
    API_TM_CODES:                        `${RS}/tmCodes`,
    API_REPAIRMEN:                       `${RS}/repairmen`,
    API_PM_GROUPS:                       `${RS}/pmGroups`,
    API_TM_REQUESTS:                     `${RS}/tmRequests`,
    API_TM_REQUESTS_FROM_WORKSHOP:       `${RS}/tmRequests/storeFromWorkshop`,
    API_TM_REQUESTS_SET_FINAL_STATEMENT: `${RS}/tmRequests/setTmRequestFinalStatement`,
    API_FINAL_STATEMENTS:                `${RS}/finalStatements`,
    API_FINAL_STATEMENTS_FACTORS:        `${RS}/finalStatementsFactors`,

    // warehouse
    API_WAREHOUSE:                     `${WH}`,
    API_WAREHOUSE_PRODUCTS:            `${WH}/products`,
    API_WAREHOUSE_STOREHOUSES:         `${WH}/storehouses`,
    API_WAREHOUSE_STOREHOUSE_USERS:    `${WH}/storehouse_users`,
    API_WAREHOUSE_CUSTOMERS:           `${WH}/customers`,
    API_WAREHOUSE_FACTORS:             `${WH}/factors`,
    API_WAREHOUSE_REQUESTS:            `${WH}/requests`,
    API_WAREHOUSE_REQUESTS_IMPORT_ALL: `${WH}/requests/importOrExportAll`,
    API_WAREHOUSE_REQUESTS_IMPORT_ONE: `${WH}/requests/importOrExportOne`,
    API_WAREHOUSE_TRANSFERS:           `${WH}/transfer_between_storehouses`,
    API_WAREHOUSE_IMPORTS:             `${WH}/imports_and_exports`,
    API_WAREHOUSE_UNITS:               `${WH}/units`,

    // waybills
    API_WAYBILLS: `${V1}/waybills`,

    // ⭐ جدید
    API_DRIVERS:                `${V1}/drivers`,
    API_MECHANISMS:             `${V1}/mechanisms`,
    API_MECHANISM_GROUPS:       `${V1}/mechanism-groups`,
    API_OWNERS:                 `${V1}/owners`,
    API_ACCOUNT_SIDES:          `${V1}/account-sides`,
    API_TICKETS:                `${V1}/tickets`,
    API_MENUS:                  `${V1}/menus`,
    API_MENUS_SIDEBAR:          `${V1}/menus/sidebar`,
    API_ROLES:                  `${V1}/roles`,
    API_PERMISSIONS:            `${V1}/permissions`,
    API_PERMISSIONS_LIST:       `${V1}/permissions/list`,
    API_PERMISSIONS_UPGRADE:    `${V1}/permissions/upgradePermission`,
}