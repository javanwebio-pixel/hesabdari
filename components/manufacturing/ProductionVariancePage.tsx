import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { ProductionOrder } from '../../types';

interface ProductionVariancePageProps {
    completedOrders: ProductionOrder[];
}

export const ProductionVariancePage: React.FC<ProductionVariancePageProps> = ({ completedOrders }) => {
    
    const totalVariances = useMemo(() => {
        const variances = {
            material: 0,
            labor: 0,
            overhead: 0,
        };

        completedOrders.forEach(order => {
            const std = order.standardCosts || { material: 0, labor: 0, overhead: 0 };
            const act = order.actualCosts || { material: 0, labor: 0, overhead: 0 };
            variances.material += (act.material - std.material);
            variances.labor += (act.labor - std.labor);
            variances.overhead += (act.overhead - std.overhead);
        });
        
        return [
            { name: 'انحراف مواد', value: variances.material },
            { name: 'انحراف دستمزد', value: variances.labor },
            { name: 'انحراف سربار', value: variances.overhead },
        ];
    }, [completedOrders]);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">تحلیل انحرافات کل تولید</h1>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow h-96">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={totalVariances} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" tickFormatter={(v) => `${(v/1000000).toLocaleString('fa-IR')}م`} />
                        <YAxis type="category" dataKey="name" width={120} />
                        <Tooltip formatter={(value: number) => `${value.toLocaleString('fa-IR')} (مساعد)/نامساعد`} />
                        <Bar dataKey="value" name="انحراف">
                            {totalVariances.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.value > 0 ? '#ea5455' : '#28c76f'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
             <div className="text-center text-sm text-gray-500">
                <span className="inline-block w-3 h-3 bg-[#28c76f] rounded-full mr-1 ml-2"></span>
                انحراف مساعد (هزینه واقعی کمتر از استاندارد)
                <span className="inline-block w-3 h-3 bg-[#ea5455] rounded-full mr-4 ml-2"></span>
                انحراف نامساعد (هزینه واقعی بیشتر از استاندارد)
            </div>
        </div>
    );
};
