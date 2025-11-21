
import React, { useState, FormEvent, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCreator } from '../contexts/CreatorContext';
import { useData } from '../contexts/DataContext';
import { UploadIcon, DownloadIcon } from '../components/icons';

const Login: React.FC = () => {
  // Clear credentials for production deployment
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const { creatorInfo } = useCreator();
  const { importMasterData } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const user = login(email, password);
    if (user) {
      if (user.mustChangePassword) {
        navigate('/force-change-password');
      } else {
        navigate('/select-profile');
      }
    } else {
      setError('Credenciales inválidas o usuario inactivo.');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
          try {
              await importMasterData(event.target?.result as string);
              alert('Configuración importada correctamente. Ahora puedes iniciar sesión con tus credenciales.');
              window.location.reload(); // Reload to refresh context data
          } catch (err) {
              alert('Error al importar archivo: ' + (err instanceof Error ? err.message : String(err)));
          }
      };
      reader.readAsText(file);
  };

  const handleOpenCloudFolder = () => {
      if (creatorInfo.systemUpdateUrl) {
          window.open(creatorInfo.systemUpdateUrl, '_blank');
      } else {
          alert("No hay una carpeta de actualizaciones configurada.");
      }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="h-1.5 bg-indigo-500"></div>
        <div className="p-8 space-y-8">
            <div className="text-center">
                <img src={creatorInfo.logo} alt="Logo" className="mx-auto h-20 w-20 rounded-full object-contain bg-white"/>
                <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                    Iniciar sesión en {creatorInfo.appName}
                </h2>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Gestión integral offline
                </p>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {error && <p className="text-center text-red-500 bg-red-100 dark:bg-red-900/50 p-3 rounded-lg">{error}</p>}
              <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <label htmlFor="email-address" className="sr-only">Email</label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="password-sr" className="sr-only">Contraseña</label>
                  <input
                    id="password-sr"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Iniciar sesión
                </button>
              </div>
            </form>
            
            <div className="border-t dark:border-gray-700 pt-4 space-y-3">
                <p className="text-xs text-center text-gray-500 mb-2">Actualización del Sistema</p>
                
                <div className="grid grid-cols-2 gap-2">
                    {creatorInfo.systemUpdateUrl && (
                        <button 
                            type="button"
                            onClick={handleOpenCloudFolder}
                            className="flex flex-col items-center justify-center p-2 text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                            title="Abre la carpeta de Drive para descargar el archivo más reciente"
                        >
                            <span className="text-xl mb-1">☁️</span>
                            <span>1. Abrir Nube</span>
                        </button>
                    )}
                    
                    <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={`flex flex-col items-center justify-center p-2 text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 rounded hover:bg-indigo-100 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-900/50 ${!creatorInfo.systemUpdateUrl ? 'col-span-2' : ''}`}
                        title="Carga el archivo descargado para actualizar"
                    >
                        <UploadIcon className="w-5 h-5 mb-1" />
                        <span>{creatorInfo.systemUpdateUrl ? '2. Cargar Archivo' : 'Cargar Archivo'}</span>
                    </button>
                </div>

                <input 
                    type="file" 
                    ref={fileInputRef} 
                    accept=".json" 
                    className="hidden" 
                    onChange={handleFileSelect}
                />
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
