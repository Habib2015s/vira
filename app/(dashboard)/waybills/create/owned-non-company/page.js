// app/waybills/create/owned-non-company/page.js
'use client'

import UniversalWaybillForm from '@/app/components/UniversalWaybillForm'
import { WAYBILL_TYPES } from '@/app/config/waybillRegistry'

export default function CreateOwnedNonCompanyWaybillPage() {
    return (
        <UniversalWaybillForm
            waybillType={WAYBILL_TYPES.OWNED_NON_COMPANY}
            mode="create"
        />
    )
}