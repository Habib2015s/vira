'use client'
import UniversalWaybillForm from '@/app/components/UniversalWaybillForm'
import { WAYBILL_TYPES } from '@/app/config/waybillRegistry'

export default function CreateCompanyOwnedWaybillPage() {
    return (
        <UniversalWaybillForm
            waybillType={WAYBILL_TYPES.COMPANY_OWNED}
            mode="create"
        />
    )
}