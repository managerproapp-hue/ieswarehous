import React, { useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { OrderStatus, OrderItem as OrderItemType } from '../../types';
import { DownloadIcon, ChevronDownIcon } from '../../components/icons';

const statusStyles: Record<OrderStatus, string> = {
    [OrderStatus.DRAFT]: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
    [OrderStatus.SUBMITTED]: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
    [OrderStatus.PROCESSED]: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
    [OrderStatus.RECEIVED_OK]: "bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300",
    [OrderStatus.RECEIVED_PARTIAL]: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300",
};

const formatCurrency = (amount: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);

const MyOrderHistory: React.FC = () => {
    const { currentUser } = useAuth();
    const { orders, orderItems, events, products } = useData();
    const [openOrderId, setOpenOrderId] = useState<string | null>(null);

    const productMap = useMemo(() => new Map(products.map(p => [p.id, p])), [products]);
    const eventMap = useMemo(() => new Map(events.map(e => [e.id, e.name])), [events]);

    const getCost = (item: OrderItemType): number => {
        if (item.unitPrice !== undefined && item.unitPrice !== null) {
            return item.quantity * item.unitPrice;
        }
        if (item.productId) {
            const product = productMap.get(item.productId);
            if (product && product.suppliers.length > 0) {
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
        if (!currentUser) return [];

        return orders
            .filter(order => order.teacherId === currentUser.id)
            .map(order => {
                const items = orderItems.filter(item => item.orderId === order.id);
                const totalCost = items.reduce((sum, item) => sum + getCost(item), 0);
                return {
                    ...order,
                    eventName: eventMap.get(order.eventId) || 'Evento Desconocido',
                    items,
                    totalCost,
                };
            })
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [currentUser, orders, orderItems, eventMap, productMap]);

    const toggleOrder = (orderId: string) => {
        setOpenOrderId(prevId => (prevId === orderId ? null : orderId));
    };
    
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6">
            <div className="non-printable flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Mi Historial de Pedidos</h1>
                <button onClick={handlePrint} className="btn-secondary flex items-center gap-2 justify-center">
                    <DownloadIcon className="w-4 h-4" />
                    Descargar PDF
                </button>
            </div>

            <div className="printable-area space-y-3">
                {enrichedOrders.length > 0 ? (
                    enrichedOrders.map(order => {
                        const isOpen = openOrderId === order.id;
                        const catalogItems = order.items.filter(i => !i.isOutOfCatalog);
                        const outOfCatalogItems = order.items.filter(i => i.isOutOfCatalog);

                        return (
                            <div key={order.id} className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                                <div className="h-1.5 bg-indigo-500"></div>
                                <div
                                    className="p-4 cursor-pointer flex flex-col sm:flex-row justify-between sm:items-center gap-2"
                                    onClick={() => toggleOrder(order.id)}
                                >
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-800 dark:text-white">{order.eventName}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(order.updatedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusStyles[order.status]}`}>
                                            {order.status}
                                        </span>
                                        <span className="font-bold text-lg">{formatCurrency(order.totalCost)}</span>
                                        <ChevronDownIcon className={`w-6 h-6 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                    </div>
                                </div>
                                <div className={`print-expanded transition-all duration-300 ease-in-out ${isOpen ? 'max-h-screen' : 'max-h-0'} overflow-hidden`}>
                                    <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                        {catalogItems.length > 0 && (
                                            <div>
                                                <h4 className="font-semibold mb-2">Artículos del Pedido:</h4>
                                                <ul className="list-disc list-inside pl-2 space-y-1 text-sm">
                                                    {catalogItems.map(item => (
                                                        <li key={item.id}>
                                                            {item.quantity} {item.unit} x {item.productName}
                                                            <span className="text-gray-500 text-xs"> ({formatCurrency(item.unitPrice || 0)}/ud)</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {outOfCatalogItems.length > 0 && (
                                            <div className="mt-4">
                                                <h4 className="font-semibold mb-2">Solicitudes de Nuevos Productos:</h4>
                                                <ul className="list-disc list-inside pl-2 space-y-1 text-sm">
                                                    {outOfCatalogItems.map(item => (
                                                        <li key={item.id}>{item.quantity} {item.unit} x {item.productName}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {order.notes && (
                                            <div className="mt-4">
                                                <h4 className="font-semibold">Notas Adicionales:</h4>
                                                <p className="text-sm italic text-gray-600 dark:text-gray-400 p-2 bg-white dark:bg-gray-700 rounded-md mt-1">{order.notes}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="bg-white dark:bg-gray-800 text-center py-16 rounded-lg shadow-md">
                        <p className="text-gray-500 dark:text-gray-400">No tienes pedidos en tu historial.</p>
                    </div>
                )}
            </div>
            
            <style>{`
                .btn-secondary { padding: 0.5rem 1rem; font-weight: 600; color: #374151; background-color: #F3F4F6; border: 1px solid #D1D5DB; border-radius: 0.5rem; }
                .dark .btn-secondary { background-color: #374151; border-color: #4B5563; color: #F9FAFB; }
                @media print {
                    body {
                        background-color: white !important;
                    }
                    .printable-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        padding: 2rem;
                    }
                    .non-printable { display: none !important; }
                    .printable-area .dark\\:bg-gray-800 { background-color: white !important; }
                    .printable-area .dark\\:text-white { color: black !important; }
                    .printable-area .dark\\:text-gray-400 { color: #6B7280 !important; }
                    .print-expanded { max-height: none !important; display: block !important; }
                    .bg-white, .shadow-md, .rounded-lg {
                        box-shadow: none !important;
                        border: 1px solid #E5E7EB !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default MyOrderHistory;