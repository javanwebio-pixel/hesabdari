
import React, { useState, useMemo, useCallback } from 'react';
import type { FixedAsset, AssetClass, JournalEntry, ToastData } from '../../types';
import { IconDeviceFloppy, IconChevronLeft, IconCheckCircle } from '../Icons';
import { v4 as uuidv4 } from 'uuid';

const PERSIAN_MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];

interface DepreciationPreview {
    assetId: string;
    assetCode: string;
    assetDescription: string;
    monthlyDepreciation: number;
}

const Stepper: React.FC<{ currentStep: number }> = ({ currentStep }) => {
    const steps = ['انتخاب دوره', 'پیش‌نمایش', 'ثبت سند'];
    return (
        <div className="flex items-center justify-center mb-8">
            {steps.map((step, index) => (
                <React.Fragment key={index}>
                    <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                            currentStep > index + 1 ? 'bg-green-500 text-white' : 
                            currentStep === index + 1 ? 'bg-primary text-white' : 
                            'bg-gray-200 dark:bg-gray-700 text-gray-500'
                        }`}>
                            {currentStep > index + 1 ? <IconCheckCircle className="w-6 h-6" /> : index + 1}
                        </div>
                        <p className={`mt-2 text-sm font-semibold ${currentStep >= index + 1 ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400'}`}>{step}</p>
                    </div>
                    {index < steps.length - 1 && <div className={`flex-1 h-1 mx-4 rounded-full ${currentStep > index + 1 ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>}
                </React.Fragment>
            ))}
        </div>
    );
};


interface DepreciationRunPageProps {
    assets: FixedAsset[];
    assetClasses: AssetClass[];
    addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'serialNumber'>) => void;
    showToast: (message: string, type?: ToastData['type']) => void;
}

export const DepreciationRunPage: React.FC<DepreciationRunPageProps> = ({ assets, assetClasses, addJournalEntry, showToast }) => {
    const [step, setStep] = useState(1);
    const [year, setYear] = useState(1403);
    const [month, setMonth] = useState(new Date().getMonth());
    const [previewData, setPreviewData] = useState<DepreciationPreview[]>([]);

    const assetClassesMap = useMemo(() => new Map(assetClasses.map(ac => [ac.id, ac])), [assetClasses]);

    const calculateDepreciation = useCallback(() => {
        const previews: DepreciationPreview[] = [];
        assets.forEach(asset => {
            const assetClass = assetClassesMap.get(asset.assetClassId);
            if (!assetClass) return;

            const acquisitionDate = new Date(asset.acquisitionDate);
            const runDate = new Date(year, month + 1, 0); // Last day of selected month
            if(acquisitionDate > runDate) return; // Asset not yet acquired

            if (assetClass.depreciationMethod === 'Straight-line') {
                const monthlyDepreciation = (asset.acquisitionCost - asset.salvageValue) / (assetClass.usefulLife * 12);
                previews.push({
                    assetId: asset.id,
                    assetCode: asset.code,
                    assetDescription: asset.description,
                    monthlyDepreciation: Math.round(monthlyDepreciation),
                });
            }
        });
        setPreviewData(previews);
        setStep(2);
    }, [assets, assetClassesMap, year, month]);

    const totalDepreciation = useMemo(() => {
        return previewData.reduce((sum, item) => sum + item.monthlyDepreciation, 0);
    }, [previewData]);

    const handlePostJournalEntry = () => {
        if (totalDepreciation <= 0) {
            showToast('مبلغ استهلاک صفر است. سندی ثبت نشد.', 'info');
            return;
        }

        const journalEntry: Omit<JournalEntry, 'id' | 'serialNumber'> = {
            docNumber: 9010, // Example doc number for depreciation runs
            date: new Date(year, month, new Date().getDate()).toLocaleDateString('fa-IR-u-nu-latn'),
            description: `سند استهلاک ${PERSIAN_MONTHS[month]} ${year}`,
            status: 'ثبت شده',
            sourceModule: 'Assets',
            lines: [
                {
                    id: uuidv4(),
                    accountCode: '5203', // هزینه استهلاک
                    accountName: 'هزینه استهلاک',
                    description: `استهلاک ${PERSIAN_MONTHS[month]}`,
                    debit: totalDepreciation,
                    credit: 0,
                },
                {
                    id: uuidv4(),
                    accountCode: '1202', // استهلاک انباشته
                    accountName: 'استهلاک انباشته دارایی‌های ثابت',
                    description: `استهلاک ${PERSIAN_MONTHS[month]}`,
                    debit: 0,
                    credit: totalDepreciation,
                },
            ],
            totalDebit: totalDepreciation,
            totalCredit: totalDepreciation,
        };

        addJournalEntry(journalEntry);
        showToast(`سند استهلاک به مبلغ ${totalDepreciation.toLocaleString('fa-IR')} با موفقیت ثبت شد.`);
        setStep(3);
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <style>{`.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;width:100%}.dark .input-field{background-color:#374151;border-color:#4B5563}.btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500;transition:all .2s}.btn-primary:hover:not(:disabled){background-color:hsl(262 75% 52%)}.btn-primary:disabled{opacity:.5;cursor:not-allowed}.btn-secondary{padding:.5rem 1rem;background-color:#E5E7EB;color:#1F2937;border-radius:.5rem;font-weight:500}.dark .btn-secondary{background-color:#4B5563;color:#F9FAFB}`}</style>
            <div className="text-center">
                 <h1 className="text-3xl font-bold text-gray-800 dark:text-white">محاسبه و ثبت استهلاک ماهانه</h1>
                 <p className="text-md text-gray-500 dark:text-gray-400 mt-2">فرآیند محاسبه استهلاک دارایی‌های ثابت را به صورت اتوماتیک اجرا کنید.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <Stepper currentStep={step} />
                
                {step === 1 && (
                    <div className="max-w-md mx-auto space-y-4 pt-8">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">سال مالی</label>
                                <select value={year} onChange={e => setYear(Number(e.target.value))} className="input-field">
                                    <option value={1403}>۱۴۰۳</option>
                                    <option value={1402}>۱۴۰۲</option>
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium mb-1">ماه</label>
                                <select value={month} onChange={e => setMonth(Number(e.target.value))} className="input-field">
                                    {PERSIAN_MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="text-center pt-4">
                             <button onClick={calculateDepreciation} className="btn-primary px-8 py-3 text-base">اجرای محاسبات و مشاهده پیش‌نمایش</button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">پیش‌نمایش سند استهلاک برای {PERSIAN_MONTHS[month]} {year}</h3>
                        <div className="overflow-x-auto max-h-96 border rounded-md">
                            <table className="w-full text-sm text-right">
                                <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0"><tr><th className="p-2">کد دارایی</th><th className="p-2">شرح دارایی</th><th className="p-2">هزینه استهلاک ماه</th></tr></thead>
                                <tbody>
                                    {previewData.map(item => (
                                        <tr key={item.assetId} className="border-b dark:border-gray-600 last:border-b-0">
                                            <td className="p-2 font-mono">{item.assetCode}</td>
                                            <td className="p-2">{item.assetDescription}</td>
                                            <td className="p-2 font-mono">{item.monthlyDepreciation.toLocaleString('fa-IR')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="font-bold bg-gray-100 dark:bg-gray-700 sticky bottom-0"><tr><td colSpan={2} className="p-2">جمع کل</td><td className="p-2 font-mono">{totalDepreciation.toLocaleString('fa-IR')}</td></tr></tfoot>
                            </table>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t dark:border-gray-700">
                             <button onClick={() => setStep(1)} className="btn-secondary flex items-center gap-1"><IconChevronLeft className="w-4 h-4" /> بازگشت و ویرایش</button>
                             <button onClick={handlePostJournalEntry} className="btn-primary flex items-center gap-2"><IconDeviceFloppy className="w-5 h-5"/> تایید و ثبت نهایی سند</button>
                        </div>
                    </div>
                )}
                {step === 3 && (
                     <div className="text-center space-y-4 p-8">
                        <IconCheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">عملیات با موفقیت انجام شد</h2>
                        <p className="text-gray-600 dark:text-gray-400">سند حسابداری استهلاک با موفقیت در سیستم ثبت گردید.</p>
                        <button onClick={() => setStep(1)} className="btn-secondary">اجرای استهلاک برای دوره جدید</button>
                    </div>
                )}
            </div>
        </div>
    );
};
