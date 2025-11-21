import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { User, Role } from '../../types';
import { ROLE_STYLES } from '../../constants';
import { EditIcon, TrashIcon, ImpersonateIcon } from '../../components/icons';
import UserFormModal from '../../components/UserFormModal';

const UserManagement: React.FC = () => {
    const { users, addUser, updateUser, deleteUser } = useData();
    const { startImpersonation } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);

    const openCreateModal = () => {
        setUserToEdit(null);
        setIsModalOpen(true);
    };

    const openEditModal = (user: User) => {
        setUserToEdit(user);
        setIsModalOpen(true);
    };

    const handleSaveUser = (userData: User | Omit<User, 'id'>) => {
        if ('id' in userData) {
            updateUser(userData);
        } else {
            // Ensure new users from this page are students
            addUser({ ...userData, roles: [Role.STUDENT] });
        }
    };

    const handleDeleteUser = (userId: string) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar a este estudiante?')) {
            deleteUser(userId);
        }
    };

    const studentUsers = users.filter(user => user.roles.includes(Role.STUDENT));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gestión de Estudiantes</h1>
                <button
                    onClick={openCreateModal}
                    className="px-4 py-2 text-white font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                    Añadir estudiante
                </button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <div className="h-1.5 bg-indigo-500"></div>
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estudiante</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Roles</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {studentUsers.map((user) => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <img className="h-10 w-10 rounded-full" src={user.avatar} alt="" />
                                        </div>
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
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end space-x-3">
                                        <button onClick={() => startImpersonation(user)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300" title="Suplantar">
                                            <ImpersonateIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => openEditModal(user)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300" title="Editar">
                                            <EditIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" title="Eliminar">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <UserFormModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={handleSaveUser}
                userToEdit={userToEdit}
            />
        </div>
    );
};

export default UserManagement;