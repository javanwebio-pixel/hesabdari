
import React, { useState, useMemo, useCallback } from 'react';
import type { SalesOrder, SalesOrderLine, ToastData, Good, Party, Quote } from '../../types';
import { IconChevronRight, IconPlusCircle, IconTrash, IconDeviceFloppy } from '../Icons';
import { v4 as uuidv4 } from 'uuid';

interface NewOrderPageProps {
    onNavigate: (page: string) => void;
    addSalesOrder: (order: Omit<SalesOrder, 'id' | 'orderNumber'>) => void;
    showToast: (message: string, type?: ToastData['type']) => void;
    parties: Party[];
    goods: Good[];
    quotes: Quote[];
}

const initialLine: Omit<SalesOrderLine, 'id'> = { itemCode: '', itemName: '', quantity: 1, rate: 0 };

export const NewOrderPage: React.FC<NewOrderPageProps> = ({ onNavigate, addSalesOrder, showToast, parties, goods, quotes }) => {
    const [selectedParty, setSelectedParty] = useState<Party | null>(null);
    const [orderDate, setOrderDate] = useState(new Date().toISOString().substring(0, 10));
    const [requiredDeliveryDate, setRequiredDeliveryDate] = useState('');
    const [lines, setLines] = useState<SalesOrderLine[]>([{ id: uuidv4(), ...initialLine }]);
    const [selectedQuoteId, setSelectedQuoteId] = useState<string>('');

    const handleQuoteChange = (quoteId: string) => {
        const quote = quotes.find(q => q.id === quoteId);
        if (quote) {
            setSelectedQuoteId(quoteId);
            setSelectedParty(parties.find(p => p.id === quote.customerId) || null);
            setLines(quote.lines.map(l => ({ ...l, id: uuidv4() })));
            showToast(`اطلاعات از پیش‌فاکتور ${quote.quoteNumber} بارگذاری شد.`, 'info');
        } else {
            setSelectedQuoteId('');
            setSelectedParty(null);
            setLines([{ id: uuidv4(), ...initialLine }]);
        }
    };
    
    const totals = useMemo(() => {
        const subtotal = lines.reduce((acc, line) => acc + (Number(line.quantity) || 0) * (Number(line.rate) || 0), 0);
        const tax = subtotal * 0.09;
        const total = subtotal + tax;
        return { total };
    }, [lines]);

    const handleSave = () => {
        if (!selectedParty || lines.some(l => !l.itemCode || l.quantity <= 0)) {
            showToast('لطفا مشتری و تمام آیتم‌های سفارش را به درستی وارد کنید.', 'error');
            return;
        }

        const newOrder: Omit<SalesOrder, 'id' | 'orderNumber'> = {
            customerId: selectedParty.id,
            customerName: selectedParty.name,
            quoteId: selectedQuoteId || undefined,
            orderDate: new Date(orderDate).toLocaleDateString('fa-IR-u-nu-latn'),
            requiredDeliveryDate: requiredDeliveryDate ? new Date(requiredDeliveryDate).toLocaleDateString('fa-IR-u-nu-latn') : '',
            lines: lines.filter(l => l.quantity > 0 && l.rate > 0),
            total: totals.total,
            status: 'باز',
        };
        addSalesOrder(newOrder);
        showToast(`سفارش فروش جدید ایجاد شد.`);
        onNavigate('dashboard');
    };

    return (
        <div className="space-y-6">
             <style>{`.label-form{display:block;font-size:.875rem;font-weight:500;color:#374151;margin-bottom:.25rem}.dark .label-form{color:#D1D5DB}.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;width:100%}.dark .input-field{background-color:#374151;border-color:#4B5563}.btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500;transition:all .2s}.btn-secondary{padding:.5rem 1rem;background-color:#E5E7EB;color:#1F2937;border-radius:.5rem;font-weight:500}.dark .btn-secondary{background-color:#4B5563;color:#F9FAFB}`}</style>
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">سفارش فروش جدید</h1>
                 <button onClick={() => onNavigate('dashboard')} className="btn-secondary flex items-center gap-2"><IconChevronRight className="w-5 h-5" /><span>بازگشت</span></button>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div>
                        <label className="label-form">تبدیل از پیش‌فاکتور</label>
                        <select onChange={e => handleQuoteChange(e.target.value)} value={selectedQuoteId} className="input-field">
                            <option value="">-- سفارش جدید --</option>
                            {quotes.filter(q=>q.status === 'پذیرفته شده').map(q => <option key={q.id} value={q.id}>{q.quoteNumber} ({q.customerName})</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="label-form">مشتری</label>
                        <input type="text" readOnly value={selectedParty?.name || ''} className="input-field bg-gray-100 dark:bg-gray-700" />
                    </div>
                    <div>
                        <label className="label-form">تاریخ سفارش</label>
                        <input type="date" value={orderDate} onChange={e => setOrderDate(e.target.value)} className="input-field" />
                    </div>
                     <div>
                        <label className="label-form">تاریخ تحویل درخواستی</label>
                        <input type="date" value={requiredDeliveryDate} onChange={e => setRequiredDeliveryDate(e.target.value)} className="input-field" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                         <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase"><tr><th className="p-1 text-right font-medium">کالا</th><th className="p-1 text-right font-medium">تعداد</th><th className="p-1 text-right font-medium">نرخ واحد</th><th className="p-1 text-right font-medium">جمع کل</th></tr></thead>
                        <tbody>
                            {lines.map(line => (
                                <tr key={line.id}>
                                    <td className="p-2">{line.itemName} ({line.itemCode})</td>
                                    <td className="p-2">{line.quantity}</td>
                                    <td className="p-2 font-mono">{line.rate.toLocaleString('fa-IR')}</td>
                                    <td className="p-2 font-mono">{(line.quantity * line.rate).toLocaleString('fa-IR')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                 <div className="flex justify-between items-end pt-4 mt-4 border-t dark:border-gray-700">
                    <div><p className="font-bold text-lg text-gray-800 dark:text-gray-200">مبلغ نهایی: {totals.total.toLocaleString('fa-IR')}</p></div>
                    <div className="flex gap-2">
                        <button onClick={handleSave} className="btn-primary flex items-center gap-2"><IconDeviceFloppy/>ثبت سفارش</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
