import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

interface IncomeExpenseData {
    name: string;
    درآمد: number;
    هزینه: number;
}

export const IncomeExpenseChart: React.FC<{ data: IncomeExpenseData[] }> = ({ data }) => (
    <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128, 128, 128, 0.2)" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#a0aec0', fontSize: '0.75rem' }} />
            <YAxis 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: '#a0aec0', fontSize: '0.75rem' }} 
                tickFormatter={(value) => {
                    if (typeof value === 'number' && isFinite(value)) {
                        return new Intl.NumberFormat('fa-IR', { notation: "compact", maximumFractionDigits: 1 }).format(value);
                    }
                    return '';
                }} 
            />
            <Tooltip
                formatter={(value) => {
                    if (typeof value === 'number' && isFinite(value)) {
                        return `${value.toLocaleString('fa-IR')} تومان`;
                    }
                    return value as React.ReactNode;
                }}
                contentStyle={{ 
                    background: 'rgba(30, 41, 59, 0.9)', 
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: 'white',
                    fontFamily: 'Vazirmatn'
                }} 
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '0.75rem' }} />
            <Bar dataKey="درآمد" fill="#8884d8" radius={[10, 10, 0, 0]} barSize={10} />
            <Bar dataKey="هزینه" fill="#ea5455" radius={[10, 10, 0, 0]} barSize={10} />
        </BarChart>
    </ResponsiveContainer>
);

interface ExpenseData {
    name: string;
    value: number;
}
const EXPENSE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const ExpenseBreakdownChart: React.FC<{ data: ExpenseData[] }> = ({ data }) => (
    <ResponsiveContainer width="100%" height="100%">
        <PieChart>
            <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                nameKey="name"
            >
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                ))}
            </Pie>
             <Tooltip
                formatter={(value, name) => {
                    if (typeof value === 'number' && isFinite(value)) {
                        return [`${value.toLocaleString('fa-IR')} تومان`, name];
                    }
                    return [value as React.ReactNode, name];
                }}
                contentStyle={{ 
                    background: 'rgba(30, 41, 59, 0.9)', 
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: 'white',
                    fontFamily: 'Vazirmatn'
                }} 
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '0.75rem' }} />
        </PieChart>
    </ResponsiveContainer>
);