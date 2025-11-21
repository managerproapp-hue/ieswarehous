
import React, { useRef, ChangeEvent, useState, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { ROLE_STYLES } from '../constants';
import { EditIcon } from '../components/icons';

const PasswordChangeForm: React.FC = () => {
    const { currentUser, changePassword } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const result = await changePassword({
            currentPassword: currentUser?.mustChangePassword ? undefined : currentPassword,
            newPassword,
            confirmPassword
        });

        if (result.success) {
            setSuccess(result.message);
            setTimeout(() => setSuccess(''), 3000);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
            <div className="h-1.5 bg-indigo-500"></div>
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Cambiar Contraseña</h2>
                {currentUser?.mustChangePassword && (
                    <div className="p-3 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 rounded-md text-sm">
                        Es tu primer inicio de sesión. Por seguridad, debes establecer una nueva contraseña.
                    </div>
                )}
                {error && <div className="p-3 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200 rounded-md text-sm">{error}</div>}
                {success && <div className="p-3 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-200 rounded-md text-sm">{success}</div>}
                
                {!currentUser?.mustChangePassword && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contraseña Actual</label>
                        <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className="input-style"/>
                    </div>
                )}
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nueva Contraseña</label>
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="input-style"/>
                    <p className="text-xs text-gray-500 mt-1">Mínimo 8 caracteres, con mayúscula, minúscula, número y símbolo (@$!%*?&amp;).</p>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirmar Nueva Contraseña</label>
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="input-style"/>
                </div>

                <div className="flex justify-end pt-2">
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Actualizar Contraseña</button>
                </div>
            </form>
            <style>{`.input-style { margin-top: 0.25rem; display: block; width: 100%; border-radius: 0.375rem; padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; } .dark .input-style { background-color: #374151; border-color: #4b5563; }`}</style>
        </div>
    );
};


const MyProfile: React.FC = () => {
  const { currentUser, updateCurrentUser, impersonatingUser } = useAuth();
  const { updateUser } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!currentUser) {
    return <div>Cargando perfil...</div>;
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newAvatar = e.target?.result as string;
        const updatedUser = { ...currentUser, avatar: newAvatar };
        
        // Persist change in the main data store
        updateUser(updatedUser);
        
        // Update the session for immediate UI feedback
        updateCurrentUser(updatedUser);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
        <div className="h-1.5 bg-indigo-500"></div>
        <div className="p-8">
            <div className="flex flex-col items-center text-center">
                <div className="relative group">
                    <img className="w-32 h-32 rounded-full border-4 border-gray-200 dark:border-gray-700" src={currentUser.avatar} alt="User Avatar" />
                    <button 
                      onClick={handleAvatarClick}
                      className="absolute inset-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      aria-label="Change profile picture"
                    >
                        <EditIcon className="w-8 h-8 text-white" />
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange}
                      accept="image/png, image/jpeg, image/gif"
                      className="hidden"
                    />
                </div>
                <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">{currentUser.name}</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">{currentUser.email}</p>
            </div>
          
            <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 text-center mb-4">Roles Asignados</h2>
                <div className="flex flex-wrap justify-center gap-3">
                {currentUser.roles.map(role => {
                    const style = ROLE_STYLES[role];
                    return (
                    <span key={role} className={`px-4 py-2 rounded-full text-white text-sm font-semibold bg-gradient-to-r ${style.gradient}`}>
                        {style.name}
                    </span>
                    );
                })}
                </div>
            </div>
        </div>
      </div>
      {!impersonatingUser && <PasswordChangeForm />}
    </div>
  );
};

export default MyProfile;