

import React, { useState, useMemo, useCallback } from 'react';
import type { PurchaseRequest, PurchaseRequestStatus, ToastData, Good, PurchaseRequestLine } from '../../types';
import { IconPlusCircle, IconCheckCircle, IconXCircle, IconClock, IconFileText, IconTrash } from '../Icons';
import { Modal } from '../common/Modal';
import { SearchableSelector } from '../common/SearchableSelector';
import { v4 as uuidv4 } from 'uuid';

const statusMap: { [key in PurchaseRequestStatus]: { class: string, icon: React.ReactNode } } = {
    'پیش‌نویس': { class: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200', icon: <IconFileText className="w-4 h-4" /> },
    'در انتظار تایید': { class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', icon: <IconClock className="w-4 h-4" /> },
    'تایید شده': { class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', icon: <IconCheckCircle className="w-4 h-4" /> },
    'رد شده': { class: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', icon: <IconXCircle className="w-4 h-4" /> },
    'سفارش داده شده': { class: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', icon: <IconCheckCircle className="w-4 h-4" /> },
};

const initialLine: Omit<PurchaseRequestLine, 'id'> = { goodId: '', goodName: '', quantity: 1, requiredDate: '' };

const PurchaseRequestForm: React.FC<{
    onSave: (request: Omit<PurchaseRequest, 'id'|'requestNumber'>) => void;
    onCancel: () => void;
    goods: Good[];
}> = ({ onSave, onCancel, goods }) => {
    const [requester, setRequester] = useState('علی رضایی');
    const [requestDate, setRequestDate] = useState(new Date().toISOString().substring(0, 10));
    const [lines, setLines] = useState<PurchaseRequestLine[]>([{...initialLine, id: uuidv4()}]);

    const handleLineChange = (id: string, field: keyof PurchaseRequestLine, value: any) => {
        setLines(prev => prev.map(line => line.id === id ? {...line, [field]: value} : line));
    };

    const handleGoodSelect = (id: string, good: Good | null) => {
        setLines(prev => prev.map(line => line.id === id ? {...line, goodId: good?.id || '', goodName: good?.name || ''} : line));
    }

    const addLine = () => setLines(prev => [...prev, {...initialLine, id: uuidv4()}]);
    const removeLine = (id: string) => setLines(prev => prev.length > 1 ? prev.filter(l => l.id !== id) : prev);

    const handleSubmit = () => {
        const validLines = lines.filter(l => l.goodId && l.quantity > 0);
        if (validLines.length === 0) return;

        onSave({
            requester,
            requestDate: new Date(requestDate).toLocaleDateString('fa-IR-u-nu-latn'),
            status: 'در انتظار تایید',
            lines: validLines.map(l => ({ ...l, requiredDate: l.requiredDate ? new Date(l.requiredDate).toLocaleDateString('fa-IR-u-nu-latn') : '' })),
        });
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div><label className="label-form">درخواست کننده</label><input type="text" value={requester} onChange={e => setRequester(e.target.value)} className="input-field"/></div>
                <div><label className="label-form">تاریخ</label><input type="date" value={requestDate} onChange={e => setRequestDate(e.target.value)} className="input-field"/></div>
            </div>
            <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">اقلام درخواستی</h4>
                <div className="space-y-2">
                    {lines.map((line, index) => (
                        <div key={line.id} className="grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-6"><SearchableSelector items={goods} onSelect={item => handleGoodSelect(line.id, item as Good | null)} placeholder="جستجوی کالا..." value={line.goodId ? {id: line.goodId, name: line.goodName} : null} /></div>
                            <div className="col-span-2"><input type="number" value={line.quantity} onChange={e => handleLineChange(line.id, 'quantity', Number(e.target.value))} className="input-field text-center" /></div>
                            <div className="col-span-3"><input type="date" value={line.requiredDate} onChange={e => handleLineChange(line.id, 'requiredDate', e.target.value)} className="input-field" /></div>
                            <div className="col-span-1 text-center"><button onClick={() => removeLine(line.id)} className="text-danger p-1"><IconTrash className="w-4 h-4"/></button></div>
                        </div>
                    ))}
                </div>
                <button onClick={addLine} className="btn-secondary text-xs mt-2">افزودن سطر</button>
            </div>
            <div className="flex justify-end gap-2 pt-4"><button type="button" onClick={onCancel} className="btn-secondary">لغو</button><button type="button" onClick={handleSubmit} className="btn-primary">ارسال برای تایید</button></div>
        </div>
    );
}

interface PurchaseRequestPageProps {
    purchaseRequests: PurchaseRequest[];
    goods: Good[];
    onAddRequest: (request: Omit<PurchaseRequest, 'id'|'requestNumber'>) => void;
    showToast: (message: string, type?: ToastData['type']) => void;
}

export const PurchaseRequestPage: React.FC<PurchaseRequestPageProps> = ({ purchaseRequests, goods, onAddRequest, showToast }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSave = (requestData: Omit<PurchaseRequest, 'id'|'requestNumber'>) => {
        onAddRequest(requestData);
        showToast('درخواست خرید جدید ثبت و برای تایید ارسال شد.');
        setIsModalOpen(false);
    }

    return (
        <div className="space-y-6">
             <style>{`.label-form{display:block;font-size:.875rem;font-weight:500;color:#374151;margin-bottom:.25rem}.dark .label-form{color:#D1D5DB}.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;width:100%}.dark .input-field{background-color:#374151;border-color:#4B5563}.btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500}.btn-secondary{padding:.5rem 1rem;background-color:#E5E7EB;color:#1F2937;border-radius:.5rem;font-weight:500}.dark .btn-secondary{background-color:#4B5563;color:#F9FAFB}`}</style>
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">درخواست‌های خرید</h1>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-primary-600 transition-colors">
                    <IconPlusCircle className="w-5 h-5"/> درخواست جدید
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-3">شماره</th><th className="px-4 py-3">درخواست کننده</th><th className="px-4 py-3">تاریخ</th><th className="px-4 py-3">وضعیت</th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchaseRequests.map(req => (
                                <tr key={req.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-4 py-2 font-mono">{req.requestNumber}</td>
                                    <td className="px-4 py-2 font-semibold">{req.requester}</td>
                                    <td className="px-4 py-2">{req.requestDate}</td>
                                    <td className="px-4 py-2">
                                        <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${statusMap[req.status].class}`}>
                                            {statusMap[req.status].icon} {req.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="درخواست خرید جدید">
                <PurchaseRequestForm onSave={handleSave} onCancel={() => setIsModalOpen(false)} goods={goods} />
            </Modal>
        </div>
    );
};