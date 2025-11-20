
import React, { useState, useMemo, useCallback } from 'react';
import type { CustomerReceipt, Invoice, Party, ToastData, PaymentMethod } from '../../../types';
import { IconPlusCircle, IconTrash } from '../../Icons';
import { Modal } from '../../common/Modal';

const ReceiptForm: React.FC<{
    onSave: (receipt: Omit<CustomerReceipt, 'id' | 'receiptNumber'>) => void;
    onCancel: () => void;
    customers: Party[];
    invoices: Invoice[];
    showToast: (message: string, type?: ToastData['type']) => void;
}> = ({ onSave, onCancel, customers, invoices, showToast }) => {
    const [customerId, setCustomerId] = useState('');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('حواله');
    const [amount, setAmount] = useState<number>(0);
    const [appliedAmounts, setAppliedAmounts] = useState<{ [invoiceId: string]: number }>({});
    
    const customerInvoices = useMemo(() => {
        if (!customerId) return [];
        return invoices
            .filter(inv => inv.customerId === customerId && (inv.status === 'ثبت نهایی' || inv.status === 'ارسال شده' || inv.status === 'پرداخت قسمتی'))
            .sort((a,b) => a.dueDateObj.getTime() - b.dueDateObj.getTime());
    }, [invoices, customerId]);
    
    // FIX: Cast `val` to `number` to resolve "Operator '+' cannot be applied to types 'unknown' and 'number'" error.
    const totalApplied = useMemo(() => Object.values(appliedAmounts).reduce((sum: number, val) => sum + Number(val), 0), [appliedAmounts]);
    const unappliedAmount = amount - totalApplied;

    const handleApplyChange = (invoiceId: string, value: string) => {
        const numericValue = Number(value.replace(/,/g, '')) || 0;
        const invoice = customerInvoices.find(i => i.id === invoiceId);
        if (!invoice) return;

        const remaining = invoice.total - invoice.paidAmount;
        const cappedValue = Math.min(numericValue, remaining);

        setAppliedAmounts(prev => ({ ...prev, [invoiceId]: cappedValue }));
    };

    const handleAutoApply = () => {
        if (amount <= 0) {
            showToast('لطفاً ابتدا مبلغ کل دریافت را وارد کنید.', 'error');
            return;
        }
        let remainingToApply = amount;
        const newAppliedAmounts: { [invoiceId: string]: number } = {};

        // Smart auto-apply: oldest invoices first
        customerInvoices.forEach(inv => {
            if (remainingToApply <= 0.01) return;

            const outstanding = inv.total - inv.paidAmount;
            if (outstanding > 0) {
                const apply = Math.min(remainingToApply, outstanding);
                newAppliedAmounts[inv.id] = apply;
                remainingToApply -= apply;
            }
        });
        setAppliedAmounts(newAppliedAmounts);
    };

    const handleSubmit = () => {
        if (totalApplied <= 0) {
            showToast('مبلغ دریافت باید به حداقل یک فاکتور تخصیص داده شود.', 'error');
            return;
        }
        if (Math.abs(amount - totalApplied) > 0.01) { // Tolerance for float
             showToast(`جمع مبالغ تخصیص داده شده (${totalApplied.toLocaleString('fa-IR')}) با مبلغ کل دریافت (${amount.toLocaleString('fa-IR')}) برابر نیست.`, 'error');
             return;
        }
        
        const customerName = customers.find(s => s.id === customerId)?.name || '';
        const receiptData: Omit<CustomerReceipt, 'id' | 'receiptNumber'> = {
            customerId,
            customerName,
            paymentDate: new Date(paymentDate).toLocaleDateString('fa-IR-u-nu-latn'),
            amount: totalApplied,
            paymentMethod,
            // FIX: Cast `amt` and `amount` to `number` to resolve type errors.
            appliedInvoices: Object.entries(appliedAmounts)
                .filter(([, amt]) => Number(amt) > 0)
                .map(([invoiceId, amount]) => ({ invoiceId, amount: Number(amount) })),
        };
        onSave(receiptData);
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="label-form">مشتری</label>
                    <select value={customerId} onChange={e => { setCustomerId(e.target.value); setAppliedAmounts({}); setAmount(0); }} className="input-field w-full">
                        <option value="">انتخاب کنید...</option>
                        {customers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                    </select>
                </div>
                <div>
                    <label className="label-form">تاریخ دریافت</label>
                    <input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} className="input-field w-full"/>
                </div>
            </div>

            {customerId && (
                <div className="border-t dark:border-gray-600 pt-4 space-y-4">
                    <div className="flex items-end gap-4">
                        <div className="flex-grow">
                            <label className="label-form">مبلغ کل دریافت</label>
                            <input type="number" value={amount || ''} onChange={e => setAmount(Number(e.target.value))} placeholder="0" className="input-field w-full font-mono text-lg"/>
                        </div>
                        <button onClick={handleAutoApply} type="button" className="btn-secondary h-10">تخصیص خودکار</button>
                    </div>

                    <div className="space-y-2">
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300">تخصیص به فاکتورهای باز:</h4>
                        <div className="max-h-56 overflow-y-auto space-y-2 pr-2 border-r-2 dark:border-gray-600">
                            {customerInvoices.length > 0 ? customerInvoices.map(inv => {
                                const remaining = inv.total - inv.paidAmount;
                                return (
                                    <div key={inv.id} className="grid grid-cols-5 gap-2 items-center text-xs">
                                        <div className="col-span-3">
                                            <p className="font-semibold text-gray-800 dark:text-gray-200">فاکتور #{inv.invoiceNumber}</p>
                                            <p className="text-gray-500">مانده: {remaining.toLocaleString('fa-IR')} | سررسید: {inv.dueDate}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <input type="text"
                                                value={(appliedAmounts[inv.id] || 0).toLocaleString('fa-IR')}
                                                onChange={e => handleApplyChange(inv.id, e.target.value)}
                                                placeholder="0"
                                                className="input-field w-full font-mono"
                                            />
                                        </div>
                                    </div>
                                )
                            }) : <p className="text-center text-sm text-gray-500 p-4">این مشتری فاکتور بازی ندارد.</p>}
                        </div>
                    </div>
                     <div className="flex justify-between items-center mt-4 pt-2 border-t dark:border-gray-600 text-sm font-semibold">
                        <span>مبلغ تخصیص داده نشده:</span>
                        <span className={`font-mono text-lg ${unappliedAmount.toFixed(0) !== '0' ? 'text-danger' : 'text-success'}`}>{unappliedAmount.toLocaleString('fa-IR')}</span>
                    </div>
                </div>
            )}
            <div className="flex justify-end gap-2 pt-4 border-t dark:border-gray-600">
                <button type="button" onClick={onCancel} className="btn-secondary">لغو</button>
                <button type="button" onClick={handleSubmit} className="btn-primary" disabled={!customerId || amount <= 0}>ذخیره دریافت</button>
            </div>
        </div>
    )
}

interface CustomerReceiptsPageProps {
    receipts: CustomerReceipt[];
    invoices: Invoice[];
    parties: Party[];
    addReceipt: (receipt: Omit<CustomerReceipt, 'id' | 'receiptNumber'>) => void;
    deleteReceipt: (id: string) => void;
    showToast: (message: string, type?: ToastData['type']) => void;
}

export const CustomerReceiptsPage: React.FC<CustomerReceiptsPageProps> = ({ receipts, invoices, parties, addReceipt, deleteReceipt, showToast }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSave = (receiptData: Omit<CustomerReceipt, 'id' | 'receiptNumber'>) => {
        addReceipt(receiptData);
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
             <style>{`.label-form{display:block;font-size:.875rem;font-weight:500;color:#374151;margin-bottom:.25rem}.dark .label-form{color:#D1D5DB}.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;width:100%}.dark .input-field{background-color:#374151;border-color:#4B5563}.input-field:focus{outline:2px solid transparent;outline-offset:2px;--tw-ring-color:hsl(262 83% 58%);box-shadow:0 0 0 2px var(--tw-ring-color)}.btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500;transition:background-color .2s;}.btn-primary:disabled{opacity:.5;cursor:not-allowed}.btn-primary:hover:not(:disabled){background-color:hsl(262 75% 52%)}.btn-secondary{padding:.5rem 1rem;background-color:#E5E7EB;color:#1F2937;border-radius:.5rem;font-weight:500;transition:background-color .2s}.dark .btn-secondary{background-color:#4B5563;color:#F9FAFB}.btn-secondary:hover{background-color:#D1D5DB}.dark .btn-secondary:hover{background-color:#6B7280}`}</style>
            <div className="flex justify-between items-center">
                 <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">دریافت‌ها و وصول مطالبات</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">دریافتی‌ها را ثبت و به فاکتورهای باز تخصیص دهید.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2"><IconPlusCircle className="w-5 h-5"/> ثبت دریافت جدید</button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-3">شماره</th><th className="px-4 py-3">مشتری</th><th className="px-4 py-3">تاریخ</th>
                                <th className="px-4 py-3">مبلغ</th><th className="px-4 py-3">روش</th><th className="px-4 py-3">عملیات</th>
                            </tr>
                        </thead>
                         <tbody>
                            {receipts.map(r => (
                                <tr key={r.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-4 py-2 font-mono">{r.receiptNumber}</td>
                                    <td className="px-4 py-2 font-semibold text-gray-800 dark:text-gray-200">{r.customerName}</td>
                                    <td className="px-4 py-2">{r.paymentDate}</td>
                                    <td className="px-4 py-2 font-mono">{r.amount.toLocaleString('fa-IR')}</td>
                                    <td className="px-4 py-2">{r.paymentMethod}</td>
                                    <td className="px-4 py-2">
                                        <button onClick={() => deleteReceipt(r.id)} className="p-1 text-danger hover:text-red-600" title="حذف و بازگردانی مبالغ"><IconTrash className="w-4 h-4"/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="دریافت از مشتری">
                <ReceiptForm onSave={handleSave} onCancel={() => setIsModalOpen(false)} customers={parties} invoices={invoices} showToast={showToast} />
            </Modal>
        </div>
    );
}