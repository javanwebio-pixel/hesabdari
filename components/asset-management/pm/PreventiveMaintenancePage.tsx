import React, { useState, useMemo } from 'react';
import type { PreventivePlan, MaintenanceObject } from '../../../types';
import { IconPlusCircle } from '../../Icons';
import { Modal } from '../../common/Modal';

const PlanForm: React.FC<{
    onSave: (data: Omit<PreventivePlan, 'id'>) => void;
    onCancel: () => void;
    objects: MaintenanceObject[];
}> = ({ onSave, onCancel, objects }) => {
    const [formData, setFormData] = useState({
        planName: '',
        objectId: '',
        taskDescription: '',
        frequency: 30,
        nextRun: new Date().toISOString().split('T')[0],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const object = objects.find(o => o.id === formData.objectId);
        if (!object) return;
        onSave({ ...formData, objectName: object.name, nextRun: new Date(formData.nextRun).toLocaleDateString('fa-IR-u-nu-latn') });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="label-form">نام برنامه</label><input type="text" value={formData.planName} onChange={e => setFormData({...formData, planName: e.target.value})} required className="input-field"/></div>
            <div>
                <label className="label-form">تجهیز/ماشین</label>
                <select value={formData.objectId} onChange={e => setFormData({...formData, objectId: e.target.value})} required className="input-field">
                    <option value="" disabled>انتخاب کنید...</option>
                    {objects.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
            </div>
            <div><label className="label-form">شرح کار</label><textarea value={formData.taskDescription} onChange={e => setFormData({...formData, taskDescription: e.target.value})} required className="input-field" rows={3}></textarea></div>
            <div className="grid grid-cols-2 gap-4">
                <div><label className="label-form">تناوب (روز)</label><input type="number" value={formData.frequency} onChange={e => setFormData({...formData, frequency: Number(e.target.value)})} required className="input-field"/></div>
                <div><label className="label-form">تاریخ اجرای بعدی</label><input type="date" value={formData.nextRun} onChange={e => setFormData({...formData, nextRun: e.target.value})} required className="input-field"/></div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                <button type="button" onClick={onCancel} className="btn-secondary">لغو</button>
                <button type="submit" className="btn-primary">ایجاد برنامه</button>
            </div>
        </form>
    );
};

interface PreventiveMaintenancePageProps {
    plans: PreventivePlan[];
    objects: MaintenanceObject[];
    onSave: (data: Omit<PreventivePlan, 'id'>) => void;
}

export const PreventiveMaintenancePage: React.FC<PreventiveMaintenancePageProps> = ({ plans, objects, onSave }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSave = (data: Omit<PreventivePlan, 'id'>) => {
        onSave(data);
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <style>{`.label-form{display:block;font-size:.875rem;font-weight:500;color:#374151;margin-bottom:.25rem}.dark .label-form{color:#D1D5DB}.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;width:100%}.dark .input-field{background-color:#374151;border-color:#4B5563}.btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500}.btn-secondary{padding:.5rem 1rem;background-color:#E5E7EB;color:#1F2937;border-radius:.5rem;font-weight:500}.dark .btn-secondary{background-color:#4B5563;color:#F9FAFB}`}</style>
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">برنامه‌های نگهداری پیشگیرانه (PM)</h1>
                <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
                    <IconPlusCircle className="w-5 h-5"/> برنامه جدید
                </button>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <table className="w-full text-sm text-right">
                    <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-4 py-3">برنامه</th>
                            <th className="px-4 py-3">تجهیز</th>
                            <th className="px-4 py-3">تناوب (روز)</th>
                            <th className="px-4 py-3">آخرین اجرا</th>
                            <th className="px-4 py-3">اجرای بعدی</th>
                        </tr>
                    </thead>
                    <tbody>
                        {plans.map(plan => (
                            <tr key={plan.id} className="border-b dark:border-gray-700">
                                <td className="px-4 py-2 font-semibold">{plan.planName}</td>
                                <td className="px-4 py-2">{plan.objectName}</td>
                                <td className="px-4 py-2">{plan.frequency}</td>
                                <td className="px-4 py-2">{plan.lastRun || '-'}</td>
                                <td className="px-4 py-2">{plan.nextRun}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="برنامه نگهداری جدید">
                <PlanForm onSave={handleSave} onCancel={() => setIsModalOpen(false)} objects={objects} />
            </Modal>
        </div>
    );
};
