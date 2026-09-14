// app/waybills/create/city/page.js
'use client'

import UniversalWaybillForm from '@/app/components/UniversalWaybillForm'
import { WAYBILL_TYPES } from '@/app/config/waybillRegistry'

export default function CreateCityWaybillPage() {
    return (
        <UniversalWaybillForm
            waybillType={WAYBILL_TYPES.CITY}
            mode="create"
        />
    )
}