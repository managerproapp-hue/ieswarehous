import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { ServiceGroup, Service } from '../../types';
import ServiceGroupFormModal from '../../components/ServiceGroupFormModal';
import ServiceFormModal from '../../components/ServiceFormModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import { EditIcon, TrashIcon } from '../../components/icons';

type ActiveTab = 'groups' | 'services';

const ServicePlanningAdmin: React.FC = () => {
    const { users, serviceGroups, services, addServiceGroup, updateServiceGroup, deleteServiceGroup, addService, updateService, deleteService } = useData();
    const [activeTab, setActiveTab] = useState<ActiveTab>('groups');
    
    // Modals state
    const [isGroupFormOpen, setGroupFormOpen] = useState(false);
    const [isServiceFormOpen, setServiceFormOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

    // Data for modals
    const [groupToEdit, setGroupToEdit] = useState<ServiceGroup | null>(null);
    const [serviceToEdit, setServiceToEdit] = useState<Service | null>(null);
    const [itemToDelete, setItemToDelete] = useState<{ type: 'group' | 'service', data: ServiceGroup | Service } | null>(null);
    
    const userMap = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);
    const groupMap = useMemo(() => new Map(serviceGroups.map(g => [g.id, g.name])), [serviceGroups]);

    // Group handlers
    const handleCreateGroup = () => { setGroupToEdit(null); setGroupFormOpen(true); };
    const handleEditGroup = (group: ServiceGroup) => { setGroupToEdit(group); setGroupFormOpen(true); };
    const handleSaveGroup = (groupData: ServiceGroup | Omit<ServiceGroup, 'id'>) => {
        'id' in groupData ? updateServiceGroup(groupData) : addServiceGroup(groupData);
    };

    // Service handlers
    const handleCreateService = () => { setServiceToEdit(null); setServiceFormOpen(true); };
    const handleEditService = (service: Service) => { setServiceToEdit(service); setServiceFormOpen(true); };
    const handleSaveService = (serviceData: Service | Omit<Service, 'id'>) => {
        'id' in serviceData ? updateService(serviceData) : addService(serviceData);
    };

    // Delete handler
    const handleDeleteRequest = (type: 'group' | 'service', data: ServiceGroup | Service) => {
        setItemToDelete({ type, data });
        setDeleteModalOpen(true);
    };
    const handleDeleteConfirm = () => {
        if (!itemToDelete) return;
        if (itemToDelete.type === 'group') {
            deleteServiceGroup(itemToDelete.data.id);
        } else {
            deleteService(itemToDelete.data.id);
        }
        setDeleteModalOpen(false);
        setItemToDelete(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Planificación de Servicios</h1>
                <button
                    onClick={activeTab === 'groups' ? handleCreateGroup : handleCreateService}
                    className="px-4 py-2 text-white font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700"
                >
                    {activeTab === 'groups' ? 'Nuevo Grupo' : 'Programar Servicio'}
                </button>
            </div>
            
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('groups')} className={`tab ${activeTab === 'groups' ? 'tab-active' : 'tab-inactive'}`}>Grupos de Servicio</button>
                    <button onClick={() => setActiveTab('services')} className={`tab ${activeTab === 'services' ? 'tab-active' : 'tab-inactive'}`}>Servicios Programados</button>
                </nav>
            </div>

            {/* Content based on active tab */}
            {activeTab === 'groups' ? (
                // Service Groups View
                <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                    <div className="h-1.5 bg-indigo-500"></div>
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="th-style">Nombre del Grupo</th>
                                <th className="th-style">Miembros</th>
                                <th className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {serviceGroups.map(group => (
                                <tr key={group.id}>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{group.name}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {group.memberIds.map(id => (
                                                <span key={id} className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">{userMap.get(id)?.name || 'Desconocido'}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleEditGroup(group)} className="btn-action"><EditIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handleDeleteRequest('group', group)} className="btn-action-danger"><TrashIcon className="w-5 h-5"/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                // Services View
                <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                    <div className="h-1.5 bg-indigo-500"></div>
                     <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="th-style">Nombre del Servicio</th>
                                <th className="th-style">Fecha y Hora</th>
                                <th className="th-style">Grupo Asignado</th>
                                <th className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {services.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(service => (
                                <tr key={service.id}>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{service.name}</td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{new Date(service.date).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{groupMap.get(service.serviceGroupId) || 'N/A'}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleEditService(service)} className="btn-action"><EditIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handleDeleteRequest('service', service)} className="btn-action-danger"><TrashIcon className="w-5 h-5"/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <ServiceGroupFormModal isOpen={isGroupFormOpen} onClose={() => setGroupFormOpen(false)} onSave={handleSaveGroup} groupToEdit={groupToEdit} />
            <ServiceFormModal isOpen={isServiceFormOpen} onClose={() => setServiceFormOpen(false)} onSave={handleSaveService} serviceToEdit={serviceToEdit} />

            {itemToDelete && (
                <ConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    onConfirm={handleDeleteConfirm}
                    title={`Eliminar ${itemToDelete.type === 'group' ? 'Grupo' : 'Servicio'}`}
                    confirmationText="ELIMINAR"
                >
                    <p>Estás a punto de eliminar permanentemente "{itemToDelete.data.name}". Esta acción no se puede deshacer.</p>
                </ConfirmationModal>
            )}

            <style>{`
                .tab { padding: 1rem 0; border-bottom: 2px solid transparent; font-weight: 500; }
                .tab-active { color: #4F46E5; border-color: #4F46E5; }
                .tab-inactive { color: #6B7280; } .dark .tab-inactive { color: #9CA3AF; }
                .th-style { padding: 0.75rem 1.5rem; text-align: left; font-size: 0.75rem; text-transform: uppercase; }
                .btn-action { padding: 0.5rem; color: #4B5563; } .dark .btn-action { color: #9CA3AF; }
                .btn-action-danger { padding: 0.5rem; color: #DC2626; } .dark .btn-action-danger { color: #F87171; }
            `}</style>
        </div>
    );
};

export default ServicePlanningAdmin;