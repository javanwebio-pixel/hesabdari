import React, { useState, useMemo } from 'react';
import type { ServiceContract, ServiceContractStatus, Party, ToastData } from '../../../types';
import { IconPlusCircle } from '../../Icons';
import { Modal } from '../../common/Modal';

const statusMap: { [key in ServiceContractStatus]: { class: string } } = {
    'فعال': { class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
    'در شرف انقضا': { class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
    'منقضی شده': { class: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
};

const parseFaDate = (dateStr: string): Date => {
    if (!dateStr) return new Date();
    const parts = dateStr.split('/');
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
};

const ContractFormModal: React.FC<{
    isOpen: boolean; onClose: () => void;
    onSave: (contract: Omit<ServiceContract, 'id' | 'contractNumber'>) => void;
    parties: Party[];
}> = ({ isOpen, onClose, onSave, parties }) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const customerId = formData.get('customerId') as string;
        const customer = parties.find(p => p.id === customerId);
        if(!customer) return;

        onSave({
            customerId,
            customerName: customer.name,
            startDate: new Date(formData.get('startDate') as string).toLocaleDateString('fa-IR-u-nu-latn'),
            endDate: new Date(formData.get('endDate') as string).toLocaleDateString('fa-IR-u-nu-latn'),
            serviceLevel: formData.get('serviceLevel') as string,
            monthlyFee: Number(formData.get('monthlyFee')),
            status: 'فعال',
            description: formData.get('description') as string,
        });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="قرارداد خدمات جدید">
            <form onSubmit={handleSubmit} className="space-y-4">
                <select name="customerId" required className="input-field w-full"><option value="">انتخاب مشتری...</option>{parties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
                <input name="description" placeholder="شرح خدمات" className="input-field w-full"/>
                <div className="grid grid-cols-2 gap-4">
                    <div><label>تاریخ شروع</label><input name="startDate" type="date" required className="input-field"/></div>
                    <div><label>تاریخ پایان</label><input name="endDate" type="date" required className="input-field"/></div>
                    <div><label>سطح خدمات (SLA)</label><input name="serviceLevel" placeholder="طلایی" required className="input-field"/></div>
                    <div><label>هزینه ماهانه</label><input name="monthlyFee" type="number" required className="input-field"/></div>
                </div>
                <div className="flex justify-end gap-2 pt-4"><button type="button" onClick={onClose} className="btn-secondary">لغو</button><button type="submit" className="btn-primary">ذخیره</button></div>
            </form>
        </Modal>
    );
};

interface ServiceContractsListPageProps {
    contracts: ServiceContract[];
    parties: Party[];
    onAddContract: (contract: Omit<ServiceContract, 'id' | 'contractNumber'>) => void;
    onUpdateContract: (contract: ServiceContract) => void;
    showToast: (message: string, type?: ToastData['type']) => void;
}

export const ServiceContractsListPage: React.FC<ServiceContractsListPageProps> = ({ contracts, parties, onAddContract, onUpdateContract, showToast }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const monthlyRecurringRevenue = useMemo(() => {
        return contracts
            .filter(c => c.status === 'فعال')
            .reduce((sum, c) => sum + c.monthlyFee, 0);
    }, [contracts]);

    const handleSave = (contractData: Omit<ServiceContract, 'id' | 'contractNumber'>) => {
        onAddContract(contractData);
        showToast('قرارداد جدید با موفقیت ایجاد شد.');
    };
    
    return (
        <div className="space-y-6">
            <style>{`.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;width:100%}.dark .input-field{background-color:#374151;border-color:#4B5563}.btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500}.btn-secondary{padding:.5rem 1rem;background-color:#E5E7EB;color:#1F2937;border-radius:.5rem;font-weight:500}.dark .btn-secondary{background-color:#4B5563;color:#F9FAFB}`}</style>
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">قراردادهای خدمات</h1>
                 <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-primary-600 transition-colors">
                    <IconPlusCircle className="w-5 h-5"/> قرارداد خدمات جدید
                </button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <p>درآمد تکرارشونده ماهانه (MRR): <span className="font-bold text-lg">{monthlyRecurringRevenue.toLocaleString('fa-IR')}</span> تومان</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700"><tr><th className="px-4 py-3">شماره</th><th className="px-4 py-3">مشتری</th><th className="px-4 py-3">دوره اعتبار</th><th className="px-4 py-3">هزینه ماهانه</th><th className="px-4 py-3">وضعیت</th></tr></thead>
                        <tbody>
                            {contracts.map(c => {
                                const start = parseFaDate(c.startDate);
                                const end = parseFaDate(c.endDate);
                                const totalDuration = end.getTime() - start.getTime();
                                const elapsed = new Date().getTime() - start.getTime();
                                const progress = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
                                return (
                                <tr key={c.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-4 py-2 font-mono">{c.contractNumber}</td>
                                    <td className="px-4 py-2 font-semibold">{c.customerName}</td>
                                    <td className="px-4 py-2">
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                            <div className="bg-primary h-2.5 rounded-full" style={{width: `${progress}%`}}></div>
                                        </div>
                                        <span className="text-xs text-gray-500">{c.startDate} تا {c.endDate}</span>
                                    </td>
                                    <td className="px-4 py-2 font-mono">{c.monthlyFee.toLocaleString('fa-IR')}</td>
                                    <td className="px-4 py-2"><span className={`px-2 py-1 text-xs rounded-full ${statusMap[c.status].class}`}>{c.status}</span></td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </div>
            <ContractFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} parties={parties} />
        </div>
    );
};
