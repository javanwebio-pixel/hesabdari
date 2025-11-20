import React, { useState, useMemo } from 'react';
import type { ProductionOrder } from '../../types';

interface ProductCostingPageProps {
    completedOrders: ProductionOrder[];
}

export const ProductCostingPage: React.FC<ProductCostingPageProps> = ({ completedOrders }) => {
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(completedOrders[0]?.id || null);

    const selectedOrder = useMemo(() => completedOrders.find(o => o.id === selectedOrderId), [completedOrders, selectedOrderId]);

    const costData = useMemo(() => {
        if (!selectedOrder) return [];
        const std = selectedOrder.standardCosts || { material: 0, labor: 0 };
        const act = selectedOrder.actualCosts || { material: 0, labor: 0 };
        return [
            { name: 'مواد اولیه', standard: std.material, actual: act.material, variance: act.material - std.material },
            { name: 'دستمزد', standard: std.labor, actual: act.labor, variance: act.labor - std.labor },
            // Add Overhead later
        ];
    }, [selectedOrder]);

    const totals = useMemo(() => {
        return costData.reduce((acc, row) => ({
            standard: acc.standard + row.standard,
            actual: acc.actual + row.actual,
            variance: acc.variance + row.variance,
        }), { standard: 0, actual: 0, variance: 0 });
    }, [costData]);


    return (
        <div className="space-y-6">
            <style>{`.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;}.dark .input-field{background-color:#374151;border-color:#4B5563}`}</style>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">بهای تمام شده تولید</h1>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <label className="mr-2">انتخاب دستور تولید:</label>
                <select value={selectedOrderId || ''} onChange={e => setSelectedOrderId(e.target.value)} className="input-field w-1/3">
                    <option value="">انتخاب کنید...</option>
                    {completedOrders.map(o => <option key={o.id} value={o.id}>PO-{o.orderNumber} ({o.goodName})</option>)}
                </select>
            </div>
            {selectedOrder && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h2 className="font-bold text-lg mb-4">گزارش بهای تمام شده دستور تولید {selectedOrder.orderNumber}</h2>
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr className="border-b"><th className="p-2 text-right">عامل هزینه</th><th className="p-2 text-right">استاندارد</th><th className="p-2 text-right">واقعی</th><th className="p-2 text-right">انحراف</th></tr>
                        </thead>
                        <tbody>
                            {costData.map(row => (
                                <tr key={row.name}>
                                    <td className="p-2 font-semibold">{row.name}</td>
                                    <td className="p-2 font-mono">{row.standard.toLocaleString('fa-IR')}</td>
                                    <td className="p-2 font-mono">{row.actual.toLocaleString('fa-IR')}</td>
                                    <td className={`p-2 font-mono ${row.variance > 0 ? 'text-danger' : 'text-success'}`}>{row.variance.toLocaleString('fa-IR')}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="font-bold bg-gray-100 dark:bg-gray-900">
                            <tr>
                                <td className="p-2">جمع کل</td>
                                <td className="p-2 font-mono">{totals.standard.toLocaleString('fa-IR')}</td>
                                <td className="p-2 font-mono">{totals.actual.toLocaleString('fa-IR')}</td>
                                <td className={`p-2 font-mono ${totals.variance > 0 ? 'text-danger' : 'text-success'}`}>{totals.variance.toLocaleString('fa-IR')}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            )}
        </div>
    );
};
