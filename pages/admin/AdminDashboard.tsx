
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Link } from 'react-router-dom';
import { UsersIcon, CalendarIcon, TruckIcon, AppleIcon, BookOpenIcon, ClipboardIcon, BriefcaseIcon, DownloadIcon } from '../../components/icons';
import { Role, EventStatus, OrderStatus } from '../../types';

const StatCard: React.FC<{ icon: React.ElementType; title: string; value: string | number; link: string; color: string }> = ({ icon: Icon, title, value, link, color }) => (
    <Link to={link} className={`block p-6 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1 ${color}`}>
        <div className="flex justify-between items-center">
            <div>
                <p className="text-sm font-medium text-white/80">{title}</p>
                <p className="text-3xl font-bold text-white">{value}</p>
            </div>
            <Icon className="w-12 h-12 text-white/30" />
        </div>
    </Link>
);

const AdminDashboard: React.FC = () => {
    const { currentUser } = useAuth();
    const { users, events, orders, services, products, suppliers, exportMasterData } = useData();

    const personnelCount = users.filter(u => !u.roles.includes(Role.CREATOR)).length;
    const scheduledServicesCount = services.length;
    const activeEventsCount = events.filter(e => e.status === EventStatus.ACTIVE).length;
    const pendingOrdersCount = orders.filter(o => o.status === OrderStatus.SUBMITTED).length;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Panel de Administrador</h1>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">Bienvenido, {currentUser?.name}.</p>
                </div>
                <button 
                    onClick={exportMasterData}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md transition-all"
                >
                    <DownloadIcon className="w-5 h-5" />
                    <span>Exportar Configuración del Centro</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={UsersIcon} title="Personal" value={personnelCount} link="/admin/personnel" color="bg-gradient-to-br from-sky-500 to-indigo-500" />
                <StatCard icon={BriefcaseIcon} title="Servicios Programados" value={scheduledServicesCount} link="/admin/service-planning" color="bg-gradient-to-br from-rose-500 to-pink-500" />
                <StatCard icon={CalendarIcon} title="Eventos Activos" value={activeEventsCount} link="/admin/events" color="bg-gradient-to-br from-emerald-500 to-teal-500" />
                <StatCard icon={ClipboardIcon} title="Pedidos Pendientes" value={pendingOrdersCount} link="/manager/process-orders" color="bg-gradient-to-br from-amber-500 to-orange-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                    <div className="h-1.5 bg-indigo-500"></div>
                    <div className="p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Accesos Directos</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <Link to="/admin/personnel" className="quick-link bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 hover:bg-sky-200 dark:hover:bg-sky-900">
                                <UsersIcon className="w-8 h-8 mb-2" />
                                <span>Personal</span>
                            </Link>
                             <Link to="/admin/service-planning" className="quick-link bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-900">
                                <BriefcaseIcon className="w-8 h-8 mb-2" />
                                <span>Planificación</span>
                            </Link>
                            <Link to="/admin/events" className="quick-link bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900">
                                <CalendarIcon className="w-8 h-8 mb-2" />
                                <span>Eventos</span>
                            </Link>
                             <Link to="/admin/suppliers" className="quick-link bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-900">
                                <TruckIcon className="w-8 h-8 mb-2" />
                                <span>Proveedores</span>
                            </Link>
                             <Link to="/admin/products" className="quick-link bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900">
                                <AppleIcon className="w-8 h-8 mb-2" />
                                <span>Catálogo</span>
                            </Link>
                             <Link to="/admin/academic-management" className="quick-link bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900">
                                <BookOpenIcon className="w-8 h-8 mb-2" />
                                <span>Académico</span>
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                    <div className="h-1.5 bg-indigo-500"></div>
                    <div className="p-6">
                         <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Resumen del Sistema</h2>
                         <ul className="space-y-3">
                            <li className="flex justify-between items-center text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Total Productos</span>
                                <span className="font-semibold text-gray-800 dark:text-gray-200">{products.length}</span>
                            </li>
                            <li className="flex justify-between items-center text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Total Proveedores</span>
                                 <span className="font-semibold text-gray-800 dark:text-gray-200">{suppliers.length}</span>
                            </li>
                            <li className="flex justify-between items-center text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Total Eventos</span>
                                 <span className="font-semibold text-gray-800 dark:text-gray-200">{events.length}</span>
                            </li>
                            <li className="flex justify-between items-center text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Total Pedidos</span>
                                 <span className="font-semibold text-gray-800 dark:text-gray-200">{orders.length}</span>
                            </li>
                         </ul>
                    </div>
                </div>
            </div>
            <style>{`.quick-link { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1rem; border-radius: 0.75rem; font-weight: 600; text-align: center; transition: background-color 0.2s; }`}</style>
        </div>
    );
};

export default AdminDashboard;
