import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { Invoice, Good, Party } from '../../../types';
import { IconCurrencyDollar, IconFileText, IconShoppingCart, IconTrendingUp, IconTrendingDown } from '../../Icons';

// Reusable Card Component
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${className}`}>
        {children}
    </div>
);

const KPICard: React.FC<{ title: string; value: string; icon: React.ReactNode; change?: number }> = ({ title, value, icon, change }) => (
    <Card>
        <div className="flex justify-between items-center">
            <div className="p-3 rounded-full bg-primary-100 dark:bg-gray-700 text-primary">
                {icon}
            </div>
            {change !== undefined && (
                <div className={`flex items-center text-sm font-semibold ${change >= 0 ? 'text-success' : 'text-danger'}`}>
                    {change >= 0 ? <IconTrendingUp className="w-4 h-4" /> : <IconTrendingDown className="w-4 h-4" />}
                    <span className="mr-1">{Math.abs(change)}%</span>
                </div>
            )}
        </div>
        <div className="mt-4">
            <p className="text-3xl font-bold text-gray-800 dark:text-white">{value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        </div>
    </Card>
);

const ChartContainer: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
    <Card className={className}>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{title}</h3>
        <div className="h-72">
            {children}
        </div>
    </Card>
);

const ListCard: React.FC<{ title: string; items: { name: string; value: string }[] }> = ({ title, items }) => (
    <Card>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{title}</h3>
        <ul className="space-y-3">
            {items.map((item, index) => (
                <li key={index} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-300 truncate pr-2">{item.name}</span>
                    <span className="font-semibold font-mono text-gray-800 dark:text-gray-200 flex-shrink-0">{item.value}</span>
                </li>
            ))}
        </ul>
    </Card>
);

const MONTHS = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];
const CATEGORY_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];

interface SalesAnalyticsDashboardPageProps {
    invoices: Invoice[];
    goods: Good[];
    parties: Party[];
}

export const SalesAnalyticsDashboardPage: React.FC<SalesAnalyticsDashboardPageProps> = ({ invoices, goods, parties }) => {
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
    });

    const analyticsData = useMemo(() => {
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);

        const validInvoices = invoices.filter(inv => {
            const issueDate = inv.dueDateObj;
            return inv.status !== 'پیش‌نویس' && inv.status !== 'لغو شده' && issueDate >= startDate && issueDate <= endDate;
        });
        
        // KPIs
        const totalSales = validInvoices.reduce((sum, inv) => sum + inv.total, 0);
        const totalInvoices = validInvoices.length;
        const avgInvoiceValue = totalInvoices > 0 ? totalSales / totalInvoices : 0;

        // Monthly Sales
        const monthlySales: { [key: number]: number } = {};
        for(let i=1; i<=12; i++) monthlySales[i] = 0;

        validInvoices.forEach(inv => {
            const month = parseInt(inv.issueDate.split('/')[1], 10);
            if(monthlySales[month] !== undefined) {
                 monthlySales[month] += inv.total;
            }
        });

        const monthlySalesChartData = MONTHS.map((name, index) => ({
            name,
            'فروش': monthlySales[index + 1] || 0,
        }));

        // Category Sales
        const categorySales: { [key: string]: number } = {};
        validInvoices.forEach(inv => {
            inv.lines.forEach(line => {
                const good = goods.find(g => g.code === line.itemCode);
                if (good) {
                    const category = good.category || 'متفرقه';
                    const lineValue = line.quantity * line.rate;
                    categorySales[category] = (categorySales[category] || 0) + lineValue;
                }
            });
        });
        const categorySalesChartData = Object.entries(categorySales).map(([name, value]) => ({ name, value }));

        // Top Products
        const productSales: { [key: string]: { name: string, value: number } } = {};
        validInvoices.forEach(inv => {
            inv.lines.forEach(line => {
                 const lineValue = line.quantity * line.rate;
                 if(productSales[line.itemName]) {
                     productSales[line.itemName].value += lineValue;
                 } else {
                     productSales[line.itemName] = { name: line.itemName, value: lineValue };
                 }
            });
        });
        const topProducts = Object.values(productSales).sort((a,b) => b.value - a.value).slice(0, 5);
        
        // Top Customers
        const customerSales: { [key: string]: { name: string, value: number } } = {};
        validInvoices.forEach(inv => {
             if(customerSales[inv.customerName]) {
                 customerSales[inv.customerName].value += inv.total;
             } else {
                 customerSales[inv.customerName] = { name: inv.customerName, value: inv.total };
             }
        });
        const topCustomers = Object.values(customerSales).sort((a,b) => b.value - a.value).slice(0, 5);

        return {
            totalSales,
            totalInvoices,
            avgInvoiceValue,
            monthlySalesChartData,
            categorySalesChartData,
            topProducts,
            topCustomers
        };

    }, [invoices, goods, parties, dateRange]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">تحلیل و گزارشات فروش</h1>
                <div className="flex items-center gap-2">
                    <input type="date" value={dateRange.start} onChange={e => setDateRange(d => ({...d, start: e.target.value}))} className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 text-sm"/>
                    <span>تا</span>
                    <input type="date" value={dateRange.end} onChange={e => setDateRange(d => ({...d, end: e.target.value}))} className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 text-sm"/>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard title="کل فروش" value={analyticsData.totalSales.toLocaleString('fa-IR', {maximumFractionDigits: 0})} icon={<IconCurrencyDollar className="w-6 h-6"/>} change={12.5} />
                <KPICard title="تعداد فاکتورها" value={analyticsData.totalInvoices.toLocaleString('fa-IR')} icon={<IconFileText className="w-6 h-6"/>} change={8} />
                <KPICard title="میانگین مبلغ هر فاکتور" value={analyticsData.avgInvoiceValue.toLocaleString('fa-IR', {maximumFractionDigits: 0})} icon={<IconShoppingCart className="w-6 h-6"/>} change={4.5} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ChartContainer title="روند فروش ماهانه" className="lg:col-span-2">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsData.monthlySalesChartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128, 128, 128, 0.1)" />
                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000000).toLocaleString('fa-IR')}م`} />
                            <Tooltip formatter={(value: number) => [value.toLocaleString('fa-IR'), 'فروش']} contentStyle={{ background: 'rgba(30, 41, 59, 0.9)', border: 'none', borderRadius: '0.5rem', color: 'white' }} />
                            <Bar dataKey="فروش" fill="#8884d8" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>

                 <ChartContainer title="ترکیب فروش" className="lg:col-span-1">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={analyticsData.categorySalesChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8">
                                {analyticsData.categorySalesChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => value.toLocaleString('fa-IR')} contentStyle={{ background: 'rgba(30, 41, 59, 0.9)', border: 'none', borderRadius: '0.5rem', color: 'white' }} />
                            <Legend iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>

                <ListCard title="۵ محصول پرفروش" items={analyticsData.topProducts.map(p => ({name: p.name, value: p.value.toLocaleString('fa-IR')}))} />
                <ListCard title="۵ مشتری برتر" items={analyticsData.topCustomers.map(c => ({name: c.name, value: c.value.toLocaleString('fa-IR')}))} />
            </div>
        </div>
    );
};