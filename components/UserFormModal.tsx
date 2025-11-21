
import React, { useState, useEffect, FormEvent } from 'react';
import { User, Role } from '../types';
import Modal from './Modal';
import { ROLE_STYLES } from '../constants';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: User | Omit<User, 'id' | 'password'> & { password?: string }) => void;
  userToEdit?: User | null;
  personnelMode?: boolean;
}

const allRoles = Object.values(Role);

const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, onClose, onSave, userToEdit, personnelMode = false }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
  const [contractType, setContractType] = useState<'Titular' | 'Sustituto' | undefined>(undefined);

  const availableRoles = allRoles.filter(r => r !== Role.CREATOR);

  useEffect(() => {
    if (isOpen) {
        if (userToEdit) {
            setName(userToEdit.name);
            setEmail(userToEdit.email);
            setAvatar(userToEdit.avatar);
            setSelectedRoles(userToEdit.roles);
            setContractType(userToEdit.contractType);
            setPassword(''); // Clear password field on edit
        } else {
            // Reset form for new user
            setName('');
            setEmail('');
            setPassword('');
            setAvatar(`https://picsum.photos/seed/${Date.now()}/200/200`);
            setSelectedRoles([]);
            setContractType(undefined);
        }
    }
  }, [userToEdit, isOpen, personnelMode]);

  const handleRoleToggle = (role: Role) => {
    setSelectedRoles(prev => 
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const userData: Omit<User, 'id' | 'password'> & { password?: string } = { name, email, avatar, roles: selectedRoles, contractType };
    
    if (password) {
        userData.password = password;
    }

    if (userToEdit) {
      onSave({ ...userToEdit, ...userData });
    } else {
      onSave(userData);
    }
    onClose();
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={userToEdit ? 'Editar Usuario' : (personnelMode ? 'Añadir Personal' : 'Añadir Usuario')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
          <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contraseña</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={userToEdit ? 'Dejar en blanco para no cambiar' : ''} required={!userToEdit} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <div>
          <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 dark:text-gray-300">URL del Avatar</label>
          <input type="text" id="avatar" value={avatar} onChange={(e) => setAvatar(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Perfiles</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {availableRoles.map(role => (
              <button
                type="button"
                key={role}
                onClick={() => handleRoleToggle(role)}
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${selectedRoles.includes(role) ? `text-white bg-gradient-to-r ${ROLE_STYLES[role].gradient}` : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500'}`}
              >
                {ROLE_STYLES[role].name}
              </button>
            ))}
          </div>
        </div>
        {selectedRoles.includes(Role.TEACHER) && (
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Contrato (Profesor)</label>
                <select 
                    value={contractType || ''} 
                    onChange={(e) => setContractType(e.target.value as 'Titular' | 'Sustituto')} 
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                    <option value="">Seleccionar tipo</option>
                    <option value="Titular">Titular</option>
                    <option value="Sustituto">Sustituto</option>
                </select>
            </div>
        )}
        <div className="flex justify-end space-x-4 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
            Cancelar
          </button>
          <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
            Guardar
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UserFormModal;
