import React from 'react';
import type { NetworkActivity } from '../../types';

interface ResourcePlanningPageProps {
    activities: NetworkActivity[];
}

export const ResourcePlanningPage: React.FC<ResourcePlanningPageProps> = ({ activities }) => {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">مدیریت منابع پروژه</h1>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                 <table className="w-full text-sm">
                    <thead>
                        <tr>
                            <th className="p-2 text-right">فعالیت</th>
                            <th className="p-2 text-right">منبع تخصیص یافته</th>
                            <th className="p-2 text-right">ساعت برنامه‌ریزی شده</th>
                            <th className="p-2 text-right">ساعت واقعی</th>
                        </tr>
                    </thead>
                     <tbody>
                        {activities.map(act => (
                            <tr key={act.id} className="border-t dark:border-gray-700">
                                <td className="p-2">{act.description}</td>
                                <td className="p-2">
                                    {/* Simplified text input for resource name */}
                                    <input type="text" defaultValue="علی رضایی" className="input-field" />
                                </td>
                                <td className="p-2">
                                    <input type="number" defaultValue={act.duration * 8} className="input-field" />
                                </td>
                                <td className="p-2 font-mono">{act.duration * 4}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <style>{`.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;width:100%}.dark .input-field{background-color:#374151;border-color:#4B5563}`}</style>
        </div>
    );
};
