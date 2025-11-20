
import React, { useState, useMemo } from 'react';
import type { Stocktake, StocktakeStatus, Good, ToastData } from '../../types';
import { IconPlusCircle, IconDeviceFloppy } from '../Icons';
import { Modal } from '../common/Modal';

const statusMap: { [key in StocktakeStatus]: { class: string } } = {
    'شمارش نشده': { class: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' },
    'در حال شمارش': { class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
    'شمارش شده': { class: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
    'ثبت شده': { class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
};

interface InventoryStocktakingPageProps {
    stocktakes: Stocktake[];
    goods: Good[];
    onAddStocktake: (stocktake: Omit<Stocktake, 'id'|'documentNumber'>) => void;
    onPostStocktake: (id: string, lines: Stocktake['lines']) => void;
    showToast: (message: string, type?: ToastData['type']) => void;
}

export const InventoryStocktakingPage: React.FC<InventoryStocktakingPageProps> = ({ stocktakes, goods, onAddStocktake, onPostStocktake, showToast }) => {
    const [viewingStocktake, setViewingStocktake] = useState<Stocktake | null>(null);

    const handleCreateStocktake = () => {
        onAddStocktake({
            countDate: new Date().toLocaleDateString('fa-IR-u-nu-latn'),
            status: 'شمارش نشده',
            lines: goods.map(g => ({
                id: g.id,
                goodId: g.id,
                goodName: g.name,
                bookQuantity: g.stock,
                countedQuantity: null,
            }))
        });
        showToast('سند انبارگردانی جدید ایجاد شد.');
    };
    
    const handleCountChange = (lineId: string, count: number) => {
        if (!viewingStocktake) return;
        
        const updatedLines = viewingStocktake.lines.map(l => l.id === lineId ? {...l, countedQuantity: count} : l);
        setViewingStocktake({...viewingStocktake, lines: updatedLines});
    };

    const handleSaveCounts = () => {
        if (!viewingStocktake) return;
        // In a real app, this would save the counts to the backend.
        // Here we just update the local viewing copy.
        const allCounted = viewingStocktake.lines.every(l => l.countedQuantity !== null);
        if (allCounted) {
             setViewingStocktake({...viewingStocktake, status: 'شمارش شده'});
        } else {
             setViewingStocktake({...viewingStocktake, status: 'در حال شمارش'});
        }
        showToast('شمارش ثبت شد.');
    };

    const handlePost = () => {
        if (viewingStocktake?.status !== 'شمارش شده') {
             showToast('ابتدا باید شمارش تمام اقلام را ثبت کنید.', 'error');
             return;
        }
        onPostStocktake(viewingStocktake.id, viewingStocktake.lines);
        setViewingStocktake(null);
    }
    
    return (
        <div className="space-y-6">
            <style>{`.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;width:100%}.dark .input-field{background-color:#374151;border-color:#4B5563}.btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500}.btn-secondary{padding:.5rem 1rem;background-color:#E5E7EB;color:#1F2937;border-radius:.5rem;font-weight:500}.dark .btn-secondary{background-color:#4B5563;color:#F9FAFB}`}</style>
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">انبارگردانی</h1>
                <button onClick={handleCreateStocktake} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-primary-600 transition-colors">
                    <IconPlusCircle className="w-5 h-5"/> شروع انبارگردانی جدید
                </button>
            </div>
             <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-3">شماره سند</th><th className="px-4 py-3">تاریخ شمارش</th><th className="px-4 py-3">وضعیت</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stocktakes.map(st => (
                                <tr key={st.id} onClick={() => setViewingStocktake(st)} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer">
                                    <td className="px-4 py-2 font-mono">{st.documentNumber}</td>
                                    <td className="px-4 py-2">{st.countDate}</td>
                                    <td className="px-4 py-2">
                                        <span className={`px-2 py-1 text-xs rounded-full ${statusMap[st.status].class}`}>{st.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {viewingStocktake && (
                <Modal isOpen={!!viewingStocktake} onClose={() => setViewingStocktake(null)} title={`شمارش انبار - سند شماره ${viewingStocktake.documentNumber}`}>
                    <div className="space-y-4">
                        <div className="overflow-auto max-h-80">
                            <table className="w-full text-sm">
                                <thead><tr><th className="text-right p-1">کالا</th><th className="text-right p-1">موجودی سیستم</th><th className="text-right p-1 w-32">تعداد شمارش شده</th><th className="text-right p-1">مغایرت</th></tr></thead>
                                <tbody>
                                    {viewingStocktake.lines.map(l => {
                                        const diff = (l.countedQuantity ?? l.bookQuantity) - l.bookQuantity;
                                        return (
                                        <tr key={l.id} className="border-t dark:border-gray-700">
                                            <td className="p-2">{l.goodName}</td>
                                            <td className="p-2 font-mono">{l.bookQuantity}</td>
                                            <td className="p-2"><input type="number" value={l.countedQuantity ?? ''} onChange={e => handleCountChange(l.id, Number(e.target.value))} className="input-field w-full" disabled={viewingStocktake.status === 'ثبت شده'}/></td>
                                            <td className={`p-2 font-mono font-bold ${diff < 0 ? 'text-danger' : (diff > 0 ? 'text-success' : '')}`}>{diff}</td>
                                        </tr>
                                    )})}
                                </tbody>
                            </table>
                        </div>
                         <div className="flex justify-between items-center pt-4 border-t dark:border-gray-700">
                            <button onClick={() => setViewingStocktake(null)} className="btn-secondary">بستن</button>
                            {viewingStocktake.status !== 'ثبت شده' && (
                                <div className="flex gap-2">
                                    <button onClick={handleSaveCounts} className="btn-secondary">ذخیره شمارش</button>
                                    <button onClick={handlePost} disabled={viewingStocktake.status !== 'شمارش شده'} className="btn-primary flex items-center gap-2">
                                       <IconDeviceFloppy className="w-5 h-5"/> ثبت نهایی مغایرت
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};
