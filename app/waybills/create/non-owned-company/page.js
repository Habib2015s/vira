'use client'
import UniversalWaybillForm from '@/app/components/UniversalWaybillForm'
import { WAYBILL_TYPES } from '@/app/config/waybillRegistry'

export default function CreateNonOwnedCompanyWaybillPage() {
    return (
        <UniversalWaybillForm
            waybillType={WAYBILL_TYPES.NON_OWNED_COMPANY}
            mode="create"
        />
    )
}