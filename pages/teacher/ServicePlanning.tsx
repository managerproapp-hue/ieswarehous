import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { BriefcaseIcon } from '../../components/icons';

const ServicePlanningTeacher: React.FC = () => {
    const { services, serviceGroups } = useData();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const myServices = useMemo(() => {
        if (!currentUser) return [];
        
        const myGroupIds = new Set(
            serviceGroups.filter(g => g.memberIds.includes(currentUser.id)).map(g => g.id)
        );
        
        return services
            .filter(s => myGroupIds.has(s.serviceGroupId))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            
    }, [services, serviceGroups, currentUser]);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Planificación de Servicios</h1>
                <p className="mt-1 text-gray-600 dark:text-gray-400">Gestiona los servicios en los que estás asignado.</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Mis Próximos Servicios</h2>
                {myServices.length > 0 ? (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {myServices.map(service => (
                            <div key={service.id} className="p-4 border dark:border-gray-700 rounded-lg flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">{service.name}</h3>
                                    <p className="text-sm text-gray-500">Fecha: {new Date(service.date).toLocaleString()}</p>
                                </div>
                                <button
                                    onClick={() => navigate(`/teacher/service-planning/${service.id}`)}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                                >
                                    <BriefcaseIcon className="w-4 h-4" />
                                    Gestionar
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="mt-4 text-gray-500 dark:text-gray-400">No tienes servicios asignados en este momento.</p>
                )}
            </div>
        </div>
    );
};

export default ServicePlanningTeacher;
