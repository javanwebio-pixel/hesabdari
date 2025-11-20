import React, { useState, useMemo } from 'react';
import type { CashDesk, TreasuryDoc, ToastData } from '../../types';
import { IconPlusCircle, IconEdit, IconTrash, IconWallet } from '../Icons';
import { Modal } from '../common/Modal';
import { v4 as uuidv4 } from 'uuid';

const CashDeskForm: React.FC<{
    onSave: (desk: Omit<CashDesk, 'id'>) => void;
    onCancel: () => void;
    initialData?: CashDesk | null;
}> = ({ onSave, onCancel, initialData }) => {
    const isEditing = !!initialData;
    const [name, setName] = useState(initialData?.name || '');
    const [balance, setBalance] = useState(initialData?.balance || 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        const deskData = { name, balance };
        onSave(deskData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="label-form">نام صندوق</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required className="input-field" />
            </div>
            <div>
                <label className="label-form">موجودی اولیه</label>
                <input type="number" value={balance} onChange={e => setBalance(Number(e.target.value))} required className="input-field" disabled={isEditing} />
            </div>
            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onCancel} className="btn-secondary">لغو</button>
                <button type="submit" className="btn-primary">ذخیره</button>
            </div>
        </form>
    );
};


interface CashDeskPageProps {
    cashDesks: CashDesk[];
    treasuryDocs: TreasuryDoc[];
    addCashDesk: (desk: Omit<CashDesk, 'id'>) => void;
    updateCashDesk: (desk: CashDesk) => void;
    deleteCashDesk: (id: string) => void;
    showToast: (message: string, type?: ToastData['type']) => void;
}

export const CashDeskPage: React.FC<CashDeskPageProps> = ({ cashDesks, treasuryDocs, addCashDesk, updateCashDesk, deleteCashDesk, showToast }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDesk, setEditingDesk] = useState<CashDesk | null>(null);
    const [selectedDeskId, setSelectedDeskId] = useState<string | null>(cashDesks[0]?.id || null);

    const cashTransactions = useMemo(() => {
        return treasuryDocs.filter(doc => doc.cashDeskId === selectedDeskId);
    }, [treasuryDocs, selectedDeskId]);
    
    const handleSave = (deskData: Omit<CashDesk, 'id'>) => {
        if (editingDesk) {
            updateCashDesk({ ...editingDesk, ...deskData });
            showToast('صندوق ویرایش شد.');
        } else {
            addCashDesk(deskData);
            showToast('صندوق جدید ایجاد شد.');
        }
        setIsModalOpen(false);
    };
    
    const handleEdit = (desk: CashDesk) => {
        setEditingDesk(desk);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <style>{`.label-form{display:block;font-size:.875rem;font-weight:500;color:#374151;margin-bottom:.25rem}.dark .label-form{color:#D1D5DB}.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;width:100%}.dark .input-field{background-color:#374151;border-color:#4B5563}.input-field:focus{outline:2px solid transparent;outline-offset:2px;--tw-ring-color:hsl(262 83% 58%);box-shadow:0 0 0 2px var(--tw-ring-color)}.btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500;transition:all .2s}.btn-primary:hover:not(:disabled){background-color:hsl(262 75% 52%)}.btn-secondary{padding:.5rem 1rem;background-color:#E5E7EB;color:#1F2937;border-radius:.5rem;font-weight:500}.dark .btn-secondary{background-color:#4B5563;color:#F9FAFB}`}</style>
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">مدیریت صندوق و تنخواه</h1>
                <button onClick={() => { setEditingDesk(null); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2">
                    <IconPlusCircle className="w-5 h-5"/> تعریف صندوق جدید
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                    <h3 className="font-semibold mb-2">صندوق‌ها</h3>
                     <ul className="space-y-1">
                        {cashDesks.map(d => (
                            <li key={d.id} onClick={() => setSelectedDeskId(d.id)}
                                className={`flex justify-between items-center p-2 rounded-md cursor-pointer ${selectedDeskId === d.id ? 'bg-primary-50 text-primary dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                <div className="font-semibold text-sm">
                                    <IconWallet className="w-4 h-4 inline-block ml-2"/>
                                    {d.name}
                                </div>
                                <span className="font-mono text-xs">{d.balance.toLocaleString('fa-IR')}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                     <h3 className="font-semibold mb-4 text-lg">گردش صندوق «{cashDesks.find(d => d.id === selectedDeskId)?.name}»</h3>
                     <div className="overflow-auto max-h-[60vh]">
                        <table className="w-full text-sm text-right">
                             <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 sticky top-0">
                                <tr>
                                    <th className="px-4 py-3">تاریخ</th>
                                    <th className="px-4 py-3">شرح</th>
                                    <th className="px-4 py-3 text-left">واریز</th>
                                    <th className="px-4 py-3 text-left">برداشت</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cashTransactions.map(doc => (
                                    <tr key={doc.id} className="border-b dark:border-gray-700">
                                        <td className="px-4 py-2">{doc.date}</td>
                                        <td className="px-4 py-2">{doc.description}</td>
                                        <td className="px-4 py-2 text-left font-mono text-success">{doc.type === 'دریافت' ? doc.amount.toLocaleString('fa-IR') : '-'}</td>
                                        <td className="px-4 py-2 text-left font-mono text-danger">{doc.type === 'پرداخت' ? doc.amount.toLocaleString('fa-IR') : '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                     </div>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingDesk ? 'ویرایش صندوق' : 'ایجاد صندوق جدید'}>
                <CashDeskForm onSave={handleSave} onCancel={() => setIsModalOpen(false)} initialData={editingDesk} />
            </Modal>
        </div>
    );
};
