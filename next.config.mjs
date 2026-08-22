/** @type {import('next').NextConfig} */
const nextConfig = {
    // ❌ output: "export" رو حذف کردیم چون:
    // - API route داری (نیاز به سرور)
    // - middleware داری (نیاز به سرور)
    // - صفحات دینامیک داری بدون generateStaticParams

    images: {
        unoptimized: true, // برای جلوگیری از مشکلات image optimization روی cPanel
    },
}

export default nextConfig
