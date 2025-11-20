import React from 'react';
import type { PerformanceReview } from '../../../types';

const Rating: React.FC<{ value: number }> = ({ value }) => (
    <div className="flex gap-1">{[...Array(5)].map((_, i) => <div key={i} className={`w-4 h-4 rounded-full ${i < value ? 'bg-yellow-400' : 'bg-gray-300'}`}></div>)}</div>
);

interface PerformancePageProps {
    reviews: PerformanceReview[];
}

export const PerformancePage: React.FC<PerformancePageProps> = ({ reviews }) => {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">ارزیابی عملکرد</h1>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <table className="w-full text-sm">
                    <thead><tr><th className="p-2 text-right">کارمند</th><th className="p-2 text-right">تاریخ</th><th className="p-2 text-right">ارزیاب</th><th className="p-2 text-right">امتیاز</th></tr></thead>
                    <tbody>
                        {reviews.map(r => (
                            <tr key={r.id} className="border-t dark:border-gray-700">
                                <td className="p-2 font-semibold">{r.employeeName}</td>
                                <td className="p-2">{r.reviewDate}</td>
                                <td className="p-2">{r.reviewer}</td>
                                <td className="p-2"><Rating value={r.rating} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
