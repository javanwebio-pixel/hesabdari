
import React, { useState } from 'react';
import type { Check, ToastData } from '../../types';
import { IconChevronRight, IconUser, IconFileText, IconCalendar, IconBuildingBank, IconCurrencyDollar } from '../Icons';

type CheckType = 'دریافتی' | 'پرداختی';

interface NewCheckPageProps {
    onNavigate: (page: 'treasury-cash-checks') => void;
    addCheck: (check: Omit<Check, 'id'>) => void;
    showToast: (message: string, type?: ToastData['type']) => void;
}

export const NewCheckPage: React.FC<NewCheckPageProps> = ({ onNavigate, addCheck, showToast }) => {
    const [checkType, setCheckType] = useState<CheckType>('دریافتی');
    const [partyName, setPartyName] = useState('');
    const [amount, setAmount] = useState<number | string>('');
    const [checkNumber, setCheckNumber] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [bankName, setBankName] = useState('');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!partyName.trim()) newErrors.partyName = 'نام طرف حساب الزامی است.';
        if (!bankName.trim()) newErrors.bankName = 'نام بانک الزامی است.';
        if (!dueDate) newErrors.dueDate = 'تاریخ سررسید الزامی است.';
    
        if (!checkNumber.trim()) {
            newErrors.checkNumber = 'شماره چک الزامی است.';
        } else if (!/^\d+$/.test(checkNumber)) {
            newErrors.checkNumber = 'شماره چک باید فقط شامل اعداد باشد.';
        }
    
        if (!amount) {
            newErrors.amount = 'مبلغ الزامی است.';
        } else if (Number(amount) <= 0) {
            newErrors.amount = 'مبلغ باید بزرگتر از صفر باشد.';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (!validate()) {
            showToast('لطفاً خطاهای فرم را برطرف کنید.', 'error');
            return;
        }

        const newCheck: Omit<Check, 'id'> = {
            type: checkType,
            partyName,
            amount: Number(amount),
            checkNumber,
            dueDate: new Date(dueDate).toLocaleDateString('fa-IR-u-nu-latn'),
            dueDateObj: new Date(dueDate),
            bankName,
            status: 'در جریان وصول',
            history: [],
        };

        addCheck(newCheck);
        showToast(`چک ${checkType} با موفقیت ثبت شد.`);
        onNavigate('treasury-cash-checks');
    };
    
    // Helper to clear error when user types
    const handleChange = (setter: React.Dispatch<React.SetStateAction<any>>, field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setter(e.target.value);
        if (errors[field]) {
            setErrors(prev => ({...prev, [field]: ''}));
        }
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">ثبت چک جدید</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">اطلاعات چک جدید را وارد نمایید.</p>
                </div>
                 <button 
                    onClick={() => onNavigate('treasury-cash-checks')}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                    <IconChevronRight className="w-5 h-5" />
                    <span>بازگشت به فهرست چک‌ها</span>
                </button>
            </div>
            
             <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
                 {/* Type */}
                 <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="type" checked={checkType === 'دریافتی'} onChange={() => setCheckType('دریافتی')} className="text-primary focus:ring-primary"/>
                        <span className="text-gray-800 dark:text-gray-200">چک دریافتی</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="type" checked={checkType === 'پرداختی'} onChange={() => setCheckType('پرداختی')} className="text-primary focus:ring-primary"/>
                        <span className="text-gray-800 dark:text-gray-200">چک پرداختی</span>
                    </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">طرف حساب</label>
                        <div className="input-field">
                             <IconUser className="absolute top-1/2 right-3 -translate-y-1/2 w-5 h-5 text-gray-400" />
                             <input type="text" value={partyName} onChange={handleChange(setPartyName, 'partyName')} placeholder="نام طرف حساب" className="w-full bg-transparent outline-none" />
                        </div>
                        {errors.partyName && <p className="text-xs text-red-500 mt-1">{errors.partyName}</p>}
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">مبلغ (ریال)</label>
                         <div className="input-field">
                             <IconCurrencyDollar className="absolute top-1/2 right-3 -translate-y-1/2 w-5 h-5 text-gray-400" />
                             <input type="number" value={amount} onChange={handleChange(setAmount, 'amount')} placeholder="0" className="w-full bg-transparent outline-none" />
                        </div>
                        {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">شماره چک</label>
                         <div className="input-field">
                             <IconFileText className="absolute top-1/2 right-3 -translate-y-1/2 w-5 h-5 text-gray-400" />
                             <input type="text" value={checkNumber} onChange={handleChange(setCheckNumber, 'checkNumber')} placeholder="شماره چک" className="w-full bg-transparent outline-none" />
                        </div>
                        {errors.checkNumber && <p className="text-xs text-red-500 mt-1">{errors.checkNumber}</p>}
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">تاریخ سررسید</label>
                         <div className="input-field">
                             <IconCalendar className="absolute top-1/2 right-3 -translate-y-1/2 w-5 h-5 text-gray-400" />
                             <input type="date" value={dueDate} onChange={handleChange(setDueDate, 'dueDate')} className="w-full bg-transparent outline-none" />
                        </div>
                        {errors.dueDate && <p className="text-xs text-red-500 mt-1">{errors.dueDate}</p>}
                    </div>
                     <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نام بانک و شعبه</label>
                         <div className="input-field">
                             <IconBuildingBank className="absolute top-1/2 right-3 -translate-y-1/2 w-5 h-5 text-gray-400" />
                             <input type="text" value={bankName} onChange={handleChange(setBankName, 'bankName')} placeholder="نام بانک" className="w-full bg-transparent outline-none" />
                        </div>
                        {errors.bankName && <p className="text-xs text-red-500 mt-1">{errors.bankName}</p>}
                    </div>
                </div>
                <div className="flex justify-end pt-4">
                    <button onClick={handleSave} className="px-6 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-primary-600 transition-colors font-medium">ثبت چک</button>
                </div>
             </div>

            <style>{`.input-field { position: relative; } .input-field input { width:100%; padding: 0.5rem 2.5rem 0.5rem 0.75rem; border-radius: 0.5rem; background-color: rgb(249 250 251 / var(--tw-bg-opacity)); border: 1px solid rgb(229 231 235 / var(--tw-border-opacity)); } .dark .input-field input { background-color: rgb(55 65 81 / var(--tw-bg-opacity)); border-color: rgb(75 85 99 / var(--tw-border-opacity)); } .input-field input:focus { outline: 2px solid transparent; outline-offset: 2px; --tw-ring-color: hsl(262 83% 58%); box-shadow: 0 0 0 2px var(--tw-ring-color); }`}</style>
        </div>
    );
};