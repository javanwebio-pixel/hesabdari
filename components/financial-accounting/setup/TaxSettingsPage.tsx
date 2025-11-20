import React, { useState } from 'react';
import type { TaxRate, ToastData } from '../../../types';
import { IconPlusCircle } from '../../Icons';
import { Modal } from '../../common/Modal';
import { v4 as uuidv4 } from 'uuid';

const TaxRateForm: React.FC<{
    onSave: (newRate: Omit<TaxRate, 'id' | 'endDate'>) => void;
    onCancel: () => void;
}> = ({ onSave, onCancel }) => {
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [vatRate, setVatRate] = useState(9);
    const [dutiesRate, setDutiesRate] = useState(0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ startDate, vatRate, dutiesRate });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="label-form">تاریخ شروع اجرا</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required className="input-field"/>
            </div>
            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="label-form">نرخ ارزش افزوده (%)</label>
                    <input type="number" value={vatRate} onChange={e => setVatRate(Number(e.target.value))} required className="input-field"/>
                </div>
                 <div>
                    <label className="label-form">نرخ سایر عوارض (%)</label>
                    <input type="number" value={dutiesRate} onChange={e => setDutiesRate(Number(e.target.value))} required className="input-field"/>
                </div>
            </div>
             <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onCancel} className="btn-secondary">لغو</button>
                <button type="submit" className="btn-primary">ذخیره نرخ جدید</button>
            </div>
        </form>
    );
};

interface TaxSettingsPageProps {
    taxRates: TaxRate[];
    setTaxRates: React.Dispatch<React.SetStateAction<TaxRate[]>>;
    showToast: (message: string, type?: ToastData['type']) => void;
}

export const TaxSettingsPage: React.FC<TaxSettingsPageProps> = ({ taxRates, setTaxRates, showToast }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSave = (newRateData: Omit<TaxRate, 'id' | 'endDate'>) => {
        setTaxRates(prev => {
            const sorted = [...prev].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
            
            // End date the previous active rate
            if (sorted.length > 0 && !sorted[0].endDate) {
                const prevEndDate = new Date(newRateData.startDate);
                prevEndDate.setDate(prevEndDate.getDate() - 1);
                sorted[0].endDate = prevEndDate.toISOString().split('T')[0];
            }
            
            return [...sorted, { ...newRateData, id: uuidv4(), endDate: null }].sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        });
        showToast('نرخ جدید مالیات با موفقیت ثبت شد.');
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
             <style>{`.label-form{display:block;font-size:.875rem;font-weight:500;color:#374151;margin-bottom:.25rem}.dark .label-form{color:#D1D5DB}.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;width:100%}.dark .input-field{background-color:#374151;border-color:#4B5563}.input-field:focus{outline:2px solid transparent;outline-offset:2px;--tw-ring-color:hsl(262 83% 58%);box-shadow:0 0 0 2px var(--tw-ring-color)}.btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500;transition:all .2s}.btn-primary:hover:not(:disabled){background-color:hsl(262 75% 52%)}.btn-secondary{padding:.5rem 1rem;background-color:#E5E7EB;color:#1F2937;border-radius:.5rem;font-weight:500}.dark .btn-secondary{background-color:#4B5563;color:#F9FAFB}`}</style>
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">مالیات و عوارض</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">مدیریت نرخ‌های مالیات بر ارزش افزوده در دوره‌های مختلف.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
                    <IconPlusCircle className="w-5 h-5"/> تعریف نرخ جدید
                </button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-3">تاریخ شروع</th>
                                <th className="px-4 py-3">تاریخ پایان</th>
                                <th className="px-4 py-3">نرخ ارزش افزوده</th>
                                <th className="px-4 py-3">نرخ عوارض</th>
                                <th className="px-4 py-3">جمع کل (%)</th>
                                <th className="px-4 py-3">وضعیت</th>
                            </tr>
                        </thead>
                        <tbody>
                            {taxRates.map(rate => {
                                const isActive = !rate.endDate;
                                return (
                                <tr key={rate.id} className={`border-b dark:border-gray-700 ${isActive ? 'bg-primary-50 dark:bg-gray-700/50' : ''}`}>
                                    <td className="px-4 py-2 font-mono">{new Date(rate.startDate).toLocaleDateString('fa-IR')}</td>
                                    <td className="px-4 py-2 font-mono">{rate.endDate ? new Date(rate.endDate).toLocaleDateString('fa-IR') : 'جاری'}</td>
                                    <td className="px-4 py-2 font-mono">{rate.vatRate}%</td>
                                    <td className="px-4 py-2 font-mono">{rate.dutiesRate}%</td>
                                    <td className="px-4 py-2 font-mono font-bold">{(rate.vatRate + rate.dutiesRate)}%</td>
                                    <td className="px-4 py-2">
                                        {isActive && <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">فعال</span>}
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="تعریف نرخ مالیاتی جدید">
                <TaxRateForm onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};