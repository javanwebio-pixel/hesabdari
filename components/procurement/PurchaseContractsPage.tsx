
import React, { useState } from 'react';
import type { PurchaseContract, Party, ToastData } from '../../types';
import { IconPlusCircle } from '../Icons';
import { Modal } from '../common/Modal';

interface PurchaseContractsPageProps {
    contracts: PurchaseContract[];
    suppliers: Party[];
    showToast: (message: string, type?: ToastData['type']) => void;
}

export const PurchaseContractsPage: React.FC<PurchaseContractsPageProps> = ({ contracts, suppliers, showToast }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">قراردادهای خرید</h1>
                <button onClick={() => showToast('این قابلیت در نسخه نمایشی غیرفعال است', 'info')} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-primary-600 transition-colors">
                    <IconPlusCircle className="w-5 h-5"/> قرارداد جدید
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-3">شماره قرارداد</th><th className="px-4 py-3">تامین کننده</th>
                                <th className="px-4 py-3">دوره اعتبار</th><th className="px-4 py-3">میزان استفاده</th>
                                <th className="px-4 py-3">وضعیت</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contracts.map(c => {
                                const progress = c.targetValue > 0 ? (c.releasedValue / c.targetValue) * 100 : 0;
                                return (
                                <tr key={c.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-4 py-2 font-mono">{c.contractNumber}</td>
                                    <td className="px-4 py-2 font-semibold">{c.supplierName}</td>
                                    <td className="px-4 py-2">{c.startDate} تا {c.endDate}</td>
                                    <td className="px-4 py-2">
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                            <div className="bg-primary h-2.5 rounded-full" style={{width: `${progress}%`}}></div>
                                        </div>
                                        <span className="text-xs font-mono text-gray-500">{c.releasedValue.toLocaleString('fa-IR')} / {c.targetValue.toLocaleString('fa-IR')}</span>
                                    </td>
                                    <td className="px-4 py-2"><span className={`px-2 py-1 text-xs rounded-full ${c.status === 'فعال' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>{c.status}</span></td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
