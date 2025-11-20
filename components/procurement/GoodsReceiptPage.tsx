

import React, { useState, useMemo, useCallback } from 'react';
import type { GoodsReceipt, PurchaseOrder, Good, ToastData, GoodsReceiptLine } from '../../types';
import { IconPlusCircle } from '../Icons';
import { Modal } from '../common/Modal';
import { v4 as uuidv4 } from 'uuid';

const GoodsReceiptForm: React.FC<{
    onSave: (receipt: Omit<GoodsReceipt, 'id'|'receiptNumber'>) => void;
    onCancel: () => void;
    purchaseOrders: PurchaseOrder[];
}> = ({ onSave, onCancel, purchaseOrders }) => {
    const [selectedPOId, setSelectedPOId] = useState('');
    const [receiptDate, setReceiptDate] = useState(new Date().toISOString().substring(0, 10));
    const [lines, setLines] = useState<Omit<GoodsReceiptLine, 'id'>[]>([]);

    const openPOs = useMemo(() => purchaseOrders.filter(po => po.status === 'باز' || po.status === 'دریافت قسمتی'), [purchaseOrders]);

    const handlePOChange = (poId: string) => {
        setSelectedPOId(poId);
        const order = purchaseOrders.find(po => po.id === poId);
        if(order) {
            setLines(order.lines.map(line => ({
                goodId: line.goodId,
                goodName: line.goodName,
                quantityOrdered: line.quantity,
                quantityReceived: line.quantity, // Default to full receipt
            })));
        } else {
            setLines([]);
        }
    };

    const handleLineChange = (goodId: string, quantity: number) => {
        setLines(prev => prev.map(line => line.goodId === goodId ? {...line, quantityReceived: quantity} : line));
    };

    const handleSubmit = () => {
        if (!selectedPOId || lines.length === 0) return;
        onSave({
            purchaseOrderId: selectedPOId,
            receiptDate: new Date(receiptDate).toLocaleDateString('fa-IR-u-nu-latn'),
            lines: lines.map(l => ({...l, id: uuidv4()})),
        });
    };
    
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="label-form">بر اساس سفارش خرید</label>
                    <select value={selectedPOId} onChange={e => handlePOChange(e.target.value)} className="input-field">
                        <option value="">انتخاب کنید...</option>
                        {openPOs.map(po => <option key={po.id} value={po.id}>PO-{po.poNumber} ({po.supplierName})</option>)}
                    </select>
                </div>
                <div>
                    <label className="label-form">تاریخ رسید</label>
                    <input type="date" value={receiptDate} onChange={e => setReceiptDate(e.target.value)} className="input-field" />
                </div>
            </div>
            {lines.length > 0 && (
                <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">اقلام دریافتی</h4>
                     <table className="w-full text-sm">
                        <thead><tr><th className="text-right p-1">کالا</th><th className="text-right p-1">تعداد سفارش</th><th className="text-right p-1">تعداد دریافتی</th></tr></thead>
                        <tbody>
                            {lines.map(line => (
                                <tr key={line.goodId}>
                                    <td className="p-1">{line.goodName}</td>
                                    <td className="p-1">{line.quantityOrdered}</td>
                                    <td className="p-1"><input type="number" value={line.quantityReceived} onChange={e => handleLineChange(line.goodId, Number(e.target.value))} className="input-field w-24"/></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <div className="flex justify-end gap-2 pt-4"><button type="button" onClick={onCancel} className="btn-secondary">لغو</button><button type="button" onClick={handleSubmit} className="btn-primary">ثبت رسید</button></div>
        </div>
    );
};


interface GoodsReceiptPageProps {
    goodsReceipts: GoodsReceipt[];
    purchaseOrders: PurchaseOrder[];
    goods: Good[];
    onAddReceipt: (receipt: Omit<GoodsReceipt, 'id'|'receiptNumber'>) => void;
    showToast: (message: string, type?: ToastData['type']) => void;
}

export const GoodsReceiptPage: React.FC<GoodsReceiptPageProps> = ({ goodsReceipts, purchaseOrders, goods, onAddReceipt, showToast }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const handleSave = (receiptData: Omit<GoodsReceipt, 'id'|'receiptNumber'>) => {
        onAddReceipt(receiptData);
        // Toast is shown in App.tsx after state updates
        setIsModalOpen(false);
    };
    
    return (
        <div className="space-y-6">
            <style>{`.label-form{display:block;font-size:.875rem;font-weight:500;color:#374151;margin-bottom:.25rem}.dark .label-form{color:#D1D5DB}.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;width:100%}.dark .input-field{background-color:#374151;border-color:#4B5563}.btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500}.btn-secondary{padding:.5rem 1rem;background-color:#E5E7EB;color:#1F2937;border-radius:.5rem;font-weight:500}.dark .btn-secondary{background-color:#4B5563;color:#F9FAFB}`}</style>
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">ورود کالا به انبار (رسید)</h1>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-primary-600 transition-colors">
                    <IconPlusCircle className="w-5 h-5"/> ثبت رسید جدید
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-3">شماره رسید</th><th className="px-4 py-3">شماره PO مرجع</th><th className="px-4 py-3">تاریخ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {goodsReceipts.map(gr => (
                                <tr key={gr.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-4 py-2 font-mono">{gr.receiptNumber}</td>
                                    <td className="px-4 py-2 font-mono">{purchaseOrders.find(po=>po.id === gr.purchaseOrderId)?.poNumber}</td>
                                    <td className="px-4 py-2">{gr.receiptDate}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="رسید کالای جدید">
                 <GoodsReceiptForm onSave={handleSave} onCancel={() => setIsModalOpen(false)} purchaseOrders={purchaseOrders} />
            </Modal>
        </div>
    );
};