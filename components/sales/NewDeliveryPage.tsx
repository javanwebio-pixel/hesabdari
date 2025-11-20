
import React, { useState, useMemo } from 'react';
import type { SalesOrder, DeliveryNote, DeliveryNoteLine, ToastData, Good } from '../../types';
import { IconChevronRight, IconDeviceFloppy } from '../Icons';
import { v4 as uuidv4 } from 'uuid';

interface NewDeliveryPageProps {
    onNavigate: (page: string) => void;
    addDeliveryNote: (delivery: Omit<DeliveryNote, 'id' | 'deliveryNumber'>) => void;
    showToast: (message: string, type?: ToastData['type']) => void;
    salesOrders: SalesOrder[];
    goods: Good[];
}

export const NewDeliveryPage: React.FC<NewDeliveryPageProps> = ({ onNavigate, addDeliveryNote, showToast, salesOrders, goods }) => {
    const [selectedOrderId, setSelectedOrderId] = useState<string>('');
    const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().substring(0, 10));
    const [lines, setLines] = useState<DeliveryNoteLine[]>([]);

    const selectedOrder = useMemo(() => salesOrders.find(o => o.id === selectedOrderId), [salesOrders, selectedOrderId]);

    const handleOrderChange = (orderId: string) => {
        const order = salesOrders.find(o => o.id === orderId);
        if (order) {
            setSelectedOrderId(orderId);
            setLines(order.lines.map(l => {
                const good = goods.find(g => g.code === l.itemCode);
                return {
                    id: uuidv4(),
                    goodId: good?.id || '',
                    goodName: l.itemName,
                    quantityOrdered: l.quantity,
                    quantityShipped: l.quantity, // Default to full shipment
                }
            }));
        } else {
            setSelectedOrderId('');
            setLines([]);
        }
    };

    const handleLineChange = (id: string, value: number) => {
        setLines(prev => prev.map(l => l.id === id ? { ...l, quantityShipped: Math.max(0, Math.min(value, l.quantityOrdered)) } : l));
    };

    const handleSave = () => {
        if (!selectedOrder || lines.every(l => l.quantityShipped <= 0)) {
            showToast('لطفا یک سفارش و حداقل یک آیتم برای ارسال انتخاب کنید.', 'error');
            return;
        }

        const newDelivery: Omit<DeliveryNote, 'id' | 'deliveryNumber'> = {
            orderId: selectedOrder.id,
            deliveryDate: new Date(deliveryDate).toLocaleDateString('fa-IR-u-nu-latn'),
            lines: lines.filter(l => l.quantityShipped > 0),
            status: 'ارسال شده',
        };
        addDeliveryNote(newDelivery);
        // Toast is shown in addDeliveryNote
        onNavigate('dashboard');
    };

    return (
        <div className="space-y-6">
             <style>{`.label-form{display:block;font-size:.875rem;font-weight:500;color:#374151;margin-bottom:.25rem}.dark .label-form{color:#D1D5DB}.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;width:100%}.dark .input-field{background-color:#374151;border-color:#4B5563}.btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500;transition:all .2s}.btn-secondary{padding:.5rem 1rem;background-color:#E5E7EB;color:#1F2937;border-radius:.5rem;font-weight:500}.dark .btn-secondary{background-color:#4B5563;color:#F9FAFB}`}</style>
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">حواله خروج کالا (ارسال)</h1>
                <button onClick={() => onNavigate('dashboard')} className="btn-secondary flex items-center gap-2"><IconChevronRight className="w-5 h-5" /><span>بازگشت</span></button>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                        <label className="label-form">بر اساس سفارش فروش</label>
                        <select onChange={e => handleOrderChange(e.target.value)} value={selectedOrderId} className="input-field">
                            <option value="">انتخاب سفارش...</option>
                            {salesOrders.filter(o=>o.status==='باز').map(o => <option key={o.id} value={o.id}>{o.orderNumber} ({o.customerName})</option>)}
                        </select>
                    </div>
                    {selectedOrder && <>
                        <div>
                            <label className="label-form">مشتری</label>
                            <input type="text" readOnly value={selectedOrder.customerName} className="input-field bg-gray-100 dark:bg-gray-700" />
                        </div>
                        <div>
                            <label className="label-form">تاریخ ارسال</label>
                            <input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} className="input-field" />
                        </div>
                    </>}
                </div>

                {selectedOrder && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-right">
                            <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase"><tr><th className="p-2 font-medium">کالا</th><th className="p-2 font-medium">موجودی فعلی</th><th className="p-2 font-medium">تعداد سفارش</th><th className="p-2 font-medium">تعداد ارسالی</th></tr></thead>
                            <tbody>
                                {lines.map(line => {
                                    const good = goods.find(g => g.id === line.goodId);
                                    return (
                                    <tr key={line.id} className="border-b dark:border-gray-700">
                                        <td className="p-2 font-semibold">{line.goodName}</td>
                                        <td className="p-2 font-mono">{good?.stock ?? 'N/A'}</td>
                                        <td className="p-2 font-mono">{line.quantityOrdered}</td>
                                        <td className="p-2"><input type="number" value={line.quantityShipped} onChange={e => handleLineChange(line.id, Number(e.target.value))} className="input-field w-24"/></td>
                                    </tr>
                                )})}
                            </tbody>
                        </table>
                    </div>
                )}

                {selectedOrder && (
                     <div className="flex justify-end pt-4 mt-4 border-t dark:border-gray-700">
                        <button onClick={handleSave} className="btn-primary flex items-center gap-2"><IconDeviceFloppy/>ثبت خروج کالا</button>
                    </div>
                )}
            </div>
        </div>
    );
};
