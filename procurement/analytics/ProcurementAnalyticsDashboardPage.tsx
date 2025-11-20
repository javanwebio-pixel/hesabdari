import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { PurchaseOrder, Party, Good } from '../../../types';
import { IconCurrencyDollar, IconFileText, IconShoppingCart, IconBuildingStore } from '../../Icons';

// Reusable Card Components
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${className}`}>
        {children}
    </div>
);

const KPICard: React.FC<{ title: string; value: string; icon: React.ReactNode; }> = ({ title, value, icon }) => (
    <Card>
        <div className="flex justify-between items-center">
            <div className="p-3 rounded-full bg-primary-100 dark:bg-gray-700 text-primary">
                {icon}
            </div>
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

const MONTHS = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];
const SUPPLIER_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];

interface ProcurementAnalyticsDashboardPageProps {
    purchaseOrders: PurchaseOrder[];
    suppliers: Party[];
    goods: Good[];
}

export const ProcurementAnalyticsDashboardPage: React.FC<ProcurementAnalyticsDashboardPageProps> = ({ purchaseOrders, suppliers, goods }) => {

    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
    });

    const analyticsData = useMemo(() => {
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        
        const validPOs = purchaseOrders.filter(po => {
            const orderDate = new Date(po.orderDate.replace(/(\d{4})\/(\d{2})\/(\d{2})/, '$1-$2-$3'));
            return orderDate >= startDate && orderDate <= endDate;
        });
        
        // KPIs
        const totalSpend = validPOs.reduce((sum, po) => sum + po.totalAmount, 0);
        const totalPOs = validPOs.length;
        const uniqueSuppliers = new Set(validPOs.map(po => po.supplierId));
        const totalSuppliers = uniqueSuppliers.size;
        const avgPoValue = totalPOs > 0 ? totalSpend / totalPOs : 0;

        // Monthly Spend
        const monthlySpend: { [key: number]: number } = {};
        for(let i=1; i<=12; i++) monthlySpend[i] = 0;

        validPOs.forEach(po => {
            const month = parseInt(po.orderDate.split('/')[1], 10);
            if(monthlySpend[month] !== undefined) {
                 monthlySpend[month] += po.totalAmount;
            }
        });

        const monthlySpendChartData = MONTHS.map((name, index) => ({
            name,
            'هزینه': monthlySpend[index + 1] || 0,
        }));

        // Spend by Supplier
        const supplierSpend: { [key: string]: number } = {};
        validPOs.forEach(po => {
            supplierSpend[po.supplierName] = (supplierSpend[po.supplierName] || 0) + po.totalAmount;
        });
        const supplierSpendChartData = Object.entries(supplierSpend).map(([name, value]) => ({ name, value }));
        
        return {
            totalSpend,
            totalPOs,
            totalSuppliers,
            avgPoValue,
            monthlySpendChartData,
            supplierSpendChartData
        };
    }, [purchaseOrders, dateRange]);

    // FIX: The component was missing a return statement, causing it to implicitly return void.
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">تحلیل و گزارشات تدارکات</h1>
                <div className="flex items-center gap-2">
                    <input type="date" value={dateRange.start} onChange={e => setDateRange(d => ({...d, start: e.target.value}))} className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 text-sm"/>
                    <span>تا</span>
                    <input type="date" value={dateRange.end} onChange={e => setDateRange(d => ({...d, end: e.target.value}))} className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 text-sm"/>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KPICard title="کل هزینه خرید" value={analyticsData.totalSpend.toLocaleString('fa-IR', {maximumFractionDigits: 0})} icon={<IconCurrencyDollar className="w-6 h-6"/>} />
                <KPICard title="تعداد سفارشات" value={analyticsData.totalPOs.toLocaleString('fa-IR')} icon={<IconFileText className="w-6 h-6"/>} />
                <KPICard title="میانگین مبلغ سفارش" value={analyticsData.avgPoValue.toLocaleString('fa-IR', {maximumFractionDigits: 0})} icon={<IconShoppingCart className="w-6 h-6"/>} />
                <KPICard title="تامین‌کنندگان فعال" value={analyticsData.totalSuppliers.toLocaleString('fa-IR')} icon={<IconBuildingStore className="w-6 h-6"/>} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ChartContainer title="روند خرید ماهانه" className="lg:col-span-2">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsData.monthlySpendChartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128, 128, 128, 0.1)" />
                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v/1000000).toLocaleString('fa-IR')}م`} />
                            <Tooltip formatter={(value: number) => [value.toLocaleString('fa-IR'), 'هزینه']} contentStyle={{ background: 'rgba(30, 41, 59, 0.9)', border: 'none', borderRadius: '0.5rem', color: 'white' }} />
                            <Bar dataKey="هزینه" fill="#8884d8" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>

                 <ChartContainer title="ترکیب خرید از تامین‌کنندگان" className="lg:col-span-1">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={analyticsData.supplierSpendChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" labelLine={false}>
                                {analyticsData.supplierSpendChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={SUPPLIER_COLORS[index % SUPPLIER_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => value.toLocaleString('fa-IR')} contentStyle={{ background: 'rgba(30, 41, 59, 0.9)', border: 'none', borderRadius: '0.5rem', color: 'white' }} />
                            <Legend iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>
        </div>
    );
};