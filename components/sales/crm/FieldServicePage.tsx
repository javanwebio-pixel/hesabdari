import React, { useState, useMemo } from 'react';
import type { FieldServiceOrder, FieldServiceStatus, Party, SupportTicket, ToastData } from '../../../types';
import { IconPlusCircle } from '../../Icons';
import { Modal } from '../../common/Modal';

const statusMap: { [key in FieldServiceStatus]: { class: string } } = {
    'زمان‌بندی شده': { class: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
    'اعزام شده': { class: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' },
    'در حال انجام': { class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
    'تکمیل شده': { class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
    'لغو شده': { class: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
};

const FieldServiceFormModal: React.FC<{
    isOpen: boolean; onClose: () => void;
    onSave: (order: Omit<FieldServiceOrder, 'id' | 'orderNumber'>) => void;
    parties: Party[];
    tickets: SupportTicket[];
}> = ({ isOpen, onClose, onSave, parties, tickets }) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const customerId = formData.get('customerId') as string;
        const customer = parties.find(p => p.id === customerId);
        if (!customer) return;

        onSave({
            customerId,
            customerName: customer.name,
            ticketId: formData.get('ticketId') as string || undefined,
            address: formData.get('address') as string,
            serviceDescription: formData.get('serviceDescription') as string,
            scheduledDate: new Date(formData.get('scheduledDate') as string).toLocaleDateString('fa-IR-u-nu-latn'),
            technician: formData.get('technician') as string,
            status: 'زمان‌بندی شده',
        });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="سفارش خدمات در محل جدید">
            <form onSubmit={handleSubmit} className="space-y-4">
                <select name="customerId" required className="input-field w-full"><option value="">انتخاب مشتری...</option>{parties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
                <select name="ticketId" className="input-field w-full"><option value="">لینک به تیکت (اختیاری)...</option>{tickets.map(t => <option key={t.id} value={t.id}>#{t.ticketNumber}: {t.subject}</option>)}</select>
                <textarea name="serviceDescription" required rows={3} placeholder="شرح خدمات مورد نیاز..." className="input-field w-full"></textarea>
                <input name="address" placeholder="آدرس محل خدمت" className="input-field w-full"/>
                <div className="grid grid-cols-2 gap-4">
                    <div><label>تاریخ اعزام</label><input name="scheduledDate" type="date" required className="input-field"/></div>
                    <div><label>تکنسین</label><input name="technician" placeholder="نام تکنسین" required className="input-field"/></div>
                </div>
                <div className="flex justify-end gap-2 pt-4"><button type="button" onClick={onClose} className="btn-secondary">لغو</button><button type="submit" className="btn-primary">ایجاد سفارش</button></div>
            </form>
        </Modal>
    );
};

interface FieldServicePageProps {
    serviceOrders: FieldServiceOrder[];
    parties: Party[];
    tickets: SupportTicket[];
    onAddOrder: (order: Omit<FieldServiceOrder, 'id' | 'orderNumber'>) => void;
    onUpdateOrder: (order: FieldServiceOrder) => void;
    showToast: (message: string, type?: ToastData['type']) => void;
}

export const FieldServicePage: React.FC<FieldServicePageProps> = ({ serviceOrders, parties, tickets, onAddOrder, onUpdateOrder, showToast }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSave = (orderData: Omit<FieldServiceOrder, 'id' | 'orderNumber'>) => {
        onAddOrder(orderData);
        showToast('سفارش خدمات جدید با موفقیت ایجاد شد.');
    };
    
    return (
        <div className="space-y-6">
            <style>{`.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;width:100%}.dark .input-field{background-color:#374151;border-color:#4B5563}.btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500}.btn-secondary{padding:.5rem 1rem;background-color:#E5E7EB;color:#1F2937;border-radius:.5rem;font-weight:500}.dark .btn-secondary{background-color:#4B5563;color:#F9FAFB}`}</style>
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">مدیریت خدمات در محل</h1>
                 <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-primary-600 transition-colors">
                    <IconPlusCircle className="w-5 h-5"/> سفارش خدمات جدید
                </button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700">
                            <tr><th className="px-4 py-3">شماره</th><th className="px-4 py-3">مشتری</th><th className="px-4 py-3">شرح</th><th className="px-4 py-3">تاریخ</th><th className="px-4 py-3">تکنسین</th><th className="px-4 py-3">وضعیت</th></tr>
                        </thead>
                        <tbody>
                            {serviceOrders.map(order => (
                                <tr key={order.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-4 py-2 font-mono">{order.orderNumber}</td>
                                    <td className="px-4 py-2 font-semibold">{order.customerName}</td>
                                    <td className="px-4 py-2 max-w-xs truncate">{order.serviceDescription}</td>
                                    <td className="px-4 py-2">{order.scheduledDate}</td>
                                    <td className="px-4 py-2">{order.technician}</td>
                                    <td className="px-4 py-2"><span className={`px-2 py-1 text-xs rounded-full ${statusMap[order.status].class}`}>{order.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <FieldServiceFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} parties={parties} tickets={tickets} />
        </div>
    );
};
