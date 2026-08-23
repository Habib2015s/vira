'use client'

import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell,
} from 'recharts'
import { motion } from 'framer-motion'

const revenueData = [
    { name: 'ش',  income: 3200, orders: 5300 },
    { name: 'ی',  income: 3800, orders: 4900 },
    { name: 'د',  income: 3500, orders: 5100 },
    { name: 'س',  income: 4600, orders: 4800 },
    { name: 'چ',  income: 4200, orders: 5600 },
    { name: 'پ',  income: 5100, orders: 5000 },
    { name: 'ج',  income: 4800, orders: 6200 },
    { name: '۸',  income: 5600, orders: 5900 },
    { name: '۹',  income: 5300, orders: 6800 },
]

// ⭐⭐ تغییر اصلی: رنگ‌های رنگی و واضح به‌جای طیف خاکستری قبلی
const categoryData = [
    { name: 'ساعت',           value: 172500, count: 1275, color: '#6366f1' }, // indigo
    { name: 'پوشاک',           value: 96500,  count: 970,  color: '#06b6d4' }, // cyan
    { name: 'ابزارهای هوشمند', value: 83500,  count: 830,  color: '#f59e0b' }, // amber
    { name: 'سایر',            value: 79800,  count: 532,  color: '#f43f5e' }, // rose
]

const fmt = (n) => n.toLocaleString('fa-IR')

export default function OverviewCharts() {
    const total = categoryData.reduce((s, c) => s + c.value, 0)

    return (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">

            {/* ── دسته‌بندی‌ها (دونات) ── */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                        className="card p-5 xl:col-span-2">
                <h3 className="text-sm font-black mb-4" style={{ color: 'var(--text)' }}>
                    پرفروش‌ترین دسته‌بندی‌ها
                </h3>
                <div style={{ height: 190 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={categoryData} dataKey="value" innerRadius={58} outerRadius={82} paddingAngle={2} stroke="none">
                                {categoryData.map((c, i) => <Cell key={i} fill={c.color} />)}
                            </Pie>
                            <Tooltip
                                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }}
                                formatter={(v) => `${fmt(v)} تومان`}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-3 space-y-2.5">
                    {categoryData.map((c) => (
                        <div key={c.name} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
                                <span style={{ color: 'var(--text-soft)' }}>{c.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span style={{ color: 'var(--text-muted)' }}>{fmt(c.count)}</span>
                                <span className="font-bold" style={{ color: 'var(--text)' }}>{fmt(c.value)} تومان</span>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* ── درآمد و سفارشات (نمودار گرادیانی دوخطی) ── */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
                        className="card p-5 xl:col-span-3">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                    <h3 className="text-sm font-black" style={{ color: 'var(--text)' }}>درآمد و سفارشات</h3>
                    <div className="flex items-center gap-5">
                        <div>
                            <p className="text-[10px] font-semibold flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                                <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#6366f1' }} />
                                کل درآمد
                            </p>
                            <p className="text-base font-black" style={{ color: 'var(--text)' }}>۱۲۹,۴۴۰ ریال</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-semibold flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                                <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#06b6d4' }} />
                                کل سفارشات
                            </p>
                            <p className="text-base font-black" style={{ color: 'var(--text)' }}>۱.۸۱ هزار</p>
                        </div>
                    </div>
                </div>

                <div style={{ height: 232 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueData} margin={{ top: 6, right: 4, left: -18, bottom: 0 }}>
                            <defs>
                                {/* ⭐⭐ گرادیان‌ها هم رنگی شدن: بنفش-ایندیگو برای درآمد، فیروزه‌ای برای سفارشات */}
                                <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gOrders" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.35} />
                                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }} />
                            <Area type="monotone" dataKey="orders" stroke="#06b6d4" strokeWidth={2} fill="url(#gOrders)" />
                            <Area type="monotone" dataKey="income" stroke="#6366f1" strokeWidth={2.5} fill="url(#gIncome)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>
        </div>
    )
}