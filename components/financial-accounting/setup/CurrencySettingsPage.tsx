import React, { useState, useMemo } from 'react';
import type { Currency, ExchangeRate, ToastData } from '../../../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { v4 as uuidv4 } from 'uuid';

interface CurrencySettingsPageProps {
    currencies: Currency[];
    exchangeRates: ExchangeRate[];
    setExchangeRates: React.Dispatch<React.SetStateAction<ExchangeRate[]>>;
    showToast: (message: string, type?: ToastData['type']) => void;
}

export const CurrencySettingsPage: React.FC<CurrencySettingsPageProps> = ({ currencies, exchangeRates, setExchangeRates, showToast }) => {
    const [selectedCurrencyId, setSelectedCurrencyId] = useState(currencies[0]?.id || '');
    const [newRateDate, setNewRateDate] = useState(new Date().toISOString().split('T')[0]);
    const [newRateValue, setNewRateValue] = useState<number | ''>('');

    const selectedCurrencyRates = useMemo(() => {
        return exchangeRates
            .filter(r => r.currencyId === selectedCurrencyId)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [exchangeRates, selectedCurrencyId]);

    const handleAddRate = () => {
        if (!newRateValue || newRateValue <= 0) {
            showToast('لطفا نرخ معتبر وارد کنید', 'error');
            return;
        }
        setExchangeRates(prev => [
            ...prev,
            { id: uuidv4(), currencyId: selectedCurrencyId, date: newRateDate, rate: newRateValue }
        ]);
        setNewRateValue('');
        showToast('نرخ جدید با موفقیت ثبت شد.');
    };

    return (
        <div className="space-y-6">
             <style>{`.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;width:100%}.dark .input-field{background-color:#374151;border-color:#4B5563}.input-field:focus{outline:2px solid transparent;outline-offset:2px;--tw-ring-color:hsl(262 83% 58%);box-shadow:0 0 0 2px var(--tw-ring-color)}.btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500;transition:all .2s}.btn-primary:hover:not(:disabled){background-color:hsl(262 75% 52%)}`}</style>
            <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">ارز و تسعیر</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">مدیریت ارزها و نرخ برابری روزانه آن‌ها با واحد پایه (ریال).</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                    <h3 className="font-semibold mb-2">ارزها</h3>
                    <ul className="space-y-1">
                        {currencies.map(c => (
                            <li key={c.id}>
                                <button onClick={() => setSelectedCurrencyId(c.id)}
                                    className={`w-full text-right p-2 rounded-md text-sm font-semibold ${selectedCurrencyId === c.id ? 'bg-primary-50 text-primary dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                >
                                    {c.name} ({c.code})
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">نرخ برابری {currencies.find(c=>c.id === selectedCurrencyId)?.name}</h3>
                    
                    <div className="h-64 mb-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={selectedCurrencyRates}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                                <XAxis dataKey="date" tickFormatter={date => new Date(date).toLocaleDateString('fa-IR', {month: 'numeric', day: 'numeric'})} />
                                <YAxis domain={['dataMin - 100', 'dataMax + 100']} tickFormatter={(value) => (value as number / 1000).toFixed(0) + 'k'} />
                                <Tooltip formatter={(value: number) => value.toLocaleString('fa-IR')} />
                                <Line type="monotone" dataKey="rate" stroke="#8884d8" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="border-t dark:border-gray-700 pt-4">
                        <h4 className="font-semibold mb-2">ثبت نرخ جدید</h4>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                            <div className="md:col-span-1">
                                <label className="text-xs">تاریخ</label>
                                <input type="date" value={newRateDate} onChange={e => setNewRateDate(e.target.value)} className="input-field mt-1"/>
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-xs">نرخ</label>
                                <input type="number" value={newRateValue} onChange={e => setNewRateValue(Number(e.target.value))} placeholder="نرخ به ریال" className="input-field mt-1"/>
                            </div>
                            <div className="md:col-span-1">
                                <button onClick={handleAddRate} className="btn-primary w-full h-10">افزودن</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
