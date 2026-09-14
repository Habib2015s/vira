// app/utils/swal.js
// ⭐ بارگذاری تنبل (lazy) sweetalert2 — این کتابخونه (~۵۰ کیلوبایت) قبلاً توی
// import استاتیک هر ۶۰ فایلی که ازش استفاده می‌کردن قرار داشت، یعنی همون اول
// لود صفحه دانلود می‌شد حتی اگه کاربر هیچ‌وقت یه Alert نمی‌دید. الان فقط وقتی
// واقعاً Swal.fire(...) صدا زده بشه (مثلاً بعد از کلیک کاربر روی حذف/ثبت) دانلود میشه.
//
// همون امضای Swal.fire(...) حفظ شده، پس هیچ فایلی که ازش استفاده می‌کنه نیاز
// به تغییر نداره — فقط import رو از 'sweetalert2' به این فایل عوض کن.

let modulePromise = null

function loadSwal() {
    if (!modulePromise) {
        modulePromise = import('sweetalert2').then(mod => mod.default)
    }
    return modulePromise
}

const Swal = {
    fire: (...args) => loadSwal().then(RealSwal => RealSwal.fire(...args)),
}

export default Swal
