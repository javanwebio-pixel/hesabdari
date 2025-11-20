import React, { useState, useMemo } from 'react';
import type { InternalOrder, InternalOrderStatus, InternalOrderType, ToastData } from '../../../types';
import { IconPlusCircle, IconSearch, IconEdit, IconTrash, IconChevronLeft, IconChevronRight } from '../../Icons';
import { Modal } from '../../common/Modal';
import { v4 as uuidv4 } from 'uuid';

const ITEMS_PER_PAGE = 5;

const statusMap: { [key in InternalOrderStatus]: { class: string } } = {
    'ایجاد شده': { class: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
    'آزاد شده': { class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
    'تسویه شده': { class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
    'بسته شده': { class: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' },
};

const OrderForm: React.FC<{
    onSave: (order: Omit<InternalOrder, 'id'> | InternalOrder) => void;
    onCancel: () => void;
    initialData?: InternalOrder | null;
    nextOrderNumber: number;
}> = ({ onSave, onCancel, initialData, nextOrderNumber }) => {
    const isEditing = !!initialData;
    const [formData, setFormData] = useState({
        description: initialData?.description || '',
        orderType: initialData?.orderType || 'عمومی',
        responsiblePerson: initialData?.responsiblePerson || '',
        plannedCosts: initialData?.plannedCosts || 0,
        status: initialData?.status || 'ایجاد شده',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const orderData = {
            ...formData,
            orderNumber: isEditing ? initialData!.orderNumber : nextOrderNumber,
            plannedCosts: Number(formData.plannedCosts),
            actualCosts: initialData?.actualCosts || 0,
        };
        if (isEditing) {
            onSave({ ...initialData!, ...orderData });
        } else {
            onSave(orderData as Omit<InternalOrder, 'id'>);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="label-form">شماره سفارش</label>
                <input type="text" value={isEditing ? initialData!.orderNumber : nextOrderNumber} disabled className="input-field w-full font-mono bg-gray-100 dark:bg-gray-700"/>
            </div>
            <div>
                <label className="label-form">شرح سفارش</label>
                <input type="text" name="description" value={formData.description} onChange={handleChange} required className="input-field w-full" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="label-form">نوع سفارش</label>
                    <select name="orderType" value={formData.orderType} onChange={handleChange} className="input-field w-full">
                        <option value="سرمایه‌گذاری">سرمایه‌گذاری</option>
                        <option value="تحقیق و توسعه">تحقیق و توسعه</option>
                        <option value="بازاریابی">بازاریابی</option>
                        <option value="نگهداری و تعمیرات">نگهداری و تعمیرات</option>
                        <option value="عمومی">عمومی</option>
                    </select>
                </div>
                <div>
                    <label className="label-form">مسئول</label>
                    <input type="text" name="responsiblePerson" value={formData.responsiblePerson} onChange={handleChange} required className="input-field w-full" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="label-form">هزینه برنامه‌ریزی شده (تومان)</label>
                    <input type="number" name="plannedCosts" value={formData.plannedCosts} onChange={handleChange} className="input-field w-full" />
                </div>
                 <div>
                    <label className="label-form">وضعیت</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="input-field w-full">
                        <option value="ایجاد شده">ایجاد شده</option>
                        <option value="آزاد شده">آزاد شده</option>
                        <option value="تسویه شده">تسویه شده</option>
                        <option value="بسته شده">بسته شده</option>
                    </select>
                </div>
            </div>
             <div className="flex justify-end gap-2 pt-4 border-t dark:border-gray-700">
                <button type="button" onClick={onCancel} className="btn-secondary">لغو</button>
                <button type="submit" className="btn-primary">ذخیره</button>
            </div>
        </form>
    );
};

interface InternalOrdersPageProps {
    internalOrders: InternalOrder[];
    addInternalOrder: (order: Omit<InternalOrder, 'id'>) => void;
    updateInternalOrder: (order: InternalOrder) => void;
    deleteInternalOrder: (id: string) => void;
    showToast: (message: string, type?: ToastData['type']) => void;
}

export const InternalOrdersPage: React.FC<InternalOrdersPageProps> = ({ internalOrders, addInternalOrder, updateInternalOrder, deleteInternalOrder, showToast }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<InternalOrder | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const filteredOrders = useMemo(() => {
        return internalOrders.filter(order =>
            order.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(order.orderNumber).includes(searchTerm)
        );
    }, [internalOrders, searchTerm]);

    const paginatedOrders = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredOrders, currentPage]);

    const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);

    const nextOrderNumber = useMemo(() => {
        if (internalOrders.length === 0) return 40001;
        return Math.max(...internalOrders.map(o => o.orderNumber)) + 1;
    }, [internalOrders]);

    const handleSave = (orderData: Omit<InternalOrder, 'id'> | InternalOrder) => {
        if ('id' in orderData) {
            updateInternalOrder(orderData);
        } else {
            addInternalOrder(orderData);
        }
        setIsModalOpen(false);
        setEditingOrder(null);
    };

    const handleEdit = (order: InternalOrder) => {
        setEditingOrder(order);
        setIsModalOpen(true);
    };
    
    const handleDelete = (id: string) => {
        if(window.confirm('آیا از حذف این سفارش داخلی اطمینان دارید؟')) {
            deleteInternalOrder(id);
        }
    }

    return (
        <div className="space-y-6">
            <style>{`.label-form{display:block;font-size:.875rem;font-weight:500;color:#374151;margin-bottom:.25rem}.dark .label-form{color:#D1D5DB}.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;width:100%}.dark .input-field{background-color:#374151;border-color:#4B5563}.input-field:focus{outline:2px solid transparent;outline-offset:2px;--tw-ring-color:hsl(262 83% 58%);box-shadow:0 0 0 2px var(--tw-ring-color)}.btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500;transition:background-color .2s}.btn-primary:hover{background-color:hsl(262 75% 52%)}.btn-secondary{padding:.5rem 1rem;background-color:#E5E7EB;color:#1F2937;border-radius:.5rem;font-weight:500}.dark .btn-secondary{background-color:#4B5563;color:#F9FAFB}.btn-secondary:hover{background-color:#D1D5DB}.dark .btn-secondary:hover{background-color:#6B7280}`}</style>
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">مدیریت سفارشات داخلی</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">سفارشات داخلی برای ردیابی هزینه‌های پروژه‌ها و فعالیت‌های خاص.</p>
                </div>
                <button onClick={() => { setEditingOrder(null); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2">
                    <IconPlusCircle className="w-5 h-5"/> ایجاد سفارش جدید
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                 <div className="relative mb-4">
                    <IconSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type="text" placeholder="جستجو شماره سفارش یا شرح..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pr-10 pl-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"/>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-3">شماره</th><th className="px-4 py-3">شرح</th><th className="px-4 py-3">نوع</th><th className="px-4 py-3">مسئول</th>
                                <th className="px-4 py-3">هزینه واقعی/برنامه</th><th className="px-4 py-3">وضعیت</th><th className="px-4 py-3">عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedOrders.map(order => {
                                const costProgress = order.plannedCosts > 0 ? (order.actualCosts / order.plannedCosts) * 100 : 0;
                                return (
                                <tr key={order.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-4 py-2 font-mono">{order.orderNumber}</td>
                                    <td className="px-4 py-2 font-semibold text-gray-800 dark:text-gray-200">{order.description}</td>
                                    <td className="px-4 py-2">{order.orderType}</td>
                                    <td className="px-4 py-2">{order.responsiblePerson}</td>
                                    <td className="px-4 py-2">
                                        <div className="flex flex-col">
                                            <span className="font-mono text-xs">{order.actualCosts.toLocaleString('fa-IR')} / {order.plannedCosts.toLocaleString('fa-IR')}</span>
                                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                                <div className="bg-primary h-1.5 rounded-full" style={{width: `${Math.min(costProgress, 100)}%`}}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusMap[order.status].class}`}>{order.status}</span></td>
                                    <td className="px-4 py-2">
                                        <button onClick={() => handleEdit(order)} className="p-1 text-blue-500 hover:text-blue-600" title="ویرایش"><IconEdit className="w-4 h-4"/></button>
                                        <button onClick={() => handleDelete(order.id)} className="p-1 text-danger hover:text-red-600" title="حذف"><IconTrash className="w-4 h-4"/></button>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
                 <div className="flex justify-between items-center mt-4 text-sm text-gray-600 dark:text-gray-400">
                    <div>نمایش {paginatedOrders.length} از {filteredOrders.length} سفارش</div>
                    <div className="flex items-center gap-1">
                        <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="p-2 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"><IconChevronRight/></button>
                        <span className="px-2">صفحه {currentPage} از {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="p-2 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"><IconChevronLeft/></button>
                    </div>
                </div>
            </div>
            
             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingOrder ? "ویرایش سفارش داخلی" : "ایجاد سفارش داخلی جدید"}>
                <OrderForm onSave={handleSave} onCancel={() => setIsModalOpen(false)} initialData={editingOrder} nextOrderNumber={nextOrderNumber} />
            </Modal>
        </div>
    );
};