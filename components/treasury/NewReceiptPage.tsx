import React, { useState } from 'react';
import type { PaymentMethod, TreasuryDoc, ToastData, BankAccount, CashDesk, Party } from '../../types';
import { IconChevronRight, IconWallet, IconBuildingBank, IconCreditCard, IconFileText } from '../Icons';
import { SearchableSelector } from '../common/SearchableSelector';

interface NewReceiptPageProps {
    onNavigate: (page: 'treasury-dashboard') => void;
    addTreasuryDoc: (doc: Omit<TreasuryDoc, 'id' | 'docNumber'>) => void;
    showToast: (message: string, type?: ToastData['type']) => void;
    bankAccounts: BankAccount[];
    cashDesks: CashDesk[];
    parties: Party[];
}

export const NewReceiptPage: React.FC<NewReceiptPageProps> = ({ onNavigate, addTreasuryDoc, showToast, bankAccounts, cashDesks, parties }) => {
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('حواله');
    const [source, setSource] = useState<'bank' | 'cash'>('bank');
    const [destinationId, setDestinationId] = useState('');
    const [selectedParty, setSelectedParty] = useState<Party | null>(null);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().substring(0, 10),
        amount: '',
        description: '',
        checkNumber: '',
        checkDueDate: '',
        bankName: '',
        transactionId: ''
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const customers = parties.filter(p => p.code.startsWith('1'));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!selectedParty) newErrors.partyName = '"دریافت از" الزامی است.';
        if (!destinationId) newErrors.destinationId = 'حساب مقصد الزامی است.';
        if (!formData.amount || Number(formData.amount) <= 0) newErrors.amount = 'مبلغ باید بزرگتر از صفر باشد.';
        if (paymentMethod === 'چک') {
            if (!formData.checkNumber.trim()) newErrors.checkNumber = 'شماره چک الزامی است.';
            if (!formData.checkDueDate) newErrors.checkDueDate = 'تاریخ سررسید الزامی است.';
            if (!formData.bankName.trim()) newErrors.bankName = 'نام بانک الزامی است.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (!validate() || !selectedParty) {
            showToast('لطفاً خطاهای فرم را برطرف کنید.', 'error');
            return;
        }

        const newDoc: Omit<TreasuryDoc, 'id' | 'docNumber'> = {
            date: new Date(formData.date).toLocaleDateString('fa-IR-u-nu-latn'),
            partyId: selectedParty.id,
            partyName: selectedParty.name,
            amount: Number(formData.amount),
            description: formData.description || `دریافت از ${selectedParty.name}`,
            paymentMethod,
            type: 'دریافت',
            status: 'نهایی',
            bankAccountId: source === 'bank' ? destinationId : undefined,
            cashDeskId: source === 'cash' ? destinationId : undefined,
            checkNumber: formData.checkNumber,
            checkDueDate: formData.checkDueDate ? new Date(formData.checkDueDate).toLocaleDateString('fa-IR-u-nu-latn') : undefined,
            bankName: formData.bankName,
            transactionId: formData.transactionId,
        };

        addTreasuryDoc(newDoc);
        showToast('اعلامیه دریافت با موفقیت ثبت شد.');
        onNavigate('treasury-dashboard');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">اعلامیه دریافت جدید</h1>
                </div>
                <button onClick={() => onNavigate('treasury-dashboard')} className="btn-secondary flex items-center gap-2">
                    <IconChevronRight className="w-5 h-5" /><span>بازگشت</span>
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div><label className="label-form">شماره سریال</label><input type="text" placeholder="خودکار" disabled className="input-field-disabled" /></div>
                    <div><label className="label-form">تاریخ</label><input type="date" name="date" value={formData.date} onChange={handleChange} className="input-field" /></div>
                    <div>
                        <label className="label-form">دریافت از</label>
                        <SearchableSelector
                            items={customers}
                            onSelect={(item) => setSelectedParty(item as Party | null)}
                            placeholder="جستجوی مشتری..."
                            value={selectedParty}
                        />
                        {errors.partyName && <p className="text-xs text-danger mt-1">{errors.partyName}</p>}
                    </div>
                </div>

                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <label className="label-form mb-2">واریز به:</label>
                    <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1 mb-2">
                        <button onClick={() => { setSource('bank'); setDestinationId(''); }} className={`w-1/2 p-2 rounded-md text-sm font-semibold transition-colors ${source === 'bank' ? 'bg-white dark:bg-gray-900 text-primary shadow' : 'text-gray-600 dark:text-gray-300'}`}>بانک</button>
                        <button onClick={() => { setSource('cash'); setDestinationId(''); }} className={`w-1/2 p-2 rounded-md text-sm font-semibold transition-colors ${source === 'cash' ? 'bg-white dark:bg-gray-900 text-primary shadow' : 'text-gray-600 dark:text-gray-300'}`}>صندوق</button>
                    </div>
                    <select value={destinationId} onChange={e => setDestinationId(e.target.value)} className="input-field w-full">
                        <option value="">یک مورد را انتخاب کنید</option>
                        {source === 'bank' ? 
                            bankAccounts.map(b => <option key={b.id} value={b.id}>{b.bankName} - {b.accountNumber} (موجودی: {b.balance.toLocaleString('fa-IR')})</option>) :
                            cashDesks.map(c => <option key={c.id} value={c.id}>{c.name} (موجودی: {c.balance.toLocaleString('fa-IR')})</option>)
                        }
                    </select>
                    {errors.destinationId && <p className="text-xs text-danger mt-1">{errors.destinationId}</p>}
                </div>

                <div className="mb-6">
                    <label className="label-form mb-2">روش دریافت</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {(['حواله', 'چک', 'نقد', 'کارتخوان'] as PaymentMethod[]).map(method => (
                           <button key={method} onClick={() => setPaymentMethod(method)} className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-colors ${paymentMethod === method ? 'border-primary bg-primary-50 dark:bg-gray-700' : 'border-gray-200 dark:border-gray-600 hover:border-primary-200'}`}>
                                {method === 'نقد' && <IconWallet className="w-5 h-5" />} {method === 'چک' && <IconFileText className="w-5 h-5" />}
                                {method === 'حواله' && <IconBuildingBank className="w-5 h-5" />} {method === 'کارتخوان' && <IconCreditCard className="w-5 h-5" />}
                                <span className={`font-semibold ${paymentMethod === method ? 'text-primary' : 'text-gray-600 dark:text-gray-300'}`}>{method}</span>
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div><label className="label-form">مبلغ دریافتی (ریال)</label><input type="number" name="amount" value={formData.amount} onChange={handleChange} placeholder="مبلغ را وارد کنید" className="input-field" />{errors.amount && <p className="text-xs text-danger mt-1">{errors.amount}</p>}</div>
                    <div className="md:col-span-2"><label className="label-form">شرح</label><input type="text" name="description" value={formData.description} onChange={handleChange} placeholder="توضیحات مربوط به دریافت..." className="input-field" /></div>
                    {paymentMethod === 'چک' && (
                        <>
                            <div><label className="label-form">شماره چک</label><input type="text" name="checkNumber" value={formData.checkNumber} onChange={handleChange} className="input-field"/>{errors.checkNumber && <p className="text-xs text-danger mt-1">{errors.checkNumber}</p>}</div>
                            <div><label className="label-form">تاریخ سررسید چک</label><input type="date" name="checkDueDate" value={formData.checkDueDate} onChange={handleChange} className="input-field"/>{errors.checkDueDate && <p className="text-xs text-danger mt-1">{errors.checkDueDate}</p>}</div>
                            <div><label className="label-form">نام بانک</label><input type="text" name="bankName" value={formData.bankName} onChange={handleChange} className="input-field"/>{errors.bankName && <p className="text-xs text-danger mt-1">{errors.bankName}</p>}</div>
                        </>
                    )}
                    {(paymentMethod === 'حواله' || paymentMethod === 'کارتخوان') && (
                         <div><label className="label-form">شماره پیگیری</label><input type="text" name="transactionId" value={formData.transactionId} onChange={handleChange} className="input-field"/></div>
                    )}
                </div>
                
                <div className="mt-6 flex justify-end items-center gap-3">
                    <button onClick={() => onNavigate('treasury-dashboard')} className="btn-secondary">لغو</button>
                    <button onClick={handleSave} className="btn-primary">ذخیره</button>
                </div>
            </div>
             <style>{`.label-form{display:block;font-size:.875rem;font-weight:500;color:#374151;margin-bottom:.25rem}.dark .label-form{color:#D1D5DB}.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;width:100%}.dark .input-field{background-color:#374151;border-color:#4B5563}.input-field:focus{outline:2px solid transparent;outline-offset:2px;--tw-ring-color:hsl(262 83% 58%);box-shadow:0 0 0 2px var(--tw-ring-color)}.input-field-disabled{padding:.5rem .75rem;border-radius:.5rem;background-color:#F3F4F6;cursor:not-allowed;width:100%}.dark .input-field-disabled{background-color:#1F2937}.btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500;transition:all .2s}.btn-primary:hover:not(:disabled){background-color:hsl(262 75% 52%)}.btn-secondary{padding:.5rem 1rem;background-color:#E5E7EB;color:#1F2937;border-radius:.5rem;font-weight:500}.dark .btn-secondary{background-color:#4B5563;color:#F9FAFB}`}</style>
        </div>
    );
};