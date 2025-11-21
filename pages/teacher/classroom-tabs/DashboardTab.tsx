import React, { useMemo } from 'react';
import { Classroom, EventStatus, OrderStatus } from '../../../types';
import { UsersIcon, PackageIcon, TruckIcon, CalendarIcon, ClipboardIcon } from '../../../components/icons';

type ActiveTab = 'dashboard' | 'students' | 'catalog' | 'events' | 'orders' | 'settings';

interface DashboardTabProps {
    classroom: Classroom;
    setActiveTab: (tab: ActiveTab) => void;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ElementType }> = ({ title, value, icon: Icon }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center gap-4">
        <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-full">
            <Icon className="w-6 h-6 text-indigo-600 dark:text-indigo-300" />
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{value}</p>
        </div>
    </div>
);

const DashboardTab: React.FC<DashboardTabProps> = ({ classroom, setActiveTab }) => {
    const stats = useMemo(() => {
        const activePractice = classroom.events.find(e => {
            const now = new Date();
            return e.status === EventStatus.ACTIVE && new Date(e.startDate) <= now && new Date(e.endDate) >= now;
        });

        const submittedOrdersCount = activePractice
            ? classroom.orders.filter(o => o.eventId === activePractice.id && o.status === OrderStatus.SUBMITTED).length
            : 0;

        return {
            studentsCount: classroom.students.length,
            productsCount: classroom.products.length,
            suppliersCount: classroom.suppliers.length,
            activePractice,
            submittedOrdersCount,
        };
    }, [classroom]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Alumnos Inscritos" value={stats.studentsCount} icon={UsersIcon} />
                <StatCard title="Productos Ficticios" value={stats.productsCount} icon={PackageIcon} />
                <StatCard title="Proveedores Ficticios" value={stats.suppliersCount} icon={TruckIcon} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <div className="h-1.5 bg-indigo-500"></div>
                    <div className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Práctica Activa</h2>
                        {stats.activePractice ? (
                            <div className="space-y-3">
                                <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{stats.activePractice.name}</h3>
                                <p className="text-sm"><strong>Finaliza:</strong> {new Date(stats.activePractice.endDate).toLocaleDateString()}</p>
                                <div className="flex items-center gap-4 pt-2">
                                    <div className="text-center">
                                        <p className="text-3xl font-bold">{stats.submittedOrdersCount}</p>
                                        <p className="text-sm text-gray-500">Pedidos Enviados</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-3xl font-bold">{classroom.students.length - stats.submittedOrdersCount}</p>
                                        <p className="text-sm text-gray-500">Alumnos Pendientes</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500 dark:text-gray-400">No hay ninguna práctica activa en este momento.</p>
                                <button onClick={() => setActiveTab('events')} className="mt-4 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                                    Crear Práctica
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <div className="h-1.5 bg-indigo-500"></div>
                    <div className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Accesos Rápidos</h2>
                        <div className="grid grid-cols-2 gap-4">
                             <button onClick={() => setActiveTab('students')} className="quick-link"><UsersIcon className="w-8 h-8 mb-2"/> Gestionar Alumnos</button>
                             <button onClick={() => setActiveTab('catalog')} className="quick-link"><PackageIcon className="w-8 h-8 mb-2"/> Editar Catálogo</button>
                             <button onClick={() => setActiveTab('events')} className="quick-link"><CalendarIcon className="w-8 h-8 mb-2"/> Ver Prácticas</button>
                             <button onClick={() => setActiveTab('orders')} className="quick-link"><ClipboardIcon className="w-8 h-8 mb-2"/> Revisar Pedidos</button>
                        </div>
                    </div>
                </div>
            </div>
             <style>{`.quick-link { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1rem; border-radius: 0.75rem; font-weight: 600; text-align: center; transition: background-color 0.2s; background-color:#F9FAFB } .dark .quick-link { background-color: #374151 } .quick-link:hover { background-color: #F3F4F6 } .dark .quick-link:hover { background-color: #4B5563 }`}</style>
        </div>
    );
};

export default DashboardTab;