// This is a new file: pages/student/WarehouseDashboard.tsx
import React, { useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Link } from 'react-router-dom';
import { PackageIcon, CalendarIcon } from '../../components/icons';
import { EventStatus, OrderStatus } from '../../types';

const StatCard: React.FC<{ icon: React.ElementType; title: string; value: string | number; link: string }> = ({ icon: Icon, title, value, link }) => (
    <Link to={link} className="block p-6 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1 bg-gradient-to-br from-green-500 to-emerald-600 text-white">
        <div className="flex justify-between items-center">
            <div>
                <p className="text-sm font-medium opacity-80">{title}</p>
                <p className="text-3xl font-bold">{value}</p>
            </div>
            <Icon className="w-12 h-12 opacity-30" />
        </div>
    </Link>
);


const WarehouseDashboard: React.FC = () => {
    const { currentUser } = useAuth();
    const { events, orders } = useData();

    const stats = useMemo(() => {
        const activeEventsCount = events.filter(e => e.status === EventStatus.ACTIVE).length;
        const pendingOrdersCount = orders.filter(o => o.status === OrderStatus.SUBMITTED).length;
        return { activeEventsCount, pendingOrdersCount };
    }, [events, orders]);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Panel de Almacén (Práctica)</h1>
                <p className="mt-1 text-gray-600 dark:text-gray-400">Bienvenido, {currentUser?.name}. Gestiona los pedidos y el stock del aula.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard icon={PackageIcon} title="Pedidos Pendientes" value={stats.pendingOrdersCount} link="/student/process-orders" />
                <StatCard icon={CalendarIcon} title="Prácticas Activas" value={stats.activeEventsCount} link="/student/dashboard" />
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <div className="h-1.5 bg-indigo-500"></div>
                <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Próximas Tareas</h2>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                        <li>Revisa los <Link to="/student/process-orders" className="text-indigo-500 hover:underline">pedidos pendientes</Link> de tus compañeros de cocina.</li>
                        <li>Prepara la <Link to="/student/reception" className="text-indigo-500 hover:underline">recepción de mercancía</Link> para los pedidos procesados.</li>
                        <li>Asegúrate de que el <Link to="/student/mini-economato" className="text-indigo-500 hover:underline">stock del Mini-Economato</Link> está actualizado.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default WarehouseDashboard;