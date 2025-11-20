import React from 'react';
import type { Employee, Payslip, AttendanceRecord } from '../../../types';
import { IconFileText, IconClock, IconCheckCircle, IconXCircle } from '../../Icons';

interface EmployeePortalPageProps {
    employee: Employee;
    payslips: Payslip[];
    attendance: AttendanceRecord[];
}

export const EmployeePortalPage: React.FC<EmployeePortalPageProps> = ({ employee, payslips, attendance }) => {
    const latestPayslip = payslips.find(p => p.employeeId === employee.employeeId);
    const recentAttendance = attendance.filter(a => a.employeeId === employee.employeeId).slice(0, 5);

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-center gap-6">
                <img src={employee.avatarUrl} className="w-24 h-24 rounded-full"/>
                <div>
                    <h1 className="text-3xl font-bold">{employee.fullName}</h1>
                    <p className="text-gray-500">{employee.position} - {employee.department}</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="font-semibold mb-4 flex items-center gap-2"><IconFileText/> آخرین فیش حقوقی ({latestPayslip?.period})</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-gray-500">حقوق ناخالص:</span><span className="font-mono">{latestPayslip?.grossSalary.toLocaleString('fa-IR')}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">کسورات:</span><span className="font-mono">{latestPayslip?.deductions.toLocaleString('fa-IR')}</span></div>
                        <div className="flex justify-between font-bold text-base border-t pt-2"><span >خالص پرداختی:</span><span className="font-mono">{latestPayslip?.netSalary.toLocaleString('fa-IR')}</span></div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="font-semibold mb-4 flex items-center gap-2"><IconClock/> آخرین وضعیت‌های حضور و غیاب</h3>
                    <ul className="space-y-2">
                        {recentAttendance.map(rec => (
                            <li key={rec.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                <span>{rec.date}</span>
                                <div><span className="font-mono">{rec.checkIn} - {rec.checkOut}</span></div>
                                {rec.status === 'حاضر' ? <IconCheckCircle className="text-success"/> : <IconXCircle className="text-danger"/>}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};
