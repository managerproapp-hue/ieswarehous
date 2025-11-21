import React, { useState, useMemo } from 'react';
import { Classroom, OrderStatus } from '../../../types';
import { ChevronDownIcon } from '../../../components/icons';

interface ReviewOrdersTabProps {
    classroom: Classroom;
}

const statusStyles: Record<OrderStatus, string> = {
    [OrderStatus.DRAFT]: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
    [OrderStatus.SUBMITTED]: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
    [OrderStatus.PROCESSED]: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
    [OrderStatus.RECEIVED_OK]: "bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300",
    [OrderStatus.RECEIVED_PARTIAL]: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300",
};

const ReviewOrdersTab: React.FC<ReviewOrdersTabProps> = ({ classroom }) => {
    const [openOrderId, setOpenOrderId] = useState<string | null>(null);

    const studentMap = useMemo(() => new Map(classroom.students.map(s => [s.id, s.name])), [classroom.students]);
    const eventMap = useMemo(() => new Map(classroom.events.map(e => [e.id, e.name])), [classroom.events]);

    const enrichedOrders = useMemo(() => {
        // Fix: Changed reference from `orderItems` to `orderItem` to match the Classroom type.
        return classroom.orders.map(order => ({
            ...order,
            items: classroom.orderItem.filter(item => item.orderId === order.id),
        })).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [classroom.orders, classroom.orderItem]);

    const toggleOrder = (orderId: string) => {
        setOpenOrderId(prev => prev === orderId ? null : orderId);
    };

    return (
        <div className="space-y-3">
             <p className="text-gray-600 dark:text-gray-400">
                Revisa los pedidos que han enviado los alumnos durante las prácticas.
            </p>
            {enrichedOrders.length > 0 ? enrichedOrders.map(order => {
                const isOpen = openOrderId === order.id;
                return (
                    <div key={order.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                        <div className="h-1.5 bg-indigo-500"></div>
                        <div onClick={() => toggleOrder(order.id)} className="p-4 flex justify-between items-center cursor-pointer">
                            <div>
                                <p className="font-semibold">{studentMap.get(order.teacherId) || 'Alumno Desconocido'}</p>
                                <p className="text-sm text-gray-500">{eventMap.get(order.eventId)} - {new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                 <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[order.status]}`}>
                                    {order.status}
                                </span>
                                <ChevronDownIcon className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                            </div>
                        </div>
                        {isOpen && (
                            <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                <h4 className="font-semibold mb-2">Artículos del Pedido:</h4>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                    {order.items.map(item => (
                                        <li key={item.id}>{item.quantity} {item.unit} x {item.productName}</li>
                                    ))}
                                </ul>
                                {order.notes && <p className="mt-2 text-sm italic"><strong>Notas:</strong> {order.notes}</p>}
                            </div>
                        )}
                    </div>
                )
            }) : <p className="text-center py-8 text-gray-500">No hay pedidos para revisar.</p>}
        </div>
    );
};

export default ReviewOrdersTab;