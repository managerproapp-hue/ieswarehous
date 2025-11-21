
import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { SunIcon, MoonIcon, LogoutIcon, LifeBuoyIcon, BellIcon } from './icons';
import { ROLE_STYLES } from '../constants';
import { Role } from '../types';
import { useData } from '../contexts/DataContext';

const timeSince = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return `hace ${Math.floor(interval)} años`;
    interval = seconds / 2592000;
    if (interval > 1) return `hace ${Math.floor(interval)} meses`;
    interval = seconds / 86400;
    if (interval > 1) return `hace ${Math.floor(interval)} días`;
    interval = seconds / 3600;
    if (interval > 1) return `hace ${Math.floor(interval)} horas`;
    interval = seconds / 60;
    if (interval > 1) return `hace ${Math.floor(interval)} min`;
    return `hace ${Math.floor(seconds)} seg`;
};


const Header = () => {
    const { currentUser, activeRole, setActiveRole, logout, impersonatingUser, stopImpersonation } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const { companyInfo, notifications, markNotificationAsRead, markAllNotificationsAsRead } = useData();
    const navigate = useNavigate();

    if (!currentUser || !activeRole) return null;
    
    const myNotifications = useMemo(() => {
        return notifications.filter(n => n.userId === currentUser.id);
    }, [notifications, currentUser]);

    const unreadCount = useMemo(() => {
        return myNotifications.filter(n => !n.isRead).length;
    }, [myNotifications]);

    const handleRoleChange = (role: Role) => {
        setActiveRole(role);
    };

    const handleNotificationClick = (notification: typeof myNotifications[0]) => {
        if (!notification.isRead) {
            markNotificationAsRead(notification.id);
        }
        if (notification.link) {
            navigate(notification.link);
        }
        setNotificationsOpen(false);
    };
    
    const handleMarkAllRead = () => {
        markAllNotificationsAsRead(currentUser.id);
    };

    return (
        <header className="fixed top-0 left-64 right-0 bg-white dark:bg-gray-900 shadow-md dark:shadow-gray-800 z-10">
            {impersonatingUser && (
                <div className="bg-yellow-400 text-black text-center py-1 text-sm font-semibold">
                    <span>Suplantando a <strong>{impersonatingUser.name}</strong></span>
                    <button onClick={stopImpersonation} className="ml-4 px-2 py-0.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-xs">
                        Dejar de suplantar
                    </button>
                </div>
            )}
            
            <div className="flex items-center justify-between h-32 px-8">
                {/* Left side: Institutional Branding */}
                <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-4xl font-bold text-gray-500 overflow-hidden shadow-inner">
                        {companyInfo.logoUI ? (
                            <img src={companyInfo.logoUI} alt="Company Logo" className="w-full h-full object-cover" />
                        ) : (
                            <span>{companyInfo.name.charAt(0)}</span>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">{companyInfo.name}</h2>
                        <span className="mt-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg text-sm font-semibold self-start">
                            Curso 2023/24
                        </span>
                    </div>
                </div>

                {/* Right side: User Controls */}
                <div className="flex items-center space-x-6">
                    <Link to="/soporte" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                        <LifeBuoyIcon className="w-6 h-6" />
                        <span className="text-sm font-medium hidden sm:inline">Ayuda</span>
                    </Link>

                    <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400">
                        {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
                    </button>
                    
                     <div className="relative">
                        <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400">
                            <BellIcon className="w-6 h-6" />
                            {unreadCount > 0 && <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900"></span>}
                        </button>
                        {notificationsOpen && (
                            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 animation-fade-in">
                                <div className="p-3 flex justify-between items-center border-b dark:border-gray-700">
                                    <h3 className="font-semibold text-sm">Notificaciones</h3>
                                    <button onClick={handleMarkAllRead} className="text-xs text-indigo-600 hover:underline disabled:opacity-50" disabled={unreadCount === 0}>Marcar todas como leídas</button>
                                </div>
                                <ul className="max-h-96 overflow-y-auto">
                                    {myNotifications.length > 0 ? myNotifications.map(n => (
                                        <li key={n.id} onClick={() => handleNotificationClick(n)} className={`p-3 border-b dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${!n.isRead ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''}`}>
                                            <p className={`font-semibold text-sm ${!n.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>{n.title}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{n.message}</p>
                                            <p className="text-xs text-right text-gray-400 mt-1">{timeSince(n.timestamp)}</p>
                                        </li>
                                    )) : (
                                        <li className="p-4 text-center text-sm text-gray-500">No hay notificaciones.</li>
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>


                    <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-full">
                        {currentUser.roles.map(role => (
                            <button
                                key={role}
                                onClick={() => handleRoleChange(role)}
                                className={`px-3 py-1 text-sm font-semibold rounded-full transition-all duration-300 ${activeRole === role ? `text-white bg-gradient-to-r ${ROLE_STYLES[role].gradient} shadow-md` : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                            >
                                {ROLE_STYLES[role].name}
                            </button>
                        ))}
                    </div>

                    <div className="relative">
                         <img 
                            src={currentUser.avatar} 
                            alt="User Avatar" 
                            className="w-12 h-12 rounded-full cursor-pointer ring-2 ring-offset-2 dark:ring-offset-gray-900 ring-gray-300 dark:ring-gray-600"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                        />
                        {dropdownOpen && (
                            <div 
                                onMouseLeave={() => setDropdownOpen(false)}
                                className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 animation-fade-in"
                            >
                                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{currentUser.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser.email}</p>
                                </div>
                                <button
                                    onClick={logout}
                                    className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    <LogoutIcon className="w-4 h-4 mr-2" />
                                    Cerrar sesión
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
