import React, { useState, useMemo } from 'react';
import type { Invoice, InvoiceStatus, Party } from '../../../types';
import { IconPlusCircle, IconSearch, IconChevronLeft, IconChevronRight, IconEdit, IconTrash, IconDeviceFloppy, IconFileText } from '../../Icons';

const ITEMS_PER_PAGE = 5;

const parseFaDate = (dateStr: string): Date => {
    if (!dateStr) return new Date();
    const parts = dateStr.split('/');
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
};

const statusMap: { [key in InvoiceStatus]: { class: string; name: string } } = {
    'پیش‌نویس': { class: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200', name: 'پیش‌نویس' },
    'ثبت نهایی': { class: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', name: 'ثبت نهایی' },
    'ارسال شده': { class: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', name: 'ارسال شده' },
    'پرداخت قسمتی': { class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', name: 'پرداخت قسمتی' },
    'پرداخت شده': { class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', name: 'پرداخت شده' },
    'لغو شده': { class: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', name: 'لغو شده' },
    'معوق': { class: 'bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-200 font-bold', name: 'معوق' },
};

interface CustomerInvoicesListPageProps {
    invoices: Invoice[];
    parties: Party[];
    onNavigate: (page: 'sales-ops-billing') => void;
    postInvoice: (invoiceId: string) => void;
}

export const CustomerInvoicesListPage: React.FC<CustomerInvoicesListPageProps> = ({ invoices, parties, onNavigate, postInvoice }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const processedInvoices = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return invoices.map(inv => {
            const dueDate = parseFaDate(inv.dueDate);
            const diffDays = Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
            const isOverdue = diffDays > 0 && inv.status !== 'پرداخت شده' && inv.status !== 'لغو شده' && inv.status !== 'پیش‌نویس';
            return { 
                ...inv, 
                daysOverdue: diffDays > 0 ? diffDays : 0,
                displayStatus: isOverdue ? 'معوق' : inv.status
            };
        }).sort((a, b) => (b.daysOverdue || 0) - (a.daysOverdue || 0));
    }, [invoices]);
    
    const filteredInvoices = useMemo(() => processedInvoices.filter(inv =>
        inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
    ), [processedInvoices, searchTerm]);
    
    const paginatedInvoices = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredInvoices.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredInvoices, currentPage]);

    const totalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE);
    
    const getOverdueClass = (days: number) => {
        if (days <= 0) return 'text-gray-500';
        if (days <= 15) return 'text-yellow-500';
        if (days <= 30) return 'text-orange-500';
        return 'text-red-500 font-bold';
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">میزکار حساب‌های دریافتنی</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">فاکتورهای مشتریان را مدیریت و پیگیری کنید.</p>
                </div>
                <button onClick={() => onNavigate('sales-ops-billing')} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-primary-600 transition-colors">
                    <IconPlusCircle className="w-5 h-5"/> صدور فاکتور جدید
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                 <div className="relative mb-4">
                    <IconSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type="text" placeholder="جستجو شماره فاکتور یا نام مشتری..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pr-10 pl-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"/>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-3">مشتری</th><th className="px-4 py-3">شماره فاکتور</th><th className="px-4 py-3">تاریخ سررسید</th>
                                <th className="px-4 py-3">تاخیر (روز)</th><th className="px-4 py-3">مبلغ کل</th><th className="px-4 py-3">مانده</th><th className="px-4 py-3">وضعیت</th><th className="px-4 py-3">عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedInvoices.map(inv => {
                                const remaining = inv.total - inv.paidAmount;
                                return (
                                <tr key={inv.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-4 py-2 font-semibold text-gray-800 dark:text-gray-200">{inv.customerName}</td>
                                    <td className="px-4 py-2 font-mono">{inv.invoiceNumber}</td>
                                    <td className="px-4 py-2">{inv.dueDate}</td>
                                    <td className={`px-4 py-2 font-mono ${getOverdueClass(inv.daysOverdue || 0)}`}>{inv.daysOverdue || 0}</td>
                                    <td className="px-4 py-2 font-mono">{inv.total.toLocaleString('fa-IR')}</td>
                                    <td className={`px-4 py-2 font-mono font-semibold ${remaining > 0 ? 'text-danger' : 'text-success'}`}>{remaining.toLocaleString('fa-IR')}</td>
                                    <td className="px-4 py-2"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusMap[inv.displayStatus as InvoiceStatus].class}`}>{statusMap[inv.displayStatus as InvoiceStatus].name}</span></td>
                                    <td className="px-4 py-2">
                                        {inv.status === 'پیش‌نویس' && (
                                            <button onClick={() => postInvoice(inv.id)} className="p-1 text-green-500 hover:text-green-600" title="ثبت نهایی و صدور سند"><IconDeviceFloppy className="w-4 h-4"/></button>
                                        )}
                                        {inv.journalEntryId && (
                                            <button className="p-1 text-gray-500 hover:text-gray-700" title="مشاهده سند حسابداری مرتبط"><IconFileText className="w-4 h-4"/></button>
                                        )}
                                        <button className="p-1 text-blue-500 hover:text-blue-600" title="ویرایش"><IconEdit className="w-4 h-4"/></button>
                                        <button className="p-1 text-danger hover:text-red-600" title="حذف"><IconTrash className="w-4 h-4"/></button>
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
        </div>
    );
};