import React, { useState, useMemo } from 'react';
import type { AttendanceRecord } from '../../../types';

interface AttendancePageProps {
    attendance: AttendanceRecord[];
}

export const AttendancePage: React.FC<AttendancePageProps> = ({ attendance }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const filteredRecords = useMemo(() => {
        const faDate = new Date(date).toLocaleDateString('fa-IR-u-nu-latn');
        return attendance.filter(a => a.date === faDate);
    }, [attendance, date]);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">گزارش حضور و غیاب</h1>
             <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center gap-4">
                <label>تاریخ:</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700 border"/>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <table className="w-full text-sm">
                    <thead><tr><th>نام</th><th>ورود</th><th>خروج</th><th>وضعیت</th></tr></thead>
                    <tbody>
                        {filteredRecords.map(rec => (
                            <tr key={rec.id} className="border-t dark:border-gray-700">
                                <td className="p-2 font-semibold">{rec.employeeName}</td>
                                <td className="p-2 font-mono">{rec.checkIn}</td>
                                <td className="p-2 font-mono">{rec.checkOut}</td>
                                <td className="p-2"><span className={`px-2 py-1 text-xs rounded-full ${rec.status === 'حاضر' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{rec.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
