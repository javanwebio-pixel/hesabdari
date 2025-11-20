import React, { useState, useMemo } from 'react';
import type { POSTerminal, POSTransaction, POSCloseout, ToastData } from '../../../types';
import { IconCheckCircle, IconDeviceFloppy } from '../../Icons';

const Stepper: React.FC<{ currentStep: number }> = ({ currentStep }) => {
    const steps = ['انتخاب صندوق', 'شمارش موجودی', 'تایید و ثبت'];
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

const StatCard: React.FC<{title: string, value: number, isCurrency?: boolean}> = ({ title, value, isCurrency = true }) => (
    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold font-mono text-gray-800 dark:text-gray-200 mt-1">
            {isCurrency ? value.toLocaleString('fa-IR') : value}
        </p>
    </div>
)


interface POSClosingPageProps {
    terminals: POSTerminal[];
    transactions: POSTransaction[];
    onRunCloseout: (closeoutData: Omit<POSCloseout, 'id'|'journalEntryId'>) => void;
    showToast: (message: string, type?: ToastData['type']) => void;
}

export const POSClosingPage: React.FC<POSClosingPageProps> = ({ terminals, transactions, onRunCloseout, showToast }) => {
    const [step, setStep] = useState(1);
    const [selectedTerminalId, setSelectedTerminalId] = useState<string>('');
    const [actualCash, setActualCash] = useState<number|''>('');

    const todayStr = useMemo(() => new Date().toLocaleDateString('fa-IR-u-nu-latn', { year: 'numeric', month: '2-digit', day: '2-digit' }), []);

    const reportData = useMemo(() => {
        if (!selectedTerminalId) return null;
        const terminalTransactions = transactions.filter(t => t.terminalId === selectedTerminalId && t.date === todayStr);
        
        const totalSales = terminalTransactions.reduce((sum, t) => sum + t.total, 0);
        const cardTotal = terminalTransactions.filter(t => t.paymentMethod === 'کارتخوان').reduce((sum, t) => sum + t.total, 0);
        const expectedCash = totalSales - cardTotal;
        const cashDifference = (actualCash === '' ? 0 : actualCash) - expectedCash;

        return {
            transactionCount: terminalTransactions.length,
            totalSales,
            cardTotal,
            expectedCash,
            cashDifference
        }
    }, [selectedTerminalId, transactions, todayStr, actualCash]);
    
    const handleNext = () => {
        if (step === 1 && !selectedTerminalId) {
            showToast('لطفا یک صندوق را انتخاب کنید.', 'error');
            return;
        }
        if (step === 2 && actualCash === '') {
            showToast('لطفا مبلغ شمارش شده را وارد کنید.', 'error');
            return;
        }
        setStep(s => s + 1);
    };
    
    const handleFinalize = () => {
        if(!reportData || selectedTerminalId === '') return;
        const terminal = terminals.find(t => t.id === selectedTerminalId);
        if(!terminal) return;

        onRunCloseout({
            terminalId: selectedTerminalId,
            terminalName: terminal.name,
            closeDate: todayStr,
            totalSales: reportData.totalSales,
            expectedCash: reportData.expectedCash,
            actualCash: Number(actualCash),
            cashDifference: reportData.cashDifference,
            cardTotal: reportData.cardTotal,
        });
        setStep(4); // Go to final success step
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <style>{`.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;width:100%}.dark .input-field{background-color:#374151;border-color:#4B5563}.input-field:focus{outline:2px solid transparent;outline-offset:2px;--tw-ring-color:hsl(262 83% 58%);box-shadow:0 0 0 2px var(--tw-ring-color)}.btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500;transition:all .2s}.btn-primary:hover:not(:disabled){background-color:hsl(262 75% 52%)}.btn-primary:disabled{opacity:.5;cursor:not-allowed}.btn-secondary{padding:.5rem 1rem;background-color:#E5E7EB;color:#1F2937;border-radius:.5rem;font-weight:500}.dark .btn-secondary{background-color:#4B5563;color:#F9FAFB}`}</style>
            <div className="text-center">
                 <h1 className="text-3xl font-bold text-gray-800 dark:text-white">بستن صندوق و تهیه گزارش Z</h1>
                 <p className="text-md text-gray-500 dark:text-gray-400 mt-2">فرآیند بستن صندوق در پایان روز کاری.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 min-h-[400px]">
                 <Stepper currentStep={step} />

                 {step === 1 && (
                     <div className="max-w-md mx-auto pt-8">
                         <label htmlFor="terminal-select" className="label-form">صندوق مورد نظر را برای بستن انتخاب کنید:</label>
                         <select id="terminal-select" value={selectedTerminalId} onChange={e => setSelectedTerminalId(e.target.value)} className="input-field">
                             <option value="" disabled>انتخاب کنید...</option>
                             {terminals.map(t => <option key={t.id} value={t.id}>{t.name} - {t.location}</option>)}
                         </select>
                     </div>
                 )}
                 {step === 2 && reportData && (
                     <div className="space-y-4">
                         <h3 className="font-semibold text-lg text-center">خلاصه فروش روز ({todayStr})</h3>
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatCard title="تعداد تراکنش" value={reportData.transactionCount} isCurrency={false} />
                            <StatCard title="کل فروش" value={reportData.totalSales} />
                            <StatCard title="فروش با کارتخوان" value={reportData.cardTotal} />
                            <StatCard title="مبلغ نقد مورد انتظار" value={reportData.expectedCash} />
                         </div>
                         <div className="pt-4">
                             <label className="label-form text-center text-lg">مبلغ نقد شمارش شده در صندوق:</label>
                             <input type="number" value={actualCash} onChange={e => setActualCash(Number(e.target.value))} className="input-field max-w-sm mx-auto text-2xl font-mono text-center" />
                         </div>
                     </div>
                 )}
                 {step === 3 && reportData && (
                     <div className="space-y-4 text-center">
                        <h3 className="font-semibold text-lg">تایید نهایی</h3>
                        <p>لطفا ارقام زیر را تایید کنید:</p>
                        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto text-left">
                            <p>مبلغ مورد انتظار:</p><p className="col-span-2 font-mono">{reportData.expectedCash.toLocaleString('fa-IR')}</p>
                            <p>مبلغ شمارش شده:</p><p className="col-span-2 font-mono">{Number(actualCash).toLocaleString('fa-IR')}</p>
                            <p className={`font-bold ${reportData.cashDifference === 0 ? '' : 'text-danger'}`}>کسری / اضافی:</p><p className={`col-span-2 font-mono font-bold ${reportData.cashDifference === 0 ? '' : 'text-danger'}`}>{reportData.cashDifference.toLocaleString('fa-IR')}</p>
                        </div>
                        <p className="text-xs text-gray-500 pt-4">با تایید نهایی، سند حسابداری مربوطه به صورت خودکار صادر و این جلسه کاری بسته خواهد شد.</p>
                     </div>
                 )}
                 {step === 4 && (
                     <div className="text-center space-y-4 p-8">
                        <IconCheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">صندوق با موفقیت بسته شد</h2>
                        <p className="text-gray-600 dark:text-gray-400">سند حسابداری در سیستم ثبت گردید.</p>
                    </div>
                 )}
                 
                 {step < 4 && (
                     <div className="flex justify-between pt-6 mt-6 border-t dark:border-gray-700">
                        <button onClick={() => setStep(s => s - 1)} disabled={step === 1} className="btn-secondary">قبلی</button>
                        {step < 3 ?
                            <button onClick={handleNext} className="btn-primary">بعدی</button>
                        :
                            <button onClick={handleFinalize} className="btn-primary flex items-center gap-2"><IconDeviceFloppy className="w-5 h-5"/> تایید و ثبت نهایی</button>
                        }
                    </div>
                 )}
            </div>
        </div>
    );
};
