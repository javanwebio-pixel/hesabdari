import React, { useMemo } from 'react';
import type { ProjectDefinition, WBSNode } from '../../types';
import { IconFileText, IconCurrencyDollar, IconChartPie, IconClock } from '../Icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const KPICard: React.FC<{ title: string; value: string; icon: React.ReactNode; colorClass: string }> = ({ title, value, icon, colorClass }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex items-start gap-4">
        <div className={`p-3 rounded-lg ${colorClass.replace('text-', 'bg-').replace('dark:text-', 'dark:bg-')}/10`}>
            {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: `w-6 h-6 ${colorClass}` })}
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-200 mt-1">{value}</p>
        </div>
    </div>
);

const statusChartColors: { [key in ProjectDefinition['status']]: string } = {
    'در حال اجرا': '#28c76f',
    'تعریف شده': '#00cfe8',
    'متوقف': '#ff9f43',
    'خاتمه یافته': '#82868b',
    'لغو شده': '#ea5455',
};

const statusBadgeColors: { [key in ProjectDefinition['status']]: string } = {
    'در حال اجرا': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    'تعریف شده': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    'متوقف': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    'خاتمه یافته': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    'لغو شده': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

export const ProjectDashboardPage: React.FC<{ projects: ProjectDefinition[]; wbs: WBSNode[] }> = ({ projects, wbs }) => {
    const projectStats = useMemo(() => {
        const activeProjects = projects.filter(p => p.status === 'در حال اجرا');
        const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
        const totalActuals = projects.reduce((sum, p) => sum + p.actualCost, 0);
        const budgetConsumption = totalBudget > 0 ? (totalActuals / totalBudget) * 100 : 0;

        return {
            activeProjectCount: activeProjects.length,
            totalBudget,
            totalActuals,
            budgetConsumption,
        };
    }, [projects]);
    
    const budgetChartData = useMemo(() => {
        return projects.map(p => ({
            name: p.projectCode,
            'بودجه': p.budget,
            'هزینه واقعی': p.actualCost,
        }));
    }, [projects]);
    
    const statusChartData = useMemo(() => {
        const statusCounts = projects.reduce((acc, p) => {
            acc[p.status] = (acc[p.status] || 0) + 1;
            return acc;
        }, {} as {[key in ProjectDefinition['status']]: number});
        
        return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
    }, [projects]);


    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">داشبورد کنترل پروژه</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard title="پروژه‌های فعال" value={projectStats.activeProjectCount.toString()} icon={<IconFileText />} colorClass="text-primary" />
                <KPICard title="کل بودجه" value={`${(projectStats.totalBudget / 1000000).toLocaleString('fa-IR')} میلیون`} icon={<IconCurrencyDollar />} colorClass="text-green-500" />
                <KPICard title="کل هزینه واقعی" value={`${(projectStats.totalActuals / 1000000).toLocaleString('fa-IR')} میلیون`} icon={<IconChartPie />} colorClass="text-yellow-500" />
                <KPICard title="میزان مصرف بودجه" value={`${projectStats.budgetConsumption.toFixed(1)}%`} icon={<IconClock />} colorClass="text-red-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                     <h3 className="font-bold mb-4">سلامت پروژه‌ها (بودجه در برابر هزینه)</h3>
                     <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={budgetChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128, 128, 128, 0.1)" />
                                <XAxis dataKey="name" fontSize={10} />
                                <YAxis fontSize={10} tickFormatter={(v) => `${(v/1000000).toLocaleString('fa-IR')}م`} />
                                <Tooltip formatter={(value: number) => value.toLocaleString('fa-IR')} contentStyle={{ background: 'rgba(30, 41, 59, 0.9)', border: 'none', borderRadius: '0.5rem', color: 'white' }} />
                                <Legend />
                                <Bar dataKey="بودجه" fill="#8884d8" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="هزینه واقعی" fill="#28c76f" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                 <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="font-bold mb-4">وضعیت پروژه‌ها</h3>
                     <div className="h-80">
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={statusChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                    {statusChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={statusChartColors[entry.name as ProjectDefinition['status']] || '#8884d8'} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => value.toLocaleString('fa-IR')} />
                                <Legend iconType="circle"/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            
             <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                 <h3 className="font-bold mb-4">نمای کلی پروژه‌ها</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="p-2 text-right">پروژه</th>
                                <th className="p-2 text-right">پیشرفت</th>
                                <th className="p-2 text-right">بودجه</th>
                                <th className="p-2 text-right">هزینه واقعی</th>
                                <th className="p-2 text-right">وضعیت</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.map(p => {
                                const progress = p.budget > 0 ? (p.actualCost / p.budget) * 100 : 0;
                                return (
                                <tr key={p.id} className="border-b dark:border-gray-700">
                                    <td className="p-2 font-semibold">{p.description}</td>
                                    <td className="p-2 w-48">
                                         <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                            <div className="bg-primary h-2.5 rounded-full" style={{width: `${Math.min(100, progress)}%`}}></div>
                                        </div>
                                        <span className="text-xs font-mono">{progress.toFixed(1)}%</span>
                                    </td>
                                    <td className="p-2 font-mono">{p.budget.toLocaleString('fa-IR')}</td>
                                    <td className="p-2 font-mono">{p.actualCost.toLocaleString('fa-IR')}</td>
                                    <td className="p-2"><span className={`px-2 py-1 text-xs rounded-full ${statusBadgeColors[p.status]}`}>{p.status}</span></td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};