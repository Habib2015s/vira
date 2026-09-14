// app/waybills/create/owned-strip/page.js
'use client'

import UniversalWaybillForm from '@/app/components/UniversalWaybillForm'
import { WAYBILL_TYPES } from '@/app/config/waybillRegistry'

export default function CreateOwnedStripWaybillPage() {
    return (
        <UniversalWaybillForm
            waybillType={WAYBILL_TYPES.OWNED_STRIP}
            mode="create"
        />
    )
}