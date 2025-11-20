

import React, { useState, useMemo, useEffect } from 'react';
import type { FixedAsset, AssetClass } from '../../types';
import { IconPlusCircle, IconSearch, IconEdit, IconTrash, IconChevronLeft, IconChevronRight } from '../Icons';
import { Modal } from '../common/Modal';
import { v4 as uuidv4 } from 'uuid';

const AssetForm: React.FC<{
    onSave: (assetData: Omit<FixedAsset, 'id'> | FixedAsset) => void,
    onCancel: () => void,
    initialData?: FixedAsset | null,
    assetClasses: AssetClass[],
    nextAssetCode: string,
}> = ({ onSave, onCancel, initialData, assetClasses, nextAssetCode }) => {
    const isEditing = !!initialData;
    const [formData, setFormData] = useState({
        code: initialData?.code || nextAssetCode,
        description: initialData?.description || '',
        assetClassId: initialData?.assetClassId || '',
        acquisitionDate: initialData?.acquisitionDate || new Date().toISOString().split('T')[0],
        acquisitionCost: initialData?.acquisitionCost || 0,
        salvageValue: initialData?.salvageValue || 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Add validation here
        if (isEditing) {
            onSave({ ...initialData!, ...formData });
        } else {
            // FIX: Add missing 'status' property to conform to the 'Omit<FixedAsset, "id">' type.
            onSave({ ...formData, status: 'Active' });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="label-form">کد دارایی</label>
                    <input type="text" value={formData.code} disabled className="input-field font-mono bg-gray-100 dark:bg-gray-700" />
                </div>
                 <div>
                    <label className="label-form">شرح دارایی</label>
                    <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required className="input-field" />
                </div>
            </div>
            <div>
                <label className="label-form">کلاس دارایی</label>
                <select value={formData.assetClassId} onChange={e => setFormData({...formData, assetClassId: e.target.value})} required className="input-field">
                    <option value="" disabled>یک کلاس انتخاب کنید</option>
                    {assetClasses.map(ac => <option key={ac.id} value={ac.id}>{ac.name}</option>)}
                </select>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="label-form">تاریخ تملک</label>
                    <input type="date" value={formData.acquisitionDate} onChange={e => setFormData({...formData, acquisitionDate: e.target.value})} required className="input-field" />
                </div>
                 <div>
                    <label className="label-form">بهای تمام شده</label>
                    <input type="number" value={formData.acquisitionCost} onChange={e => setFormData({...formData, acquisitionCost: Number(e.target.value)})} required className="input-field" />
                </div>
             </div>
             <div>
                <label className="label-form">ارزش اسقاط</label>
                <input type="number" value={formData.salvageValue} onChange={e => setFormData({...formData, salvageValue: Number(e.target.value)})} required className="input-field" />
            </div>
            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onCancel} className="btn-secondary">لغو</button>
                <button type="submit" className="btn-primary">ذخیره</button>
            </div>
        </form>
    );
};

const ITEMS_PER_PAGE = 10;

// FIX: Update props to match what is passed from App.tsx (onSaveAsset, onDeleteAsset).
interface AssetMasterPageProps {
    assets: FixedAsset[];
    assetClasses: AssetClass[];
    onSaveAsset: (assetData: Omit<FixedAsset, 'id'> | FixedAsset) => void;
    onDeleteAsset: (id: string) => void;
}

export const AssetMasterPage: React.FC<AssetMasterPageProps> = ({ assets, assetClasses, onSaveAsset, onDeleteAsset }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<FixedAsset | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const assetClassesMap = useMemo(() => new Map(assetClasses.map(ac => [ac.id, ac.name])), [assetClasses]);

    const filteredAssets = useMemo(() => {
        return assets.filter(asset =>
            asset.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.code.includes(searchTerm)
        );
    }, [assets, searchTerm]);

    const paginatedAssets = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredAssets.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredAssets, currentPage]);

    const totalPages = Math.ceil(filteredAssets.length / ITEMS_PER_PAGE);
    
    const nextAssetCode = useMemo(() => {
        const maxCode = assets.reduce((max, asset) => Math.max(max, parseInt(asset.code, 10) || 0), 1000);
        return String(maxCode + 1);
    }, [assets]);

    // FIX: Adapt handleSave to use the single onSaveAsset prop.
    const handleSave = (assetData: Omit<FixedAsset, 'id'> | FixedAsset) => {
        onSaveAsset(assetData);
        setIsModalOpen(false);
    };
    
    const handleEdit = (asset: FixedAsset) => {
        setEditingAsset(asset);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <style>{`.label-form{display:block;font-size:.875rem;font-weight:500;color:#374151;margin-bottom:.25rem}.dark .label-form{color:#D1D5DB}.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;width:100%}.dark .input-field{background-color:#374151;border-color:#4B5563}.input-field:focus{outline:2px solid transparent;outline-offset:2px;--tw-ring-color:hsl(262 83% 58%);box-shadow:0 0 0 2px var(--tw-ring-color)}.btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500;transition:background-color .2s}.btn-primary:hover{background-color:hsl(262 75% 52%)}.btn-secondary{padding:.5rem 1rem;background-color:#E5E7EB;color:#1F2937;border-radius:.5rem;font-weight:500}.dark .btn-secondary{background-color:#4B5563;color:#F9FAFB}`}</style>
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">مدیریت اطلاعات پایه دارایی‌های ثابت</h1>
                <button onClick={() => { setEditingAsset(null); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2">
                    <IconPlusCircle className="w-5 h-5"/> ایجاد دارایی جدید
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="relative mb-4">
                    <IconSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type="text" placeholder="جستجو کد یا شرح دارایی..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pr-10 pl-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"/>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-3">کد</th><th className="px-4 py-3">شرح</th><th className="px-4 py-3">کلاس دارایی</th>
                                <th className="px-4 py-3">تاریخ تملک</th><th className="px-4 py-3">بهای تمام شده</th><th className="px-4 py-3">عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedAssets.map(asset => (
                                <tr key={asset.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-4 py-2 font-mono">{asset.code}</td>
                                    <td className="px-4 py-2 font-semibold">{asset.description}</td>
                                    <td className="px-4 py-2">{assetClassesMap.get(asset.assetClassId)}</td>
                                    <td className="px-4 py-2">{new Date(asset.acquisitionDate).toLocaleDateString('fa-IR')}</td>
                                    <td className="px-4 py-2 font-mono">{asset.acquisitionCost.toLocaleString('fa-IR')}</td>
                                    <td className="px-4 py-2">
                                        <button onClick={() => handleEdit(asset)} className="p-1 text-blue-500 hover:text-blue-600" title="ویرایش"><IconEdit className="w-4 h-4"/></button>
                                        {/* FIX: Use onDeleteAsset prop for deleting. */}
                                        <button onClick={() => onDeleteAsset(asset.id)} className="p-1 text-danger hover:text-red-600" title="حذف"><IconTrash className="w-4 h-4"/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 <div className="flex justify-between items-center mt-4 text-sm text-gray-600 dark:text-gray-400">
                    <div>نمایش {paginatedAssets.length} از {filteredAssets.length} دارایی</div>
                    <div className="flex items-center gap-1">
                        <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="p-2 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"><IconChevronRight/></button>
                        <span className="px-2">صفحه {currentPage} از {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="p-2 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"><IconChevronLeft/></button>
                    </div>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingAsset ? "ویرایش دارایی" : "ایجاد دارایی جدید"}>
                <AssetForm onSave={handleSave} onCancel={() => setIsModalOpen(false)} initialData={editingAsset} assetClasses={assetClasses} nextAssetCode={nextAssetCode} />
            </Modal>
        </div>
    );
};
