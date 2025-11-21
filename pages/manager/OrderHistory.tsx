import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { Order, Role, OrderStatus } from '../../types';
import { DownloadIcon } from '../../components/icons';

const formatCurrency = (amount: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);

const statusStyles: Record<OrderStatus, string> = {
    [OrderStatus.DRAFT]: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
    [OrderStatus.SUBMITTED]: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
    [OrderStatus.PROCESSED]: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
    [OrderStatus.RECEIVED_OK]: "bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300",
    [OrderStatus.RECEIVED_PARTIAL]: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300",
};

const OrderHistory: React.FC = () => {
    const { orders, orderItems, users, events, products } = useData();
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [teacherFilter, setTeacherFilter] = useState<string>('');

    const teachers = useMemo(() => users.filter(u => u.roles.includes(Role.TEACHER)), [users]);
    const userMap = useMemo(() => new Map(users.map(u => [u.id, u.name])), [users]);
    const eventMap = useMemo(() => new Map(events.map(e => [e.id, e.name])), [events]);
    const productMap = useMemo(() => new Map(products.map(p => [p.id, p])), [products]);

    const getCost = (item: typeof orderItems[0]): number => {
        if (item.unitPrice !== undefined) {
            return item.quantity * item.unitPrice;
        }
        if (item.productId) {
            const product = productMap.get(item.productId);
            if (product) {
                const bestPriceSupplier = product.suppliers
                    .filter(s => s.status === 'Activo')
                    .sort((a, b) => a.price - b.price)[0];
                if (bestPriceSupplier) {
                    return item.quantity * bestPriceSupplier.price;
                }
            }
        }
        return 0;
    };

    const enrichedOrders = useMemo(() => {
        return orders.map(order => {
            const items = orderItems.filter(item => item.orderId === order.id);
            const cost = items.reduce((sum, item) => sum + getCost(item), 0);
            return {
                ...order,
                teacherName: userMap.get(order.teacherId) || 'N/A',
                eventName: eventMap.get(order.eventId) || 'N/A',
                totalCost: cost,
            };
        });
    }, [orders, orderItems, userMap, eventMap, productMap]);

    const filteredAndSortedOrders = useMemo(() => {
        return enrichedOrders
            .filter(order => {
                const statusMatch = !statusFilter || order.status === statusFilter;
                const teacherMatch = !teacherFilter || order.teacherId === teacherFilter;
                return statusMatch && teacherMatch;
            })
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [enrichedOrders, statusFilter, teacherFilter]);

    const handleExport = () => {
        const headers = ['Fecha', 'Profesor', 'Evento', 'Estado', 'Coste'];
        const rows = filteredAndSortedOrders.map(order => [
            `"${new Date(order.createdAt).toLocaleString()}"`,
            `"${order.teacherName}"`,
            `"${order.eventName}"`,
            `"${order.status}"`,
            order.totalCost.toFixed(2)
        ].join(','));
        
        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'historial_pedidos.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Historial de Pedidos</h1>
            
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="input-style"
                        >
                            <option value="">Todos los estados</option>
                            {Object.values(OrderStatus).map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                        <select
                            value={teacherFilter}
                            onChange={(e) => setTeacherFilter(e.target.value)}
                            className="input-style"
                        >
                            <option value="">Todos los profesores</option>
                            {teachers.map(teacher => (
                                <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                            ))}
                        </select>
                    </div>
                    <button onClick={handleExport} className="btn-secondary flex items-center gap-2 justify-center">
                        <DownloadIcon className="w-4 h-4" />
                        Exportar a CSV
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="th-style">Fecha</th>
                                <th className="th-style">Profesor</th>
                                <th className="th-style">Evento</th>
                                <th className="th-style">Estado</th>
                                <th className="th-style">Coste</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredAndSortedOrders.map(order => (
                                <tr key={order.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{order.teacherName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{order.eventName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[order.status]}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">{formatCurrency(order.totalCost)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <style>{`
                .input-style { background-color: white; border: 1px solid #D1D5DB; border-radius: 0.5rem; padding: 0.5rem 0.75rem; }
                .dark .input-style { background-color: #374151; border-color: #4B5563; }
                .btn-secondary { padding: 0.5rem 1rem; font-weight: 600; color: #374151; background-color: #F3F4F6; border: 1px solid #D1D5DB; border-radius: 0.5rem; }
                .dark .btn-secondary { background-color: #374151; border-color: #4B5563; color: #F9FAFB; }
                .th-style { padding: 0.75rem 1.5rem; text-align: left; font-size: 0.75rem; text-transform: uppercase; }
            `}</style>
        </div>
    );
};

export default OrderHistory;