
import React, { useState, FormEvent, ChangeEvent, useRef, useEffect } from 'react';
import { useCreator } from '../../contexts/CreatorContext';
import { useData } from '../../contexts/DataContext';
import { CreatorInfo } from '../../types';
import { WarningIcon, UploadIcon } from '../../components/icons';
import ConfirmationModal from '../../components/ConfirmationModal';
import storage from '../../services/storageService';

const CreatorDashboard: React.FC = () => {
    const { creatorInfo, setCreatorInfo } = useCreator();
    const { downloadBackupData, restoreApplicationData, resetApplicationData } = useData();

    // State for signature form
    const [formData, setFormData] = useState<CreatorInfo>(creatorInfo);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State for backup and restore
    const [lastBackupDate, setLastBackupDate] = useState<string | null>(() => storage.local.get('lastBackupDate', null));
    const [restoreFile, setRestoreFile] = useState<File | null>(null);
    const [isRestoring, setIsRestoring] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [restoreError, setRestoreError] = useState<string | null>(null);

    // State for modals
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);

    const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setFormData({ ...formData, logo: event.target.result as string });
                }
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleFormSubmit = (e: FormEvent) => {
        e.preventDefault();
        setCreatorInfo(formData);
        alert('Configuración guardada!');
    };
    
    const handleDownloadBackup = () => {
        downloadBackupData();
        setLastBackupDate(new Date().toISOString());
    };

    const handleRestoreFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        setRestoreError(null);
        if (e.target.files && e.target.files[0]) {
            if(e.target.files[0].type === 'application/json') {
                setRestoreFile(e.target.files[0]);
            } else {
                setRestoreError("Por favor, selecciona un archivo .json válido.");
                setRestoreFile(null);
            }
        }
    };

    const handleConfirmRestore = () => {
        if (!restoreFile) return;

        setIsRestoring(true);
        setUploadProgress(0);
        setRestoreError(null);

        const reader = new FileReader();
        reader.onload = async (event) => {
            const content = event.target?.result as string;
            
            // Simulate progress
            let progress = 0;
            const interval = setInterval(() => {
                progress += 10;
                setUploadProgress(progress);
                if (progress >= 100) clearInterval(interval);
            }, 150);

            try {
                await restoreApplicationData(content);
                setTimeout(() => {
                    alert('Restauración completada con éxito. La aplicación se recargará.');
                    window.location.reload();
                }, 1600);
            } catch (error) {
                clearInterval(interval);
                setRestoreError(error instanceof Error ? error.message : "Ocurrió un error desconocido.");
                setIsRestoring(false);
            }
        };
        reader.onerror = () => {
            setRestoreError("No se pudo leer el archivo.");
            setIsRestoring(false);
        };
        reader.readAsText(restoreFile);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Panel de Creador</h1>

            {/* Signature Form */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <div className="h-1.5 bg-indigo-500"></div>
                <form onSubmit={handleFormSubmit}>
                    <div className="p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Configura tu Firma</h2>
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Form fields */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre de la Aplicación</label>
                                <input type="text" name="appName" value={formData.appName} onChange={handleFormChange} className="mt-1 block w-full input-style" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre del Creador</label>
                                <input type="text" name="creatorName" value={formData.creatorName} readOnly disabled className="mt-1 block w-full input-style bg-gray-100 cursor-not-allowed" title="Este campo está bloqueado." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email de Contacto</label>
                                <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleFormChange} className="mt-1 block w-full input-style" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Texto de Copyright</label>
                                <input type="text" name="copyrightText" value={formData.copyrightText} onChange={handleFormChange} className="mt-1 block w-full input-style" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Logo</label>
                                <div className="mt-2 flex items-center gap-4">
                                    {formData.logo ? (
                                        <div className="p-2 bg-gray-100 rounded-md text-xs text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap max-w-xs">
                                            URL Fija: {formData.logo}
                                        </div>
                                    ) : <p className="text-sm text-gray-500">Logo predeterminado</p>}
                                    <input type="file" accept="image/*" onChange={handleLogoChange} ref={fileInputRef} className="hidden" disabled />
                                </div>
                                <p className="text-xs text-gray-400 mt-1">La imagen del creador es fija y no se puede cambiar desde aquí.</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Cloud Updates Link Config */}
                    <div className="p-6 border-t dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Enlaces de la Nube (Google Drive)</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">URL para Actualizaciones del Sistema</label>
                                <input 
                                    type="text" 
                                    name="systemUpdateUrl" 
                                    value={formData.systemUpdateUrl || ''} 
                                    onChange={handleFormChange} 
                                    className="mt-1 block w-full input-style" 
                                    placeholder="https://drive.google.com/drive/folders/..." 
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Carpeta donde subes los archivos JSON de actualización global. (Pública)
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">URL para Enviar Pedidos (Profesores)</label>
                                <input 
                                    type="text" 
                                    name="ordersFolderUrl" 
                                    value={formData.ordersFolderUrl || ''} 
                                    onChange={handleFormChange} 
                                    className="mt-1 block w-full input-style" 
                                    placeholder="https://drive.google.com/drive/folders/..." 
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Carpeta donde los profesores arrastrarán sus pedidos JSON descargados. (Pública o con permisos de escritura)
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 text-right">
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Guardar Cambios</button>
                    </div>
                </form>
            </div>

            {/* Backup & Restore */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <div className="h-1.5 bg-indigo-500"></div>
                <div className="p-6 space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Copia de Seguridad y Restauración</h2>
                    {/* Backup */}
                    <div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Descargar Copia de Seguridad</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Guarda todos los datos de la aplicación en un archivo .json.</p>
                        {lastBackupDate && <p className="text-xs text-gray-500 mt-1 italic">Última copia: {new Date(lastBackupDate).toLocaleString()}</p>}
                        <button onClick={handleDownloadBackup} className="mt-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">Descargar Ahora</button>
                    </div>
                    <hr className="dark:border-gray-700" />
                    {/* Restore */}
                    <div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Restaurar desde Copia de Seguridad</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Sube un archivo .json para restaurar el estado de la aplicación. <strong className="text-yellow-600 dark:text-yellow-400">Los datos actuales se sobreescribirán.</strong></p>
                        <div className="mt-3 flex items-center gap-4">
                            <input type="file" accept=".json" onChange={handleRestoreFileSelect} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/50 dark:file:text-indigo-300 dark:hover:file:bg-indigo-900" />
                            <button onClick={() => setIsRestoreModalOpen(true)} disabled={!restoreFile || isRestoring} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed">Restaurar</button>
                        </div>
                         {isRestoring && (
                            <div className="mt-4 w-full bg-gray-200 rounded-full dark:bg-gray-700">
                                <div className="bg-blue-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full" style={{ width: `${uploadProgress}%`, transition: 'width 0.2s' }}> {uploadProgress}% </div>
                            </div>
                        )}
                        {restoreError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{restoreError}</p>}
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="border-2 border-red-500/50 rounded-lg bg-red-50 dark:bg-red-900/20 overflow-hidden">
                <div className="h-1.5 bg-indigo-500"></div>
                <div className="p-6">
                    <h2 className="text-xl font-bold text-red-700 dark:text-red-400">Zona Peligrosa</h2>
                    <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-gray-800 dark:text-gray-200">Restablecer la Aplicación</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Esta acción es irreversible. Se eliminarán todos los datos. Asegúrate de tener una copia de seguridad reciente.</p>
                        </div>
                        <button onClick={() => setIsResetModalOpen(true)} className="mt-4 md:mt-0 md:ml-4 flex-shrink-0 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">Restablecer Ahora</button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <ConfirmationModal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} onConfirm={resetApplicationData} title="Confirmar Restablecimiento Total" confirmationText="reiniciar ahora">
                <p>Estás a punto de <strong className="text-red-600 dark:text-red-400">eliminar permanentemente</strong> todos los datos de la aplicación.</p>
            </ConfirmationModal>
            
            <ConfirmationModal isOpen={isRestoreModalOpen} onClose={() => setIsRestoreModalOpen(false)} onConfirm={handleConfirmRestore} title="Confirmar Restauración" confirmationText="restaurar datos">
                <p>Esta acción <strong className="text-red-600 dark:text-red-400">sobreescribirá todos los datos actuales</strong> con el contenido del archivo de respaldo.</p>
                <p>Asegúrate de que el archivo seleccionado es correcto. Esta operación no se puede deshacer.</p>
            </ConfirmationModal>
            
            <style>{`.input-style { background-color: white; border: 1px solid #D1D5DB; border-radius: 0.375rem; padding: 0.5rem 0.75rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); } .dark .input-style { background-color: #374151; border-color: #4B5563; color: #F9FAFB; } .input-style:focus { outline: none; border-color: #6366F1; box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5); }`}</style>
        </div>
    );
};

export default CreatorDashboard;
