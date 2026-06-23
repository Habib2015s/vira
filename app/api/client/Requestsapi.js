// app/api/client/requestsApi.js

import { ENV, getHeaders } from '@/app/config/env'

const API_BASE = ENV.API_REPAIRSHOPS

const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
}

export const requestsApi = {
    /**
     * دریافت لیست درخواست‌ها (Final Statements)
     * @param {string} cursor - cursor برای pagination
     * @returns {Promise}
     */
    async getAll(cursor = null) {
        let url = `${API_BASE}/shops`
        if (cursor) {
            url += `?cursor=${cursor}`
        }

        const response = await fetch(url, { headers })

        if (!response.ok) {
            throw new Error('Failed to fetch requests')
        }

        return await response.json()
    },

    /**
     * دریافت یک درخواست
     * @param {number} id - شناسه درخواست
     * @returns {Promise}
     */
    async getOne(id) {
        const response = await fetch(`${API_BASE}/finalStatements/${id}`, { headers })

        if (!response.ok) {
            throw new Error('Failed to fetch request')
        }

        return await response.json()
    },

    /**
     * ایجاد درخواست جدید
     * @param {Object} data - اطلاعات درخواست
     * @returns {Promise}
     */
    async create(data) {
        const response = await fetch(`${API_BASE}/finalStatements`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                title: data.title,
                number: data.number ? parseInt(data.number) : null,
                date: data.date || new Date().toISOString(),
                creator_id: data.creator_id || 1,
                shop_id: data.shop_id,
                shop_name: data.shop_name,
                description: data.description || null
            })
        })

        if (!response.ok) {
            throw new Error('Failed to create request')
        }

        return await response.json()
    },

    /**
     * ویرایش درخواست
     * @param {number} id - شناسه درخواست
     * @param {Object} data - اطلاعات جدید
     * @returns {Promise}
     */
    async update(id, data) {
        const response = await fetch(`${API_BASE}/finalStatements/${id}`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(data)
        })

        if (!response.ok) {
            throw new Error('Failed to update request')
        }

        return await response.json()
    },

    /**
     * حذف درخواست
     * @param {number} id - شناسه درخواست
     * @returns {Promise}
     */
    async delete(id) {
        const response = await fetch(`${API_BASE}/finalStatements/${id}`, {
            method: 'DELETE',
            headers
        })

        if (!response.ok) {
            throw new Error('Failed to delete request')
        }

        return await response.json()
    }
}