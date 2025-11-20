import React from 'react';
import type { PurchaseRequest, PurchaseOrder } from '../../types';

interface ProjectProcurementPageProps {
    purchaseRequests: PurchaseRequest[];
    purchaseOrders: PurchaseOrder[];
}

export const ProjectProcurementPage: React.FC<ProjectProcurementPageProps> = ({ purchaseRequests, purchaseOrders }) => {
    
    const projectPRs = purchaseRequests.filter(pr => pr.projectId);
    const projectPOs = purchaseOrders.filter(po => po.projectId);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">تدارکات پروژه</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h2 className="font-bold text-lg mb-4">درخواست‌های خرید پروژه‌ای</h2>
                    <table className="w-full text-sm">
                         <thead><tr><th className="p-2 text-right">#</th><th className="p-2 text-right">تاریخ</th><th className="p-2 text-right">کد پروژه</th></tr></thead>
                         <tbody>
                            {projectPRs.map(pr => (
                                <tr key={pr.id} className="border-t dark:border-gray-700">
                                    <td className="p-2">{pr.requestNumber}</td>
                                    <td className="p-2">{pr.requestDate}</td>
                                    <td className="p-2 font-mono">{pr.projectId}</td>
                                </tr>
                            ))}
                         </tbody>
                    </table>
                </div>
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h2 className="font-bold text-lg mb-4">سفارشات خرید پروژه‌ای</h2>
                    <table className="w-full text-sm">
                         <thead><tr><th className="p-2 text-right">#</th><th className="p-2 text-right">تاریخ</th><th className="p-2 text-right">تامین کننده</th><th className="p-2 text-right">کد پروژه</th></tr></thead>
                         <tbody>
                            {projectPOs.map(po => (
                                <tr key={po.id} className="border-t dark:border-gray-700">
                                    <td className="p-2">{po.poNumber}</td>
                                    <td className="p-2">{po.orderDate}</td>
                                    <td className="p-2">{po.supplierName}</td>
                                    <td className="p-2 font-mono">{po.projectId}</td>
                                </tr>
                            ))}
                         </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
