import React from 'react';
import { IconFileText, IconBuildingBank } from '../../Icons';

const ReportLink: React.FC<{title: string; description: string; icon: React.ReactNode}> = ({ title, description, icon }) => (
    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg flex items-start gap-4 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
        <div className="text-primary">{icon}</div>
        <div>
            <p className="font-semibold">{title}</p>
            <p className="text-xs text-gray-500">{description}</p>
        </div>
    </div>
)

export const PayrollReportsPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">گزارشات حقوق و دستمزد</h1>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ReportLink title="فایل بیمه تامین اجتماعی" description="خروجی ماهانه برای سامانه تامین اجتماعی" icon={<IconFileText className="w-6 h-6"/>} />
                    <ReportLink title="فایل مالیات حقوق" description="خروجی ماهانه برای سامانه امور مالیاتی" icon={<IconFileText className="w-6 h-6"/>} />
                    <ReportLink title="فایل پرداخت گروهی بانک" description="خروجی استاندارد برای واریز حقوق از طریق بانک" icon={<IconBuildingBank className="w-6 h-6"/>} />
                    <ReportLink title="فیش حقوقی گروهی" description="چاپ فیش حقوقی تمام پرسنل برای دوره انتخابی" icon={<IconFileText className="w-6 h-6"/>} />
                     <ReportLink title="گزارش خلاصه حقوق و دستمزد" description="گزارش مدیریتی از هزینه‌های حقوق در یک نگاه" icon={<IconFileText className="w-6 h-6"/>} />
                </div>
            </div>
        </div>
    );
};
