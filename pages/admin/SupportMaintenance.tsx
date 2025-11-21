import React, { useState, ChangeEvent } from 'react';
import { useCreator } from '../../contexts/CreatorContext';
import { useData } from '../../contexts/DataContext';
import { DownloadIcon, UploadIcon } from '../../components/icons';
import ConfirmationModal from '../../components/ConfirmationModal';

const SupportMaintenance: React.FC = () => {
    const { creatorInfo } = useCreator();
    const { backupHistory, downloadBackupData, restoreApplicationData, resetApplicationData } = useData();

    const [restoreFile, setRestoreFile] = useState<File | null>(null);
    const [isRestoring, setIsRestoring] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [restoreError, setRestoreError] = useState<string | null>(null);
    const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
    
    const handleRestoreFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        setRestoreError(null);
        if (e.target.files && e.target.files[0]) {
            if (e.target.files[0].type === 'application/json') {
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
        setIsRestoreModalOpen(false);

        const reader = new FileReader();
        reader.onload = async (event) => {
            const content = event.target?.result as string;
            
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

    const formatBytes = (bytes: number, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Soporte y Mantenimiento</h1>
            
            <div className="card">
                <div className="h-1.5 bg-indigo-500"></div>
                <div className="p-6">
                    <h2 className="card-title">Copia de Seguridad y Restauración</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold">Exportar / Descargar Copia</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Guarda todos los datos de la aplicación en un archivo .json.</p>
                            <button onClick={downloadBackupData} className="btn-primary mt-3 flex items-center gap-2">
                                <DownloadIcon className="w-5 h-5"/>
                                Descargar copia de seguridad
                            </button>
                        </div>
                        <div>
                            <h3 className="font-semibold">Importar / Restaurar desde Copia</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sube un archivo .json para restaurar el estado de la aplicación.</p>
                            <div className="mt-3">
                                <input type="file" accept=".json" onChange={handleRestoreFileSelect} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/50 dark:file:text-indigo-300 dark:hover:file:bg-indigo-900" />
                            </div>
                            {restoreFile && (
                                <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                    <p className="text-sm font-medium">{restoreFile.name}</p>
                                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Advertencia: Esta acción reemplazará todos los datos actuales.</p>
                                    <button onClick={() => setIsRestoreModalOpen(true)} disabled={isRestoring} className="btn-secondary w-full mt-3">Implementar</button>
                                </div>
                            )}
                            {isRestoring && (
                                <div className="mt-4 w-full bg-gray-200 rounded-full dark:bg-gray-700">
                                    <div className="bg-blue-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full" style={{ width: `${uploadProgress}%`, transition: 'width 0.2s' }}> {uploadProgress}% </div>
                                </div>
                            )}
                            {restoreError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{restoreError}</p>}
                        </div>
                    </div>

                    <div className="mt-6 border-t dark:border-gray-700 pt-4">
                        <h3 className="font-semibold">Historial de Copias de Seguridad (últimas 10)</h3>
                        <div className="overflow-x-auto mt-2">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-100 dark:bg-gray-700"><tr><th className="p-2 text-left">Fecha y Hora</th><th className="p-2 text-left">Nombre de Archivo</th><th className="p-2 text-left">Tamaño</th></tr></thead>
                                <tbody>
                                    {backupHistory.map(record => (
                                        <tr key={record.date} className="border-b dark:border-gray-600">
                                            <td className="p-2">{new Date(record.date).toLocaleString()}</td>
                                            <td className="p-2">{record.filename}</td>
                                            <td className="p-2">{formatBytes(record.size)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="card">
                    <div className="h-1.5 bg-indigo-500"></div>
                    <div className="p-6">
                        <h2 className="card-title">Datos de la Aplicación y Creador</h2>
                        <div className="flex items-center gap-4">
                            <img src={creatorInfo.logo} alt="Logo" className="w-16 h-16 rounded-full"/>
                            <div>
                                <p><strong>Nombre Creador:</strong> {creatorInfo.creatorName}</p>
                                <p><strong>Email Soporte:</strong> {creatorInfo.contactEmail}</p>
                                <p className="text-sm text-gray-500 mt-1">{creatorInfo.copyrightText}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="h-1.5 bg-indigo-500"></div>
                    <div className="p-6">
                        <h2 className="card-title">Propiedad Intelectual y Licencia</h2>
                        <div className="text-sm space-y-2">
                            <p><strong>App:</strong> {creatorInfo.appName}</p>
                            <p><strong>Titular:</strong> {creatorInfo.creatorName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded">Esta aplicación es propiedad intelectual de {creatorInfo.creatorName}. Queda prohibida su reproducción, distribución o modificación sin autorización expresa del titular.</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <ConfirmationModal isOpen={isRestoreModalOpen} onClose={() => setIsRestoreModalOpen(false)} onConfirm={handleConfirmRestore} title="Confirmar Restauración" confirmationText="restaurar datos">
                <p>Esta acción <strong className="text-red-600 dark:text-red-400">sobreescribirá todos los datos actuales</strong> con el contenido del archivo de respaldo.</p>
                <p>Asegúrate de que el archivo seleccionado es correcto. Esta operación no se puede deshacer.</p>
            </ConfirmationModal>
            
            <style>{`
                .card { background-color: white; border-radius: 0.75rem; box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1); overflow: hidden; }
                .dark .card { background-color: #1F2937; }
                .card-title { font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem; }
                .btn-primary { padding: 0.5rem 1rem; font-weight: 500; color: white; background-color: #4338CA; border-radius: 0.5rem; }
                .btn-secondary { padding: 0.5rem 1rem; font-weight: 500; color: #1F2937; background-color: #E5E7EB; border-radius: 0.5rem; }
                .dark .btn-secondary { background-color: #4B5563; color: #F9FAFB; }
            `}</style>
        </div>
    );
};

export default SupportMaintenance;