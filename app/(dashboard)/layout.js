// app/(dashboard)/layout.js
// ⭐ لایه مشترک همه صفحات داشبورد — Sidebar/Header فقط اینجا یک‌بار mount میشن
// و بین ناوبری صفحات زیر این گروه (Route Group) ثابت می‌مونن، برخلاف قبل که
// هر page.js خودش <DashboardLayout> رو رندر می‌کرد و باعث unmount/mount کامل
// سایدبار و هدر با هر تغییر صفحه می‌شد.
// نکته: پرانتز دور "(dashboard)" یه Route Group هست — توی URL دیده نمیشه،
// یعنی /requests/list همچنان همون /requests/list باقی می‌مونه.
import DashboardLayout from "@/app/(dashboard)/dashboard/Dashboardlayout"

export default function DashboardGroupLayout({ children }) {
    return <DashboardLayout>{children}</DashboardLayout>
}
