import React, { useState, useMemo, useEffect } from 'react';
import type { Party } from '../../types';
import { IconPlusCircle, IconSearch, IconEdit, IconTrash, IconChevronLeft, IconChevronRight, IconUser } from '../Icons';
import { Modal } from '../common/Modal';

// Form component for adding/editing parties
const PartyForm: React.FC<{
    parties: Party[];
    onSave: (partyData: Omit<Party, 'id'> | Party) => void,
    onCancel: () => void,
    initialData?: Party | null,
}> = ({ parties, onSave, onCancel, initialData }) => {
    const isEditing = !!initialData;
    const [formData, setFormData] = useState({
        code: initialData?.code || '',
        name: initialData?.name || '',
        type: initialData?.type || 'حقیقی',
        nationalId: initialData?.nationalId || '',
        phone: initialData?.phone || '',
        address: initialData?.address || '',
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    
    useEffect(() => {
        if (isEditing) return;

        // Unified logic for all party types starting from 1001
        const existingCodes = parties
            .map(p => {
                // Extracts the numeric part from codes like 'C-1001' or '1002'
                const codeParts = p.code.split('-');
                return parseInt(codeParts[codeParts.length - 1], 10);
            })
            .filter(num => !isNaN(num)); // Filter out any non-numeric results

        // Find the maximum existing code number, or default to 1000 if none exist
        const maxId = existingCodes.length > 0 ? Math.max(...existingCodes) : 1000;
        
        // The new code is the next sequential number
        const nextId = maxId + 1;

        setFormData(prev => ({ ...prev, code: String(nextId) }));

    }, [isEditing, parties]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error on change
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };
    
    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.code.trim()) newErrors.code = 'کد طرف حساب الزامی است.';
        if (!formData.name.trim()) newErrors.name = 'نام طرف حساب الزامی است.';
        
        if (!formData.phone.trim()) {
            // Optional field
        } else if (!/^0\d{10}$/.test(formData.phone)) {
            newErrors.phone = 'فرمت شماره تماس صحیح نیست (مثال: 09123456789).';
        }
        
        if (formData.type === 'حقیقی') {
            if (!/^\d{10}$/.test(formData.nationalId)) {
                newErrors.nationalId = 'کد ملی باید ۱۰ رقم باشد.';
            }
        } else { // حقوقی
            if (!/^\d{11}$/.test(formData.nationalId)) {
                newErrors.nationalId = 'شناسه ملی باید ۱۱ رقم باشد.';
            }
        }
    
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            return;
        }
        if (isEditing) {
            onSave({ ...initialData!, ...formData });
        } else {
            onSave(formData as Omit<Party, 'id'>);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">کد طرف حساب</label>
                    <input type="text" name="code" value={formData.code} disabled required className="w-full input-field font-mono bg-gray-100 dark:bg-gray-700 cursor-not-allowed" />
                    {errors.code && <p className="text-xs text-danger mt-1">{errors.code}</p>}
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نام طرف حساب</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full input-field" />
                    {errors.name && <p className="text-xs text-danger mt-1">{errors.name}</p>}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نوع شخص</label>
                    <select name="type" value={formData.type} onChange={handleChange} disabled={isEditing} className="w-full input-field disabled:bg-gray-100 disabled:cursor-not-allowed dark:disabled:bg-gray-700">
                        <option value="حقیقی">حقیقی</option>
                        <option value="حقوقی">حقوقی</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {formData.type === 'حقیقی' ? 'کد ملی' : 'شناسه ملی'}
                    </label>
                    <input type="text" name="nationalId" value={formData.nationalId} onChange={handleChange} required className="w-full input-field" />
                    {errors.nationalId && <p className="text-xs text-danger mt-1">{errors.nationalId}</p>}
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">شماره تماس</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full input-field" />
                {errors.phone && <p className="text-xs text-danger mt-1">{errors.phone}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">آدرس</label>
                <textarea name="address" value={formData.address} onChange={handleChange} rows={2} className="w-full input-field" />
            </div>
            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 transition-colors">لغو</button>
                <button type="submit" className="px-6 py-2 text-sm bg-primary text-white rounded-lg shadow-md hover:bg-primary-600 transition-colors">ذخیره</button>
            </div>
        </form>
    );
}

const ITEMS_PER_PAGE = 5;

interface PartiesPageProps {
    parties: Party[];
    addParty: (partyData: Omit<Party, 'id'>) => void;
    updateParty: (updatedParty: Party) => void;
    deleteParty: (id: string) => void;
}

export const PartiesPage: React.FC<PartiesPageProps> = ({ parties, addParty, updateParty, deleteParty }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingParty, setEditingParty] = useState<Party | null>(null);
    const [partyToDelete, setPartyToDelete] = useState<Party | null>(null);
    const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    
    const filteredParties = useMemo(() => {
        return parties.filter(party =>
            party.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            party.code.includes(searchTerm) ||
            party.nationalId.includes(searchTerm)
        );
    }, [parties, searchTerm]);

    const paginatedParties = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredParties.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredParties, currentPage]);

    const totalPages = Math.ceil(filteredParties.length / ITEMS_PER_PAGE);

    const handleSaveParty = (partyData: Omit<Party, 'id'> | Party) => {
        if ('id' in partyData) {
            updateParty(partyData);
        } else {
            addParty(partyData);
        }
        handleCloseModal();
    };

    const handleEdit = (party: Party) => {
        setEditingParty(party);
        setIsModalOpen(true);
    };

    const handleDelete = (party: Party) => {
        setPartyToDelete(party);
    };

    const handleConfirmDelete = () => {
        if (partyToDelete && deleteConfirmationText === 'حذف') {
            deleteParty(partyToDelete.id);
            setPartyToDelete(null);
            setDeleteConfirmationText('');
        }
    };
    
    const handleCancelDelete = () => {
        setPartyToDelete(null);
        setDeleteConfirmationText('');
    };


    const handleOpenModal = () => {
        setEditingParty(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingParty(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">فهرست طرف حساب ها</h1>
                 <button 
                    onClick={handleOpenModal}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-primary-600 transition-colors"
                >
                    <IconPlusCircle className="w-5 h-5" />
                    <span>طرف حساب جدید</span>
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex flex-wrap items-center gap-4 mb-4">
                     <div className="relative flex-grow">
                        <IconSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input 
                            type="text" 
                            placeholder="جستجو کد، نام یا شناسه ملی..."
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
                                 <th scope="col" className="px-6 py-3">نام طرف حساب</th>
                                 <th scope="col" className="px-6 py-3">نوع</th>
                                 <th scope="col" className="px-6 py-3">شناسه ملی / کد ملی</th>
                                 <th scope="col" className="px-6 py-3">شماره تماس</th>
                                 <th scope="col" className="px-6 py-3">عملیات</th>
                             </tr>
                         </thead>
                         <tbody>
                            {paginatedParties.map(party => (
                                <tr key={party.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 font-mono text-gray-900 dark:text-white">{party.code}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{party.name}</td>
                                    <td className="px-6 py-4">{party.type}</td>
                                    <td className="px-6 py-4 font-mono">{party.nationalId}</td>
                                    <td className="px-6 py-4 font-mono">{party.phone}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-start gap-2">
                                            <button onClick={() => handleEdit(party)} className="text-blue-500 hover:text-blue-700 p-1" title="ویرایش"><IconEdit className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(party)} className="text-danger hover:text-red-700 p-1" title="حذف"><IconTrash className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                         </tbody>
                    </table>
                </div>

                 <div className="flex justify-between items-center mt-4 text-sm text-gray-600 dark:text-gray-400">
                    <div>نمایش {paginatedParties.length} از {filteredParties.length} طرف حساب</div>
                    <div className="flex items-center gap-1">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"><IconChevronRight/></button>
                        <span className="px-3 py-1 text-xs">صفحه {currentPage} از {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"><IconChevronLeft/></button>
                    </div>
                </div>
            </div>

             <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingParty ? "ویرایش طرف حساب" : "ایجاد طرف حساب جدید"}>
                 <style>{`.input-field { padding: 0.5rem 0.75rem; border-radius: 0.5rem; background-color: rgb(249 250 251 / var(--tw-bg-opacity)); border: 1px solid rgb(229 231 235 / var(--tw-border-opacity)); } .dark .input-field { background-color: rgb(55 65 81 / var(--tw-bg-opacity)); border-color: rgb(75 85 99 / var(--tw-border-opacity)); } .input-field:focus { outline: 2px solid transparent; outline-offset: 2px; --tw-ring-color: hsl(262 83% 58%); box-shadow: 0 0 0 2px var(--tw-ring-color); }`}</style>
                <PartyForm parties={parties} onSave={handleSaveParty} onCancel={handleCloseModal} initialData={editingParty} />
            </Modal>
            
            <Modal isOpen={!!partyToDelete} onClose={handleCancelDelete} title={`حذف طرف حساب: ${partyToDelete?.name}`}>
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
