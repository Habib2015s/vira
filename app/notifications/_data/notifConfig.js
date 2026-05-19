// app/notifications/_data/notifConfig.js
import {
    faFileLines, faTruck, faMoneyBill, faShield,
    faTriangleExclamation, faWrench,
} from '@fortawesome/free-solid-svg-icons'

export const TYPE_CONFIG = {
    waybill:  { icon: faFileLines,           color: 'var(--primary)', bg: 'var(--primary-light)', label: 'بارنامه' },
    vehicle:  { icon: faTruck,               color: 'var(--info)',    bg: 'var(--info-light)',    label: 'ماشین'   },
    payment:  { icon: faMoneyBill,           color: 'var(--success)', bg: 'var(--success-light)', label: 'مالی'    },
    security: { icon: faShield,              color: 'var(--warning)', bg: 'var(--warning-light)', label: 'امنیتی' },
    alert:    { icon: faTriangleExclamation, color: 'var(--danger)',  bg: 'var(--danger-light)',  label: 'هشدار'   },
    repair:   { icon: faWrench,              color: '#7c3aed',        bg: '#ede9fe',              label: 'تعمیر'   },
}

export const FILTERS = [
    { id: 'all',    label: 'همه'          },
    { id: 'unread', label: 'خوانده نشده' },
]

export const SORTS = [
    { id: 'newest', label: 'جدیدترین'        },
    { id: 'oldest', label: 'قدیمی‌ترین'       },
    { id: 'unread', label: 'خوانده نشده اول' },
]

export const DAY_ORDER = ['امروز', 'دیروز', 'این هفته', 'این ماه', 'قدیمی‌تر']

export const MOCK_NOTIFS = [
    { id:  1, type: 'waybill',  title: 'بارنامه جدید ثبت شد',           desc: 'بارنامه شماره BL-۱۳۹۵ توسط علی محمدی ثبت شد',    time: new Date(Date.now() - 3   * 60 * 1000),    unread: true  },
    { id:  5, type: 'waybill',  title: 'بارنامه ویرایش شد',             desc: 'بارنامه BL-۱۳۸۸ توسط سارا احمدی ویرایش شد',      time: new Date(Date.now() - 5   * 3600 * 1000),  unread: false },
    { id:  6, type: 'repair',   title: 'کد تعمیر جدید اضافه شد',        desc: 'کد CM-۰۴۵ با عنوان «تعویض روغن موتور» ثبت شد',   time: new Date(Date.now() - 8   * 3600 * 1000),  unread: false },
    { id:  7, type: 'payment',  title: 'فاکتور در انتظار تایید',         desc: 'فاکتور شماره INV-۲۲۱ نیاز به بررسی دارد',          time: new Date(Date.now() - 1   * 86400 * 1000), unread: true  },
    { id:  8, type: 'alert',    title: 'هشدار: ظرفیت انبار بالاست',      desc: 'انبار شماره ۳ به ۸۵٪ ظرفیت رسیده است',            time: new Date(Date.now() - 1   * 86400 * 1000), unread: false },
    { id:  9, type: 'waybill',  title: 'بارنامه BL-۱۳۸۰ تحویل داده شد', desc: 'محموله با موفقیت به گیرنده تحویل داده شد',          time: new Date(Date.now() - 2   * 86400 * 1000), unread: false },
    { id: 10, type: 'vehicle',  title: 'سرویس دوره‌ای ماشین',            desc: 'کامیون پلاک ۹۸۷-ب-۶۵ نیاز به سرویس دارد',        time: new Date(Date.now() - 2   * 86400 * 1000), unread: false },
    { id: 11, type: 'security', title: 'رمز عبور تغییر کرد',             desc: 'رمز عبور حساب کاربری شما با موفقیت تغییر یافت',   time: new Date(Date.now() - 3   * 86400 * 1000), unread: false },
    { id: 12, type: 'payment',  title: 'پرداخت رد شد',                   desc: 'مبلغ ۱,۲۰۰,۰۰۰ ریال بابت فاکتور INV-۲۱۵ رد شد', time: new Date(Date.now() - 5   * 86400 * 1000), unread: false },
    { id: 13, type: 'repair',   title: 'درخواست تعمیر تایید شد',         desc: 'درخواست شماره REP-۴۴۲ توسط مدیر تایید شد',        time: new Date(Date.now() - 7   * 86400 * 1000), unread: false },
    { id: 14, type: 'waybill',  title: '۱۵ بارنامه آرشیو شد',            desc: 'بارنامه‌های ماه گذشته به آرشیو منتقل شدند',       time: new Date(Date.now() - 10  * 86400 * 1000), unread: false },
]