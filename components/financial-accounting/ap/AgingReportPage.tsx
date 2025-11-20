import React, { useMemo, useState } from 'react';
import type { SupplierInvoice } from '../../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { IconChevronLeft } from '../../Icons';

interface AgingData {
    supplierId: string;
    supplierName: string;
    current: number;
    '1-30': number;
    '31-60': number;
    '61-90': number;
    over90: number;
    total: number;
}

const parseFaDate = (dateStr: string): Date => {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return new Date();
    // Assuming YYYY/MM/DD format
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
};

const calculateAging = (invoices: SupplierInvoice[], asOfDate: Date): AgingData[] => {
    asOfDate.setHours(0, 0, 0, 0);
    const agingMap: { [supplierId: string]: AgingData } = {};

    invoices
        .filter(inv => {
            const invDate = parseFaDate(inv.invoiceDate);
            return (inv.status === 'ثبت شده' || inv.status === 'پرداخت قسمتی') && invDate <= asOfDate;
        })
        .forEach(inv => {
            const remaining = inv.totalAmount - inv.paidAmount;
            if (remaining <= 0.01) return;

            if (!agingMap[inv.supplierId]) {
                agingMap[inv.supplierId] = {
                    supplierId: inv.supplierId,
                    supplierName: inv.supplierName,
                    current: 0, '1-30': 0, '31-60': 0, '61-90': 0, over90: 0, total: 0,
                };
            }

            const dueDate = parseFaDate(inv.dueDate);
            const diffDays = Math.ceil((asOfDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (diffDays <= 0) agingMap[inv.supplierId].current += remaining;
            else if (diffDays <= 30) agingMap[inv.supplierId]['1-30'] += remaining;
            else if (diffDays <= 60) agingMap[inv.supplierId]['31-60'] += remaining;
            else if (diffDays <= 90) agingMap[inv.supplierId]['61-90'] += remaining;
            else agingMap[inv.supplierId].over90 += remaining;

            agingMap[inv.supplierId].total += remaining;
        });

    return Object.values(agingMap).filter(a => a.total > 0).sort((a,b) => b.total - a.total);
};

const ChartTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gray-800 text-white p-2 rounded-md shadow-lg text-sm">
                <p className="font-bold">{label}</p>
                <p>مبلغ: {payload[0].value.toLocaleString('fa-IR')} تومان</p>
            </div>
        );
    }
    return null;
};

const AgingTableRow: React.FC<{
    row: AgingData,
    invoices: SupplierInvoice[],
    asOfDate: Date
}> = ({ row, invoices, asOfDate }) => {
    const [isOpen, setIsOpen] = useState(false);

    const supplierInvoices = useMemo(() => {
        return invoices
            .filter(inv => inv.supplierId === row.supplierId && (inv.status === 'ثبت شده' || inv.status === 'پرداخت قسمتی'))
            .map(inv => {
                const dueDate = parseFaDate(inv.dueDate);
                const diffDays = Math.ceil((asOfDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
                return { ...inv, daysOverdue: diffDays };
            })
            .filter(inv => inv.totalAmount - inv.paidAmount > 0.01);
    }, [invoices, row.supplierId, asOfDate]);

    return (
        <>
            <tr onClick={() => setIsOpen(!isOpen)} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                <td className="px-4 py-2 font-semibold flex items-center gap-2">
                    <IconChevronLeft className={`w-4 h-4 transition-transform ${isOpen ? '-rotate-90' : ''}`} />
                    {row.supplierName}
                </td>
                <td className="px-4 py-2 font-mono font-bold text-gray-800 dark:text-gray-200">{row.total.toLocaleString('fa-IR')}</td>
                <td className="px-4 py-2 font-mono">{row.current > 0 ? row.current.toLocaleString('fa-IR') : '-'}</td>
                <td className="px-4 py-2 font-mono">{row['1-30'] > 0 ? row['1-30'].toLocaleString('fa-IR') : '-'}</td>
                <td className="px-4 py-2 font-mono">{row['31-60'] > 0 ? row['31-60'].toLocaleString('fa-IR') : '-'}</td>
                <td className="px-4 py-2 font-mono">{row['61-90'] > 0 ? row['61-90'].toLocaleString('fa-IR') : '-'}</td>
                <td className="px-4 py-2 font-mono">{row.over90 > 0 ? row.over90.toLocaleString('fa-IR') : '-'}</td>
            </tr>
            {isOpen && (
                <tr>
                    <td colSpan={7} className="p-0">
                        <div className="bg-gray-50 dark:bg-gray-900 p-3">
                            <table className="w-full text-xs">
                                <thead className="text-gray-500">
                                    <tr>
                                        <th className="text-right p-1 font-medium">شماره فاکتور</th>
                                        <th className="text-right p-1 font-medium">تاریخ سررسید</th>
                                        <th className="text-right p-1 font-medium">تاخیر (روز)</th>
                                        <th className="text-right p-1 font-medium">مبلغ مانده</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {supplierInvoices.map(inv => (
                                        <tr key={inv.id} className="border-t dark:border-gray-700">
                                            <td className="p-1 font-mono">{inv.invoiceNumber}</td>
                                            <td className="p-1">{inv.dueDate}</td>
                                            <td className="p-1 font-mono">{inv.daysOverdue}</td>
                                            <td className="p-1 font-mono">{(inv.totalAmount - inv.paidAmount).toLocaleString('fa-IR')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};

export const AgingReportPage: React.FC<{ invoices: SupplierInvoice[] }> = ({ invoices }) => {
    const [asOfDate, setAsOfDate] = useState(new Date());
    
    const agingData = useMemo(() => calculateAging(invoices, asOfDate), [invoices, asOfDate]);
    
    const chartData = useMemo(() => {
        const totals = agingData.reduce((acc, supplier) => {
            acc.current += supplier.current;
            acc['1-30'] += supplier['1-30'];
            acc['31-60'] += supplier['31-60'];
            acc['61-90'] += supplier['61-90'];
            acc.over90 += supplier.over90;
            return acc;
        }, { current: 0, '1-30': 0, '31-60': 0, '61-90': 0, over90: 0 });

        return [
            { name: 'جاری', value: totals.current },
            { name: '۱-۳۰ روز', value: totals['1-30'] },
            { name: '۳۱-۶۰ روز', value: totals['31-60'] },
            { name: '۶۱-۹۰ روز', value: totals['61-90'] },
            { name: '> ۹۰ روز', value: totals.over90 },
        ];
    }, [agingData]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">گزارش تحلیلی مرور بدهی</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">بدهی‌های معوق به تفکیک بازه‌های زمانی و تامین‌کنندگان.</p>
            </div>
             <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center gap-4">
                <label htmlFor="asOfDate" className="text-sm font-medium">تاریخ مبنای گزارش:</label>
                <input 
                    type="date"
                    id="asOfDate"
                    value={asOfDate.toISOString().split('T')[0]}
                    onChange={(e) => setAsOfDate(new Date(e.target.value))}
                    className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                />
             </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">خلاصه بدهی‌ها بر اساس بازه زمانی</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128, 128, 128, 0.2)" />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => new Intl.NumberFormat('fa-IR', { notation: 'compact' }).format(value as number)} />
                            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(136, 132, 216, 0.1)' }} />
                            <Bar dataKey="value" fill="#8884d8" radius={[10, 10, 0, 0]} barSize={30} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                 <h3 className="text-lg font-semibold mb-4">جزئیات بدهی به تفکیک تامین کننده</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-3">تامین کننده</th>
                                <th className="px-4 py-3">جمع بدهی</th>
                                <th className="px-4 py-3">جاری</th>
                                <th className="px-4 py-3">۱-۳۰ روز</th>
                                <th className="px-4 py-3">۳۱-۶۰ روز</th>
                                <th className="px-4 py-3">۶۱-۹۰ روز</th>
                                <th className="px-4 py-3">&gt; ۹۰ روز</th>
                            </tr>
                        </thead>
                        <tbody>
                            {agingData.map(row => (
                                <AgingTableRow key={row.supplierId} row={row} invoices={invoices} asOfDate={asOfDate} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};