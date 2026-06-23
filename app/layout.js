import localFont from 'next/font/local'
import './globals.css'
import QueryProvider from '@/app/providers/QueryProvider'
import Script from "next/script"

const vazir = localFont({
    src: [
        { path: '../public/fonts/vazir/Vazirmatn-Light.woff2',    weight: '300', style: 'normal' },
        { path: '../public/fonts/vazir/Vazirmatn-Regular.woff2',  weight: '400', style: 'normal' },
        { path: '../public/fonts/vazir/Vazirmatn-Medium.woff2',   weight: '500', style: 'normal' },
        { path: '../public/fonts/vazir/Vazirmatn-SemiBold.woff2', weight: '600', style: 'normal' },
        { path: '../public/fonts/vazir/Vazirmatn-Bold.woff2',     weight: '700', style: 'normal' },
    ],
    variable: '--font-sans',
    display: 'swap',
})

export const metadata = {
    title: 'سیستم مدیریت ویرا',
    description: 'Vira Transport Management System',
}

export default function RootLayout({ children }) {
    return (
        // ⭐ suppressHydrationWarning: چون script تم class/data-theme رو
        // قبل از hydration عوض میکنه، React باید این تفاوت رو ignore کنه
        <html lang="fa" dir="rtl" className={vazir.variable} suppressHydrationWarning>
        <head>
            <script
                dangerouslySetInnerHTML={{
                    __html: `
(function() {
    try {
        var saved = localStorage.getItem('vira-theme');
        var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        var isDark = saved ? saved === 'dark' : prefersDark;
        if (isDark) {
            document.documentElement.classList.add('dark');
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
        }
    } catch(e) {}
})();
`
                }}
            />
        </head>
        <body className="antialiased" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
        <QueryProvider>
            {children}
        </QueryProvider>
        <Script
            src="https://cdn.lordicon.com/lordicon.js"
            strategy="afterInteractive"
        />
        </body>
        </html>
    )
}