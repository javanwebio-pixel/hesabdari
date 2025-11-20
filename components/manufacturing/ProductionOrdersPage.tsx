import React, { useState, useMemo } from 'react';
import type { ProductionOrder, ProductionOrderStatus, Good, BOM, Routing } from '../../types';
import { IconPlusCircle, IconCheckCircle, IconXCircle, IconClock, IconFileText } from '../Icons';
import { Modal } from '../common/Modal';

const statusMap: { [key in ProductionOrderStatus]: { class: string } } = {
    'ایجاد شده': { class: 'bg-gray-100 text-gray-800' },
    'برنامه‌ریزی شده': { class: 'bg-blue-100 text-blue-800' },
    'آزاد شده': { class: 'bg-yellow-100 text-yellow-800' },
    'در حال تولید': { class: 'bg-purple-100 text-purple-800' },
    'تایید شده': { class: 'bg-green-100 text-green-800' },
    'بسته شده': { class: 'bg-gray-200 text-gray-500' },
};

const NewOrderForm: React.FC<{onSave: (data: any) => void, onCancel: () => void, goods: Good[]}> = ({ onSave, onCancel, goods }) => {
    const [goodId, setGoodId] = useState('');
    const [quantity, setQuantity] = useState(1);
    const handleSubmit = () => onSave({ goodId, quantity });
    return (
        <div className="space-y-4">
            <div><label>محصول</label><select value={goodId} onChange={e => setGoodId(e.target.value)} className="input-field"><option value="">انتخاب...</option>{goods.filter(g=>g.type==='Finished Good').map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select></div>
            <div><label>تعداد</label><input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="input-field"/></div>
            <div className="flex justify-end gap-2"><button onClick={onCancel} className="btn-secondary">لغو</button><button onClick={handleSubmit} className="btn-primary">ایجاد</button></div>
        </div>
    );
};

const MaterialConfirmationModal: React.FC<{order: ProductionOrder, bom: BOM | undefined, onConfirm: (data: any) => void, onCancel: () => void}> = ({order, bom, onConfirm, onCancel}) => {
    const totalMaterialCost = bom?.items.reduce((sum, item) => sum + item.quantity * 20000, 0) || 0; // Simplified cost
    const handleSubmit = () => onConfirm({ materialCost: totalMaterialCost * order.quantity });
    return (
        <Modal isOpen={true} onClose={onCancel} title={`تایید مصرف مواد برای PO-${order.orderNumber}`}>
            <div className="space-y-4">
                <p>آیا از ثبت مصرف مواد اولیه برای تولید {order.quantity} عدد {order.goodName} اطمینان دارید؟</p>
                <ul>{bom?.items.map(i => <li key={i.id}>{i.componentName}: {i.quantity * order.quantity} عدد</li>)}</ul>
                <div className="flex justify-end gap-2"><button onClick={onCancel} className="btn-secondary">لغو</button><button onClick={handleSubmit} className="btn-primary">تایید مصرف</button></div>
            </div>
        </Modal>
    );
};

const ProductionConfirmationModal: React.FC<{order: ProductionOrder, onConfirm: (data: any) => void, onCancel: () => void}> = ({order, onConfirm, onCancel}) => {
    const [producedQty, setProducedQty] = useState(order.quantity);
    const handleSubmit = () => onConfirm({ producedQty, laborCost: producedQty * 150000 });
    return (
        <Modal isOpen={true} onClose={onCancel} title={`تایید تولید برای PO-${order.orderNumber}`}>
            <div className="space-y-4">
                <div><label>تعداد تولید شده</label><input type="number" value={producedQty} onChange={e => setProducedQty(Number(e.target.value))} max={order.quantity} className="input-field" /></div>
                <div className="flex justify-end gap-2"><button onClick={onCancel} className="btn-secondary">لغو</button><button onClick={handleSubmit} className="btn-primary">تایید تولید</button></div>
            </div>
        </Modal>
    );
}

interface ProductionOrdersPageProps {
    productionOrders: ProductionOrder[];
    goods: Good[];
    boms: BOM[];
    routings: Routing[];
    onAddOrder: (order: Omit<ProductionOrder, 'id'|'orderNumber'|'status'>) => void;
    onUpdateOrder: (orderId: string, action: 'release' | 'issue_material' | 'confirm_production', data?: any) => void;
}

export const ProductionOrdersPage: React.FC<ProductionOrdersPageProps> = ({ productionOrders, goods, boms, routings, onAddOrder, onUpdateOrder }) => {
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);
    const [confirmingMaterial, setConfirmingMaterial] = useState<ProductionOrder|null>(null);
    const [confirmingProduction, setConfirmingProduction] = useState<ProductionOrder|null>(null);

    const handleSaveNewOrder = (data: {goodId: string, quantity: number}) => {
        const good = goods.find(g => g.id === data.goodId);
        const bom = boms.find(b => b.goodId === data.goodId);
        const routing = routings.find(r => r.goodId === data.goodId);
        if (!good || !bom || !routing) return;
        onAddOrder({
            goodId: data.goodId,
            goodName: good.name,
            quantity: data.quantity,
            startDate: new Date().toLocaleDateString('fa-IR-u-nu-latn'),
            endDate: '',
            bomId: bom.id,
            routingId: routing.id,
        });
        setIsNewModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <style>{`.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;width:100%}.dark .input-field{background-color:#374151;border-color:#4B5563}.btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500}.btn-secondary{padding:.5rem 1rem;background-color:#E5E7EB;color:#1F2937;border-radius:.5rem;font-weight:500}.dark .btn-secondary{background-color:#4B5563;color:#F9FAFB}`}</style>
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">دستورات تولید</h1>
                <button onClick={() => setIsNewModalOpen(true)} className="btn-primary flex items-center gap-2 text-sm"><IconPlusCircle className="w-4 h-4"/> دستور تولید جدید</button>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <table className="w-full text-sm">
                    <thead><tr><th className="p-2 text-right">شماره</th><th className="p-2 text-right">محصول</th><th className="p-2 text-right">تعداد</th><th className="p-2 text-right">تاریخ شروع</th><th className="p-2 text-right">وضعیت</th><th className="p-2 text-center">عملیات</th></tr></thead>
                    <tbody>
                        {productionOrders.map(po => (
                            <tr key={po.id} className="border-t dark:border-gray-700">
                                <td className="p-2">{po.orderNumber}</td><td className="p-2">{po.goodName}</td><td className="p-2">{po.quantity}</td><td className="p-2">{po.startDate}</td>
                                <td className="p-2"><span className={`px-2 py-1 text-xs rounded-full ${statusMap[po.status].class}`}>{po.status}</span></td>
                                <td className="p-2 text-center">
                                    {po.status === 'ایجاد شده' && <button onClick={() => onUpdateOrder(po.id, 'release')} className="btn-secondary text-xs">آزادسازی</button>}
                                    {po.status === 'آزاد شده' && <button onClick={() => setConfirmingMaterial(po)} className="btn-secondary text-xs mx-1">مصرف مواد</button>}
                                    {po.status === 'آزاد شده' && <button onClick={() => setConfirmingProduction(po)} className="btn-secondary text-xs">تایید تولید</button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isNewModalOpen && <Modal isOpen={isNewModalOpen} onClose={() => setIsNewModalOpen(false)} title="دستور تولید جدید"><NewOrderForm onSave={handleSaveNewOrder} onCancel={() => setIsNewModalOpen(false)} goods={goods}/></Modal>}
            {confirmingMaterial && <MaterialConfirmationModal order={confirmingMaterial} bom={boms.find(b=>b.id === confirmingMaterial.bomId)} onConfirm={(data) => { onUpdateOrder(confirmingMaterial.id, 'issue_material', data); setConfirmingMaterial(null);}} onCancel={() => setConfirmingMaterial(null)} />}
            {confirmingProduction && <ProductionConfirmationModal order={confirmingProduction} onConfirm={(data) => { onUpdateOrder(confirmingProduction.id, 'confirm_production', data); setConfirmingProduction(null);}} onCancel={() => setConfirmingProduction(null)} />}
        </div>
    );
};
