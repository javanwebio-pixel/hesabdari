

import React, { useState, useMemo, useCallback } from 'react';
import type { PurchaseOrder, PurchaseOrderStatus, PurchaseRequest, Party, Good, ToastData, PurchaseOrderLine } from '../../types';
import { IconPlusCircle } from '../Icons';
import { Modal } from '../common/Modal';
import { SearchableSelector } from '../common/SearchableSelector';
import { v4 as uuidv4 } from 'uuid';

const statusMap: { [key in PurchaseOrderStatus]: { class: string } } = {
    'باز': { class: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
    'دریافت قسمتی': { class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
    'دریافت کامل': { class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
    'فاکتور شده': { class: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' },
    'بسته': { class: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' },
};

const PurchaseOrderForm: React.FC<{
    onSave: (order: Omit<PurchaseOrder, 'id'|'poNumber'>) => void;
    onCancel: () => void;
    purchaseRequests: PurchaseRequest[];
    suppliers: Party[];
    goods: Good[];
}> = ({ onSave, onCancel, purchaseRequests, suppliers, goods }) => {
    const [selectedPRId, setSelectedPRId] = useState<string>('');
    const [selectedSupplier, setSelectedSupplier] = useState<Party | null>(null);
    const [orderDate, setOrderDate] = useState(new Date().toISOString().substring(0, 10));
    const [lines, setLines] = useState<PurchaseOrderLine[]>([]);

    const approvedRequests = useMemo(() => purchaseRequests.filter(pr => pr.status === 'تایید شده'), [purchaseRequests]);

    const handlePRChange = (prId: string) => {
        setSelectedPRId(prId);
        const request = purchaseRequests.find(pr => pr.id === prId);
        if(request) {
            setLines(request.lines.map(line => {
                const good = goods.find(g => g.id === line.goodId);
                const price = good?.purchasePrice || 0;
                return {
                    id: uuidv4(),
                    goodId: line.goodId,
                    goodName: line.goodName,
                    quantity: line.quantity,
                    price: price,
                    total: line.quantity * price
                }
            }));
        } else {
            setLines([]);
        }
    }
    
    const totalAmount = useMemo(() => lines.reduce((sum, line) => sum + line.total, 0), [lines]);

    const handleSubmit = () => {
        if (!selectedPRId || !selectedSupplier || lines.length === 0) {
            return;
        }

        onSave({
            supplierId: selectedSupplier.id,
            supplierName: selectedSupplier.name,
            orderDate: new Date(orderDate).toLocaleDateString('fa-IR-u-nu-latn'),
            deliveryDate: '', // Can add a field for this
            status: 'باز',
            purchaseRequestId: selectedPRId,
            lines,
            totalAmount
        });
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="label-form">بر اساس درخواست خرید</label>
                    <select value={selectedPRId} onChange={e => handlePRChange(e.target.value)} className="input-field">
                        <option value="">انتخاب کنید...</option>
                        {approvedRequests.map(pr => <option key={pr.id} value={pr.id}>PR-{pr.requestNumber} ({pr.requester})</option>)}
                    </select>
                </div>
                <div>
                    <label className="label-form">تامین کننده</label>
                    <SearchableSelector items={suppliers} onSelect={item => setSelectedSupplier(item as Party | null)} placeholder="جستجوی تامین کننده..." value={selectedSupplier} />
                </div>
            </div>
            {lines.length > 0 && (
                 <div className="border-t pt-4">
                     <h4 className="font-semibold mb-2">اقلام سفارش</h4>
                     <table className="w-full text-sm">
                        <thead><tr><th className="text-right p-1">کالا</th><th className="text-right p-1">تعداد</th><th className="text-right p-1">قیمت</th><th className="text-right p-1">جمع</th></tr></thead>
                        <tbody>
                            {lines.map(line => (
                                <tr key={line.id}>
                                    <td className="p-1">{line.goodName}</td>
                                    <td className="p-1">{line.quantity}</td>
                                    <td className="p-1 font-mono">{line.price.toLocaleString('fa-IR')}</td>
                                    <td className="p-1 font-mono">{line.total.toLocaleString('fa-IR')}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot><tr><td colSpan={3} className="text-left font-bold p-2">جمع کل:</td><td className="font-bold font-mono p-2">{totalAmount.toLocaleString('fa-IR')}</td></tr></tfoot>
                    </table>
                 </div>
            )}
            <div className="flex justify-end gap-2 pt-4"><button type="button" onClick={onCancel} className="btn-secondary">لغو</button><button type="button" onClick={handleSubmit} className="btn-primary">ایجاد سفارش</button></div>
        </div>
    );
}

interface PurchaseOrderPageProps {
    purchaseOrders: PurchaseOrder[];
    purchaseRequests: PurchaseRequest[];
    suppliers: Party[];
    goods: Good[];
    onAddOrder: (order: Omit<PurchaseOrder, 'id'|'poNumber'>) => void;
    showToast: (message: string, type?: ToastData['type']) => void;
}

export const PurchaseOrderPage: React.FC<PurchaseOrderPageProps> = ({ purchaseOrders, purchaseRequests, suppliers, goods, onAddOrder, showToast }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSave = (orderData: Omit<PurchaseOrder, 'id'|'poNumber'>) => {
        onAddOrder(orderData);
        // Toast is shown in App.tsx
        setIsModalOpen(false);
    }
    
    return (
        <div className="space-y-6">
             <style>{`.label-form{display:block;font-size:.875rem;font-weight:500;color:#374151;margin-bottom:.25rem}.dark .label-form{color:#D1D5DB}.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;width:100%}.dark .input-field{background-color:#374151;border-color:#4B5563}.btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500}.btn-secondary{padding:.5rem 1rem;background-color:#E5E7EB;color:#1F2937;border-radius:.5rem;font-weight:500}.dark .btn-secondary{background-color:#4B5563;color:#F9FAFB}`}</style>
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">سفارشات خرید (PO)</h1>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-primary-600 transition-colors">
                    <IconPlusCircle className="w-5 h-5"/> سفارش جدید
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-3">شماره PO</th><th className="px-4 py-3">تامین کننده</th><th className="px-4 py-3">تاریخ</th><th className="px-4 py-3">مبلغ کل</th><th className="px-4 py-3">وضعیت</th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchaseOrders.map(po => (
                                <tr key={po.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-4 py-2 font-mono">{po.poNumber}</td>
                                    <td className="px-4 py-2 font-semibold">{po.supplierName}</td>
                                    <td className="px-4 py-2">{po.orderDate}</td>
                                    <td className="px-4 py-2 font-mono">{po.totalAmount.toLocaleString('fa-IR')}</td>
                                    <td className="px-4 py-2">
                                        <span className={`px-2 py-1 text-xs rounded-full ${statusMap[po.status].class}`}>
                                            {po.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="سفارش خرید جدید">
                 <PurchaseOrderForm onSave={handleSave} onCancel={() => setIsModalOpen(false)} purchaseRequests={purchaseRequests} suppliers={suppliers} goods={goods} />
            </Modal>
        </div>
    );
};