
import React, { useState, useMemo } from 'react';
import type { SalesContract, Party, ToastData } from '../../types';
import { IconPlusCircle, IconEdit, IconTrash } from '../Icons';
import { Modal } from '../common/Modal';

const ContractForm: React.FC<{
    onSave: (contract: Omit<SalesContract, 'id' | 'contractNumber'>) => void;
    onCancel: () => void;
    parties: Party[];
}> = ({ onSave, onCancel, parties }) => {
    const [formData, setFormData] = useState({
        customerId: '',
        startDate: '',
        endDate: '',
        totalValue: 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const customer = parties.find(p => p.id === formData.customerId);
        if (!customer) return;
        onSave({
            ...formData,
            customerName: customer.name,
            status: 'فعال',
            startDate: new Date(formData.startDate).toLocaleDateString('fa-IR-u-nu-latn'),
            endDate: new Date(formData.endDate).toLocaleDateString('fa-IR-u-nu-latn'),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="label-form">مشتری</label>
                <select value={formData.customerId} onChange={e => setFormData(f => ({...f, customerId: e.target.value}))} className="input-field">
                    <option>انتخاب کنید...</option>
                    {parties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div><label className="label-form">تاریخ شروع</label><input type="date" value={formData.startDate} onChange={e => setFormData(f => ({...f, startDate: e.target.value}))} className="input-field"/></div>
                <div><label className="label-form">تاریخ پایان</label><input type="date" value={formData.endDate} onChange={e => setFormData(f => ({...f, endDate: e.target.value}))} className="input-field"/></div>
            </div>
            <div>
                <label className="label-form">ارزش کل قرارداد (تومان)</label>
                <input type="number" value={formData.totalValue} onChange={e => setFormData(f => ({...f, totalValue: Number(e.target.value)}))} className="input-field"/>
            </div>
             <div className="flex justify-end gap-2 pt-4 border-t dark:border-gray-700">
                <button type="button" onClick={onCancel} className="btn-secondary">لغو</button>
                <button type="submit" className="btn-primary">ذخیره قرارداد</button>
            </div>
        </form>
    )
}

interface SalesContractsPageProps {
    onNavigate: (page: string) => void;
    addSalesContract: (contract: Omit<SalesContract, 'id' | 'contractNumber'>) => void;
    showToast: (message: string, type?: ToastData['type']) => void;
    parties: Party[];
    salesContracts: SalesContract[];
}

export const SalesContractsPage: React.FC<SalesContractsPageProps> = ({ onNavigate, addSalesContract, showToast, parties, salesContracts }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSave = (contractData: Omit<SalesContract, 'id' | 'contractNumber'>) => {
        addSalesContract(contractData);
        showToast('قرارداد فروش جدید با موفقیت ایجاد شد.');
        setIsModalOpen(false);
    };
    
    return (
        <div className="space-y-6">
            <style>{`.label-form{display:block;font-size:.875rem;font-weight:500;color:#374151;margin-bottom:.25rem}.dark .label-form{color:#D1D5DB}.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;width:100%}.dark .input-field{background-color:#374151;border-color:#4B5563}.btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500;transition:all .2s}.btn-secondary{padding:.5rem 1rem;background-color:#E5E7EB;color:#1F2937;border-radius:.5rem;font-weight:500}.dark .btn-secondary{background-color:#4B5563;color:#F9FAFB}`}</style>
             <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">مدیریت قراردادهای فروش</h1>
                <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2"><IconPlusCircle className="w-5 h-5"/> قرارداد جدید</button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700">
                             <tr>
                                <th className="px-4 py-3">شماره قرارداد</th><th className="px-4 py-3">مشتری</th><th className="px-4 py-3">شروع</th>
                                <th className="px-4 py-3">پایان</th><th className="px-4 py-3">مبلغ</th><th className="px-4 py-3">وضعیت</th><th className="px-4 py-3">عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {salesContracts.map(c => (
                                <tr key={c.id} className="border-b dark:border-gray-700">
                                    <td className="px-4 py-2 font-mono">{c.contractNumber}</td>
                                    <td className="px-4 py-2 font-semibold text-gray-800 dark:text-gray-200">{c.customerName}</td>
                                    <td className="px-4 py-2">{c.startDate}</td>
                                    <td className="px-4 py-2">{c.endDate}</td>
                                    <td className="px-4 py-2 font-mono">{c.totalValue.toLocaleString('fa-IR')}</td>
                                    <td className="px-4 py-2"><span className={`px-2 py-1 text-xs rounded-full ${c.status === 'فعال' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{c.status}</span></td>
                                     <td className="px-4 py-2">
                                        <button className="p-1 text-blue-500"><IconEdit className="w-4 h-4" /></button>
                                        <button className="p-1 text-danger"><IconTrash className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="قرارداد فروش جدید">
                <ContractForm onSave={handleSave} onCancel={() => setIsModalOpen(false)} parties={parties} />
            </Modal>
        </div>
    );
};
