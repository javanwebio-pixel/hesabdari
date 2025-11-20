import React, { useMemo } from 'react';
import type { StatCardData, JournalEntry, Check, TreasuryDoc, AccountNode, Invoice, SupplierInvoice } from '../../types';
import { 
    IconUser, IconBuildingStore, IconTrendingUp, IconTrendingDown, IconCurrencyDollar,
    IconChartPie, IconWallet, IconFileText, IconPlusCircle, IconClock
} from '../Icons';
import { IncomeExpenseChart, ExpenseBreakdownChart } from '../charts/Charts';

// --- Reusable Components ---
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm ${className}`}>
        {children}
    </div>
);

const CardHeader: React.FC<{ title: string; }> = ({ title }) => (
    <div className="p-5 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-md font-bold text-gray-800 dark:text-white">{title}</h3>
    </div>
);

const toPersianNumerals = (num: string | number): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  // Use Persian comma (٫) for decimal separator
  return String(num).replace(/[0-9]/g, (digit) => persianDigits[parseInt(digit)]).replace('.', '٫');
};

const StatCard: React.FC<{ data: StatCardData }> = ({ data }) => {
    const colorVariants = {
        green: { bg: 'bg-green-100 dark:bg-green-500/10', icon: 'text-green-500' },
        red: { bg: 'bg-red-100 dark:bg-red-500/10', icon: 'text-red-500' },
        blue: { bg: 'bg-blue-100 dark:bg-blue-500/10', icon: 'text-blue-500' },
        orange: { bg: 'bg-orange-100 dark:bg-orange-500/10', icon: 'text-orange-500' },
        purple: { bg: 'bg-purple-100 dark:bg-purple-500/10', icon: 'text-purple-500' },
    };
    const colorClass = colorVariants[data.color];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm transition-transform duration-200 hover:-translate-y-1 relative h-full flex flex-col justify-end">
            <div className="absolute top-4 right-4 left-4 flex justify-between items-start">
                <div className={`p-2.5 rounded-lg ${colorClass.bg}`}>
                    {React.cloneElement(data.icon, { className: `w-5 h-5 ${colorClass.icon}` })}
                </div>
                {data.change !== undefined && (
                    <div className={`flex items-center text-xs font-semibold ${data.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        <span>%{toPersianNumerals(Math.abs(data.change))}</span>
                        {data.change >= 0 ? <IconTrendingUp className="w-4 h-4 mr-1" /> : <IconTrendingDown className="w-4 h-4 mr-1" />}
                    </div>
                )}
            </div>
            
            <div className="mt-8">
                 <p className="text-3xl font-bold text-gray-800 dark:text-white">{data.value}</p>
                 <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{data.title}</p>
            </div>
        </div>
    );
};


// --- Main Dashboard Page ---
interface DashboardPageProps {
    journalEntries: JournalEntry[];
    checks: Check[];
    treasuryDocs: TreasuryDoc[];
    customerInvoices: Invoice[];
    supplierInvoices: SupplierInvoice[];
    onNavigate: (page: any) => void;
    accounts: AccountNode[];
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ journalEntries, checks, treasuryDocs, customerInvoices, supplierInvoices, onNavigate, accounts }) => {
    
    const formatValue = (value: number, unit: 'M' | null = 'M'): string => {
        const sign = value < 0 ? '−' : '';
        const absValue = Math.abs(value);
        const inMillions = (absValue / 1000000).toFixed(1);
        
        const persianNumber = toPersianNumerals(inMillions);

        if (unit === 'M') {
            return `M ${persianNumber}`;
        }
        return `${sign}${persianNumber}`;
    };

    const kpiData = useMemo(() => {
        const totalSales = customerInvoices.filter(inv => inv.status !== 'پیش‌نویس').reduce((sum, inv) => sum + inv.total, 0);
        
        const revenues = journalEntries.flatMap(j => j.lines).filter(l => l.accountCode.startsWith('4')).reduce((sum, l) => sum + l.credit - l.debit, 0);
        const expenses = journalEntries.flatMap(j => j.lines).filter(l => l.accountCode.startsWith('5')).reduce((sum, l) => sum + l.debit - l.credit, 0);
        const netProfit = revenues - expenses;

        const totalReceivables = customerInvoices.filter(inv => inv.status !== 'پرداخت شده' && inv.status !== 'لغو شده' && inv.status !== 'پیش‌نویس').reduce((sum, inv) => sum + (inv.total - inv.paidAmount), 0);
        const totalPayables = supplierInvoices.filter(inv => inv.status !== 'پرداخت شده' && inv.status !== 'لغو شده').reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0);
        
        const receivableChecksAmount = checks.filter(c => c.type === 'دریافتی' && c.status === 'در جریان وصول').reduce((sum, c) => sum + c.amount, 0);
        const payableChecksAmount = checks.filter(c => c.type === 'پرداختی' && c.status === 'در جریان وصول').reduce((sum, c) => sum + c.amount, 0);

        return { totalSales, netProfit, totalReceivables, totalPayables, receivableChecksAmount, payableChecksAmount };
    }, [journalEntries, checks, customerInvoices, supplierInvoices]);

    const statCardsData: StatCardData[] = [
        { title: 'کل فروش', value: formatValue(kpiData.totalSales), icon: <IconCurrencyDollar />, color: 'green', change: 18 },
        { title: 'سود خالص', value: formatValue(kpiData.netProfit, null), icon: <IconClock />, color: 'purple', change: 12 },
        { title: 'مطالبات (AR)', value: formatValue(kpiData.totalReceivables), icon: <IconUser />, color: 'orange' },
        { title: 'بدهی‌ها (AP)', value: formatValue(kpiData.totalPayables), icon: <IconWallet />, color: 'red' },
        { title: 'چک‌های دریافتی', value: formatValue(kpiData.receivableChecksAmount), icon: <IconFileText />, color: 'blue' },
        { title: 'چک‌های پرداختی', value: formatValue(kpiData.payableChecksAmount), icon: <IconFileText />, color: 'blue' },
    ];


    const { monthlyFlowsData, expenseBreakdownChartData } = useMemo(() => {
        // --- Cash Flow Data ---
        const monthlyFlows = Array.from({ length: 6 }, (_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            return { name: d.toLocaleDateString('fa-IR', { month: 'long' }), jsMonth: d.getMonth(), jsYear: d.getFullYear(), 'درآمد': 0, 'هزینه': 0 };
        }).reverse();
        
        const dateMap: { [key: string]: Date } = {};
        for(let i = 0; i < 200; i++) { 
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('fa-IR-u-nu-latn', { year: 'numeric', month: '2-digit', day: '2-digit' });
            dateMap[dateStr] = date;
        }

        treasuryDocs.forEach(doc => {
            const docDate = dateMap[doc.date];
            if (docDate) {
                const flow = monthlyFlows.find(f => f.jsMonth === docDate.getMonth() && f.jsYear === docDate.getFullYear());
                if (flow) {
                    if (doc.type === 'دریافت') flow['درآمد'] += doc.amount;
                    else flow['هزینه'] += doc.amount;
                }
            }
        });

        // --- Expense Breakdown Data ---
        const expenseBreakdown: { [key: string]: number } = {};
        journalEntries.forEach(entry => {
            entry.lines.forEach(line => {
                if (line.accountCode.startsWith('52')) { // General expenses
                    expenseBreakdown[line.accountName] = (expenseBreakdown[line.accountName] || 0) + line.debit;
                }
            });
        });
        const expenseData = Object.entries(expenseBreakdown).map(([name, value]) => ({ name, value }));

        return { monthlyFlowsData: monthlyFlows, expenseBreakdownChartData: expenseData };
    }, [treasuryDocs, journalEntries]);
    
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">داشبورد اصلی</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
                {statCardsData.map((stat) => (
                    <div key={stat.title}>
                        <StatCard data={stat} />
                    </div>
                ))}
            </div>
            
            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-8">
                    <Card>
                        <CardHeader title="جریان نقدینگی (۶ ماه اخیر)" />
                        <div className="p-4 h-80">
                            <IncomeExpenseChart data={monthlyFlowsData} />
                        </div>
                    </Card>
                </div>

                <div className="col-span-12 lg:col-span-4">
                    <Card>
                        <CardHeader title="ترکیب هزینه‌ها" />
                        <div className="p-4 h-80">
                            <ExpenseBreakdownChart data={expenseBreakdownChartData} />
                        </div>
                    </Card>
                </div>
            
                <div className="col-span-12 lg:col-span-7">
                    <Card>
                        <CardHeader title="تراکنش‌های اخیر خزانه" />
                        <div className="overflow-x-auto p-5 pt-0">
                            <table className="w-full text-sm text-right text-gray-500 dark:text-gray-400">
                                <tbody>
                                    {treasuryDocs.slice(0, 5).map(row => (
                                        <tr key={row.id} className="border-b dark:border-gray-700 last:border-0">
                                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{row.description}</td>
                                            <td className="px-4 py-3">{row.date}</td>
                                            <td className={`px-4 py-3 font-semibold ${row.type === 'دریافت' ? 'text-success' : 'text-danger'}`}>
                                                {row.type === 'پرداخت' ? '−' : '+'}
                                                {toPersianNumerals((row.amount ?? 0).toLocaleString('fa-IR'))}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                <div className="col-span-12 lg:col-span-5">
                     <Card>
                        <CardHeader title="دسترسی سریع" />
                         <div className="grid grid-cols-2 gap-4 p-5">
                            <button className="quick-access-btn" onClick={() => onNavigate('financials-gl-new')}>
                                <IconPlusCircle className="w-6 h-6 text-primary mb-2" />
                                <span className="text-sm font-medium text-primary">سند جدید</span>
                            </button>
                             <button className="quick-access-btn" onClick={() => onNavigate('sales-ops-billing')}>
                                <IconPlusCircle className="w-6 h-6 text-primary mb-2" />
                                <span className="text-sm font-medium text-primary">فاکتور جدید</span>
                            </button>
                            <button className="quick-access-btn" onClick={() => onNavigate('treasury-payment')}>
                                <IconPlusCircle className="w-6 h-6 text-primary mb-2" />
                                <span className="text-sm font-medium text-primary">پرداخت جدید</span>
                            </button>
                             <button className="quick-access-btn" onClick={() => onNavigate('treasury-receive')}>
                                <IconPlusCircle className="w-6 h-6 text-primary mb-2" />
                                <span className="text-sm font-medium text-primary">دریافت جدید</span>
                            </button>
                         </div>
                    </Card>
                </div>
            </div>
            <style>{`.quick-access-btn { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1rem; border-radius: 0.75rem; background-color: hsl(262, 90%, 97%); transition: background-color 0.2s; } .quick-access-btn:hover { background-color: hsl(262, 90%, 94%); } .dark .quick-access-btn { background-color: #374151; } .dark .quick-access-btn:hover { background-color: #4b5563; }`}</style>
        </div>
    );
};