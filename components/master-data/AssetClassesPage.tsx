import React, { useState } from 'react';
import type { AssetClass } from '../../types';
import { IconPlusCircle, IconEdit, IconTrash } from '../Icons';
import { Modal } from '../common/Modal';
import { v4 as uuidv4 } from 'uuid';

const AssetClassForm: React.FC<{
    onSave: (data: Omit<AssetClass, 'id'> | AssetClass) => void;
    onCancel: () => void;
    initialData?: AssetClass | null;
}> = ({ onSave, onCancel, initialData }) => {
    const isEditing = !!initialData;
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        depreciationMethod: initialData?.depreciationMethod || 'Straight-line',
        usefulLife: initialData?.usefulLife || 10,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            onSave({ ...initialData!, ...formData });
        } else {
            onSave({ id: uuidv4(), ...formData });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="label-form">نام کلاس دارایی</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="input-field" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="label-form">روش استهلاک</label>
                    <select value={formData.depreciationMethod} onChange={e => setFormData({...formData, depreciationMethod: e.target.value as 'Straight-line'})} required className="input-field">
                        <option value="Straight-line">خط مستقیم</option>
                    </select>
                </div>
                <div>
                    <label className="label-form">عمر مفید (سال)</label>
                    <input type="number" value={formData.usefulLife} onChange={e => setFormData({...formData, usefulLife: Number(e.target.value)})} required className="input-field" />
                </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                <button type="button" onClick={onCancel} className="btn-secondary">لغو</button>
                <button type="submit" className="btn-primary">ذخیره</button>
            </div>
        </form>
    );
};

interface AssetClassesPageProps {
    assetClasses: AssetClass[];
    onSave: (data: Omit<AssetClass, 'id'> | AssetClass) => void;
    onDelete: (id: string) => void;
}

export const AssetClassesPage: React.FC<AssetClassesPageProps> = ({ assetClasses, onSave, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState<AssetClass | null>(null);

    const handleSave = (data: Omit<AssetClass, 'id'> | AssetClass) => {
        onSave(data);
        setIsModalOpen(false);
    };
    
    const handleEdit = (ac: AssetClass) => {
        setEditingClass(ac);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <style>{`.label-form{display:block;font-size:.875rem;font-weight:500;color:#374151;margin-bottom:.25rem}.dark .label-form{color:#D1D5DB}.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;width:100%}.dark .input-field{background-color:#374151;border-color:#4B5563}.input-field:focus{outline:2px solid transparent;outline-offset:2px;--tw-ring-color:hsl(262 83% 58%);box-shadow:0 0 0 2px var(--tw-ring-color)}.btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500}.btn-secondary{padding:.5rem 1rem;background-color:#E5E7EB;color:#1F2937;border-radius:.5rem;font-weight:500}.dark .btn-secondary{background-color:#4B5563;color:#F9FAFB}`}</style>
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">کلاس‌های دارایی ثابت</h1>
                <button onClick={() => { setEditingClass(null); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2">
                    <IconPlusCircle className="w-5 h-5"/> افزودن کلاس جدید
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-3">نام کلاس</th>
                                <th className="px-4 py-3">روش استهلاک</th>
                                <th className="px-4 py-3">عمر مفید (سال)</th>
                                <th className="px-4 py-3">عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assetClasses.map(ac => (
                                <tr key={ac.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-4 py-2 font-semibold">{ac.name}</td>
                                    <td className="px-4 py-2">{ac.depreciationMethod}</td>
                                    <td className="px-4 py-2 font-mono">{ac.usefulLife}</td>
                                    <td className="px-4 py-2">
                                        <button onClick={() => handleEdit(ac)} className="p-1 text-blue-500 hover:text-blue-600" title="ویرایش"><IconEdit className="w-4 h-4"/></button>
                                        <button onClick={() => onDelete(ac.id)} className="p-1 text-danger hover:text-red-600" title="حذف"><IconTrash className="w-4 h-4"/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingClass ? "ویرایش کلاس دارایی" : "ایجاد کلاس دارایی جدید"}>
                <AssetClassForm onSave={handleSave} onCancel={() => setIsModalOpen(false)} initialData={editingClass} />
            </Modal>
        </div>
    );
};
