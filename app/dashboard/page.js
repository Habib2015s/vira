export const dynamic = 'force-dynamic'

import DashboardLayout from "@/app/dashboard/Dashboardlayout"
import DashboardContent from "@/app/dashboard/Dashboardcontent"

export default function DashboardPage() {
    return (
        <DashboardLayout>
            <DashboardContent />
        </DashboardLayout>
    )
}