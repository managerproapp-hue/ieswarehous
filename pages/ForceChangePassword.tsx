import React, { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCreator } from '../contexts/CreatorContext';

const ForceChangePassword = () => {
    const { currentUser, changePassword } = useAuth();
    const { creatorInfo } = useCreator();
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!currentUser) {
            navigate('/login', { replace: true });
        } else if (!currentUser.mustChangePassword) {
            // User doesn't need to be here, send them to their destination
            navigate('/select-profile', { replace: true });
        }
    }, [currentUser, navigate]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        const result = await changePassword({ newPassword, confirmPassword });

        if (result.success) {
            alert('Contraseña actualizada con éxito. Serás redirigido al panel.');
            navigate('/select-profile');
        } else {
            setError(result.message);
        }
    };
    
    if (!currentUser || !currentUser.mustChangePassword) {
        // Render nothing or a loading spinner while redirecting
        return null;
    }

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
                <div className="h-1.5 bg-indigo-500"></div>
                <div className="p-8 space-y-8">
                    <div className="text-center">
                        <img src={creatorInfo.logo} alt="Logo" className="mx-auto h-20 w-20 rounded-full"/>
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                            Cambio de Contraseña Obligatorio
                        </h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Por seguridad, debes establecer una nueva contraseña para tu cuenta.
                        </p>
                    </div>
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {error && <p className="text-center text-red-500 bg-red-100 dark:bg-red-900/50 p-3 rounded-lg">{error}</p>}
                        
                        <div>
                            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nueva Contraseña</label>
                            <input
                                id="new-password"
                                name="newPassword"
                                type="password"
                                required
                                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Nueva Contraseña"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <p className="text-xs text-gray-500 mt-1">Mínimo 8 caracteres, con mayúscula, minúscula, número y símbolo (@$!%*?&amp;).</p>
                        </div>
                        <div>
                            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmar Nueva Contraseña</label>
                            <input
                                id="confirm-password"
                                name="confirmPassword"
                                type="password"
                                required
                                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Confirmar Contraseña"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Guardar y Continuar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForceChangePassword;
