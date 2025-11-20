

import React, { useState, useMemo } from 'react';
import { IconCheckCircle, IconChevronLeft, IconDeviceFloppy } from '../../Icons';

// Mock Data
const mockCompanies = [
    { id: 'c1', name: 'شرکت اصلی (هلدینگ)' },
    { id: 'c2', name: 'شرکت فرعی آلفا' },
    { id: 'c3', name: 'شرکت فرعی بتا' },
];

const mockIntercompany = [
    { id: 'ic1', from: 'c2', to: 'c3', account: 'حساب‌های دریافتنی/پرداختنی', amount: 150000000, eliminated: false },
    { id: 'ic2', from: 'c3', to: 'c2', account: 'فروش/خرید درون گروهی', amount: 75000000, eliminated: false },
    { id: 'ic3', from: 'c2', to: 'c1', account: 'وام دریافتی/پرداختی', amount: 200000000, eliminated: false },
];

const mockConsolidatedData = [
    { account: 'موجودی نقد', balance: 500000000 },
    { account: 'حساب‌های دریافتنی', balance: 320000000 },
    { account: 'دارایی ثابت', balance: 1200000000 },
    { account: 'جمع دارایی‌ها', balance: 2020000000, isTotal: true },
    { account: 'حساب‌های پرداختنی', balance: 450000000 },
    { account: 'تسهیلات', balance: 600000000 },
    { account: 'سرمایه', balance: 800000000 },
    { account: 'سود انباشته', balance: 170000000 },
    { account: 'جمع بدهی‌ها و حقوق صاحبان سهام', balance: 2020000000, isTotal: true },
];


const Stepper: React.FC<{ currentStep: number }> = ({ currentStep }) => {
    const steps = ['تنظیمات', 'حذف معاملات درون‌گروهی', 'پیش‌نمایش', 'نهایی‌سازی'];
    return (
        <div className="flex items-center justify-center mb-8">
            {steps.map((step, index) => (
                <React.Fragment key={index}>
                    <div className="flex flex-col items-center text-center w-32">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                            currentStep > index + 1 ? 'bg-green-500 text-white' : 
                            currentStep === index + 1 ? 'bg-primary text-white' : 
                            'bg-gray-200 dark:bg-gray-700 text-gray-500'
                        }`}>
                            {currentStep > index + 1 ? <IconCheckCircle className="w-6 h-6" /> : index + 1}
                        </div>
                        <p className={`mt-2 text-xs font-semibold ${currentStep >= index + 1 ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400'}`}>{step}</p>
                    </div>
                    {index < steps.length - 1 && <div className={`flex-1 h-1 mx-2 rounded-full ${currentStep > index + 1 ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>}
                </React.Fragment>
            ))}
        </div>
    );
};

export const ConsolidationPage: React.FC = () => {
    const [step, setStep] = useState(1);
    const [selectedCompanies, setSelectedCompanies] = useState<Set<string>>(new Set(['c1', 'c2', 'c3']));
    const [eliminations, setEliminations] = useState(mockIntercompany);

    const toggleElimination = (id: string) => {
        setEliminations(prev => prev.map(e => e.id === id ? { ...e, eliminated: !e.eliminated } : e));
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
             <div className="text-center">
                 <h1 className="text-3xl font-bold text-gray-800 dark:text-white">فرآیند تجمیع و تلفیق صورت‌های مالی</h1>
                 <p className="text-md text-gray-500 dark:text-gray-400 mt-2">صورت‌های مالی شرکت‌های گروه را به صورت یکپارچه تلفیق کنید.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 min-h-[400px]">
                <Stepper currentStep={step} />

                {step === 1 && (
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg mb-4">گام ۱: انتخاب محدوده تلفیق</h3>
                        <div>
                            <label className="label-form">دوره تلفیق</label>
                            <select className="input-field w-full md:w-1/2">
                                <option>پایان سال مالی ۱۴۰۳</option>
                                <option>شش ماهه اول ۱۴۰۳</option>
                            </select>
                        </div>
                         <div>
                            <label className="label-form">شرکت‌های مورد نظر</label>
                            <div className="space-y-2 p-2 border rounded-md">
                                {mockCompanies.map(c => (
                                    <label key={c.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <input type="checkbox" checked={selectedCompanies.has(c.id)} onChange={() => {}} className="h-4 w-4" />
                                        {c.name}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {step === 2 && (
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg mb-4">گام ۲: شناسایی و حذف معاملات درون‌گروهی</h3>
                        <p className="text-sm text-gray-500">سیستم به صورت هوشمند معاملات متقابل را شناسایی کرده است. موارد مورد نظر برای حذف را انتخاب کنید.</p>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-right">
                                <thead className="bg-gray-50 dark:bg-gray-700"><tr><th className="p-2">از</th><th className="p-2">به</th><th className="p-2">نوع معامله</th><th className="p-2">مبلغ</th><th className="p-2 text-center">حذف شود؟</th></tr></thead>
                                <tbody>
                                    {eliminations.map(e => (
                                        <tr key={e.id} className="border-b dark:border-gray-600">
                                            <td className="p-2">{mockCompanies.find(c=>c.id === e.from)?.name}</td>
                                            <td className="p-2">{mockCompanies.find(c=>c.id === e.to)?.name}</td>
                                            <td className="p-2">{e.account}</td>
                                            <td className="p-2 font-mono">{e.amount.toLocaleString('fa-IR')}</td>
                                            <td className="p-2 text-center"><input type="checkbox" checked={e.eliminated} onChange={() => toggleElimination(e.id)} className="h-4 w-4"/></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                 {step === 3 && (
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg mb-4">گام ۳: پیش‌نمایش تراز تلفیقی</h3>
                         <div className="overflow-x-auto border rounded-md max-h-96">
                            <table className="w-full text-sm text-right">
                                <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0"><tr><th className="p-2">حساب</th><th className="p-2 text-left">مبلغ</th></tr></thead>
                                <tbody>
                                    {mockConsolidatedData.map(row => (
                                        <tr key={row.account} className={`border-b dark:border-gray-600 ${row.isTotal ? 'font-bold bg-gray-100 dark:bg-gray-900' : ''}`}>
                                            <td className="p-2">{row.account}</td>
                                            <td className="p-2 text-left font-mono">{row.balance.toLocaleString('fa-IR')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                 {step === 4 && (
                    <div className="text-center space-y-4 p-8">
                        <IconCheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">عملیات تلفیق با موفقیت انجام شد</h2>
                        <p className="text-gray-600 dark:text-gray-400">سند تلفیق در سیستم ثبت شد و گزارشات نهایی قابل استخراج هستند.</p>
                        <div className="flex gap-4 justify-center">
                            <button className="btn-secondary">دانلود ترازنامه تلفیقی (PDF)</button>
                             <button className="btn-secondary">دانلود سود و زیان تلفیقی (Excel)</button>
                        </div>
                    </div>
                )}

                 <div className="flex justify-between pt-6 mt-6 border-t dark:border-gray-700">
                    <button onClick={() => setStep(s => s - 1)} disabled={step === 1 || step === 4} className="btn-secondary">قبلی</button>
                    {step < 4 ? 
                        <button onClick={() => setStep(s => s + 1)} className="btn-primary">{step === 3 ? 'نهایی‌سازی و ثبت سند' : 'بعدی'}</button>
                        :
                         <button onClick={() => setStep(1)} className="btn-primary">شروع تلفیق جدید</button>
                    }
                </div>
            </div>
            <style>{`.label-form{display:block;font-size:.875rem;font-weight:500;color:#374151;margin-bottom:.25rem}.dark .label-form{color:#D1D5DB}.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;width:100%}.dark .input-field{background-color:#374151;border-color:#4B5563}.input-field:focus{outline:2px solid transparent;outline-offset:2px;--tw-ring-color:hsl(262 83% 58%);box-shadow:0 0 0 2px var(--tw-ring-color)}.btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500;transition:all .2s}.btn-primary:hover:not(:disabled){background-color:hsl(262 75% 52%)}.btn-primary:disabled{opacity:.5;cursor:not-allowed}.btn-secondary{padding:.5rem 1rem;background-color:#E5E7EB;color:#1F2937;border-radius:.5rem;font-weight:500}.dark .btn-secondary{background-color:#4B5563;color:#F9FAFB}.btn-secondary:disabled{opacity:.5;cursor:not-allowed}`}</style>
        </div>
    );
};
