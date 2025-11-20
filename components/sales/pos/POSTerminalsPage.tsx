import React, { useState, useCallback } from 'react';
import type { POSTerminal, ToastData } from '../../../types';
import { IconPlusCircle, IconEdit, IconTrash } from '../../Icons';
import { Modal } from '../../common/Modal';
import { v4 as uuidv4 } from 'uuid';

const TerminalForm: React.FC<{
    onSave: (terminal: Omit<POSTerminal, 'id'> | POSTerminal) => void;
    onCancel: () => void;
    initialData?: POSTerminal | null;
}> = ({ onSave, onCancel, initialData }) => {
    const isEditing = !!initialData;
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        location: initialData?.location || '',
        defaultCashAccountId: initialData?.defaultCashAccountId || '1104',
        defaultBankAccountId: initialData?.defaultBankAccountId || '1101',
        defaultSalesAccountId: initialData?.defaultSalesAccountId || '4101',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        if (isEditing) {
            onSave({ ...initialData!, ...formData });
        } else {
            onSave(formData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="label-form">نام ترمینال</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="input-field" />
            </div>
            <div>
                <label className="label-form">موقعیت</label>
                <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="input-field" />
            </div>
             <div className="border-t pt-4">
                <h4 className="font-semibold text-sm mb-2">حساب‌های پیش‌فرض GL</h4>
                 <div className="space-y-2">
                    <div>
                        <label className="label-form text-xs">حساب صندوق (برای وجوه نقد)</label>
                        <input type="text" value={formData.defaultCashAccountId} onChange={e => setFormData({...formData, defaultCashAccountId: e.target.value})} required className="input-field font-mono" />
                    </div>
                     <div>
                        <label className="label-form text-xs">حساب بانک (برای کارتخوان)</label>
                        <input type="text" value={formData.defaultBankAccountId} onChange={e => setFormData({...formData, defaultBankAccountId: e.target.value})} required className="input-field font-mono" />
                    </div>
                     <div>
                        <label className="label-form text-xs">حساب درآمد فروش</label>
                        <input type="text" value={formData.defaultSalesAccountId} onChange={e => setFormData({...formData, defaultSalesAccountId: e.target.value})} required className="input-field font-mono" />
                    </div>
                 </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={onCancel} className="btn-secondary">لغو</button>
                <button type="submit" className="btn-primary">ذخیره</button>
            </div>
        </form>
    );
};


interface POSTerminalsPageProps {
    terminals: POSTerminal[];
    setTerminals: React.Dispatch<React.SetStateAction<POSTerminal[]>>;
    showToast: (message: string, type?: ToastData['type']) => void;
}

export const POSTerminalsPage: React.FC<POSTerminalsPageProps> = ({ terminals, setTerminals, showToast }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTerminal, setEditingTerminal] = useState<POSTerminal | null>(null);
    
    const handleSave = useCallback((terminalData: Omit<POSTerminal, 'id'> | POSTerminal) => {
        if ('id' in terminalData) {
            setTerminals(prev => prev.map(t => t.id === terminalData.id ? terminalData : t));
            showToast('ترمینال با موفقیت ویرایش شد.');
        } else {
            setTerminals(prev => [...prev, { id: uuidv4(), ...terminalData }]);
            showToast('ترمینال جدید با موفقیت ایجاد شد.');
        }
        setIsModalOpen(false);
    }, [setTerminals, showToast]);

    const handleEdit = (terminal: POSTerminal) => {
        setEditingTerminal(terminal);
        setIsModalOpen(true);
    };
    
    const handleDelete = (id: string) => {
        if(window.confirm('آیا از حذف این ترمینال اطمینان دارید؟')) {
             setTerminals(prev => prev.filter(t => t.id !== id));
             showToast('ترمینال حذف شد.');
        }
    };

    return (
        <div className="space-y-6">
            <style>{`.label-form{display:block;font-size:.875rem;font-weight:500;color:#374151;margin-bottom:.25rem}.dark .label-form{color:#D1D5DB}.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;width:100%}.dark .input-field{background-color:#374151;border-color:#4B5563}.input-field:focus{outline:2px solid transparent;outline-offset:2px;--tw-ring-color:hsl(262 83% 58%);box-shadow:0 0 0 2px var(--tw-ring-color)}.btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500;transition:all .2s}.btn-primary:hover:not(:disabled){background-color:hsl(262 75% 52%)}.btn-secondary{padding:.5rem 1rem;background-color:#E5E7EB;color:#1F2937;border-radius:.5rem;font-weight:500}.dark .btn-secondary{background-color:#4B5563;color:#F9FAFB}`}</style>
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">مدیریت صندوق‌های فروش (POS)</h1>
                <button onClick={() => { setEditingTerminal(null); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2">
                    <IconPlusCircle className="w-5 h-5"/> تعریف صندوق جدید
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-3">نام صندوق</th>
                                <th className="px-4 py-3">موقعیت</th>
                                <th className="px-4 py-3">حساب صندوق</th>
                                <th className="px-4 py-3">حساب بانک</th>
                                <th className="px-4 py-3">عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {terminals.map(term => (
                                <tr key={term.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-4 py-2 font-semibold">{term.name}</td>
                                    <td className="px-4 py-2">{term.location}</td>
                                    <td className="px-4 py-2 font-mono">{term.defaultCashAccountId}</td>
                                    <td className="px-4 py-2 font-mono">{term.defaultBankAccountId}</td>
                                    <td className="px-4 py-2">
                                        <button onClick={() => handleEdit(term)} className="p-1 text-blue-500 hover:text-blue-600"><IconEdit className="w-4 h-4"/></button>
                                        <button onClick={() => handleDelete(term.id)} className="p-1 text-danger hover:text-red-600"><IconTrash className="w-4 h-4"/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTerminal ? 'ویرایش صندوق فروش' : 'تعریف صندوق فروش جدید'}>
                <TerminalForm onSave={handleSave} onCancel={() => setIsModalOpen(false)} initialData={editingTerminal} />
            </Modal>
        </div>
    );
};
