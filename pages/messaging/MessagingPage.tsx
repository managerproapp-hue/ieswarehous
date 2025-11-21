import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Message, User } from '../../types';
import ComposeMessageModal from '../../components/messaging/ComposeMessageModal';
import MessageDetailModal from '../../components/messaging/MessageDetailModal';

type ActiveTab = 'inbox' | 'sent';

const MessagingPage: React.FC = () => {
    const { currentUser } = useAuth();
    const { messages, users } = useData();
    const [activeTab, setActiveTab] = useState<ActiveTab>('inbox');
    const [isComposeOpen, setComposeOpen] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

    const userMap = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);

    const { inbox, sent, unreadCount } = useMemo(() => {
        if (!currentUser) return { inbox: [], sent: [], unreadCount: 0 };
        
        const myInbox = messages
            .filter(m => m.recipientIds.includes(currentUser.id))
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            
        const mySent = messages
            .filter(m => m.senderId === currentUser.id)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        const count = myInbox.filter(m => !m.readBy.includes(currentUser.id)).length;

        return { inbox: myInbox, sent: mySent, unreadCount: count };
    }, [messages, currentUser]);

    const messagesToDisplay = activeTab === 'inbox' ? inbox : sent;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Mensajería Interna</h1>
                <button
                    onClick={() => setComposeOpen(true)}
                    className="px-4 py-2 text-white font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700"
                >
                    Redactar Mensaje
                </button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                        <button onClick={() => setActiveTab('inbox')} className={`tab ${activeTab === 'inbox' ? 'tab-active' : 'tab-inactive'}`}>
                            Bandeja de Entrada {unreadCount > 0 && <span className="ml-2 px-2 py-0.5 text-xs font-medium text-white bg-indigo-600 rounded-full">{unreadCount}</span>}
                        </button>
                        <button onClick={() => setActiveTab('sent')} className={`tab ${activeTab === 'sent' ? 'tab-active' : 'tab-inactive'}`}>Enviados</button>
                    </nav>
                </div>
                
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {messagesToDisplay.map(message => {
                        const sender = userMap.get(message.senderId);
                        const isUnread = activeTab === 'inbox' && !message.readBy.includes(currentUser!.id);
                        return (
                             <li key={message.id} onClick={() => setSelectedMessage(message)} className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer ${isUnread ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}>
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <img src={sender?.avatar} alt={sender?.name} className="w-10 h-10 rounded-full"/>
                                        <div>
                                            <p className={`text-sm font-semibold ${isUnread ? 'text-indigo-800 dark:text-indigo-300' : 'text-gray-800 dark:text-gray-200'}`}>
                                                {activeTab === 'inbox' ? sender?.name : `Para: ${message.recipientIds.map(id => userMap.get(id)?.name).join(', ')}`}
                                            </p>
                                            <p className={`text-sm ${isUnread ? 'font-bold' : 'font-medium'} text-gray-900 dark:text-white`}>{message.subject}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate max-w-md">{message.body}</p>
                                        </div>
                                    </div>
                                    <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                                        <p>{new Date(message.timestamp).toLocaleDateString()}</p>
                                        <p>{new Date(message.timestamp).toLocaleTimeString()}</p>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
                {messagesToDisplay.length === 0 && <p className="p-8 text-center text-gray-500">No hay mensajes en esta bandeja.</p>}
            </div>

            <ComposeMessageModal isOpen={isComposeOpen} onClose={() => setComposeOpen(false)} />
            {selectedMessage && <MessageDetailModal message={selectedMessage} onClose={() => setSelectedMessage(null)} />}

            <style>{`.tab{padding:1rem 0;border-bottom:2px solid transparent;font-weight:500;}.tab-active{color:#4F46E5;border-color:#4F46E5;}.tab-inactive{color:#6B7280;}`}</style>
        </div>
    );
};

export default MessagingPage;