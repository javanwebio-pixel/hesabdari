

import React, { useState, useMemo, useEffect } from 'react';
import type { Good } from '../../types';
import { IconPlusCircle, IconSearch, IconEdit, IconTrash, IconChevronLeft, IconChevronRight } from '../Icons';
import { Modal } from '../common/Modal';

// Form component for adding/editing goods
const NewGoodForm: React.FC<{
    goods: Good[];
    onSave: (goodData: Omit<Good, 'id'> | Good) => void,
    onCancel: () => void,
    initialData?: Good | null,
}> = ({ goods, onSave, onCancel, initialData }) => {
    const isEditing = !!initialData;
    const [formData, setFormData] = useState({
        code: initialData?.code || '',
        name: initialData?.name || '',
        category: initialData?.category || '',
        unit: initialData?.unit || 'عدد',
        stock: initialData?.stock || 0,
        purchasePrice: initialData?.purchasePrice || 0,
        salePrice: initialData?.salePrice || 0,
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (isEditing) return;

        const existingCodes = goods
            .map(p => parseInt(p.code, 10))
            .filter(num => !isNaN(num));

        const maxId = existingCodes.length > 0 ? Math.max(...existingCodes) : 1000;
        const nextId = maxId + 1;

        setFormData(prev => ({ ...prev, code: String(nextId) }));

    }, [isEditing, goods]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.code.trim()) newErrors.code = 'کد کالا الزامی است.';
        if (!formData.name.trim()) newErrors.name = 'نام کالا الزامی است.';
        if (Number(formData.stock) < 0) newErrors.stock = 'موجودی نمی‌تواند منفی باشد.';
        if (Number(formData.purchasePrice) < 0) newErrors.purchasePrice = 'قیمت خرید نمی‌تواند منفی باشد.';
        if (Number(formData.salePrice) < 0) newErrors.salePrice = 'قیمت فروش نمی‌تواند منفی باشد.';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        
        const dataToSave = {
            ...formData,
            stock: Number(formData.stock),
            purchasePrice: Number(formData.purchasePrice),
            salePrice: Number(formData.salePrice),
        };

        if (isEditing) {
            onSave({ ...initialData!, ...dataToSave });
        } else {
            onSave(dataToSave as Omit<Good, 'id'>);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">کد کالا</label>
                    <input type="text" name="code" value={formData.code} disabled required className="w-full input-field font-mono bg-gray-100 dark:bg-gray-700 cursor-not-allowed" />
                    {errors.code && <p className="text-xs text-danger mt-1">{errors.code}</p>}
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نام کالا</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full input-field" />
                    {errors.name && <p className="text-xs text-danger mt-1">{errors.name}</p>}
                </div>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">دسته بندی</label>
                <input type="text" name="category" value={formData.category} onChange={handleChange} className="w-full input-field" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">واحد شمارش</label>
                    <select name="unit" value={formData.unit} onChange={handleChange} className="w-full input-field">
                        <option value="عدد">عدد</option>
                        <option value="کیلوگرم">کیلوگرم</option>
                        <option value="متر">متر</option>
                        <option value="بسته">بسته</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">موجودی اولیه</label>
                    <input type="number" name="stock" value={formData.stock} onChange={handleChange} required className="w-full input-field" />
                    {errors.stock && <p className="text-xs text-danger mt-1">{errors.stock}</p>}
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">قیمت خرید (تومان)</label>
                    <input type="number" name="purchasePrice" value={formData.purchasePrice} onChange={handleChange} className="w-full input-field" />
                    {errors.purchasePrice && <p className="text-xs text-danger mt-1">{errors.purchasePrice}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">قیمت فروش (تومان)</label>
                    <input type="number" name="salePrice" value={formData.salePrice} onChange={handleChange} className="w-full input-field" />
                    {errors.salePrice && <p className="text-xs text-danger mt-1">{errors.salePrice}</p>}
                </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 transition-colors">لغو</button>
                <button type="submit" className="px-6 py-2 text-sm bg-primary text-white rounded-lg shadow-md hover:bg-primary-600 transition-colors">ذخیره</button>
            </div>
        </form>
    );
}

const ITEMS_PER_PAGE = 5;

interface GoodsPageProps {
    goods: Good[];
    addGood: (goodData: Omit<Good, 'id'>) => void;
    updateGood: (updatedGood: Good) => void;
    deleteGood: (id: string) => void;
}

export const GoodsPage: React.FC<GoodsPageProps> = ({ goods, addGood, updateGood, deleteGood }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGood, setEditingGood] = useState<Good | null>(null);
    const [goodToDelete, setGoodToDelete] = useState<Good | null>(null);
    const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    
    const filteredGoods = useMemo(() => {
        return goods.filter(good =>
            good.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            good.code.includes(searchTerm)
        );
    }, [goods, searchTerm]);

    const paginatedGoods = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredGoods.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredGoods, currentPage]);

    const totalPages = Math.ceil(filteredGoods.length / ITEMS_PER_PAGE);

    const handleSaveGood = (goodData: Omit<Good, 'id'> | Good) => {
        if ('id' in goodData) {
            updateGood(goodData);
        } else {
            addGood(goodData);
        }
        handleCloseModal();
    };

    const handleEdit = (good: Good) => {
        setEditingGood(good);
        setIsModalOpen(true);
    };

    const handleDelete = (good: Good) => {
        setGoodToDelete(good);
    };

    const handleConfirmDelete = () => {
        if (goodToDelete && deleteConfirmationText === 'حذف') {
            deleteGood(goodToDelete.id);
            setGoodToDelete(null);
            setDeleteConfirmationText('');
        }
    };
    
    const handleCancelDelete = () => {
        setGoodToDelete(null);
        setDeleteConfirmationText('');
    };

    const handleOpenModal = () => {
        setEditingGood(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingGood(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">فهرست کالا و خدمات</h1>
                 <button 
                    onClick={handleOpenModal}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-primary-600 transition-colors"
                >
                    <IconPlusCircle className="w-5 h-5" />
                    <span>کالای جدید</span>
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex flex-wrap items-center gap-4 mb-4">
                     <div className="relative flex-grow">
                        <IconSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input 
                            type="text" 
                            placeholder="جستجو کد یا نام کالا..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="w-full pr-10 pl-4 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right text-gray-500 dark:text-gray-400">
                         <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                             <tr>
                                 <th scope="col" className="px-6 py-3">کد</th>
                                 <th scope="col" className="px-6 py-3">نام کالا</th>
                                 <th scope="col" className="px-6 py-3">واحد</th>
                                 <th scope="col" className="px-6 py-3">موجودی</th>
                                 <th scope="col" className="px-6 py-3">قیمت فروش</th>
                                 <th scope="col" className="px-6 py-3">عملیات</th>
                             </tr>
                         </thead>
                         <tbody>
                            {paginatedGoods.map(good => (
                                <tr key={good.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 font-mono text-gray-900 dark:text-white">{good.code}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{good.name}</td>
                                    <td className="px-6 py-4">{good.unit}</td>
                                    <td className="px-6 py-4">{good.stock}</td>
                                    <td className="px-6 py-4 font-mono">{(good.salePrice ?? 0).toLocaleString('fa-IR')}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-start gap-2">
                                            <button onClick={() => handleEdit(good)} className="text-blue-500 hover:text-blue-700 p-1" title="ویرایش"><IconEdit className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(good)} className="text-danger hover:text-red-700 p-1" title="حذف"><IconTrash className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                         </tbody>
                    </table>
                </div>

                 <div className="flex justify-between items-center mt-4 text-sm text-gray-600 dark:text-gray-400">
                    <div>نمایش {paginatedGoods.length} از {filteredGoods.length} کالا</div>
                    <div className="flex items-center gap-1">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"><IconChevronRight/></button>
                        <span className="px-3 py-1 text-xs">صفحه {currentPage} از {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"><IconChevronLeft/></button>
                    </div>
                </div>
            </div>

             <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingGood ? "ویرایش کالا" : "ایجاد کالای جدید"}>
                 <style>{`.input-field { padding: 0.5rem 0.75rem; border-radius: 0.5rem; background-color: rgb(249 250 251 / var(--tw-bg-opacity)); border: 1px solid rgb(229 231 235 / var(--tw-border-opacity)); } .dark .input-field { background-color: rgb(55 65 81 / var(--tw-bg-opacity)); border-color: rgb(75 85 99 / var(--tw-border-opacity)); } .input-field:focus { outline: 2px solid transparent; outline-offset: 2px; --tw-ring-color: hsl(262 83% 58%); box-shadow: 0 0 0 2px var(--tw-ring-color); }`}</style>
                <NewGoodForm goods={goods} onSave={handleSaveGood} onCancel={handleCloseModal} initialData={editingGood} />
            </Modal>
            
            <Modal isOpen={!!goodToDelete} onClose={handleCancelDelete} title={`حذف کالا: ${goodToDelete?.name}`}>
                <style>{`.input-field { padding: 0.5rem 0.75rem; border-radius: 0.5rem; background-color: rgb(249 250 251 / var(--tw-bg-opacity)); border: 1px solid rgb(229 231 235 / var(--tw-border-opacity)); } .dark .input-field { background-color: rgb(55 65 81 / var(--tw-bg-opacity)); border-color: rgb(75 85 99 / var(--tw-border-opacity)); } .input-field:focus { outline: 2px solid transparent; outline-offset: 2px; --tw-ring-color: hsl(262 83% 58%); box-shadow: 0 0 0 2px var(--tw-ring-color); }`}</style>
                <div className="space-y-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        برای تایید حذف، لطفاً کلمه <strong className="font-mono text-danger">حذف</strong> را در کادر زیر وارد کنید. این عملیات قابل بازگشت نیست.
                    </p>
                    <input
                        type="text"
                        value={deleteConfirmationText}
                        onChange={(e) => setDeleteConfirmationText(e.target.value)}
                        className="w-full input-field"
                        placeholder="حذف"
                    />
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={handleCancelDelete} className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 transition-colors">لغو</button>
                        <button
                            onClick={handleConfirmDelete}
                            disabled={deleteConfirmationText !== 'حذف'}
                            className="px-6 py-2 text-sm bg-danger text-white rounded-lg shadow-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            حذف نهایی
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
