
import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { User, Role } from '../../types';
import { ROLE_STYLES } from '../../constants';
import { EditIcon, TrashIcon } from '../../components/icons';
import UserFormModal from '../../components/UserFormModal';
import ConfirmationModal from '../../components/ConfirmationModal';

const PersonnelManagement: React.FC = () => {
    const { users, addUser, updateUser, deleteUser } = useData();
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    // Filter out Creator role
    const personnel = users.filter(u => !u.roles.includes(Role.CREATOR));

    const openCreateModal = () => {
        setUserToEdit(null);
        setIsFormModalOpen(true);
    };

    const openEditModal = (user: User) => {
        setUserToEdit(user);
        setIsFormModalOpen(true);
    };
    
    const openDeleteModal = (user: User) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };

    const handleSaveUser = (userData: User | Omit<User, 'id' | 'password'> & { password?: string }) => {
        const baseData = {
            ...userData,
            activityStatus: userData.activityStatus || 'active',
        };

        if ('id' in baseData) {
            updateUser(baseData as User);
        } else {
            addUser(baseData as Omit<User, 'id'>);
        }
    };
    
    const handleToggleStatus = (user: User) => {
        const newStatus = user.activityStatus === 'active' ? 'inactive' : 'active';
        updateUser({ ...user, activityStatus: newStatus });
    };

    const handleDeleteUser = () => {
        if (userToDelete) {
            deleteUser(userToDelete.id);
            setIsDeleteModalOpen(false);
            setUserToDelete(null);
        }
    };

    const exportToCsv = () => {
        const headers = ['ID', 'Nombre', 'Email', 'Perfiles', 'Estado', 'Tipo de Contrato'];
        const rows = personnel.map(user => [
            user.id,
            user.name,
            user.email,
            user.roles.map(r => ROLE_STYLES[r].name).join(', '),
            user.activityStatus === 'active' ? 'Activo' : 'De Baja',
            user.contractType || 'N/A'
        ].join(','));
        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'personal.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gestión de Personal</h1>
                <div className="flex gap-2">
                    <button
                        onClick={exportToCsv}
                        className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                    >
                        Exportar a CSV
                    </button>
                    <button
                        onClick={openCreateModal}
                        className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                    >
                        Nuevo Personal
                    </button>
                </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <div className="h-1.5 bg-indigo-500"></div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nombre</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Perfiles</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado de Actividad</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ubicación</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {personnel.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <img className="h-10 w-10 rounded-full" src={user.avatar} alt="Avatar" />
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-wrap gap-1">
                                            {user.roles.map(role => (
                                                <span key={role} className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full text-white ${ROLE_STYLES[role].gradient.replace('from-', 'bg-').split(' ')[0]}`}>
                                                    {ROLE_STYLES[role].name}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.activityStatus === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                                            <svg className={`-ml-0.5 mr-1.5 h-2 w-2 ${user.activityStatus === 'active' ? 'text-green-400' : 'text-red-400'}`} fill="currentColor" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" /></svg>
                                            {user.activityStatus === 'active' ? 'Activo' : 'De Baja'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {user.activityStatus === 'active' ? 'En el centro' : 'Fuera del centro'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-4">
                                            <button onClick={() => openEditModal(user)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300" title="Ver/Editar">
                                                Ver/Editar
                                            </button>
                                            <button onClick={() => handleToggleStatus(user)} className={`${user.activityStatus === 'active' ? 'text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300' : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'}`} title={user.activityStatus === 'active' ? 'Dar de Baja' : 'Reactivar'}>
                                                 {user.activityStatus === 'active' ? 'Dar de Baja' : 'Reactivar'}
                                            </button>
                                            <button onClick={() => openDeleteModal(user)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" title="Eliminar">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <UserFormModal 
                isOpen={isFormModalOpen} 
                onClose={() => setIsFormModalOpen(false)} 
                onSave={handleSaveUser}
                userToEdit={userToEdit}
                personnelMode={true}
            />
            
            {userToDelete && (
                <ConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleDeleteUser}
                    title={`Eliminar a ${userToDelete.name}`}
                    confirmationText="ELIMINAR"
                >
                    <p>Esta acción es irreversible y eliminará permanentemente al usuario del sistema.</p>
                    <p>Todos sus datos asociados se perderán. Para inhabilitar temporalmente a un usuario, use la opción "Dar de Baja".</p>
                </ConfirmationModal>
            )}
        </div>
    );
};

export default PersonnelManagement;
