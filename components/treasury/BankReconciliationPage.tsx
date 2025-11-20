
import React, { useState, useMemo, useCallback } from 'react';
import type { BankAccount, TreasuryDoc, Check, BankStatementTransaction, ToastData } from '../../types';
import { IconDeviceFloppy, IconSwitchHorizontal, IconCheckCircle } from '../Icons';
import { Modal } from '../common/Modal';

type BookItem = (TreasuryDoc & { itemType: 'doc' }) | (Check & { itemType: 'check' });

// FIX: Add parseFaDate helper to handle Persian date strings consistently with other components.
const parseFaDate = (dateStr: string): Date => {
    if (!dateStr) return new Date();
    const parts = dateStr.split('/');
    // This is not a correct Jalali to Gregorian conversion but is consistent with other parts of the app.
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
};

// FIX: Export the component to make it available for import in App.tsx.
export const BankReconciliationPage: React.FC<{
    bankAccounts: BankAccount[];
    treasuryDocs: TreasuryDoc[];
    checks: Check[];
    bankStatement: BankStatementTransaction[];
    onReconcile: (clearedDocIds: string[], clearedCheckIds: string[]) => void;
    showToast: (message: string, type?: ToastData['type']) => void;
}> = ({ bankAccounts, treasuryDocs, checks, bankStatement, onReconcile, showToast }) => {
    const [step, setStep] = useState(1);
    const [selectedAccountId, setSelectedAccountId] = useState<string>('');
    const [bankStatementBalance, setBankStatementBalance] = useState<number | ''>('');
    
    const [selectedBookItems, setSelectedBookItems] = useState<Set<string>>(new Set());
    const [selectedBankItems, setSelectedBankItems] = useState<Set<string>>(new Set());

    const bookItems = useMemo((): BookItem[] => {
        if (!selectedAccountId) return [];
        const unclearedDocs = treasuryDocs
            .filter(doc => doc.bankAccountId === selectedAccountId && !doc.isCleared && doc.paymentMethod !== 'چک')
            .map(doc => ({...doc, itemType: 'doc' as 'doc'}));
        const unclearedChecks = checks
            .filter(c => c.bankAccountId === selectedAccountId && !c.isCleared && c.status !== 'برگشتی' && c.status !== 'باطل شده')
            .map(c => ({...c, itemType: 'check' as 'check'}));
        
        return [...unclearedDocs, ...unclearedChecks];
    }, [treasuryDocs, checks, selectedAccountId]);

    const handleToggleSelection = (set: React.Dispatch<React.SetStateAction<Set<string>>>, id: string) => {
        set(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    const totals = useMemo(() => {
        const bookTotal = Array.from(selectedBookItems).reduce<number>((sum, id) => {
            const item = bookItems.find(i => i.id === id);
            if (!item) return sum;
            if ((item.itemType === 'doc' && item.type === 'دریافت') || (item.itemType === 'check' && item.type === 'دریافتی')) {
                return sum + item.amount;
            }
            return sum - item.amount;
        }, 0);

        const bankTotal = Array.from(selectedBankItems).reduce<number>((sum, id) => {
            const item = bankStatement.find(i => i.id === id);
            if (!item) return sum;
            return sum + item.credit - item.debit;
        }, 0);

        return { bookTotal, bankTotal, difference: bankTotal - bookTotal };
    }, [selectedBookItems, selectedBankItems, bookItems, bankStatement]);

    const handleReconcile = () => {
        if (Math.abs(totals.difference) > 0.01) {
            showToast('مجموع اقلام انتخاب شده تراز نیست.', 'error');
            return;
        }
        const clearedDocIds = Array.from(selectedBookItems).filter(id => bookItems.find(i => i.id === id)?.itemType === 'doc');
        const clearedCheckIds = Array.from(selectedBookItems).filter(id => bookItems.find(i => i.id === id)?.itemType === 'check');
        onReconcile(clearedDocIds, clearedCheckIds);
        showToast('اقلام با موفقیت مغایرت‌گیری شدند.');
        setStep(1); // Reset
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">مغایرت‌گیری بانکی</h1>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                {step === 1 && (
                    <div className="max-w-md mx-auto space-y-4">
                        <h3 className="font-semibold text-lg text-center">انتخاب حساب و ورود اطلاعات</h3>
                         <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">حساب بانکی</label>
                            <select value={selectedAccountId} onChange={e => setSelectedAccountId(e.target.value)} className="input-field mt-1">
                                <option value="">انتخاب کنید</option>
                                {bankAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.bankName} - {acc.accountNumber}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">موجودی طبق صورتحساب بانکی</label>
                            <input type="number" value={bankStatementBalance} onChange={e => setBankStatementBalance(Number(e.target.value))} className="input-field mt-1" />
                        </div>
                        <div className="text-center pt-2">
                             <button onClick={() => setStep(2)} disabled={!selectedAccountId || bankStatementBalance === ''} className="btn-primary px-8">شروع مغایرت‌گیری</button>
                        </div>
                    </div>
                )}
                {step === 2 && (
                    <div>
                        <div className="grid grid-cols-2 gap-6">
                            {/* Book Side */}
                            <div>
                                <h3 className="font-semibold mb-2">اقلام باز دفتر</h3>
                                <div className="border rounded-lg max-h-96 overflow-y-auto">
                                    <table className="w-full text-xs">
                                        <tbody>
                                        {bookItems.map(item => {
                                            const isCredit = (item.itemType === 'doc' && item.type === 'پرداخت') || (item.itemType === 'check' && item.type === 'پرداختی');
                                            return (
                                            <tr key={item.id} className="border-b dark:border-gray-700">
                                                <td className="p-2"><input type="checkbox" checked={selectedBookItems.has(item.id)} onChange={() => handleToggleSelection(setSelectedBookItems, item.id)} /></td>
                                                <td className="p-2">{item.itemType === 'doc' ? item.description : `چک ${item.checkNumber}`}</td>
                                                <td className={`p-2 font-mono text-right ${isCredit ? 'text-danger' : 'text-success'}`}>{item.amount.toLocaleString('fa-IR')}</td>
                                            </tr>
                                        )})}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            {/* Bank Side */}
                            <div>
                                 <h3 className="font-semibold mb-2">اقلام صورتحساب بانکی</h3>
                                 <div className="border rounded-lg max-h-96 overflow-y-auto">
                                    <table className="w-full text-xs">
                                        <tbody>
                                        {bankStatement.map(item => (
                                             <tr key={item.id} className="border-b dark:border-gray-700">
                                                <td className="p-2"><input type="checkbox" checked={selectedBankItems.has(item.id)} onChange={() => handleToggleSelection(setSelectedBankItems, item.id)}/></td>
                                                <td className="p-2">{item.description}</td>
                                                <td className={`p-2 font-mono text-right ${item.debit > 0 ? 'text-danger' : 'text-success'}`}>{item.credit > 0 ? item.credit.toLocaleString('fa-IR') : item.debit.toLocaleString('fa-IR')}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                         <div className="mt-4 pt-4 border-t dark:border-gray-700 flex justify-between items-center">
                             <div className="flex gap-4 text-sm">
                                 <p>جمع دفتر: <span className="font-mono font-bold">{totals.bookTotal.toLocaleString('fa-IR')}</span></p>
                                 <p>جمع بانک: <span className="font-mono font-bold">{totals.bankTotal.toLocaleString('fa-IR')}</span></p>
                                 <p>اختلاف: <span className={`font-mono font-bold ${totals.difference !== 0 ? 'text-danger' : 'text-success'}`}>{totals.difference.toLocaleString('fa-IR')}</span></p>
                             </div>
                            <div>
                                <button onClick={() => setStep(1)} className="btn-secondary mr-2">بازگشت</button>
                                <button onClick={handleReconcile} disabled={totals.difference !== 0} className="btn-primary disabled:opacity-50">ثبت مغایرت</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
             <style>{`.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;width:100%}.dark .input-field{background-color:#374151;border-color:#4B5563}.btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500}.btn-secondary{padding:.5rem 1rem;background-color:#E5E7EB;color:#1F2937;border-radius:.5rem;font-weight:500}.dark .btn-secondary{background-color:#4B5563;color:#F9FAFB}`}</style>
        </div>
    );
};