import React, { useState, useMemo } from 'react';
import type { Budget, AccountNode, CostCenterNode, JournalEntry } from '../../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PERSIAN_MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];

const flattenHierarchy = (nodes: (AccountNode | CostCenterNode)[]): { code: string, name: string, type: string, level: number }[] => {
    const flatList: { code: string, name: string, type: string, level: number }[] = [];
    const traverse = (nodes: (AccountNode | CostCenterNode)[], level: number) => {
        nodes.forEach(node => {
            flatList.push({ code: node.code, name: node.name, type: node.type, level });
            if (node.children) {
                traverse(node.children, level + 1);
            }
        });
    };
    traverse(nodes, 0);
    return flatList;
};

const parseFaDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('/').map(Number);
    return { year, month, day };
}

interface BudgetActualsReportPageProps {
    budgets: Budget[];
    accounts: AccountNode[];
    costCenters: CostCenterNode[];
    journalEntries: JournalEntry[];
}

export const BudgetActualsReportPage: React.FC<BudgetActualsReportPageProps> = ({ budgets, accounts, costCenters, journalEntries }) => {
    const [fiscalYear, setFiscalYear] = useState(1403);
    const [version, setVersion] = useState('بودجه اصلی');
    const [dimension, setDimension] = useState<'account' | 'costCenter'>('account');
    const [period, setPeriod] = useState('ytd'); // 'ytd', 'full', 'custom'

    const hierarchyData = useMemo(() => {
        return dimension === 'account' ? accounts : costCenters;
    }, [dimension, accounts, costCenters]);

    const budgetData = useMemo(() => {
        return budgets.find(b => b.fiscalYear === fiscalYear && b.version === version && b.dimension === dimension);
    }, [budgets, fiscalYear, version, dimension]);

    const actualsData = useMemo(() => {
        const actuals = new Map<string, number>();
        const currentMonth = new Date().getMonth() + 1; // Assuming today is in the current year for YTD

        journalEntries.forEach(entry => {
            const entryDate = parseFaDate(entry.date);
            if (entryDate.year !== fiscalYear) return;
            if (period === 'ytd' && entryDate.month > currentMonth) return;

            entry.lines.forEach(line => {
                const code = line.accountCode; // Assuming budgeting by account for now
                if(line.debit > 0 && code.startsWith('5')) { // Expense accounts
                    actuals.set(code, (actuals.get(code) || 0) + line.debit);
                }
            });
        });
        return actuals;
    }, [journalEntries, fiscalYear, period]);

    const reportRows = useMemo(() => {
        const flatHierarchy = flattenHierarchy(hierarchyData);
        return flatHierarchy.map(item => {
            const budgetLine = budgetData?.lines.find(l => l.dimensionCode === item.code);
            const budgetAmount = budgetLine?.monthlyAmounts.reduce((sum, val) => sum + val, 0) || 0;
            const actualAmount = actualsData.get(item.code) || 0;

            if(item.type === 'group') {
                // Aggregate children for group totals in a real app
                return null;
            }

            const variance = actualAmount - budgetAmount;
            const variancePercent = budgetAmount !== 0 ? (variance / budgetAmount) * 100 : 0;
            const consumption = budgetAmount !== 0 ? (actualAmount / budgetAmount) * 100 : 0;

            return {
                ...item,
                budgetAmount,
                actualAmount,
                variance,
                variancePercent,
                consumption
            };
        }).filter(Boolean);
    }, [hierarchyData, budgetData, actualsData]);

    const chartData = reportRows.filter(r => r && r.budgetAmount > 0).slice(0, 10);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">گزارش بودجه در برابر عملکرد</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">مقایسه هزینه‌های واقعی با بودجه تخصیص یافته.</p>
            </div>
             <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                    <label className="label-form">سال مالی</label>
                    <select value={fiscalYear} onChange={e => setFiscalYear(Number(e.target.value))} className="input-field">
                        <option value={1403}>۱۴۰۳</option>
                        <option value={1404}>۱۴۰۴</option>
                    </select>
                </div>
                <div>
                    <label className="label-form">نسخه بودجه</label>
                    <input type="text" value={version} onChange={e => setVersion(e.target.value)} className="input-field" />
                </div>
                <div>
                    <label className="label-form">بر اساس</label>
                        <select value={dimension} onChange={e => setDimension(e.target.value as any)} className="input-field">
                        <option value="account">سرفصل حسابداری</option>
                        <option value="costCenter">مرکز هزینه</option>
                    </select>
                </div>
                <div>
                    <label className="label-form">دوره گزارش</label>
                    <select value={period} onChange={e => setPeriod(e.target.value)} className="input-field">
                        <option value="ytd">از ابتدای سال تا کنون</option>
                        <option value="full">کل سال</option>
                    </select>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                 <h3 className="text-lg font-semibold mb-4">نمودار مقایسه‌ای</h3>
                 <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={chartData} margin={{ top: 5, right: 10, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128, 128, 128, 0.2)" />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => new Intl.NumberFormat('fa-IR', { notation: 'compact' }).format(value as number)} />
                            <Tooltip formatter={(value: number) => `${value.toLocaleString('fa-IR')} تومان`} contentStyle={{ background: 'rgba(30, 41, 59, 0.9)', border: 'none', borderRadius: '0.5rem', color: 'white' }} />
                            <Legend />
                            <Bar dataKey="budgetAmount" name="بودجه" fill="#8884d8" radius={[10, 10, 0, 0]} barSize={20} />
                            <Bar dataKey="actualAmount" name="عملکرد واقعی" fill="#28c76f" radius={[10, 10, 0, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                 <h3 className="text-lg font-semibold mb-4">جزئیات گزارش</h3>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                         <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700">
                             <tr>
                                 <th className="px-4 py-3">عنوان</th>
                                 <th className="px-4 py-3">بودجه</th>
                                 <th className="px-4 py-3">عملکرد</th>
                                 <th className="px-4 py-3">انحراف (مبلغ)</th>
                                 <th className="px-4 py-3">انحراف (٪)</th>
                                 <th className="px-4 py-3 w-40">مصرف بودجه</th>
                             </tr>
                         </thead>
                         <tbody>
                            {reportRows.map(row => {
                                if (!row) return null;
                                const isUnfavorable = row.variance > 0;
                                return (
                                <tr key={row.code} className="border-b dark:border-gray-700">
                                    <td className="px-4 py-2 font-semibold">{row.name}</td>
                                    <td className="px-4 py-2 font-mono">{row.budgetAmount.toLocaleString('fa-IR')}</td>
                                    <td className="px-4 py-2 font-mono">{row.actualAmount.toLocaleString('fa-IR')}</td>
                                    <td className={`px-4 py-2 font-mono font-semibold ${isUnfavorable ? 'text-danger' : 'text-success'}`}>{row.variance.toLocaleString('fa-IR')}</td>
                                    <td className={`px-4 py-2 font-mono font-semibold ${isUnfavorable ? 'text-danger' : 'text-success'}`}>{row.variancePercent.toFixed(2)}%</td>
                                    <td className="px-4 py-2">
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                            <div className="bg-primary h-2.5 rounded-full" style={{width: `${Math.min(row.consumption, 100)}%`}}></div>
                                        </div>
                                         <span className="text-xs font-mono">{row.consumption.toFixed(1)}%</span>
                                    </td>
                                </tr>
                            )})}
                         </tbody>
                    </table>
                 </div>
            </div>
             <style>{`
                .label-form { display: block; font-size: 0.875rem; font-weight: 500; color: #4B5563; margin-bottom: 0.25rem; } .dark .label-form { color: #D1D5DB; }
                .input-field { width: 100%; padding: 0.5rem 0.75rem; border-radius: 0.5rem; background-color: #F9FAFB; border: 1px solid #E5E7EB; } .dark .input-field { background-color: #374151; border-color: #4B5563; }
                .input-field:focus { outline: 2px solid transparent; outline-offset: 2px; --tw-ring-color: hsl(262 83% 58%); box-shadow: 0 0 0 2px var(--tw-ring-color); }
            `}</style>
        </div>
    );
}
