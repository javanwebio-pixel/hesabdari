import React, { useState, useMemo } from 'react';
import type { AssetTransaction, AssetTransactionType, FixedAsset } from '../../types';
import { IconPlusCircle, IconSearch, IconChevronLeft, IconChevronRight } from '../Icons';
import { Modal } from '../common/Modal';

const TransactionForm: React.FC<{
    onSave: (transaction: Omit<AssetTransaction, 'id'>) => void;
    onCancel: () => void;
    assets: FixedAsset[];
}> = ({ onSave, onCancel, assets }) => {
    const [assetId, setAssetId] = useState('');
    const [type, setType] = useState<AssetTransactionType>('Sale');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [amount, setAmount] = useState<number | ''>('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const asset = assets.find(a => a.id === assetId);
        if (!asset) return;

        onSave({
            assetId,
            assetDescription: asset.description,
            type,
            date: new Date(date).toLocaleDateString('fa-IR-u-nu-latn'),
            amount: type === 'Sale' ? Number(amount) : undefined,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="label-form">دارایی</label>
                <select value={assetId} onChange={e => setAssetId(e.target.value)} required className="input-field">
                    <option value="" disabled>یک دارایی انتخاب کنید</option>
                    {assets.map(a => <option key={a.id} value={a.id}>{a.description} ({a.code})</option>)}
                </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="label-form">نوع عملیات</label>
                    <select value={type} onChange={e => setType(e.target.value as AssetTransactionType)} required className="input-field">
                        <option value="Sale">فروش</option>
                        <option value="Disposal">اسقاط</option>
                    </select>
                </div>
                <div>
                    <label className="label-form">تاریخ عملیات</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="input-field" />
                </div>
            </div>
            {type === 'Sale' && (
                <div>
                    <label className="label-form">مبلغ فروش</label>
                    <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} required className="input-field" />
                </div>
            )}
            <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                <button type="button" onClick={onCancel} className="btn-secondary">لغو</button>
                <button type="submit" className="btn-primary">ثبت عملیات</button>
            </div>
        </form>
    );
};

const ITEMS_PER_PAGE = 10;

interface AssetTransactionsPageProps {
    transactions: AssetTransaction[];
    assets: FixedAsset[];
    onSave: (transaction: Omit<AssetTransaction, 'id'>) => void;
}

export const AssetTransactionsPage: React.FC<AssetTransactionsPageProps> = ({ transactions, assets, onSave }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    
    const typeMap = {
        'Acquisition': 'تملک',
        'Sale': 'فروش',
        'Disposal': 'اسقاط',
    }

    const filteredTransactions = useMemo(() => {
        return transactions.filter(tx =>
            tx.assetDescription.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [transactions, searchTerm]);

    const paginatedTransactions = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredTransactions, currentPage]);

    const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);

    const handleSave = (transactionData: Omit<AssetTransaction, 'id'>) => {
        onSave(transactionData);
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <style>{`.label-form{display:block;font-size:.875rem;font-weight:500;color:#374151;margin-bottom:.25rem}.dark .label-form{color:#D1D5DB}.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;width:100%}.dark .input-field{background-color:#374151;border-color:#4B5563}.input-field:focus{outline:2px solid transparent;outline-offset:2px;--tw-ring-color:hsl(262 83% 58%);box-shadow:0 0 0 2px var(--tw-ring-color)}.btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500}.btn-secondary{padding:.5rem 1rem;background-color:#E5E7EB;color:#1F2937;border-radius:.5rem;font-weight:500}.dark .btn-secondary{background-color:#4B5563;color:#F9FAFB}`}</style>
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">عملیات دارایی ثابت</h1>
                <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
                    <IconPlusCircle className="w-5 h-5"/> ثبت عملیات جدید
                </button>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="relative mb-4">
                    <IconSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type="text" placeholder="جستجو شرح دارایی..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pr-10 pl-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"/>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-3">تاریخ</th>
                                <th className="px-4 py-3">شرح دارایی</th>
                                <th className="px-4 py-3">نوع عملیات</th>
                                <th className="px-4 py-3">مبلغ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedTransactions.map(tx => (
                                <tr key={tx.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-4 py-2">{tx.date}</td>
                                    <td className="px-4 py-2 font-semibold">{tx.assetDescription}</td>
                                    <td className="px-4 py-2">{typeMap[tx.type]}</td>
                                    <td className="px-4 py-2 font-mono">{(tx.amount || 0).toLocaleString('fa-IR')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 <div className="flex justify-between items-center mt-4 text-sm text-gray-600 dark:text-gray-400">
                    <div>نمایش {paginatedTransactions.length} از {filteredTransactions.length} عملیات</div>
                    <div className="flex items-center gap-1">
                        <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="p-2 disabled:opacity-50"><IconChevronRight/></button>
                        <span>{currentPage} از {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="p-2 disabled:opacity-50"><IconChevronLeft/></button>
                    </div>
                </div>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="ثبت عملیات جدید برای دارایی">
                <TransactionForm onSave={handleSave} onCancel={() => setIsModalOpen(false)} assets={assets} />
            </Modal>
        </div>
    );
};
