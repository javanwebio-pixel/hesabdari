import React, { useState, useMemo } from 'react';
import type { NetworkActivity, WBSNode } from '../../types';

interface NetworkPageProps {
    activities: NetworkActivity[];
    setActivities: React.Dispatch<React.SetStateAction<NetworkActivity[]>>;
    wbs: WBSNode[];
}

export const NetworkPage: React.FC<NetworkPageProps> = ({ activities, setActivities, wbs }) => {
    const [selectedWbsId, setSelectedWbsId] = useState<string | null>(null);

    const filteredActivities = useMemo(() => {
        if (!selectedWbsId) return activities;
        return activities.filter(act => act.wbsId === selectedWbsId);
    }, [activities, selectedWbsId]);
    
    const getWbsPath = (wbsId: string) => {
        const node = wbs.find(w => w.id === wbsId);
        return node ? `${node.code} - ${node.description}` : 'N/A';
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">شبکه و فعالیت‌ها</h1>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="mb-4">
                    <label>فیلتر بر اساس WBS:</label>
                    <select onChange={e => setSelectedWbsId(e.target.value)} className="input-field ml-2">
                        <option value="">همه</option>
                        {wbs.map(w => <option key={w.id} value={w.id}>{w.code} - {w.description}</option>)}
                    </select>
                </div>
                <table className="w-full text-sm">
                    <thead>
                        <tr>
                            <th className="p-2 text-right">#</th>
                            <th className="p-2 text-right">شرح</th>
                            <th className="p-2 text-right">WBS</th>
                            <th className="p-2 text-right">مدت (روز)</th>
                            <th className="p-2 text-right">وابستگی</th>
                            <th className="p-2 text-right">وضعیت</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredActivities.map(act => (
                            <tr key={act.id} className="border-t dark:border-gray-700">
                                <td className="p-2">{act.activityNumber}</td>
                                <td className="p-2 font-semibold">{act.description}</td>
                                <td className="p-2 text-xs text-gray-500">{getWbsPath(act.wbsId)}</td>
                                <td className="p-2">{act.duration}</td>
                                <td className="p-2">{act.dependencies.map(d => `${d.activityId}-${d.type}`).join(', ')}</td>
                                <td className="p-2">{act.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             <style>{`.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;}.dark .input-field{background-color:#374151;border-color:#4B5563}`}</style>
        </div>
    );
};
