'use client'
import { useParams, useSearchParams } from 'next/navigation'
import UniversalWaybillForm from '@/app/components/UniversalWaybillForm'
import { WAYBILL_TYPES } from '@/app/config/waybillRegistry'

export default function EditWaybillPage() {
    const params = useParams()
    const searchParams = useSearchParams()

    const waybillId = params.id
    const waybillType = searchParams.get('type') || WAYBILL_TYPES.COMPANY_OWNED

    return (
        <UniversalWaybillForm
            waybillType={waybillType}
            mode="edit"
            waybillId={waybillId}
        />
    )
}