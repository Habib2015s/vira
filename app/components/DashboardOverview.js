'use client'

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell
} from 'recharts'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faChartLine,
    faBoxesStacked,
    faClock,
    faUsers,
    faChartPie
} from '@fortawesome/free-solid-svg-icons'

const revenueData = [
    { name: 'شنبه', value: 1200000 },
    { name: 'یکشنبه', value: 2100000 },
    { name: 'دوشنبه', value: 1800000 },
    { name: 'سه‌شنبه', value: 2400000 },
    { name: 'چهارشنبه', value: 3000000 },
    { name: 'پنجشنبه', value: 2800000 },
    { name: 'جمعه', value: 3500000 },
]

const ordersData = [
    { name: 'حمل بار', value: 40 },
    { name: 'مسافر', value: 25 },
    { name: 'یخچالی', value: 15 },
    { name: 'کانتینری', value: 20 },
]

const pieData = [
    { name: 'موفق', value: 75 },
    { name: 'لغو شده', value: 15 },
    { name: 'در انتظار', value: 10 },
]

export default function DashboardOverview() {
    return (
        <div className="space-y-10">

            {/* ===== Revenue Section ===== */}
            <section className="space-y-4">
                <div className="flex items-center gap-3 border-b pb-3"
                     style={{ borderColor: 'var(--border)' }}>
                    <FontAwesomeIcon icon={faChartLine} />
                    <h2 className="text-xl font-black">گزارش درآمد</h2>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card p-6"
                >
                    <ResponsiveContainer width="100%" height={320}>
                        <LineChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="var(--primary)"
                                strokeWidth={3}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </motion.div>
            </section>

            {/* ===== Orders Section ===== */}
            <section className="space-y-4">
                <div className="flex items-center gap-3 border-b pb-3"
                     style={{ borderColor: 'var(--border)' }}>
                    <FontAwesomeIcon icon={faBoxesStacked} />
                    <h2 className="text-xl font-black">تحلیل سفارش‌ها</h2>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                    <div className="card p-6">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={ordersData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar
                                    dataKey="value"
                                    fill="var(--info)"
                                    radius={[10, 10, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="card p-6">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    dataKey="value"
                                    outerRadius={100}
                                    label
                                >
                                    <Cell fill="var(--success)" />
                                    <Cell fill="var(--danger)" />
                                    <Cell fill="var(--warning)" />
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                </div>
            </section>

            {/* ===== Activity Section ===== */}
            <section className="space-y-4">
                <div className="flex items-center gap-3 border-b pb-3"
                     style={{ borderColor: 'var(--border)' }}>
                    <FontAwesomeIcon icon={faClock} />
                    <h2 className="text-xl font-black">فعالیت‌های اخیر</h2>
                </div>

                <div className="card p-6 space-y-4">
                    {[
                        'سفارش جدید ثبت شد',
                        'کاربر جدید ثبت‌نام کرد',
                        'پرداخت موفق انجام شد',
                        'سفارش لغو شد'
                    ].map((item, i) => (
                        <div
                            key={i}
                            className="flex justify-between items-center border-b pb-3"
                            style={{ borderColor: 'var(--border)' }}
                        >
                            <span>{item}</span>
                            <span className="text-xs"
                                  style={{ color: 'var(--text-muted)' }}>
                {i + 1} ساعت پیش
              </span>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}