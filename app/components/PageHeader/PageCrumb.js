'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'

/**
 * Breadcrumb ساده بالای هر صفحه لیست
 * مثال استفاده:
 * <PageCrumb icon={faStore} root="شاپ‌ها" current="لیست شاپ‌ها" />
 * خروجی: [آیکون]  شاپ‌ها  ›  لیست شاپ‌ها
 */
export default function PageCrumb({ icon, root, current }) {
    return (
        <div className="crumb-bar">
            {icon && (
                <div className="crumb-icon">
                    <FontAwesomeIcon icon={icon} className="w-4 h-4" />
                </div>
            )}
            <div className="crumb-text">
                <span className="crumb-root">{root}</span>
                <FontAwesomeIcon icon={faChevronLeft} className="crumb-sep" style={{ width: 9, height: 9 }} />
                <span className="crumb-current">{current}</span>
            </div>
        </div>
    )
}