
import React, { useState, useMemo, useCallback } from 'react';
import type { Quote, QuoteLine, ToastData, Good, Party } from '../../types';
import { IconChevronRight, IconPlusCircle, IconTrash, IconSend, IconDeviceFloppy, IconSwitchHorizontal } from '../Icons';
import { v4 as uuidv4 } from 'uuid';

interface NewQuotePageProps {
    onNavigate: (page: string) => void;
    addQuote: (quote: Omit<Quote, 'id' | 'quoteNumber'>) => void;
    showToast: (message: string, type?: ToastData['type']) => void;
    parties: Party[];
    goods: Good[];
}

const initialLine: Omit<QuoteLine, 'id'> = { itemCode: '', itemName: '', quantity: 1, rate: 0 };

export const NewQuotePage: React.FC<NewQuotePageProps> = ({ onNavigate, addQuote, showToast, parties, goods }) => {
    const [selectedParty, setSelectedParty] = useState<Party | null>(null);
    const [issueDate, setIssueDate] = useState(new Date().toISOString().substring(0, 10));
    const [validityDate, setValidityDate] = useState('');
    const [lines, setLines] = useState<QuoteLine[]>([{ id: uuidv4(), ...initialLine }]);

    const handleLineChange = useCallback((id: string, field: keyof Omit<QuoteLine, 'id'>, value: string | number) => {
        setLines(prev => prev.map(line => line.id === id ? { ...line, [field]: value } : line));
    }, []);

    const addLine = useCallback(() => setLines(prev => [...prev, { id: uuidv4(), ...initialLine }]), []);
    const removeLine = useCallback((id: string) => setLines(prev => prev.length > 1 ? prev.filter(l => l.id !== id) : prev), []);
    
    const totals = useMemo(() => {
        const subtotal = lines.reduce((acc, line) => acc + (Number(line.quantity) || 0) * (Number(line.rate) || 0), 0);
        const tax = subtotal * 0.09;
        const total = subtotal + tax;
        return { subtotal, tax, total };
    }, [lines]);

    const handleSave = (status: Quote['status']) => {
        if (!selectedParty || lines.some(l => !l.itemCode || l.quantity <= 0)) {
            showToast('لطفا مشتری و تمام آیتم‌های پیش‌فاکتور را به درستی وارد کنید.', 'error');
            return;
        }

        const newQuote: Omit<Quote, 'id' | 'quoteNumber'> = {
            customerId: selectedParty.id,
            customerName: selectedParty.name,
            issueDate: new Date(issueDate).toLocaleDateString('fa-IR-u-nu-latn'),
            validityDate: validityDate ? new Date(validityDate).toLocaleDateString('fa-IR-u-nu-latn') : '',
            lines: lines.filter(l => l.quantity > 0 && l.rate > 0),
            total: totals.total,
            status,
        };
        addQuote(newQuote);
        showToast(`پیش‌فاکتور با وضعیت «${status}» ذخیره شد.`);
        onNavigate('dashboard'); // Or a new quote list page
    };

    return (
        <div className="space-y-6">
             <style>{`.label-form{display:block;font-size:.875rem;font-weight:500;color:#374151;margin-bottom:.25rem}.dark .label-form{color:#D1D5DB}.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;width:100%}.dark .input-field{background-color:#374151;border-color:#4B5563}.btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500;transition:all .2s}.btn-primary:hover:not(:disabled){background-color:hsl(262 75% 52%)}.btn-secondary{padding:.5rem 1rem;background-color:#E5E7EB;color:#1F2937;border-radius:.5rem;font-weight:500}.dark .btn-secondary{background-color:#4B5563;color:#F9FAFB}`}</style>
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">پیش‌فاکتور جدید</h1>
                <button onClick={() => onNavigate('dashboard')} className="btn-secondary flex items-center gap-2"><IconChevronRight className="w-5 h-5" /><span>بازگشت</span></button>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                        <label className="label-form">مشتری</label>
                        <select onChange={e => setSelectedParty(parties.find(p => p.id === e.target.value) || null)} className="input-field">
                            <option>انتخاب کنید...</option>
                            {parties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="label-form">تاریخ صدور</label>
                        <input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} className="input-field" />
                    </div>
                     <div>
                        <label className="label-form">تاریخ اعتبار</label>
                        <input type="date" value={validityDate} onChange={e => setValidityDate(e.target.value)} className="input-field" />
                    </div>
                </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-gray-500 dark:text-gray-400"><tr><th className="p-1 text-right font-medium">کالا</th><th className="p-1 text-right font-medium w-24">تعداد</th><th className="p-1 text-right font-medium w-32">نرخ</th><th className="p-1 text-right font-medium w-32">جمع</th><th className="w-10"></th></tr></thead>
                        <tbody>
                            {lines.map(line => (
                                <tr key={line.id}>
                                    <td className="p-1"><select className="input-field" onChange={e => {const g = goods.find(good=>good.id === e.target.value); if(g) {handleLineChange(line.id, 'itemCode', g.code); handleLineChange(line.id, 'itemName', g.name); handleLineChange(line.id, 'rate', g.salePrice)}}}><option>انتخاب کالا</option>{goods.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select></td>
                                    <td className="p-1"><input type="number" value={line.quantity} onChange={e => handleLineChange(line.id, 'quantity', Number(e.target.value))} className="input-field"/></td>
                                    <td className="p-1"><input type="number" value={line.rate} onChange={e => handleLineChange(line.id, 'rate', Number(e.target.value))} className="input-field"/></td>
                                    <td className="p-1"><input type="text" readOnly value={(line.quantity * line.rate).toLocaleString('fa-IR')} className="input-field bg-gray-100 dark:bg-gray-700"/></td>
                                    <td className="p-1 text-center"><button onClick={() => removeLine(line.id)} className="text-danger p-1"><IconTrash className="w-4 h-4" /></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button onClick={addLine} className="flex items-center gap-2 mt-2 px-3 py-1.5 text-sm btn-secondary"><IconPlusCircle className="w-4 h-4"/> افزودن سطر</button>
                </div>
                <div className="flex justify-between items-end pt-4 mt-4 border-t dark:border-gray-700">
                    <div className="space-y-1">
                        <p>جمع کل: {totals.subtotal.toLocaleString('fa-IR')}</p>
                        <p>مالیات (۹٪): {totals.tax.toLocaleString('fa-IR')}</p>
                        <p className="font-bold text-lg text-gray-800 dark:text-gray-200">مبلغ نهایی: {totals.total.toLocaleString('fa-IR')}</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => handleSave('پیش‌نویس')} className="btn-secondary flex items-center gap-2"><IconDeviceFloppy/>ذخیره پیش‌نویس</button>
                        <button onClick={() => handleSave('ارسال شده')} className="btn-primary flex items-center gap-2"><IconSend/>ذخیره و ارسال</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
