'use client'
import UniversalWaybillForm from '@/app/components/UniversalWaybillForm'
import { WAYBILL_TYPES } from '@/app/config/waybillRegistry'

export default function CreateNonCompanyOwnedWaybillPage() {
    return (
        <UniversalWaybillForm
            waybillType={WAYBILL_TYPES.NON_COMPANY_OWNED}
            mode="create"
        />
    )
}