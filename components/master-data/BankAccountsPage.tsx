import React, { useState } from 'react';
import type { BankAccount, ToastData } from '../../types';
import { IconPlusCircle, IconEdit, IconTrash } from '../Icons';
import { Modal } from '../common/Modal';
import { v4 as uuidv4 } from 'uuid';

const BankAccountForm: React.FC<{
    onSave: (account: Omit<BankAccount, 'id'> | BankAccount) => void;
    onCancel: () => void;
    initialData?: BankAccount | null;
}> = ({ onSave, onCancel, initialData }) => {
    const isEditing = !!initialData;
    const [formData, setFormData] = useState({
        bankName: initialData?.bankName || '',
        branchName: initialData?.branchName || '',
        accountNumber: initialData?.accountNumber || '',
        iban: initialData?.iban || '',
        accountType: initialData?.accountType || 'جاری',
        currency: initialData?.currency || 'ریال',
        isActive: initialData?.isActive ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Add validation here
        if (isEditing) {
            onSave({ ...initialData!, ...formData });
        } else {
            onSave({ ...formData, balance: 0 });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="label-form">نام بانک</label>
                    <input type="text" value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} required className="input-field" />
                </div>
                <div>
                    <label className="label-form">شعبه</label>
                    <input type="text" value={formData.branchName} onChange={e => setFormData({...formData, branchName: e.target.value})} required className="input-field" />
                </div>
            </div>
            <div>
                <label className="label-form">شماره حساب</label>
                <input type="text" value={formData.accountNumber} onChange={e => setFormData({...formData, accountNumber: e.target.value})} required className="input-field font-mono" />
            </div>
            <div>
                <label className="label-form">شماره شبا (IBAN)</label>
                <input type="text" value={formData.iban} onChange={e => setFormData({...formData, iban: e.target.value})} required className="input-field font-mono" placeholder="IR..." />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="label-form">نوع حساب</label>
                    <select value={formData.accountType} onChange={e => setFormData({...formData, accountType: e.target.value as any})} required className="input-field">
                        <option value="جاری">جاری</option>
                        <option value="پس‌انداز">پس‌انداز</option>
                    </select>
                </div>
                 <div>
                    <label className="label-form">واحد پول</label>
                    <select value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value as any})} required className="input-field">
                        <option value="ریال">ریال</option>
                        <option value="دلار">دلار</option>
                        <option value="یورو">یورو</option>
                    </select>
                </div>
            </div>
            <div className="flex items-center">
                <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="h-4 w-4 rounded" />
                <label htmlFor="isActive" className="mr-2 text-sm">حساب فعال است</label>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                <button type="button" onClick={onCancel} className="btn-secondary">لغو</button>
                <button type="submit" className="btn-primary">ذخیره</button>
            </div>
        </form>
    );
};

interface BankAccountsPageProps {
    bankAccounts: BankAccount[];
    addBankAccount: (account: Omit<BankAccount, 'id'>) => void;
    updateBankAccount: (account: BankAccount) => void;
    deleteBankAccount: (id: string) => void;
    showToast: (message: string, type?: ToastData['type']) => void;
}

export const BankAccountsPage: React.FC<BankAccountsPageProps> = ({ bankAccounts, addBankAccount, updateBankAccount, deleteBankAccount, showToast }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);

    const handleSave = (accountData: Omit<BankAccount, 'id'> | BankAccount) => {
        if ('id' in accountData) {
            updateBankAccount(accountData);
            showToast('حساب بانکی با موفقیت ویرایش شد.');
        } else {
            addBankAccount(accountData);
            showToast('حساب بانکی جدید با موفقیت ایجاد شد.');
        }
        setIsModalOpen(false);
    };
    
    const handleEdit = (account: BankAccount) => {
        setEditingAccount(account);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <style>{`.label-form{display:block;font-size:.875rem;font-weight:500;color:#374151;margin-bottom:.25rem}.dark .label-form{color:#D1D5DB}.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;width:100%}.dark .input-field{background-color:#374151;border-color:#4B5563}.input-field:focus{outline:2px solid transparent;outline-offset:2px;--tw-ring-color:hsl(262 83% 58%);box-shadow:0 0 0 2px var(--tw-ring-color)}.btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500;transition:background-color .2s}.btn-primary:hover{background-color:hsl(262 75% 52%)}.btn-secondary{padding:.5rem 1rem;background-color:#E5E7EB;color:#1F2937;border-radius:.5rem;font-weight:500}.dark .btn-secondary{background-color:#4B5563;color:#F9FAFB}`}</style>
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">مدیریت حساب‌های بانکی</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">حساب‌های بانکی شرکت را تعریف و مدیریت کنید.</p>
                </div>
                <button onClick={() => { setEditingAccount(null); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2">
                    <IconPlusCircle className="w-5 h-5"/> افزودن حساب جدید
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-3">نام بانک</th><th className="px-4 py-3">شعبه</th><th className="px-4 py-3">شماره حساب</th>
                                <th className="px-4 py-3">شماره شبا</th><th className="px-4 py-3">نوع</th><th className="px-4 py-3">وضعیت</th><th className="px-4 py-3">عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bankAccounts.map(acc => (
                                <tr key={acc.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-4 py-2 font-semibold">{acc.bankName}</td>
                                    <td className="px-4 py-2">{acc.branchName}</td>
                                    <td className="px-4 py-2 font-mono">{acc.accountNumber}</td>
                                    <td className="px-4 py-2 font-mono text-xs">{acc.iban}</td>
                                    <td className="px-4 py-2">{acc.accountType}</td>
                                    <td className="px-4 py-2">
                                        <span className={`px-2 py-1 text-xs rounded-full ${acc.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {acc.isActive ? 'فعال' : 'غیرفعال'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2">
                                        <button onClick={() => handleEdit(acc)} className="p-1 text-blue-500 hover:text-blue-600" title="ویرایش"><IconEdit className="w-4 h-4"/></button>
                                        <button onClick={() => deleteBankAccount(acc.id)} className="p-1 text-danger hover:text-red-600" title="حذف"><IconTrash className="w-4 h-4"/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingAccount ? "ویرایش حساب بانکی" : "ایجاد حساب بانکی جدید"}>
                <BankAccountForm onSave={handleSave} onCancel={() => setIsModalOpen(false)} initialData={editingAccount} />
            </Modal>
        </div>
    );
};
