import React, { useState, useMemo } from 'react';
import type { MaintenanceOrder, MaintenanceObject } from '../../../types';
import { IconPlusCircle } from '../../Icons';
import { Modal } from '../../common/Modal';

const OrderForm: React.FC<{
    onSave: (data: Omit<MaintenanceOrder, 'id' | 'orderNumber' | 'status' | 'creationDate'>) => void;
    onCancel: () => void;
    objects: MaintenanceObject[];
}> = ({ onSave, onCancel, objects }) => {
    const [formData, setFormData] = useState({
        objectId: '',
        description: '',
        type: 'Corrective' as 'Corrective' | 'Preventive',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const object = objects.find(o => o.id === formData.objectId);
        if (!object) return;
        onSave({ ...formData, objectName: object.name });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="label-form">تجهیز/ماشین</label>
                <select value={formData.objectId} onChange={e => setFormData({...formData, objectId: e.target.value})} required className="input-field">
                    <option value="" disabled>انتخاب کنید...</option>
                    {objects.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
            </div>
            <div>
                <label className="label-form">شرح مشکل/کار</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required className="input-field" rows={3}></textarea>
            </div>
            <div>
                <label className="label-form">نوع دستور کار</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})} className="input-field">
                    <option value="Corrective">اصلاحی (خرابی)</option>
                    <option value="Preventive">پیشگیرانه</option>
                </select>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                <button type="button" onClick={onCancel} className="btn-secondary">لغو</button>
                <button type="submit" className="btn-primary">ایجاد دستور کار</button>
            </div>
        </form>
    );
};

interface MaintenanceOrdersPageProps {
    orders: MaintenanceOrder[];
    objects: MaintenanceObject[];
    onSave: (data: Omit<MaintenanceOrder, 'id' | 'orderNumber' | 'status' | 'creationDate'>) => void;
}

export const MaintenanceOrdersPage: React.FC<MaintenanceOrdersPageProps> = ({ orders, objects, onSave }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSave = (data: Omit<MaintenanceOrder, 'id' | 'orderNumber' | 'status' | 'creationDate'>) => {
        onSave(data);
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <style>{`.label-form{display:block;font-size:.875rem;font-weight:500;color:#374151;margin-bottom:.25rem}.dark .label-form{color:#D1D5DB}.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;width:100%}.dark .input-field{background-color:#374151;border-color:#4B5563}.btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500}.btn-secondary{padding:.5rem 1rem;background-color:#E5E7EB;color:#1F2937;border-radius:.5rem;font-weight:500}.dark .btn-secondary{background-color:#4B5563;color:#F9FAFB}`}</style>
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">دستورکارهای تعمیراتی</h1>
                <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
                    <IconPlusCircle className="w-5 h-5"/> دستور کار جدید
                </button>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <table className="w-full text-sm text-right">
                    <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-4 py-3">شماره</th>
                            <th className="px-4 py-3">تجهیز</th>
                            <th className="px-4 py-3">شرح</th>
                            <th className="px-4 py-3">تاریخ</th>
                            <th className="px-4 py-3">وضعیت</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.id} className="border-b dark:border-gray-700">
                                <td className="px-4 py-2 font-mono">{order.orderNumber}</td>
                                <td className="px-4 py-2 font-semibold">{order.objectName}</td>
                                <td className="px-4 py-2">{order.description}</td>
                                <td className="px-4 py-2">{order.creationDate}</td>
                                <td className="px-4 py-2"><span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">{order.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="دستور کار جدید">
                <OrderForm onSave={handleSave} onCancel={() => setIsModalOpen(false)} objects={objects} />
            </Modal>
        </div>
    );
};
