import React, { useState } from 'react';
import type { TimesheetEntry, WBSNode } from '../../types';
import { v4 as uuidv4 } from 'uuid';

interface TimesheetPageProps {
    timesheets: TimesheetEntry[];
    setTimesheets: React.Dispatch<React.SetStateAction<TimesheetEntry[]>>;
    wbs: WBSNode[];
}

export const TimesheetPage: React.FC<TimesheetPageProps> = ({ timesheets, setTimesheets, wbs }) => {
    const [formData, setFormData] = useState({
        wbsId: '',
        workDate: new Date().toISOString().split('T')[0],
        hours: 8,
        description: '',
    });

    const handleSubmit = () => {
        if (!formData.wbsId || formData.hours <= 0) return;
        const newEntry: TimesheetEntry = {
            id: uuidv4(),
            userId: 'u1',
            userName: 'علی رضایی',
            wbsId: formData.wbsId,
            workDate: new Date(formData.workDate).toLocaleDateString('fa-IR-u-nu-latn'),
            hours: formData.hours,
            description: formData.description,
            status: 'پیش‌نویس',
        };
        setTimesheets(prev => [newEntry, ...prev]);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">ثبت کارکرد (Timesheet)</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="font-semibold mb-4">ثبت رکورد جدید</h3>
                    <div className="space-y-4">
                        <div>
                            <label>پروژه / WBS</label>
                            <select value={formData.wbsId} onChange={e => setFormData({...formData, wbsId: e.target.value})} className="input-field mt-1">
                                <option value="">انتخاب کنید...</option>
                                {wbs.map(w => <option key={w.id} value={w.id}>{w.code} - {w.description}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div><label>تاریخ</label><input type="date" value={formData.workDate} onChange={e => setFormData({...formData, workDate: e.target.value})} className="input-field mt-1"/></div>
                             <div><label>ساعت</label><input type="number" value={formData.hours} onChange={e => setFormData({...formData, hours: Number(e.target.value)})} className="input-field mt-1"/></div>
                        </div>
                        <div><label>شرح فعالیت</label><textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="input-field mt-1"/></div>
                        <button onClick={handleSubmit} className="btn-primary w-full">ثبت</button>
                    </div>
                </div>
                <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                     <h3 className="font-semibold mb-4">کارکردهای اخیر</h3>
                     <table className="w-full text-sm">
                        <thead><tr><th className="p-2 text-right">تاریخ</th><th className="p-2 text-right">WBS</th><th className="p-2 text-right">ساعت</th><th className="p-2 text-right">وضعیت</th></tr></thead>
                        <tbody>
                            {timesheets.map(ts => (
                                <tr key={ts.id} className="border-t dark:border-gray-700">
                                    <td className="p-2">{ts.workDate}</td>
                                    <td className="p-2">{wbs.find(w=>w.id === ts.wbsId)?.description}</td>
                                    <td className="p-2">{ts.hours}</td>
                                    <td className="p-2"><span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">{ts.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
             <style>{`.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;width:100%}.dark .input-field{background-color:#374151;border-color:#4B5563}.btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500}.btn-secondary{padding:.5rem 1rem;background-color:#E5E7EB;color:#1F2937;border-radius:.5rem;}`}</style>
        </div>
    );
};
