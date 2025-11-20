
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import type { Invoice, InvoiceLine, ToastData, Good, Party, PriceList, DiscountRule } from '../../types';
import { IconChevronRight, IconPlusCircle, IconTrash, IconSend, IconEye, IconDeviceFloppy } from '../Icons';
import { v4 as uuidv4 } from 'uuid';

interface NewInvoicePageProps {
    onNavigate: (page: string) => void;
    addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'status'>) => void;
    showToast: (message: string, type?: ToastData['type']) => void;
    parties: Party[];
    goods: Good[];
    priceLists: PriceList[];
    discountRules: DiscountRule[];
}

const initialLine: Omit<InvoiceLine, 'id'> = { itemCode: '', itemName: '', quantity: 1, rate: 0 };

export const NewInvoicePage: React.FC<NewInvoicePageProps> = ({ onNavigate, addInvoice, showToast, parties, goods, priceLists, discountRules }) => {
    const [customer, setCustomer] = useState<Party | null>(null);
    const [issueDate, setIssueDate] = useState(new Date().toISOString().substring(0, 10));
    const [dueDate, setDueDate] = useState('');
    const [lines, setLines] = useState<InvoiceLine[]>([{ id: uuidv4(), ...initialLine }]);
    const [notes, setNotes] = useState('از همکاری با شما سپاسگزاریم.');
    
    const [customerSearch, setCustomerSearch] = useState('');
    const [isCustomerDropdown, setIsCustomerDropdown] = useState(false);
    
    const [activeLine, setActiveLine] = useState<string | null>(null);
    const [productSearch, setProductSearch] = useState('');

    const customerInputRef = useRef<HTMLDivElement>(null);
    // FIX: Changed ref type from HTMLDivElement to HTMLTableCellElement to match the 'td' element it is attached to.
    const productInputRef = useRef<HTMLTableCellElement>(null);

    const nextInvoiceNumber = "F-1403-105";

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (customerInputRef.current && !customerInputRef.current.contains(event.target as Node)) {
                setIsCustomerDropdown(false);
            }
            if (productInputRef.current && !productInputRef.current.contains(event.target as Node)) {
                setActiveLine(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredCustomers = useMemo(() => {
        if (!customerSearch) return parties.filter(p => p.code.startsWith('1'));
        return parties.filter(p => p.code.startsWith('1') && p.name.toLowerCase().includes(customerSearch.toLowerCase()));
    }, [parties, customerSearch]);

    const handleCustomerSelect = (party: Party) => {
        setCustomer(party);
        setCustomerSearch(party.name);
        setIsCustomerDropdown(false);
    };

    const calculatePrice = useCallback((good: Good, qty: number): number => {
        if (!customer) return good.salePrice;

        const basePrice = priceLists[0]?.items.find(i => i.goodId === good.id)?.price || good.salePrice;
        let finalPrice = basePrice;
        let highestPriorityDiscount = 0;

        const applicableDiscounts = discountRules.filter(r => r.isActive && r.conditions.some(c => 
            (c.target === 'CUSTOMER' && c.value === customer.id) ||
            (c.target === 'PRODUCT' && c.value === good.id) ||
            (c.target === 'CATEGORY' && c.value === good.category)
        )).sort((a,b) => a.priority - b.priority);

        if (applicableDiscounts.length > 0) {
            const rule = applicableDiscounts[0]; // Highest priority
            if(rule.action.type === 'PERCENTAGE' && rule.action.value) {
                finalPrice = basePrice * (1 - rule.action.value / 100);
            }
        }
        
        return finalPrice;

    }, [customer, priceLists, discountRules]);

    const handleProductSelect = (lineId: string, good: Good) => {
        setLines(prev => prev.map(line => {
            if (line.id === lineId) {
                const price = calculatePrice(good, line.quantity);
                return { ...line, itemCode: good.code, itemName: good.name, rate: price };
            }
            return line;
        }));
        setActiveLine(null);
        setProductSearch('');
    };

    const addLine = useCallback(() => setLines(prev => [...prev, { ...initialLine, id: uuidv4() }]), []);
    const removeLine = useCallback((id: string) => setLines(prev => prev.length > 1 ? prev.filter(l => l.id !== id) : [{ id: uuidv4(), ...initialLine }]), []);

    const handleLineChange = (id: string, field: keyof InvoiceLine, value: any) => {
        setLines(prev => prev.map(line => {
            if (line.id === id) {
                const updatedLine = { ...line, [field]: value };
                if (field === 'quantity') {
                    const good = goods.find(g => g.code === line.itemCode);
                    if(good) updatedLine.rate = calculatePrice(good, Number(value));
                }
                return updatedLine;
            }
            return line;
        }));
    };
    
    const totals = useMemo(() => {
        const subtotal = lines.reduce((acc, line) => acc + (Number(line.quantity) || 0) * (Number(line.rate) || 0), 0);
        const tax = subtotal * 0.09;
        const total = subtotal + tax;
        return { subtotal, tax, total };
    }, [lines]);

    const handleSave = () => {
        if (!customer || lines.some(l => !l.itemCode || l.quantity <= 0)) {
            showToast('لطفاً مشتری و تمام آیتم‌های فاکتور را به درستی وارد کنید.', 'error');
            return;
        }

        const newInvoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'status'> = {
            customerId: customer.id,
            customerName: customer.name,
            customerEmail: customer.phone,
            customerAddress: customer.address,
            issueDate: new Date(issueDate).toLocaleDateString('fa-IR-u-nu-latn'),
            dueDate: dueDate ? new Date(dueDate).toLocaleDateString('fa-IR-u-nu-latn') : '',
            dueDateObj: new Date(dueDate),
            lines: lines.filter(l => l.quantity > 0 && l.rate > 0),
            notes,
            subtotal: totals.subtotal,
            tax: totals.tax,
            discount: 0,
            total: totals.total,
            paidAmount: 0,
        };
        addInvoice(newInvoice);
        showToast('فاکتور جدید به صورت پیش‌نویس ذخیره شد.');
        onNavigate('financials-ar-invoices');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">فاکتور فروش جدید (حرفه‌ای)</h1>
                <button onClick={() => onNavigate('dashboard')} className="btn-secondary flex items-center gap-2"><IconChevronRight className="w-5 h-5" /><span>بازگشت</span></button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b dark:border-gray-700">
                     <div className="relative" ref={customerInputRef}>
                        <label className="label-form">مشتری</label>
                        <input type="text" placeholder="جستجوی نام مشتری..." value={customerSearch}
                            onChange={e => {setCustomerSearch(e.target.value); setCustomer(null);}} onFocus={() => setIsCustomerDropdown(true)} className="input-field"/>
                        {isCustomerDropdown && <ul className="dropdown-list">{filteredCustomers.map(p => <li key={p.id} onClick={() => handleCustomerSelect(p)} className="dropdown-item">{p.name} ({p.code})</li>)}</ul>}
                    </div>
                     <div>
                        <label className="label-form">تاریخ صدور</label>
                        <input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} className="input-field" />
                    </div>
                     <div>
                        <label className="label-form">تاریخ سررسید</label>
                        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="input-field" />
                    </div>
                </div>
                
                <div className="overflow-x-auto -mx-6 px-6">
                    <table className="w-full text-sm">
                        <thead className="text-gray-500 dark:text-gray-400">
                            <tr className="border-b dark:border-gray-600">
                                <th className="p-2 text-right font-medium min-w-[300px]">نام کالا</th>
                                <th className="p-2 text-right font-medium w-24">موجودی</th>
                                <th className="p-2 text-right font-medium w-24">تعداد</th>
                                <th className="p-2 text-right font-medium w-32">مبلغ واحد</th>
                                <th className="p-2 text-right font-medium w-32">مبلغ کل</th>
                                <th className="w-10"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {lines.map((line) => {
                                const good = goods.find(g => g.code === line.itemCode);
                                return (
                                <tr key={line.id}>
                                    <td className="p-1" ref={productInputRef}>
                                        <div className="relative">
                                            <input type="text" placeholder="جستجوی نام یا کد کالا" value={activeLine === line.id ? productSearch : line.itemName}
                                            onChange={e => setProductSearch(e.target.value)} onFocus={() => {setActiveLine(line.id); setProductSearch('');}} className="input-field"/>
                                            {activeLine === line.id && <ul className="dropdown-list">{goods.filter(g => g.name.includes(productSearch)).map(g => <li key={g.id} onClick={() => handleProductSelect(line.id, g)} className="dropdown-item">{g.name} ({g.code})</li>)}</ul>}
                                        </div>
                                    </td>
                                    <td className="p-1"><input type="text" readOnly value={good?.stock ?? '-'} className="input-field-readonly"/></td>
                                    <td className="p-1"><input type="number" value={line.quantity} onChange={e => handleLineChange(line.id, 'quantity', Number(e.target.value))} className="input-field"/></td>
                                    <td className="p-1"><input type="number" value={line.rate} onChange={e => handleLineChange(line.id, 'rate', Number(e.target.value))} className="input-field font-mono"/></td>
                                    <td className="p-1"><input type="text" readOnly value={((line.quantity || 0) * (line.rate || 0)).toLocaleString('fa-IR')} className="input-field-readonly"/></td>
                                    <td className="p-1 text-center"><button onClick={() => removeLine(line.id)} className="text-danger p-1 rounded-full hover:bg-red-100 dark:hover:bg-gray-600"><IconTrash className="w-4 h-4" /></button></td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                     <button onClick={addLine} className="flex items-center gap-2 mt-3 px-3 py-1.5 text-sm bg-primary-50 text-primary rounded-lg hover:bg-primary-100 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"><IconPlusCircle className="w-4 h-4"/> افزودن آیتم</button>
                </div>

                <div className="flex flex-col md:flex-row gap-6 pt-4 border-t dark:border-gray-700">
                    <div className="flex-grow"><label className="label-form">یادداشت:</label><textarea value={notes} onChange={e => setNotes(e.target.value)} className="input-field w-full" rows={3}></textarea></div>
                    <div className="w-full md:w-64 space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">جمع کل:</span><span className="font-medium text-gray-800 dark:text-gray-200">{totals.subtotal.toLocaleString('fa-IR')}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">مالیات (۹٪):</span><span className="font-medium text-gray-800 dark:text-gray-200">{totals.tax.toLocaleString('fa-IR')}</span></div>
                        <div className="flex justify-between items-center pt-2 mt-2 border-t dark:border-gray-600"><span className="font-bold text-lg text-gray-900 dark:text-white">مبلغ نهایی:</span><span className="font-bold text-lg text-primary">{totals.total.toLocaleString('fa-IR')} تومان</span></div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t dark:border-gray-700">
                    <button onClick={handleSave} className="btn-primary flex items-center gap-2"><IconDeviceFloppy className="w-5 h-5"/>ذخیره پیش‌نویس</button>
                </div>
            </div>
            
            <style>{`
                .label-form{display:block;font-size:.875rem;font-weight:500;color:#4B5563;margin-bottom:.25rem}.dark .label-form{color:#D1D5DB}
                .input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;width:100%}.dark .input-field{background-color:#374151;border-color:#4B5563;color:white}
                .input-field:focus{outline:2px solid transparent;outline-offset:2px;--tw-ring-color:hsl(262 83% 58%);box-shadow:0 0 0 2px var(--tw-ring-color)}
                .input-field-readonly{padding:.5rem .75rem;border-radius:.5rem;background-color:#F3F4F6;border:1px solid #E5E7EB;width:100%;font-family:monospace;text-align:left}.dark .input-field-readonly{background-color:#1F2937;border-color:#4B5563;color:#D1D5DB}
                .btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500;transition:all .2s}.btn-primary:hover:not(:disabled){background-color:hsl(262 75% 52%)}
                .btn-secondary{padding:.5rem 1rem;background-color:#E5E7EB;color:#1F2937;border-radius:.5rem;font-weight:500}.dark .btn-secondary{background-color:#4B5563;color:#F9FAFB}
                .dropdown-list{position:absolute;z-index:10;width:100%;max-height:12rem;overflow-y:auto;background-color:white;border:1px solid #d1d5db;border-radius:0.375rem;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);margin-top:0.25rem}.dark .dropdown-list{background-color:#1F2937;border-color:#4B5563}
                .dropdown-item{padding:0.5rem 0.75rem;cursor:pointer}.dropdown-item:hover{background-color:#f3f4f6}.dark .dropdown-item:hover{background-color:#374151}
            `}</style>
        </div>
    );
};
