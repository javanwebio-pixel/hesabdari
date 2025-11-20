import React, { useState, useMemo } from 'react';
import type { MaintenanceObject } from '../../../types';
import { IconPlusCircle, IconSearch, IconEdit, IconTrash } from '../../Icons';
import { Modal } from '../../common/Modal';
import { v4 as uuidv4 } from 'uuid';

const ObjectForm: React.FC<{
    onSave: (data: Omit<MaintenanceObject, 'id'> | MaintenanceObject) => void;
    onCancel: () => void;
    initialData?: MaintenanceObject | null;
}> = ({ onSave, onCancel, initialData }) => {
    const isEditing = !!initialData;
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        location: initialData?.location || '',
        type: initialData?.type || 'Machine',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            onSave({ ...initialData!, ...formData });
        } else {
            onSave(formData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="label-form">نام تجهیز</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="input-field" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="label-form">محل استقرار</label>
                    <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="input-field" />
                </div>
                <div>
                    <label className="label-form">نوع</label>
                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})} className="input-field">
                        <option value="Machine">ماشین</option>
                        <option value="Equipment">تجهیز</option>
                    </select>
                </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                <button type="button" onClick={onCancel} className="btn-secondary">لغو</button>
                <button type="submit" className="btn-primary">ذخیره</button>
            </div>
        </form>
    );
};

interface MaintenanceObjectsPageProps {
    objects: MaintenanceObject[];
    onSave: (data: Omit<MaintenanceObject, 'id'> | MaintenanceObject) => void;
    onDelete: (id: string) => void;
}

export const MaintenanceObjectsPage: React.FC<MaintenanceObjectsPageProps> = ({ objects, onSave, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingObject, setEditingObject] = useState<MaintenanceObject | null>(null);

    const handleSave = (data: Omit<MaintenanceObject, 'id'> | MaintenanceObject) => {
        onSave(data);
        setIsModalOpen(false);
    };

    const handleEdit = (obj: MaintenanceObject) => {
        setEditingObject(obj);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <style>{`.label-form{display:block;font-size:.875rem;font-weight:500;color:#374151;margin-bottom:.25rem}.dark .label-form{color:#D1D5DB}.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;width:100%}.dark .input-field{background-color:#374151;border-color:#4B5563}.btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500}.btn-secondary{padding:.5rem 1rem;background-color:#E5E7EB;color:#1F2937;border-radius:.5rem;font-weight:500}.dark .btn-secondary{background-color:#4B5563;color:#F9FAFB}`}</style>
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">فهرست تجهیزات و ماشین‌آلات (PM)</h1>
                <button onClick={() => { setEditingObject(null); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2">
                    <IconPlusCircle className="w-5 h-5"/> تجهیز جدید
                </button>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <table className="w-full text-sm text-right">
                    <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-4 py-3">نام تجهیز</th>
                            <th className="px-4 py-3">محل استقرار</th>
                            <th className="px-4 py-3">نوع</th>
                            <th className="px-4 py-3">عملیات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {objects.map(obj => (
                            <tr key={obj.id} className="border-b dark:border-gray-700">
                                <td className="px-4 py-2 font-semibold">{obj.name}</td>
                                <td className="px-4 py-2">{obj.location}</td>
                                <td className="px-4 py-2">{obj.type}</td>
                                <td className="px-4 py-2">
                                    <button onClick={() => handleEdit(obj)} className="p-1 text-blue-500"><IconEdit className="w-4 h-4"/></button>
                                    <button onClick={() => onDelete(obj.id)} className="p-1 text-danger"><IconTrash className="w-4 h-4"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingObject ? "ویرایش تجهیز" : "تجهیز جدید"}>
                <ObjectForm onSave={handleSave} onCancel={() => setIsModalOpen(false)} initialData={editingObject} />
            </Modal>
        </div>
    );
};
