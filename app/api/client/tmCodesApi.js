// app/api/client/tmCodesApi.js
import { ENV, getHeaders } from '@/app/config/env'

const API_BASE = ENV.API_TM_CODES

export const tmCodesApi = {
    async getByShop(shopId, search = '') {
        let url = `${API_BASE}?shop_id=${shopId}`
        if (search && search.length >= 2) url += `&search=${encodeURIComponent(search)}`
        const res = await fetch(url, { headers: getHeaders() })
        if (!res.ok) throw new Error('Failed to fetch TM codes')
        return res.json()
    },

    async getOne(id) {
        const res = await fetch(`${API_BASE}/${id}`, { headers: getHeaders() })
        if (!res.ok) throw new Error('Failed to fetch TM code')
        return res.json()
    },

    async create(data) {
        const res = await fetch(API_BASE, {
            method: 'POST', headers: getHeaders(),
            body: JSON.stringify({
                code: data.code, title: data.title,
                hours:              data.hours              ? parseInt(data.hours)              : null,
                amount_per_hours:   data.amount_per_hours   ? parseInt(data.amount_per_hours)   : null,
                max_cost:           data.max_cost            ? parseInt(data.max_cost)            : null,
                base_amount:        data.base_amount         ? parseInt(data.base_amount)         : null,
                shop_id:            data.shop_id,
                mechanism_group_id: data.mechanism_group_id || null,
                is_active:          data.is_active           || 'Y',
                type:               data.type                || 'CM',
            })
        })
        if (!res.ok) throw new Error('Failed to create TM code')
        return res.json()
    },

    async update(id, data) {
        const res = await fetch(`${API_BASE}/${id}`, { method: 'PATCH', headers: getHeaders(), body: JSON.stringify(data) })
        if (!res.ok) throw new Error('Failed to update TM code')
        return res.json()
    },

    async delete(id) {
        const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE', headers: getHeaders() })
        if (!res.ok) throw new Error('Failed to delete TM code')
        return res.json()
    },
}