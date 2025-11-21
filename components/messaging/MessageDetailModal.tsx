import React, { useEffect, useMemo } from 'react';
import { Message } from '../../types';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import Modal from '../Modal';

interface MessageDetailModalProps {
    message: Message | null;
    onClose: () => void;
}

const MessageDetailModal: React.FC<MessageDetailModalProps> = ({ message, onClose }) => {
    const { users, markMessageAsRead } = useData();
    const { currentUser } = useAuth();
    
    const userMap = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);
    
    useEffect(() => {
        if (message && currentUser && !message.readBy.includes(currentUser.id)) {
            markMessageAsRead(message.id, currentUser.id);
        }
    }, [message, currentUser, markMessageAsRead]);

    if (!message) return null;

    const sender = userMap.get(message.senderId);
    const recipients = message.recipientIds.map(id => userMap.get(id)?.name || 'Desconocido').join(', ');

    return (
        <Modal isOpen={!!message} onClose={onClose} title={message.subject}>
            <div className="space-y-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm">
                    <p><strong>De:</strong> {sender?.name}</p>
                    <p><strong>Para:</strong> {recipients}</p>
                    <p><strong>Fecha:</strong> {new Date(message.timestamp).toLocaleString()}</p>
                </div>
                <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
                    <p>{message.body}</p>
                </div>
                 <div className="flex justify-end pt-4 border-t dark:border-gray-700">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Cerrar</button>
                </div>
            </div>
        </Modal>
    );
};

export default MessageDetailModal;