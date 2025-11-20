
import React, { useState, useMemo } from 'react';
import type { CostCenterNode } from '../../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Mock data for the report
const mockReportData = {
    '2100': [
        { account: 'مواد مستقیم', budget: 120000000, actual: 125000000 },
        { account: 'دستمزد مستقیم', budget: 80000000, actual: 78000000 },
        { account: 'سربار ساخت', budget: 45000000, actual: 50000000 },
    ],
    '2200': [
        { account: 'ملزومات بسته‌بندی', budget: 30000000, actual: 32000000 },
        { account: 'دستمزد مستقیم', budget: 40000000, actual: 41000000 },
        { account: 'سربار ساخت', budget: 15000000, actual: 14000000 },
    ],
};

const flattenCostCenters = (nodes: CostCenterNode[]): CostCenterNode[] => {
    let flatList: CostCenterNode[] = [];
    nodes.forEach(node => {
        flatList.push(node);
        if (node.children) {
            flatList = flatList.concat(flattenCostCenters(node.children));
        }
    });
    return flatList;
};

interface CostCenterReportPageProps {
    costCenters: CostCenterNode[];
}

export const CostCenterReportPage: React.FC<CostCenterReportPageProps> = ({ costCenters }) => {
    const [selectedCenter, setSelectedCenter] = useState('2100'); // Default to 'دایره مونتاژ'
    
    const productionCenters = useMemo(() => {
        return flattenCostCenters(costCenters).filter(c => c.type === 'Cost Center');
    }, [costCenters]);
    
    const reportData = mockReportData[selectedCenter as keyof typeof mockReportData] || [];
    const chartData = reportData.map(d => ({...d, variance: d.actual - d.budget}));

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">گزارش تحلیلی مراکز هزینه</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">مقایسه عملکرد واقعی با بودجه به تفکیک سرفصل‌های هزینه.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center gap-4">
                <label htmlFor="cost-center-select" className="text-sm font-medium">مرکز هزینه:</label>
                <select 
                    id="cost-center-select"
                    value={selectedCenter}
                    onChange={(e) => setSelectedCenter(e.target.value)}
                    className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    {productionCenters.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                </select>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">نمودار انحراف از بودجه</h3>
                 <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 10, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(128, 128, 128, 0.2)" />
                            <XAxis type="number" tickFormatter={(value) => new Intl.NumberFormat('fa-IR', { notation: 'compact' }).format(value as number)} />
                            <YAxis type="category" dataKey="account" width={100} />
                            <Tooltip formatter={(value: number) => `${value.toLocaleString('fa-IR')} تومان`} contentStyle={{ background: 'rgba(30, 41, 59, 0.9)', border: 'none', borderRadius: '0.5rem', color: 'white' }} />
                            <Legend />
                            <Bar dataKey="budget" name="بودجه" fill="#8884d8" radius={[0, 10, 10, 0]} barSize={15} />
                            <Bar dataKey="actual" name="عملکرد واقعی" fill="#28c76f" radius={[0, 10, 10, 0]} barSize={15} />
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
                                <th className="px-4 py-3">سرفصل هزینه</th>
                                <th className="px-4 py-3">مبلغ بودجه</th>
                                <th className="px-4 py-3">عملکرد واقعی</th>
                                <th className="px-4 py-3">انحراف (مبلغ)</th>
                                <th className="px-4 py-3">انحراف (درصد)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.map(row => {
                                const variance = row.actual - row.budget;
                                const variancePercent = row.budget > 0 ? (variance / row.budget) * 100 : 0;
                                const isUnfavorable = variance > 0;
                                return (
                                    <tr key={row.account} className="border-b dark:border-gray-700">
                                        <td className="px-4 py-2 font-semibold">{row.account}</td>
                                        <td className="px-4 py-2 font-mono">{row.budget.toLocaleString('fa-IR')}</td>
                                        <td className="px-4 py-2 font-mono cursor-pointer hover:text-primary hover:underline" title="مشاهده اسناد مرتبط">{row.actual.toLocaleString('fa-IR')}</td>
                                        <td className={`px-4 py-2 font-mono font-semibold ${isUnfavorable ? 'text-danger' : 'text-success'}`}>{variance.toLocaleString('fa-IR')}</td>
                                        <td className={`px-4 py-2 font-mono font-semibold ${isUnfavorable ? 'text-danger' : 'text-success'}`}>{variancePercent.toFixed(2)}%</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                        <tfoot className="font-bold bg-gray-50 dark:bg-gray-700">
                             <tr>
                                <td className="px-4 py-2">جمع کل</td>
                                {/* FIX: Explicitly type accumulator in reduce to prevent type inference issues. */}
                                <td className="px-4 py-2 font-mono">{chartData.reduce((s: number, r) => s + r.budget, 0).toLocaleString('fa-IR')}</td>
                                <td className="px-4 py-2 font-mono">{chartData.reduce((s: number, r) => s + r.actual, 0).toLocaleString('fa-IR')}</td>
                                <td className="px-4 py-2 font-mono">{chartData.reduce((s: number, r) => s + r.variance, 0).toLocaleString('fa-IR')}</td>
                                 <td className="px-4 py-2 font-mono"></td>
                            </tr>
                        </tfoot>
                    </table>
                 </div>
            </div>

        </div>
    );
};