import React, { useMemo } from 'react';
import type { Invoice, Party } from '../../../types';
import { BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { IconCurrencyDollar, IconFileText, IconShoppingCart, IconClock } from '../../Icons';

// --- Reusable Wrapper & Helpers ---
const WidgetCard: React.FC<{ title: string; children: React.ReactNode, className?: string }> = ({ title, children, className }) => (
    <div className={`widget-card p-4 ${className}`}>
        <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2 flex-shrink-0">{title}</h3>
        <div className="flex-grow h-full mt-2">
            {children}
        </div>
    </div>
);

const CustomTooltip: React.FC<any> = ({ active, payload, label, formatter }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gray-800 text-white p-3 rounded-lg shadow-lg text-sm font-sans">
                <p className="font-bold mb-1">{label}</p>
                {payload.map((pld: any, index: number) => (
                    <div key={index} className="flex justify-between items-center">
                        <span style={{color: pld.fill}}>{pld.name}: </span>
                        <span className="font-mono ml-2">{formatter(pld.value)}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const parseFaDate = (dateStr: string): Date => {
    if (!dateStr) return new Date();
    const parts = dateStr.split('/');
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
};

const MONTHS = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];

// --- WIDGET COMPONENTS ---

export const KPIWidget: React.FC<{ title: string; invoices: Invoice[]; metric: 'totalSales' | 'invoiceCount' | 'avgInvoice' | 'arOverdue'; parties?: Party[] }> = ({ title, invoices, metric }) => {
    const { value, icon, iconBgColor } = useMemo(() => {
        const validInvoices = invoices.filter(inv => inv.status !== 'پیش‌نویس' && inv.status !== 'لغو شده');
        let val: number = 0;
        let icn = <IconCurrencyDollar className="w-5 h-5 text-white"/>;
        let bg = 'bg-green-500';

        switch(metric) {
            case 'totalSales':
                val = validInvoices.reduce((sum, inv) => sum + inv.total, 0);
                icn = <IconCurrencyDollar className="w-5 h-5 text-white"/>;
                bg = 'bg-green-500';
                break;
            case 'invoiceCount':
                val = validInvoices.length;
                icn = <IconFileText className="w-5 h-5 text-white"/>;
                bg = 'bg-blue-500';
                break;
            case 'avgInvoice':
                val = validInvoices.length > 0 ? validInvoices.reduce((sum, inv) => sum + inv.total, 0) / validInvoices.length : 0;
                icn = <IconShoppingCart className="w-5 h-5 text-white"/>;
                bg = 'bg-purple-500';
                break;
            case 'arOverdue':
                 val = validInvoices
                    .filter(inv => inv.dueDateObj < new Date() && inv.status !== 'پرداخت شده')
                    .reduce((sum, inv) => sum + (inv.total - inv.paidAmount), 0);
                 icn = <IconClock className="w-5 h-5 text-white"/>;
                 bg = 'bg-red-500';
                 break;
        }
        return { value: val, icon: icn, iconBgColor: bg };
    }, [invoices, metric]);

    return (
        <WidgetCard title={title} className="justify-between">
            <div className="flex justify-between items-center mt-2">
                <div className={`p-2 rounded-lg inline-block ${iconBgColor}`}>
                    {icon}
                </div>
                 <p className="text-3xl font-bold text-gray-800 dark:text-white font-mono">
                    {value.toLocaleString('fa-IR', { maximumFractionDigits: 0 })}
                </p>
            </div>
        </WidgetCard>
    );
};

export const SalesOverTimeWidget: React.FC<{ title: string; invoices: Invoice[]; parties?: Party[] }> = ({ title, invoices }) => {
    const data = useMemo(() => {
        const monthlySales: { [key: number]: number } = {};
        for(let i=1; i<=12; i++) monthlySales[i] = 0;
        invoices.forEach(inv => {
            const month = parseInt(inv.issueDate.split('/')[1], 10);
            if(monthlySales[month] !== undefined) monthlySales[month] += inv.total;
        });
        return MONTHS.map((name, index) => ({ name, 'فروش': monthlySales[index + 1] || 0 }));
    }, [invoices]);

    return (
        <WidgetCard title={title}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128, 128, 128, 0.1)" />
                    <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${(v/1000000).toLocaleString('fa-IR')}م`} />
                    <Tooltip content={<CustomTooltip formatter={(v: number) => v.toLocaleString('fa-IR')} />} cursor={{ fill: 'rgba(136, 132, 216, 0.1)' }} />
                    <Bar dataKey="فروش" fill="hsl(262, 83%, 58%)" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </WidgetCard>
    );
};

export const TopCustomersWidget: React.FC<{ title: string; invoices: Invoice[]; parties?: Party[] }> = ({ title, invoices, parties }) => {
    const data = useMemo(() => {
        const customerSales: { [key: string]: number } = {};
        invoices.forEach(inv => {
            customerSales[inv.customerName] = (customerSales[inv.customerName] || 0) + inv.total;
        });
        return Object.entries(customerSales).sort((a, b) => b[1] - a[1]).slice(0, 5);
    }, [invoices]);

    const getAvatarForCustomer = (name: string) => {
        const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return `https://i.pravatar.cc/40?u=${hash}`;
    };

    return (
        <WidgetCard title={title}>
            <ul className="space-y-3 h-full overflow-y-auto pr-2">
                {data.map(([name, value], index) => (
                     <li key={name} className="flex items-center gap-3">
                        <span className="font-bold text-gray-400 dark:text-gray-500 w-4 text-sm">{index + 1}</span>
                        <img src={getAvatarForCustomer(name)} className="w-8 h-8 rounded-full" alt={name} />
                        <div className="flex-grow">
                            <p className="font-semibold text-sm text-gray-700 dark:text-gray-300 truncate">{name}</p>
                        </div>
                        <span className="font-mono text-sm font-semibold text-gray-800 dark:text-gray-200">{value.toLocaleString('fa-IR')}</span>
                    </li>
                ))}
            </ul>
        </WidgetCard>
    );
};

const AGING_COLORS = ['#28c76f', '#ff9f43', '#ea5455', '#d93a3a', '#b02a2a'];

export const AccountsReceivableAgingWidget: React.FC<{ title: string; invoices: Invoice[]; parties?: Party[] }> = ({ title, invoices }) => {
    const agingData = useMemo(() => {
        const buckets = { current: 0, '1-30': 0, '31-60': 0, '61-90': 0, over90: 0 };
        const today = new Date();
        today.setHours(0,0,0,0);

        invoices.filter(inv => inv.status !== 'پرداخت شده' && inv.status !== 'پیش‌نویس').forEach(inv => {
            const remaining = inv.total - inv.paidAmount;
            const diffDays = Math.ceil((today.getTime() - inv.dueDateObj.getTime()) / (1000*60*60*24));

            if(diffDays <= 0) buckets.current += remaining;
            else if(diffDays <= 30) buckets['1-30'] += remaining;
            else if(diffDays <= 60) buckets['31-60'] += remaining;
            else if(diffDays <= 90) buckets['61-90'] += remaining;
            else buckets.over90 += remaining;
        });
        return [
            { name: 'جاری', value: buckets.current },
            { name: '۱-۳۰ روز', value: buckets['1-30'] },
            { name: '۳۱-۶۰ روز', value: buckets['31-60'] },
            { name: '۶۱-۹۰ روز', value: buckets['61-90'] },
            { name: '> ۹۰ روز', value: buckets.over90 },
        ];
    }, [invoices]);

    return (
        <WidgetCard title={title}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128, 128, 128, 0.1)" />
                    <XAxis dataKey="name" fontSize={10} tickLine={false} />
                    <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${(v/1000000).toLocaleString('fa-IR')}م`} />
                    <Tooltip content={<CustomTooltip formatter={(v: number) => v.toLocaleString('fa-IR')} />} cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }} />
                    <Bar dataKey="value" name="مبلغ معوق" radius={[4, 4, 0, 0]}>
                        {agingData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={AGING_COLORS[index % AGING_COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </WidgetCard>
    )
};