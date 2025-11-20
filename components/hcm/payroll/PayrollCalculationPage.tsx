import React, { useState } from 'react';
import type { Payslip, ToastData } from '../../../types';
import { IconDeviceFloppy } from '../../Icons';

interface PayrollCalculationPageProps {
    onRunPayroll: (period: { year: number, month: number }) => void;
    payslips: Payslip[]; // To show history
    showToast: (message: string, type?: ToastData['type']) => void;
}

const PERSIAN_MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];

export const PayrollCalculationPage: React.FC<PayrollCalculationPageProps> = ({ onRunPayroll, payslips, showToast }) => {
    const [year, setYear] = useState(1403);
    const [month, setMonth] = useState(new Date().getMonth());

    const handleRun = () => {
        onRunPayroll({ year, month });
        showToast(`محاسبه حقوق برای ${PERSIAN_MONTHS[month]} ${year} با موفقیت انجام شد.`);
    };

    const payrollHistory = payslips.reduce((acc, slip) => {
        if (!acc.find(p => p.period === slip.period)) {
            acc.push({ period: slip.period, total: 0, count: 0 });
        }
        const period = acc.find(p => p.period === slip.period)!;
        period.total += slip.netSalary;
        period.count++;
        return acc;
    }, [] as { period: string, total: number, count: number }[]);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">محاسبه حقوق و دستمزد</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
                    <h3 className="font-semibold text-lg">اجرای محاسبه جدید</h3>
                    <div><label>سال</label><select value={year} onChange={e => setYear(Number(e.target.value))} className="input-field mt-1"><option value={1403}>۱۴۰۳</option><option value={1402}>۱۴۰۲</option></select></div>
                    <div><label>ماه</label><select value={month} onChange={e => setMonth(Number(e.target.value))} className="input-field mt-1">{PERSIAN_MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}</select></div>
                    <button onClick={handleRun} className="btn-primary w-full flex items-center justify-center gap-2"><IconDeviceFloppy/> اجرای محاسبه</button>
                </div>
                <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="font-semibold text-lg mb-4">تاریخچه محاسبات</h3>
                    <table className="w-full text-sm">
                        <thead><tr><th>دوره</th><th>تعداد پرسنل</th><th>مبلغ خالص پرداختی</th></tr></thead>
                        <tbody>
                            {payrollHistory.map(h => (
                                <tr key={h.period} className="border-t dark:border-gray-700">
                                    <td className="p-2">{h.period}</td>
                                    <td className="p-2 text-center">{h.count}</td>
                                    <td className="p-2 text-left font-mono">{h.total.toLocaleString('fa-IR')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <style>{`.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;width:100%}.dark .input-field{background-color:#374151;border-color:#4B5563}.btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500}`}</style>
        </div>
    );
};
