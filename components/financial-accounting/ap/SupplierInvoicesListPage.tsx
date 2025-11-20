import React, { useState, useMemo, useCallback } from 'react';
import type { SupplierInvoice, SupplierInvoiceStatus, Good, Party, ToastData, SupplierInvoiceLine } from '../../../types';
import { IconPlusCircle, IconSearch, IconEdit, IconTrash, IconChevronLeft, IconChevronRight, IconFilter, IconFileText } from '../../Icons';
import { Modal } from '../../common/Modal';
import { v4 as uuidv4 } from 'uuid';

const ITEMS_PER_PAGE = 5;

const parseFaDate = (dateStr: string): Date => {
    if (!dateStr) return new Date();
    const parts = dateStr.split('/');
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
};

const statusMap: { [key in SupplierInvoiceStatus]: { class: string; name: string } } = {
    'پیش‌نویس': { class: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200', name: 'پیش‌نویس' },
    'ثبت شده': { class: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', name: 'ثبت شده' },
    'پرداخت قسمتی': { class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', name: 'پرداخت قسمتی' },
    'پرداخت شده': { class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', name: 'پرداخت شده' },
    'لغو شده': { class: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', name: 'لغو شده' },
};


const SupplierInvoiceForm: React.FC<{
    onSave: (invoice: Omit<SupplierInvoice, 'id'> | SupplierInvoice) => void,
    onCancel: () => void,
    initialData?: SupplierInvoice | null,
    suppliers: Party[],
    goods: Good[],
    showToast: (message: string, type?: ToastData['type']) => void,
}> = ({ onSave, onCancel, initialData, suppliers, goods, showToast }) => {
    const isEditing = !!initialData;
    const [formData, setFormData] = useState({
        supplierId: initialData?.supplierId || '',
        invoiceNumber: initialData?.invoiceNumber || '',
        invoiceDate: initialData?.invoiceDate ? new Date(parseFaDate(initialData.invoiceDate)).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        dueDate: initialData?.dueDate ? new Date(parseFaDate(initialData.dueDate)).toISOString().split('T')[0] : '',
    });
    const [lines, setLines] = useState<SupplierInvoiceLine[]>(initialData?.lines?.map(l => ({ ...l, id: uuidv4() })) || [{ id: uuidv4(), itemCode: '', itemName: '', description: '', quantity: 1, rate: 0, total: 0 }]);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    const handleLineChange = useCallback((id: string, field: keyof Omit<SupplierInvoiceLine, 'id'>, value: any) => {
        setLines(prev => prev.map(line => {
            if (line.id !== id) return line;
            const updatedLine = { ...line, [field]: value };
            if (field === 'quantity' || field === 'rate') {
                updatedLine.total = (Number(updatedLine.quantity) || 0) * (Number(updatedLine.rate) || 0);
            }
            return updatedLine;
        }));
    }, []);
    
    const handleGoodSelect = (lineId: string, good: Good) => {
        setLines(prev => prev.map(line => 
            line.id === lineId ? { ...line, itemCode: good.code, itemName: good.name, rate: good.purchasePrice, total: (line.quantity || 1) * good.purchasePrice, description: good.name } : line
        ));
        setActiveDropdown(null);
    };

    const addLine = useCallback(() => setLines(prev => [...prev, { id: uuidv4(), itemCode: '', itemName: '', description: '', quantity: 1, rate: 0, total: 0 }]), []);
    const removeLine = useCallback((id: string) => setLines(prev => prev.filter(l => l.id !== id)), []);

    const totals = useMemo(() => {
        const subtotal = lines.reduce((acc, line) => acc + line.total, 0);
        const tax = subtotal * 0.09;
        const totalAmount = subtotal + tax;
        return { subtotal, tax, totalAmount };
    }, [lines]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.supplierId || !formData.invoiceNumber || !formData.dueDate) {
            showToast('لطفاً تامین کننده، شماره فاکتور و تاریخ سررسید را وارد کنید.', 'error');
            return;
        }

        const supplierName = suppliers.find(s => s.id === formData.supplierId)?.name || '';
        const invoiceData = {
            ...initialData,
            ...formData,
            invoiceDate: new Date(formData.invoiceDate).toLocaleDateString('fa-IR-u-nu-latn'),
            dueDate: new Date(formData.dueDate).toLocaleDateString('fa-IR-u-nu-latn'),
            supplierName,
            lines: lines.filter(l => l.total > 0),
            ...totals,
            paidAmount: initialData?.paidAmount || 0,
            status: initialData?.status || 'ثبت شده',
        };
        onSave(invoiceData as SupplierInvoice);
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="label-form">تامین کننده</label>
                    <select name="supplierId" value={formData.supplierId} onChange={(e) => setFormData(f => ({ ...f, supplierId: e.target.value }))} className="input-field w-full">
                        <option value="">انتخاب کنید...</option>
                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                    </select>
                </div>
                <div>
                    <label className="label-form">شماره فاکتور تامین کننده</label>
                    <input type="text" value={formData.invoiceNumber} onChange={(e) => setFormData(f => ({ ...f, invoiceNumber: e.target.value }))} className="input-field w-full" />
                </div>
                <div>
                    <label className="label-form">تاریخ فاکتور</label>
                    <input type="date" value={formData.invoiceDate} onChange={(e) => setFormData(f => ({ ...f, invoiceDate: e.target.value }))} className="input-field w-full" />
                </div>
                <div>
                    <label className="label-form">تاریخ سررسید</label>
                    <input type="date" value={formData.dueDate} onChange={(e) => setFormData(f => ({ ...f, dueDate: e.target.value }))} className="input-field w-full" />
                </div>
            </div>
            {/* Invoice Lines */}
            <div className="overflow-x-auto border-t dark:border-gray-600 pt-4">
                <table className="w-full text-sm">
                    <thead><tr><th className="text-right p-1 font-medium">کالا/شرح</th><th className="text-right p-1 font-medium w-24">تعداد</th><th className="text-right p-1 font-medium w-32">نرخ</th><th className="text-right p-1 font-medium w-32">جمع</th><th className="w-8"></th></tr></thead>
                    <tbody>
                        {lines.map(line => (
                            <tr key={line.id}>
                                <td className="p-1 relative">
                                    <input type="text" placeholder="جستجوی کالا یا وارد کردن شرح هزینه" value={line.description} 
                                        onChange={e => { handleLineChange(line.id, 'description', e.target.value); handleLineChange(line.id, 'itemName', e.target.value); setActiveDropdown(line.id); }}
                                        onFocus={() => setActiveDropdown(line.id)} className="input-field w-full" />
                                    {activeDropdown === line.id && (
                                        <ul className="absolute z-20 w-full max-h-48 overflow-y-auto bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-md shadow-lg mt-1">
                                            {goods.filter(g => g.name.toLowerCase().includes((line.description || '').toLowerCase())).map(good => (
                                                <li key={good.id} onClick={() => handleGoodSelect(line.id, good)} className="px-3 py-2 cursor-pointer hover:bg-primary-50 dark:hover:bg-gray-700">
                                                    {good.name} <span className="text-xs text-gray-500">({good.code})</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </td>
                                <td className="p-1"><input type="number" value={line.quantity} onChange={e => handleLineChange(line.id, 'quantity', Number(e.target.value))} className="input-field w-full"/></td>
                                <td className="p-1"><input type="number" value={line.rate} onChange={e => handleLineChange(line.id, 'rate', Number(e.target.value))} className="input-field w-full font-mono"/></td>
                                <td className="p-1"><input type="text" readOnly value={line.total.toLocaleString('fa-IR')} className="input-field bg-gray-100 dark:bg-gray-700 border-none w-full font-mono"/></td>
                                <td className="p-1 text-center">{lines.length > 1 && <button type="button" onClick={() => removeLine(line.id)} className="text-danger p-1"><IconTrash className="w-4 h-4" /></button>}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button type="button" onClick={addLine} className="flex items-center gap-2 mt-2 px-3 py-1.5 text-sm bg-primary-50 text-primary rounded-lg hover:bg-primary-100 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors">
                    <IconPlusCircle className="w-4 h-4"/> افزودن سطر
                </button>
            </div>
            {/* Totals and Actions */}
            <div className="flex justify-between items-end pt-4 border-t dark:border-gray-600">
                 <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <div><span>جمع: </span><span className="font-mono">{totals.subtotal.toLocaleString('fa-IR')}</span></div>
                    <div><span>مالیات (۹٪): </span><span className="font-mono">{totals.tax.toLocaleString('fa-IR')}</span></div>
                    <div className="font-bold text-base text-gray-800 dark:text-white"><span>مبلغ نهایی: </span><span className="font-mono">{totals.totalAmount.toLocaleString('fa-IR')}</span></div>
                </div>
                <div className="flex gap-2">
                    <button type="button" onClick={onCancel} className="btn-secondary">لغو</button>
                    <button type="submit" className="btn-primary">ذخیره</button>
                </div>
            </div>
        </form>
    );
};

interface SupplierInvoicesListPageProps {
    invoices: SupplierInvoice[];
    parties: Party[];
    goods: Good[];
    addInvoice: (invoice: Omit<SupplierInvoice, 'id'>) => void;
    updateInvoice: (invoice: SupplierInvoice) => void;
    deleteInvoice: (id: string) => void;
    showToast: (message: string, type?: ToastData['type']) => void;
}

export const SupplierInvoicesListPage: React.FC<SupplierInvoicesListPageProps> = ({ invoices, parties, goods, addInvoice, updateInvoice, deleteInvoice, showToast }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState<SupplierInvoice | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    
    const processedInvoices = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return invoices.map(inv => {
            const dueDate = parseFaDate(inv.dueDate);
            const diffDays = Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
            return { ...inv, daysOverdue: diffDays > 0 ? diffDays : 0 };
        }).sort((a, b) => (b.daysOverdue || 0) - (a.daysOverdue || 0));
    }, [invoices]);

    const filteredInvoices = useMemo(() => processedInvoices.filter(inv =>
        inv.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
    ), [processedInvoices, searchTerm]);

    const paginatedInvoices = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredInvoices.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredInvoices, currentPage]);

    const totalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE);

    const handleSave = (invoiceData: Omit<SupplierInvoice, 'id'> | SupplierInvoice) => {
        if ('id' in invoiceData) {
            updateInvoice(invoiceData);
        } else {
            addInvoice(invoiceData as Omit<SupplierInvoice, 'id'>);
        }
        setIsModalOpen(false);
        setEditingInvoice(null);
    };

    const handleEdit = (invoice: SupplierInvoice) => {
        setEditingInvoice(invoice);
        setIsModalOpen(true);
    };

    const handleOpenModal = () => {
        setEditingInvoice(null);
        setIsModalOpen(true);
    };
    
    const getOverdueClass = (days: number) => {
        if (days <= 0) return 'text-gray-500';
        if (days <= 15) return 'text-yellow-500';
        if (days <= 30) return 'text-orange-500';
        return 'text-red-500 font-bold';
    };


    return (
        <div className="space-y-6">
            <style>{`.label-form{display:block;font-size:.875rem;font-weight:500;color:#374151;margin-bottom:.25rem}.dark .label-form{color:#D1D5DB}.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;width:100%}.dark .input-field{background-color:#374151;border-color:#4B5563}.input-field:focus{outline:2px solid transparent;outline-offset:2px;--tw-ring-color:hsl(262 83% 58%);box-shadow:0 0 0 2px var(--tw-ring-color)}.btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500;transition:background-color .2s}.btn-primary:hover{background-color:hsl(262 75% 52%)}.btn-secondary{padding:.5rem 1rem;background-color:#E5E7EB;color:#1F2937;border-radius:.5rem;font-weight:500;transition:background-color .2s}.dark .btn-secondary{background-color:#4B5563;color:#F9FAFB}.btn-secondary:hover{background-color:#D1D5DB}.dark .btn-secondary:hover{background-color:#6B7280}`}</style>
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">میزکار حساب‌های پرداختنی</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">فاکتورهای تامین‌کنندگان را مدیریت و پیگیری کنید.</p>
                </div>
                <button onClick={handleOpenModal} className="btn-primary flex items-center gap-2"><IconPlusCircle className="w-5 h-5"/> ثبت فاکتور جدید</button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                 <div className="relative mb-4">
                    <IconSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type="text" placeholder="جستجو شماره فاکتور یا نام تامین کننده..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pr-10 pl-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"/>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-3">تامین کننده</th><th className="px-4 py-3">شماره فاکتور</th><th className="px-4 py-3">تاریخ سررسید</th>
                                <th className="px-4 py-3">تاخیر (روز)</th><th className="px-4 py-3">مبلغ کل</th><th className="px-4 py-3">مانده</th><th className="px-4 py-3">وضعیت</th><th className="px-4 py-3">عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedInvoices.map(inv => {
                                const remaining = inv.totalAmount - inv.paidAmount;
                                return (
                                <tr key={inv.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-4 py-2 font-semibold text-gray-800 dark:text-gray-200">{inv.supplierName}</td>
                                    <td className="px-4 py-2 font-mono">{inv.invoiceNumber}</td>
                                    <td className="px-4 py-2">{inv.dueDate}</td>
                                    <td className={`px-4 py-2 font-mono ${getOverdueClass(inv.daysOverdue || 0)}`}>{inv.daysOverdue || 0}</td>
                                    <td className="px-4 py-2 font-mono">{inv.totalAmount.toLocaleString('fa-IR')}</td>
                                    <td className={`px-4 py-2 font-mono font-semibold ${remaining > 0 ? 'text-danger' : 'text-success'}`}>{remaining.toLocaleString('fa-IR')}</td>
                                    <td className="px-4 py-2"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusMap[inv.status].class}`}>{statusMap[inv.status].name}</span></td>
                                    <td className="px-4 py-2">
                                        <button onClick={() => handleEdit(inv)} className="p-1 text-blue-500 hover:text-blue-600" title="ویرایش"><IconEdit className="w-4 h-4"/></button>
                                        <button onClick={() => deleteInvoice(inv.id)} className="p-1 text-danger hover:text-red-600" title="حذف"><IconTrash className="w-4 h-4"/></button>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-between items-center mt-4 text-sm text-gray-600 dark:text-gray-400">
                    <div>نمایش {paginatedInvoices.length} از {filteredInvoices.length} فاکتور</div>
                    <div className="flex items-center gap-1">
                        <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="p-2 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"><IconChevronRight/></button>
                        <span className="px-2">صفحه {currentPage} از {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="p-2 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"><IconChevronLeft/></button>
                    </div>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingInvoice(null); }} title={editingInvoice ? "ویرایش فاکتور تامین‌کننده" : "ثبت فاکتور تامین‌کننده جدید"}>
                <SupplierInvoiceForm onSave={handleSave} onCancel={() => { setIsModalOpen(false); setEditingInvoice(null); }} initialData={editingInvoice} suppliers={parties} goods={goods} showToast={showToast} />
            </Modal>
        </div>
    );
};