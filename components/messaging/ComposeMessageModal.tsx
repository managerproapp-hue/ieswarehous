
import React, { useState, useMemo, FormEvent, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Role, User } from '../../types';
import Modal from '../Modal';
import { CloseIcon } from '../icons';

interface ComposeMessageModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ComposeMessageModal: React.FC<ComposeMessageModalProps> = ({ isOpen, onClose }) => {
    const { currentUser, activeRole } = useAuth();
    const { users, sendMessage } = useData();
    
    const [recipientIds, setRecipientIds] = useState<string[]>([]);
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    
    const [search, setSearch] = useState('');
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const userMap = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);

    const { availableRecipients, groupShortcuts } = useMemo<{
        availableRecipients: User[];
        groupShortcuts: Record<string, string[]>;
    }>(() => {
        if (!currentUser || !activeRole) return { availableRecipients: [], groupShortcuts: {} };

        const allOtherUsers = users.filter(u => u.id !== currentUser.id);
        const shortcuts = {
            'Todos los Profesores': allOtherUsers.filter(u => u.roles.includes(Role.TEACHER)).map(u => u.id),
            'Todo Almacén': allOtherUsers.filter(u => u.roles.includes(Role.MANAGER)).map(u => u.id),
            'Todos los Admins': allOtherUsers.filter(u => u.roles.includes(Role.ADMIN)).map(u => u.id),
        };
        return { availableRecipients: allOtherUsers, groupShortcuts: shortcuts };

    }, [currentUser, activeRole, users]);

    const filteredRecipients = useMemo(() => {
        if (!search) return availableRecipients;
        return availableRecipients.filter(u => u.name.toLowerCase().includes(search.toLowerCase()));
    }, [search, availableRecipients]);

    const handleToggleRecipient = (id: string) => {
        setRecipientIds(prev => prev.includes(id) ? prev.filter(rId => rId !== id) : [...prev, id]);
    };
    
    const handleGroupSelect = (ids: string[]) => {
        const newIds = new Set([...recipientIds, ...ids]);
        setRecipientIds(Array.from(newIds));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!currentUser || recipientIds.length === 0 || !subject || !body) {
            alert("Por favor, completa todos los campos.");
            return;
        }
        sendMessage({ senderId: currentUser.id, recipientIds, subject, body });
        onClose();
    };

    useEffect(() => {
        if (!isOpen) {
            setRecipientIds([]);
            setSubject('');
            setBody('');
            setSearch('');
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Redactar Nuevo Mensaje">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div ref={dropdownRef}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Para:</label>
                    <div className="mt-1 relative border border-gray-300 dark:border-gray-600 rounded-md p-2 flex flex-wrap gap-2">
                        {recipientIds.map(id => (
                            <span key={id} className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-sm font-medium px-2 py-1 rounded-full flex items-center gap-1">
                                {userMap.get(id)?.name}
                                <button type="button" onClick={() => handleToggleRecipient(id)}><CloseIcon className="w-3 h-3"/></button>
                            </span>
                        ))}
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onFocus={() => setDropdownOpen(true)}
                            className="flex-grow bg-transparent focus:outline-none"
                            placeholder={recipientIds.length === 0 ? "Seleccionar destinatarios..." : ""}
                        />
                    </div>
                    {isDropdownOpen && (
                         <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {Object.entries(groupShortcuts).length > 0 && (
                                <div className="p-2 border-b dark:border-gray-700">
                                    <h4 className="text-xs font-bold uppercase text-gray-500">Grupos</h4>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                    {Object.entries(groupShortcuts).map(([name, ids]: [string, string[]]) => (
                                        <button type="button" key={name} onClick={() => handleGroupSelect(ids)} className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600">{name}</button>
                                    ))}
                                    </div>
                                </div>
                            )}
                            <ul className="py-1">
                                {filteredRecipients.map(user => (
                                    <li key={user.id} onClick={() => handleToggleRecipient(user.id)} className={`px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${recipientIds.includes(user.id) ? 'bg-indigo-50 dark:bg-indigo-900/50' : ''}`}>
                                        {user.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
                 <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Asunto</label>
                    <input type="text" id="subject" value={subject} onChange={e => setSubject(e.target.value)} required className="input-style"/>
                </div>
                 <div>
                    <label htmlFor="body" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mensaje</label>
                    <textarea id="body" value={body} onChange={e => setBody(e.target.value)} required rows={6} className="input-style"></textarea>
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                    <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
                    <button type="submit" className="btn-primary">Enviar</button>
                </div>
            </form>
             <style>{`
                .input-style { margin-top: 0.25rem; display: block; width: 100%; border-radius: 0.375rem; padding: 0.5rem 0.75rem; }
                .btn-primary { padding: 0.5rem 1rem; color: white; background-color: #4F46E5; }
                .btn-secondary { padding: 0.5rem 1rem; background-color: #F3F4F6; }
            `}</style>
        </Modal>
    );
};

export default ComposeMessageModal;
