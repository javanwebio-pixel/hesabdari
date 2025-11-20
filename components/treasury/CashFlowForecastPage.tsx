
import React, { useMemo, useState } from 'react';
import type { Invoice, SupplierInvoice, Check, BankAccount } from '../../types';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { IconTrendingUp, IconTrendingDown, IconWallet, IconFileText } from '../Icons';

interface CashFlowForecastPageProps {
    invoices: Invoice[];
    supplierInvoices: SupplierInvoice[];
    checks: Check[];
    bankAccounts: BankAccount[];
}

// FIX: Update the 'icon' prop type to be more specific, allowing 'className' to be passed via cloneElement.
const KPICard: React.FC<{ title: string; value: number; icon: React.ReactElement<{ className?: string }>; colorClass: string }> = ({ title, value, icon, colorClass }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex items-start gap-4">
        <div className={`p-3 rounded-lg ${colorClass.replace('text-', 'bg-').replace('dark:text-', 'dark:bg-')}/10`}>
            {React.cloneElement(icon, { className: `w-6 h-6 ${colorClass}` })}
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold font-mono text-gray-800 dark:text-gray-200 mt-1">{value.toLocaleString('fa-IR')}</p>
        </div>
    </div>
);

const FlowDetailTable: React.FC<{ title: string; sources: any[]; today: Date }> = ({ title, sources, today }) => {
    const getDaysClass = (days: number) => {
        if (days < 0) return 'text-gray-500';
        if (days <= 3) return 'text-danger font-bold';
        if (days <= 7) return 'text-warning';
        return 'text-gray-600 dark:text-gray-400';
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">{title}</h3>
            <div className="overflow-auto max-h-72">
                <table className="w-full text-sm text-right">
                    <thead className="sticky top-0 bg-gray-50 dark:bg-gray-700 text-xs text-gray-500 dark:text-gray-400 uppercase">
                        <tr>
                            <th className="p-2">نوع</th>
                            <th className="p-2">سررسید</th>
                            <th className="p-2">روز مانده</th>
                            <th className="p-2 text-left">مبلغ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-700">
                        {sources.map((s, i) => {
                             const daysRemaining = Math.ceil((s.dueDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                             return (
                                <tr key={i}>
                                    <td className="p-2 text-gray-800 dark:text-gray-300">{s.type} ({s.ref})</td>
                                    <td className="p-2">{s.date}</td>
                                    <td className={`p-2 font-mono ${getDaysClass(daysRemaining)}`}>{daysRemaining >= 0 ? daysRemaining : 'معوق'}</td>
                                    <td className="p-2 text-left font-mono font-semibold text-gray-700 dark:text-gray-200">{s.amount.toLocaleString('fa-IR')}</td>
                                </tr>
                             );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


export const CashFlowForecastPage: React.FC<CashFlowForecastPageProps> = ({ invoices, supplierInvoices, checks, bankAccounts }) => {
    const [forecastDays, setForecastDays] = useState(30);

    const initialBalance = useMemo(() => {
        return bankAccounts
            .filter(acc => acc.isActive)
            .reduce((sum, acc) => sum + acc.balance, 0);
    }, [bankAccounts]);
    
    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    const forecastData = useMemo(() => {
        const dataMap = new Map<string, { date: Date, inflow: number, outflow: number }>();
        for (let i = 0; i < forecastDays; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dateKey = date.toISOString().split('T')[0];
            dataMap.set(dateKey, { date, inflow: 0, outflow: 0 });
        }

        // Inflows
        invoices.forEach(inv => {
            if ((inv.status === 'ارسال شده' || inv.status === 'پرداخت قسمتی') && inv.dueDateObj) {
                const dateKey = inv.dueDateObj.toISOString().split('T')[0];
                if (dataMap.has(dateKey)) {
                    dataMap.get(dateKey)!.inflow += (inv.total - inv.paidAmount);
                }
            }
        });
        checks.forEach(c => {
            if (c.type === 'دریافتی' && c.status === 'در جریان وصول' && c.dueDateObj) {
                const dateKey = c.dueDateObj.toISOString().split('T')[0];
                if (dataMap.has(dateKey)) {
                    dataMap.get(dateKey)!.inflow += c.amount;
                }
            }
        });

        // Outflows
        supplierInvoices.forEach(inv => {
            if ((inv.status === 'ثبت شده' || inv.status === 'پرداخت قسمتی') && inv.dueDateObj) {
                const dateKey = inv.dueDateObj.toISOString().split('T')[0];
                if (dataMap.has(dateKey)) {
                    dataMap.get(dateKey)!.outflow += (inv.totalAmount - inv.paidAmount);
                }
            }
        });
        checks.forEach(c => {
            if (c.type === 'پرداختی' && c.status === 'در جریان وصول' && c.dueDateObj) {
                const dateKey = c.dueDateObj.toISOString().split('T')[0];
                if (dataMap.has(dateKey)) {
                    dataMap.get(dateKey)!.outflow += c.amount;
                }
            }
        });

        let runningBalance = initialBalance;
        const result = Array.from(dataMap.values());

        return result.map(d => {
            const netFlow = d.inflow - d.outflow;
            runningBalance += netFlow;
            return {
                ...d,
                name: new Date(d.date).toLocaleDateString('fa-IR-u-nu-latn', { month: 'numeric', day: 'numeric' }),
                netFlow,
                balance: runningBalance,
            };
        });
    }, [invoices, supplierInvoices, checks, initialBalance, forecastDays, today]);
    
    const kpis = useMemo(() => {
        const totalInflow = forecastData.reduce((sum, d) => sum + d.inflow, 0);
        const totalOutflow = forecastData.reduce((sum, d) => sum + d.outflow, 0);
        const finalBalance = forecastData.length > 0 ? forecastData[forecastData.length - 1].balance : initialBalance;
        return { totalInflow, totalOutflow, finalBalance };
    }, [forecastData, initialBalance]);

    const inflowSources = useMemo(() => [
        ...invoices.filter(i => (i.status === 'ارسال شده' || i.status === 'پرداخت قسمتی') && i.dueDateObj >= today).map(i => ({ type: 'فاکتور فروش', ref: i.invoiceNumber, date: i.dueDate, dueDateObj: i.dueDateObj, amount: i.total - i.paidAmount })),
        ...checks.filter(c => c.type === 'دریافتی' && c.status === 'در جریان وصول' && c.dueDateObj >= today).map(c => ({ type: 'چک دریافتی', ref: c.checkNumber, date: c.dueDate, dueDateObj: c.dueDateObj, amount: c.amount })),
    ].sort((a,b) => a.dueDateObj.getTime() - b.dueDateObj.getTime()), [invoices, checks, today]);
    
     const outflowSources = useMemo(() => [
        ...supplierInvoices.filter(i => (i.status === 'ثبت شده' || i.status === 'پرداخت قسمتی') && i.dueDateObj >= today).map(i => ({ type: 'فاکتور خرید', ref: i.invoiceNumber, date: i.dueDate, dueDateObj: i.dueDateObj, amount: i.totalAmount - i.paidAmount })),
        ...checks.filter(c => c.type === 'پرداختی' && c.status === 'در جریان وصول' && c.dueDateObj >= today).map(c => ({ type: 'چک پرداختی', ref: c.checkNumber, date: c.dueDate, dueDateObj: c.dueDateObj, amount: c.amount })),
    ].sort((a,b) => a.dueDateObj.getTime() - b.dueDateObj.getTime()), [supplierInvoices, checks, today]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">پیش‌بینی جریان وجوه نقد</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">نمای پویا از وضعیت نقدینگی شرکت.</p>
                </div>
                <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    {[7, 15, 30].map(days => (
                        <button key={days} onClick={() => setForecastDays(days)} 
                            className={`px-3 py-1 rounded-md text-sm font-semibold transition-colors ${forecastDays === days ? 'bg-white dark:bg-gray-900 text-primary shadow' : 'text-gray-600 dark:text-gray-300'}`}
                        >
                            {days} روز آینده
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <KPICard title="موجودی اولیه نقد" value={initialBalance} icon={<IconWallet />} colorClass="text-indigo-500 dark:text-indigo-400" />
                 <KPICard title={`ورودی ${forecastDays} روز آینده`} value={kpis.totalInflow} icon={<IconTrendingUp />} colorClass="text-success" />
                 <KPICard title={`خروجی ${forecastDays} روز آینده`} value={kpis.totalOutflow} icon={<IconTrendingDown />} colorClass="text-danger" />
                 <KPICard title="موجودی نهایی پیش‌بینی شده" value={kpis.finalBalance} icon={<IconFileText />} colorClass="text-warning" />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">نمودار جریان نقد و مانده حساب</h3>
                 <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={forecastData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128, 128, 128, 0.2)" />
                            <XAxis dataKey="name" tick={{fill: '#6b7280'}} />
                            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" tickFormatter={(v) => `${(v/1000000).toLocaleString('fa-IR', { maximumFractionDigits: 1 })} م`} tick={{fill: '#8884d8'}} />
                            <YAxis yAxisId="right" orientation="right" stroke="#ffc658" tickFormatter={(v) => `${(v/1000000).toLocaleString('fa-IR', { maximumFractionDigits: 1 })} م`} tick={{fill: '#ffc658'}} />
                            <Tooltip formatter={(value: number, name) => [value.toLocaleString('fa-IR'), name]} contentStyle={{ background: 'rgba(30, 41, 59, 0.9)', border: 'none', borderRadius: '0.5rem', color: 'white' }} />
                            <Legend />
                            <ReferenceLine y={0} yAxisId="left" stroke="#666" strokeDasharray="3 3" />
                            <Bar yAxisId="left" dataKey="netFlow" name="جریان خالص" barSize={20}>
                                {forecastData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.netFlow >= 0 ? 'rgba(40, 199, 111, 0.7)' : 'rgba(234, 84, 85, 0.7)'} />
                                ))}
                            </Bar>
                            <Line yAxisId="right" type="monotone" dataKey="balance" name="موجودی پیش‌بینی" stroke="#ffc658" strokeWidth={3} dot={false} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FlowDetailTable title="جزئیات ورودی‌های آتی" sources={inflowSources} today={today} />
                <FlowDetailTable title="جزئیات خروجی‌های آتی" sources={outflowSources} today={today} />
            </div>
        </div>
    );
};
