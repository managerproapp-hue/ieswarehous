import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { EventStatus, OrderStatus, Role } from '../../types';
import { ClipboardCheckIcon, EditIcon, EyeIcon } from '../../components/icons';

const OrderPortal: React.FC = () => {
    const { events, orders } = useData();
    const { currentUser, activeRole } = useAuth();
    const navigate = useNavigate();

    const isStudent = activeRole === Role.STUDENT;
    const pathPrefix = isStudent ? '/student' : '/teacher';

    const eventsAndOrders = useMemo(() => {
        if (!currentUser) return [];

        const activeEvents = events.filter(e => {
            const now = new Date();
            const startDate = new Date(e.startDate);
            const endDate = new Date(e.endDate);
            return e.status === EventStatus.ACTIVE && now >= startDate && now <= endDate;
        });

        return activeEvents.map(event => {
            const myOrder = orders.find(o => o.eventId === event.id && o.teacherId === currentUser.id);
            return { event, myOrder };
        }).sort((a,b) => new Date(a.event.endDate).getTime() - new Date(b.event.endDate).getTime());
    }, [events, orders, currentUser]);
    
    const getStatusChip = (status?: OrderStatus) => {
        if (!status) {
            return <span className="chip chip-gray">No realizado</span>;
        }
        const styles: Record<OrderStatus, string> = {
            [OrderStatus.DRAFT]: "chip-yellow",
            [OrderStatus.SUBMITTED]: "chip-blue",
            [OrderStatus.PROCESSED]: "chip-green",
            [OrderStatus.RECEIVED_OK]: "chip-teal",
            [OrderStatus.RECEIVED_PARTIAL]: "chip-orange",
        };
        return <span className={`chip ${styles[status]}`}>{status}</span>;
    };

    const handleAction = (eventId: string, orderId?: string) => {
        const url = orderId 
            ? `${pathPrefix}/create-order/${eventId}?orderId=${orderId}`
            : `${pathPrefix}/create-order/${eventId}`;
        navigate(url);
    };
    
    if (!currentUser) return null;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Portal de Pedidos</h1>
                <p className="mt-1 text-gray-600 dark:text-gray-400">
                    Crea y gestiona tus pedidos para los eventos de compra activos.
                </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <div className="h-1.5 bg-indigo-500"></div>
                <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Tabla de Eventos Activos</h2>
                    {eventsAndOrders.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th className="th-style">Evento</th>
                                        <th className="th-style">Finaliza</th>
                                        <th className="th-style">Estado de Mi Pedido</th>
                                        <th className="th-style text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {eventsAndOrders.map(({ event, myOrder }) => {
                                        const isEditable = !myOrder || myOrder.status === OrderStatus.DRAFT;
                                        
                                        return (
                                            <tr key={event.id}>
                                                <td className="td-style font-medium text-gray-900 dark:text-white">{event.name}</td>
                                                <td className="td-style">{new Date(event.endDate).toLocaleString()}</td>
                                                <td className="td-style">{getStatusChip(myOrder?.status)}</td>
                                                <td className="td-style text-right">
                                                    <button 
                                                        onClick={() => handleAction(event.id, myOrder?.id)} 
                                                        className="action-btn"
                                                    >
                                                        {isEditable ? 
                                                            (myOrder ? <><EditIcon className="w-4 h-4 mr-2"/>Editar Borrador</> : <><ClipboardCheckIcon className="w-4 h-4 mr-2"/>Crear Pedido</>) : 
                                                            <><EyeIcon className="w-4 h-4 mr-2"/>Ver Pedido</>
                                                        }
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-gray-500 dark:text-gray-400">No hay eventos de pedido activos en este momento.</p>
                        </div>
                    )}
                </div>
            </div>
            <style>{`
                .chip { padding: 0.25rem 0.75rem; font-size: 0.75rem; font-weight: 600; border-radius: 9999px; }
                .chip-gray { background-color: #F3F4F6; color: #4B5563; } .dark .chip-gray { background-color: #374151; color: #D1D5DB; }
                .chip-yellow { background-color: #FEF3C7; color: #92400E; } .dark .chip-yellow { background-color: #78350F; color: #FBBF24; }
                .chip-blue { background-color: #DBEAFE; color: #1E40AF; } .dark .chip-blue { background-color: #1E3A8A; color: #93C5FD; }
                .chip-green { background-color: #D1FAE5; color: #065F46; } .dark .chip-green { background-color: #064E3B; color: #A7F3D0; }
                .chip-teal { background-color: #CCFBF1; color: #134E4A; } .dark .chip-teal { background-color: #115E59; color: #99F6E4; }
                .chip-orange { background-color: #FFEDD5; color: #9A3412; } .dark .chip-orange { background-color: #7C2D12; color: #FDBA74; }
                .th-style { padding: 0.75rem 1rem; text-align: left; font-size: 0.75rem; text-transform: uppercase; color: #6B7280; } .dark .th-style { color: #9CA3AF; }
                .td-style { padding: 1rem; vertical-align: middle; }
                .action-btn { display: inline-flex; align-items: center; padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 500; color: white; background-color: #4F46E5; border-radius: 0.5rem; transition: background-color 0.2s; }
                .action-btn:hover { background-color: #4338CA; }
            `}</style>
        </div>
    );
};

export default OrderPortal;