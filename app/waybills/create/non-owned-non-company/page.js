// app/waybills/create/non-owned-non-company/page.js
'use client'

import UniversalWaybillForm from '@/app/components/UniversalWaybillForm'
import { WAYBILL_TYPES } from '@/app/config/waybillRegistry'

export default function CreateNonOwnedNonCompanyWaybillPage() {
    return (
        <UniversalWaybillForm
            waybillType={WAYBILL_TYPES.NON_OWNED_NON_COMPANY}
            mode="create"
        />
    )
}