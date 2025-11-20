import React, { useState } from 'react';
import type { Bank } from '../../types';
import { IconPlusCircle, IconEdit, IconTrash } from '../Icons';
import { Modal } from '../common/Modal';
import { v4 as uuidv4 } from 'uuid';

const BankForm: React.FC<{
    onSave: (bank: Omit<Bank, 'id'> | Bank) => void;
    onCancel: () => void;
    initialData?: Bank | null;
}> = ({ onSave, onCancel, initialData }) => {
    const isEditing = !!initialData;
    const [formData, setFormData] = useState({
        code: initialData?.code || '',
        name: initialData?.name || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.code.trim()) return;

        if (isEditing) {
            onSave({ ...initialData!, ...formData });
        } else {
            onSave({ id: uuidv4(), ...formData });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="label-form">کد بانک</label>
                    <input type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} required className="input-field" />
                </div>
                <div>
                    <label className="label-form">نام بانک</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="input-field" />
                </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                <button type="button" onClick={onCancel} className="btn-secondary">لغو</button>
                <button type="submit" className="btn-primary">ذخیره</button>
            </div>
        </form>
    );
};

interface BanksPageProps {
    banks: Bank[];
    onSave: (bank: Omit<Bank, 'id'> | Bank) => void;
    onDelete: (id: string) => void;
}

export const BanksPage: React.FC<BanksPageProps> = ({ banks, onSave, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBank, setEditingBank] = useState<Bank | null>(null);

    const handleSave = (data: Omit<Bank, 'id'> | Bank) => {
        onSave(data);
        setIsModalOpen(false);
    };

    const handleEdit = (bank: Bank) => {
        setEditingBank(bank);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <style>{`.label-form{display:block;font-size:.875rem;font-weight:500;color:#374151;margin-bottom:.25rem}.dark .label-form{color:#D1D5DB}.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;width:100%}.dark .input-field{background-color:#374151;border-color:#4B5563}.input-field:focus{outline:2px solid transparent;outline-offset:2px;--tw-ring-color:hsl(262 83% 58%);box-shadow:0 0 0 2px var(--tw-ring-color)}.btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500}.btn-secondary{padding:.5rem 1rem;background-color:#E5E7EB;color:#1F2937;border-radius:.5rem;font-weight:500}.dark .btn-secondary{background-color:#4B5563;color:#F9FAFB}`}</style>
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">مدیریت بانک‌ها</h1>
                <button onClick={() => { setEditingBank(null); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2">
                    <IconPlusCircle className="w-5 h-5"/> افزودن بانک جدید
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-3">کد بانک</th>
                                <th className="px-4 py-3">نام بانک</th>
                                <th className="px-4 py-3">عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {banks.map(bank => (
                                <tr key={bank.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-4 py-2 font-mono">{bank.code}</td>
                                    <td className="px-4 py-2 font-semibold">{bank.name}</td>
                                    <td className="px-4 py-2">
                                        <button onClick={() => handleEdit(bank)} className="p-1 text-blue-500 hover:text-blue-600" title="ویرایش"><IconEdit className="w-4 h-4"/></button>
                                        <button onClick={() => onDelete(bank.id)} className="p-1 text-danger hover:text-red-600" title="حذف"><IconTrash className="w-4 h-4"/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingBank ? "ویرایش بانک" : "ایجاد بانک جدید"}>
                <BankForm onSave={handleSave} onCancel={() => setIsModalOpen(false)} initialData={editingBank} />
