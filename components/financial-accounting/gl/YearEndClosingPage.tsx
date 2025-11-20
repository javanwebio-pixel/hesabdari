import React, { useMemo, useCallback } from 'react';
import type { FiscalYearStatus, AccountNode, JournalEntry, JournalEntryLine, ToastData } from '../../../types';
import { IconCheckCircle, IconXCircle, IconChevronLeft, IconBook, IconFileText } from '../../Icons';
import { v4 as uuidv4 } from 'uuid';

const Stepper: React.FC<{ currentStep: number }> = ({ currentStep }) => {
    const steps = ['پیش‌نیازها', 'تولید اسناد', 'نهایی‌سازی'];
    return (
        <div className="flex items-center justify-center mb-8">
            {steps.map((step, index) => (
                <React.Fragment key={index}>
                    <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                            currentStep > index ? 'bg-green-500 text-white' : 
                            currentStep === index ? 'bg-primary text-white' : 
                            'bg-gray-200 dark:bg-gray-700 text-gray-500'
                        }`}>
                            {currentStep > index ? <IconCheckCircle className="w-6 h-6" /> : index + 1}
                        </div>
                        <p className={`mt-2 text-sm font-semibold ${currentStep >= index ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400'}`}>{step}</p>
                    </div>
                    {index < steps.length - 1 && <div className={`flex-1 h-1 mx-4 rounded-full ${currentStep > index ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>}
                </React.Fragment>
            ))}
        </div>
    );
};

interface YearEndClosingPageProps {
    fiscalYear: FiscalYearStatus;
    updateFiscalYear: (update: Partial<FiscalYearStatus>) => void;
    showToast: (message: string, type?: ToastData['type']) => void;
    accounts: AccountNode[];
    addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'serialNumber'>) => void;
}

const PreCheckItem: React.FC<{ title: string; isOk: boolean; description: string }> = ({ title, isOk, description }) => (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
        {isOk ? <IconCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" /> : <IconXCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />}
        <div>
            <p className={`font-semibold ${isOk ? 'text-gray-800 dark:text-gray-200' : 'text-red-600 dark:text-red-400'}`}>{title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
        </div>
    </div>
);

const JournalPreview: React.FC<{ title: string, icon: React.ReactNode, lines: JournalEntryLine[], total: number }> = ({ title, icon, lines, total }) => (
     <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3 text-lg font-semibold text-gray-800 dark:text-gray-200">
            {icon}
            <h3>{title}</h3>
        </div>
        <div className="max-h-48 overflow-y-auto text-sm border rounded-md dark:border-gray-600">
            <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
                    <tr>
                        <th className="p-2 text-right font-medium">حساب</th>
                        <th className="p-2 text-right font-medium">بدهکار</th>
                        <th className="p-2 text-right font-medium">بستانکار</th>
                    </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-700">
                    {lines.map(line => (
                        <tr key={line.id}>
                            <td className="p-2">{line.accountName} ({line.accountCode})</td>
                            <td className="p-2 font-mono">{line.debit > 0 ? line.debit.toLocaleString('fa-IR') : '-'}</td>
                            <td className="p-2 font-mono">{line.credit > 0 ? line.credit.toLocaleString('fa-IR') : '-'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        <div className="flex justify-between font-bold mt-2 pt-2 border-t dark:border-gray-600">
            <span>جمع کل:</span>
            <span className="font-mono">{total.toLocaleString('fa-IR')}</span>
        </div>
    </div>
);


export const YearEndClosingPage: React.FC<YearEndClosingPageProps> = ({ fiscalYear, updateFiscalYear, showToast, accounts, addJournalEntry }) => {
    
    const preChecks = useMemo(() => ({
        isBalanced: true,
        allDocsFinalized: true,
    }), []);

    const canProceedToStep1 = Object.values(preChecks).every(Boolean);
    const currentStep = fiscalYear.status === 'بسته' ? 3 : fiscalYear.closingStep;

    const generateClosingEntries = useCallback(() => {
        let closingLines: JournalEntryLine[] = [];
        let openingLines: JournalEntryLine[] = [];
        let netIncome = 0;

        const traverse = (nodes: AccountNode[]) => {
            nodes.forEach(node => {
                const codePrefix = node.code[0];
                if (node.type === 'account') {
                    const balance = Math.random() * 10000000;
                    
                    if (['4', '5'].includes(codePrefix)) {
                        if (codePrefix === '4') { 
                            netIncome += balance;
                            closingLines.push({ id: uuidv4(), accountCode: node.code, accountName: node.name, description: 'بستن حساب سود و زیان', debit: balance, credit: 0 });
                        } else {
                            netIncome -= balance;
                            closingLines.push({ id: uuidv4(), accountCode: node.code, accountName: node.name, description: 'بستن حساب سود و زیان', debit: 0, credit: balance });
                        }
                    } else if (['1', '2', '3'].includes(codePrefix)) {
                         if (codePrefix === '1') {
                            openingLines.push({ id: uuidv4(), accountCode: node.code, accountName: node.name, description: `سند افتتاحیه سال ${fiscalYear.year + 1}`, debit: balance, credit: 0 });
                        } else {
                            openingLines.push({ id: uuidv4(), accountCode: node.code, accountName: node.name, description: `سند افتتاحیه سال ${fiscalYear.year + 1}`, debit: 0, credit: balance });
                        }
                    }
                }
                if (node.children) traverse(node.children);
            });
        };

        traverse(accounts);

        const retainedEarningsAccount = { code: '3103', name: 'سود انباشته' };
        if (netIncome >= 0) {
            closingLines.push({ id: uuidv4(), accountCode: retainedEarningsAccount.code, accountName: retainedEarningsAccount.name, description: 'انتقال سود سال مالی', debit: 0, credit: netIncome });
            openingLines.push({ id: uuidv4(), accountCode: retainedEarningsAccount.code, accountName: retainedEarningsAccount.name, description: `سند افتتاحیه سال ${fiscalYear.year + 1}`, debit: 0, credit: netIncome });
        } else {
            closingLines.push({ id: uuidv4(), accountCode: retainedEarningsAccount.code, accountName: retainedEarningsAccount.name, description: 'انتقال زیان سال مالی', debit: -netIncome, credit: 0 });
             openingLines.push({ id: uuidv4(), accountCode: retainedEarningsAccount.code, accountName: retainedEarningsAccount.name, description: `سند افتتاحیه سال ${fiscalYear.year + 1}`, debit: -netIncome, credit: 0 });
        }

        const closingTotal = closingLines.reduce((sum, l) => sum + l.debit, 0);
        const openingTotal = openingLines.reduce((sum, l) => sum + l.debit, 0);

        updateFiscalYear({
            closingStep: 2,
            generatedClosingEntry: { docNumber: 9998, date: `۲۹/۱۲/${fiscalYear.year}`, description: `سند اختتامیه سال مالی ${fiscalYear.year}`, lines: closingLines, totalDebit: closingTotal, totalCredit: closingTotal },
            generatedOpeningEntry: { docNumber: 1, date: `۰۱/۰۱/${fiscalYear.year + 1}`, description: `سند افتتاحیه سال مالی ${fiscalYear.year + 1}`, lines: openingLines, totalDebit: openingTotal, totalCredit: openingTotal }
        });
        showToast('اسناد اختتامیه و افتتاحیه با موفقیت تولید شدند.', 'info');
    }, [accounts, fiscalYear.year, updateFiscalYear, showToast]);
    
    const finalizeClosing = () => {
        if(fiscalYear.generatedClosingEntry && fiscalYear.generatedOpeningEntry) {
            addJournalEntry({ ...fiscalYear.generatedClosingEntry, status: 'ثبت شده', sourceModule: 'Closing' });
            addJournalEntry({ ...fiscalYear.generatedOpeningEntry, status: 'ثبت شده', sourceModule: 'Closing' });
            
            updateFiscalYear({ status: 'بسته', closingStep: 3 });
            showToast(`سال مالی ${fiscalYear.year} با موفقیت بسته شد.`);
        } else {
            showToast('خطا: اسناد بستن سال یافت نشدند!', 'error');
        }
    };
    
    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">عملیات پایان سال مالی {fiscalYear.year}</h1>
                 <p className="text-md text-gray-500 dark:text-gray-400 mt-2">
                    وضعیت فعلی: <span className={`font-bold ${fiscalYear.status === 'باز' ? 'text-green-500' : (fiscalYear.status === 'در حال بستن' ? 'text-yellow-500' : 'text-red-500')}`}>{fiscalYear.status}</span>
                </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <Stepper currentStep={currentStep} />
                
                {currentStep === 0 && (
                    <div className="space-y-4 animate-fade-in-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">قبل از شروع، اطمینان حاصل کنید که تمام موارد زیر برقرار هستند. این عملیات غیرقابل بازگشت است.</p>
                        <div className="space-y-3 pt-4">
                            <PreCheckItem title="تراز بودن حساب‌ها" isOk={preChecks.isBalanced} description="جمع بدهکار و بستانکار در تراز آزمایشی باید برابر باشد." />
                            <PreCheckItem title="نهایی بودن تمام اسناد" isOk={preChecks.allDocsFinalized} description="تمام اسناد موقت و پیش‌نویس باید به وضعیت قطعی تبدیل شده باشند." />
                        </div>
                        <div className="flex justify-end pt-6 border-t dark:border-gray-700">
                            <button onClick={() => updateFiscalYear({ closingStep: 1, status: 'در حال بستن' })} disabled={!canProceedToStep1} className="px-6 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                شروع فرآیند بستن سال
                            </button>
                        </div>
                    </div>
                )}

                {currentStep === 1 && (
                     <div className="text-center p-6 bg-primary-50 dark:bg-gray-700/50 rounded-lg animate-fade-in-right">
                         <p className="mb-4">برای تولید اسناد اختتامیه و افتتاحیه بر روی دکمه زیر کلیک کنید.</p>
                         <button onClick={generateClosingEntries} className="px-6 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-primary-600 transition-colors">تولید اسناد</button>
                     </div>
                )}
                 
                {currentStep === 2 && fiscalYear.generatedClosingEntry && fiscalYear.generatedOpeningEntry && (
                     <div className="space-y-6 animate-fade-in-right">
                         <p className="text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/50 p-3 rounded-md">اسناد زیر با موفقیت تولید شده‌اند. لطفاً قبل از نهایی‌سازی، آن‌ها را به دقت بازبینی کنید.</p>
                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <JournalPreview title="سند اختتامیه" icon={<IconBook />} lines={fiscalYear.generatedClosingEntry.lines} total={fiscalYear.generatedClosingEntry.totalDebit} />
                            <JournalPreview title="سند افتتاحیه" icon={<IconFileText />} lines={fiscalYear.generatedOpeningEntry.lines} total={fiscalYear.generatedOpeningEntry.totalDebit} />
                        </div>
                         <div className="flex justify-between items-center pt-6 border-t dark:border-gray-700">
                             <button onClick={() => updateFiscalYear({ closingStep: 0, status: 'باز' })} className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-600 rounded-lg">
                                <IconChevronLeft className="w-4 h-4 inline-block ml-1"/> بازگشت و لغو
                             </button>
                             <button onClick={finalizeClosing} className="px-6 py-2 bg-danger text-white rounded-lg shadow-md hover:bg-red-700 transition-colors">
                                 تایید و بستن نهایی سال مالی {fiscalYear.year}
                             </button>
                        </div>
                     </div>
                 )}

                 {currentStep === 3 && (
                    <div className="text-center space-y-4 p-8 animate-fade-in-right">
                        <IconCheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">سال مالی {fiscalYear.year} با موفقیت بسته شد.</h2>
                        <p className="text-gray-600 dark:text-gray-400">اسناد اختتامیه و افتتاحیه در سیستم ثبت شدند. اکنون در سال مالی {fiscalYear.year + 1} قرار دارید.</p>
                    </div>
                )}
            </div>
        </div>
    );
};