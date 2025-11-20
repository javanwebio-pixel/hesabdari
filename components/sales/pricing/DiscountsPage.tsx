import React, { useState, useMemo, useCallback } from 'react';
import type { DiscountRule, DiscountConditionTarget, Good, Party, ToastData } from '../../../types';
import { IconPlusCircle, IconDeviceFloppy, IconEdit, IconTrash } from '../../Icons';
import { Modal } from '../../common/Modal';
import { v4 as uuidv4 } from 'uuid';

const DiscountRuleForm: React.FC<{
    onSave: (rule: Omit<DiscountRule, 'id'>) => void;
    onCancel: () => void;
    goods: Good[];
    parties: Party[];
}> = ({ onSave, onCancel, goods, parties }) => {
    const [name, setName] = useState('');
    const [priority, setPriority] = useState(10);
    const [conditionTarget, setConditionTarget] = useState<DiscountConditionTarget>('CATEGORY');
    const [conditionValue, setConditionValue] = useState('');
    const [actionType, setActionType] = useState<'PERCENTAGE'>('PERCENTAGE');
    const [actionValue, setActionValue] = useState<number | ''>('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !conditionValue || !actionValue) return;

        onSave({
            name,
            priority,
            isActive: true,
            validFrom: new Date().toISOString().split('T')[0],
            validTo: null,
            conditions: [{ target: conditionTarget, operator: 'EQ', value: conditionValue }],
            action: { type: actionType, value: actionValue }
        });
    };

    const uniqueCategories = useMemo(() => [...new Set(goods.map(g => g.category))], [goods]);
    const customers = useMemo(() => parties.filter(p => p.code.startsWith('1')), [parties]);

    const renderConditionValueInput = () => {
        switch (conditionTarget) {
            case 'CATEGORY':
                return (
                    <select value={conditionValue} onChange={e => setConditionValue(e.target.value)} required className="input-field">
                        <option value="">انتخاب دسته‌بندی...</option>
                        {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                );
            case 'PRODUCT':
                 return (
                    <select value={conditionValue} onChange={e => setConditionValue(e.target.value)} required className="input-field">
                        <option value="">انتخاب محصول...</option>
                        {goods.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                );
            case 'CUSTOMER':
                 return (
                    <select value={conditionValue} onChange={e => setConditionValue(e.target.value)} required className="input-field">
                        <option value="">انتخاب مشتری...</option>
                        {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                );
            default:
                return null;
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="label-form">نام قانون/پروموشن</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required className="input-field" />
            </div>
            
            <fieldset className="p-4 border rounded-md dark:border-gray-600">
                <legend className="px-2 font-semibold">شرط تخفیف</legend>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                         <label className="label-form">نوع شرط</label>
                        <select value={conditionTarget} onChange={e => {setConditionTarget(e.target.value as DiscountConditionTarget); setConditionValue('');}} className="input-field">
                            <option value="CUSTOMER">برای مشتری خاص</option>
                            <option value="CATEGORY">برای دسته‌بندی محصول</option>
                            <option value="PRODUCT">برای محصول خاص</option>
                        </select>
                    </div>
                    <div>
                        <label className="label-form">مقدار شرط</label>
                        {renderConditionValueInput()}
                    </div>
                </div>
            </fieldset>

             <fieldset className="p-4 border rounded-md dark:border-gray-600">
                <legend className="px-2 font-semibold">عمل تخفیف</legend>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="label-form">نوع عمل</label>
                        <select value={actionType} onChange={e => setActionType(e.target.value as 'PERCENTAGE')} className="input-field">
                            <option value="PERCENTAGE">درصد تخفیف</option>
                        </select>
                    </div>
                     <div>
                        <label className="label-form">مقدار</label>
                        <input type="number" value={actionValue} onChange={e => setActionValue(Number(e.target.value))} required className="input-field" placeholder="مثال: 10 برای ۱۰٪"/>
                    </div>
                </div>
            </fieldset>
            
            <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                <button type="button" onClick={onCancel} className="btn-secondary">لغو</button>
                <button type="submit" className="btn-primary flex items-center gap-2"><IconDeviceFloppy/> ذخیره قانون</button>
            </div>
        </form>
    );
};


interface DiscountsPageProps {
    discountRules: DiscountRule[];
    onAddDiscountRule: (rule: Omit<DiscountRule, 'id'>) => void;
    onUpdateDiscountRule: (rule: DiscountRule) => void;
    onDeleteDiscountRule: (id: string) => void;
    goods: Good[];
    parties: Party[];
    showToast: (message: string, type?: ToastData['type']) => void;
}

export const DiscountsPage: React.FC<DiscountsPageProps> = ({ discountRules, onAddDiscountRule, onUpdateDiscountRule, onDeleteDiscountRule, goods, parties, showToast }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const handleSave = (rule: Omit<DiscountRule, 'id'>) => {
        onAddDiscountRule(rule);
        showToast('قانون تخفیف جدید با موفقیت ایجاد شد.');
        setIsModalOpen(false);
    };

    const getConditionText = (rule: DiscountRule) => {
        return rule.conditions.map(cond => {
            let valueText = cond.value;
            if (cond.target === 'PRODUCT') valueText = goods.find(g => g.id === cond.value)?.name || cond.value;
            if (cond.target === 'CUSTOMER') valueText = parties.find(p => p.id === cond.value)?.name || cond.value;
            return `اگر ${cond.target} برابر «${valueText}» باشد`;
        }).join(' و ');
    }

    const getActionText = (rule: DiscountRule) => {
        if(rule.action.type === 'PERCENTAGE') {
            return `${rule.action.value}% تخفیف اعمال شود`;
        }
        return '';
    }

    return (
        <div className="space-y-6">
            <style>{`.label-form{display:block;font-size:.875rem;font-weight:500;color:#374151;margin-bottom:.25rem}.dark .label-form{color:#D1D5DB}.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;width:100%}.dark .input-field{background-color:#374151;border-color:#4B5563}.input-field:focus{outline:2px solid transparent;outline-offset:2px;--tw-ring-color:hsl(262 83% 58%);box-shadow:0 0 0 2px var(--tw-ring-color)}.btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500;transition:all .2s}.btn-primary:hover:not(:disabled){background-color:hsl(262 75% 52%)}.btn-secondary{padding:.5rem 1rem;background-color:#E5E7EB;color:#1F2937;border-radius:.5rem;font-weight:500}.dark .btn-secondary{background-color:#4B5563;color:#F9FAFB}`}</style>
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">مدیریت تخفیفات و پروموشن‌ها</h1>
                 <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
                    <IconPlusCircle className="w-5 h-5"/> ایجاد قانون جدید
                </button>
            </div>
            
             <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-3">نام قانون</th>
                                <th className="px-4 py-3">شرط</th>
                                <th className="px-4 py-3">عمل</th>
                                <th className="px-4 py-3">اولویت</th>
                                <th className="px-4 py-3">وضعیت</th>
                                <th className="px-4 py-3">عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {discountRules.sort((a,b) => a.priority - b.priority).map(rule => (
                                <tr key={rule.id} className="border-b dark:border-gray-700">
                                    <td className="px-4 py-2 font-semibold">{rule.name}</td>
                                    <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{getConditionText(rule)}</td>
                                    <td className="px-4 py-2 font-semibold text-primary">{getActionText(rule)}</td>
                                    <td className="px-4 py-2">{rule.priority}</td>
                                    <td className="px-4 py-2">
                                        <span className={`px-2 py-1 text-xs rounded-full ${rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {rule.isActive ? 'فعال' : 'غیرفعال'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2">
                                        <button className="p-1 text-blue-500 hover:text-blue-700"><IconEdit className="w-4 h-4"/></button>
                                        <button onClick={() => onDeleteDiscountRule(rule.id)} className="p-1 text-danger hover:text-red-700"><IconTrash className="w-4 h-4"/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="ایجاد قانون تخفیف/پروموشن جدید">
                 <DiscountRuleForm onSave={handleSave} onCancel={() => setIsModalOpen(false)} goods={goods} parties={parties} />
            </Modal>
        </div>
    );
};
