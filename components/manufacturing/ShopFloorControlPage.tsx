import React, { useState, useMemo } from 'react';
import type { ProductionOrder, RoutingOperation, WorkCenter, Routing } from '../../types';
import { Modal } from '../common/Modal';

const OperationConfirmationModal: React.FC<{
    op: RoutingOperation,
    order: ProductionOrder,
    onConfirm: (data: { orderId: string, opId: string, confirmedQty: number, actualHours: number }) => void,
    onCancel: () => void
}> = ({ op, order, onConfirm, onCancel }) => {
    const [confirmedQty, setConfirmedQty] = useState(order.quantity);
    const [actualHours, setActualHours] = useState(op.runTime * order.quantity / 60);

    const handleSubmit = () => {
        onConfirm({ orderId: order.id, opId: op.id, confirmedQty, actualHours });
        onCancel();
    };
    return (
        <Modal isOpen={true} onClose={onCancel} title={`تایید عملیات: ${op.description}`}>
            <div className="space-y-4">
                <p>دستور تولید: {order.orderNumber} - محصول: {order.goodName}</p>
                <div><label>تعداد تایید شده</label><input type="number" value={confirmedQty} onChange={e => setConfirmedQty(Number(e.target.value))} className="input-field"/></div>
                <div><label>ساعت واقعی صرف شده</label><input type="number" value={actualHours} onChange={e => setActualHours(Number(e.target.value))} className="input-field"/></div>
                <div className="flex justify-end gap-2"><button onClick={onCancel} className="btn-secondary">لغو</button><button onClick={handleSubmit} className="btn-primary">تایید</button></div>
            </div>
        </Modal>
    );
}

interface ShopFloorControlPageProps {
    activeOrders: ProductionOrder[];
    workCenters: WorkCenter[];
    routings: Routing[];
    onConfirmOperation: (orderId: string, action: 'confirm_production', data: any) => void;
}

export const ShopFloorControlPage: React.FC<ShopFloorControlPageProps> = ({ activeOrders, workCenters, routings, onConfirmOperation }) => {
    const [confirmingOp, setConfirmingOp] = useState<{ op: RoutingOperation, order: ProductionOrder } | null>(null);

    const operationsByWC = useMemo(() => {
        const map = new Map<string, { op: RoutingOperation, order: ProductionOrder }[]>();
        workCenters.forEach(wc => map.set(wc.id, []));

        activeOrders.forEach(order => {
            const routing = routings.find(r => r.id === order.routingId);
            routing?.operations.forEach(op => {
                const wcOps = map.get(op.workCenterId);
                if (wcOps) {
                    wcOps.push({ op, order });
                }
            });
        });
        return map;
    }, [activeOrders, workCenters, routings]);
    
    const handleConfirm = (data: { orderId: string, opId: string, confirmedQty: number, actualHours: number }) => {
        // Simplified: confirm production for the whole order based on the last operation
        const laborCost = data.actualHours * 50000; // Mock rate
        onConfirmOperation(data.orderId, 'confirm_production', { producedQty: data.confirmedQty, laborCost });
    }

    return (
        <div className="space-y-6">
            <style>{`.btn-primary{padding:.5rem .75rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500}.btn-secondary{padding:.5rem .75rem;background-color:#E5E7EB;border-radius:.5rem;}.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;width:100%}.dark .input-field{background-color:#374151;border-color:#4B5563}`}</style>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">کنترل کارگاه (SFC)</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workCenters.map(wc => (
                    <div key={wc.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                        <h2 className="font-bold border-b pb-2 mb-2">{wc.name}</h2>
                        <div className="space-y-3 h-[calc(100vh-20rem)] overflow-y-auto pr-1">
                            {operationsByWC.get(wc.id)?.map(({ op, order }) => (
                                <div key={op.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                                    <p className="font-semibold">PO-{order.orderNumber} - {op.description}</p>
                                    <p className="text-xs text-gray-500">{order.goodName} - تعداد: {order.quantity}</p>
                                    <div className="flex gap-2 mt-2">
                                        <button onClick={() => setConfirmingOp({op, order})} className="btn-primary text-xs">تایید عملیات</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            {confirmingOp && <OperationConfirmationModal op={confirmingOp.op} order={confirmingOp.order} onConfirm={handleConfirm} onCancel={() => setConfirmingOp(null)} />}
        </div>
    );
};
