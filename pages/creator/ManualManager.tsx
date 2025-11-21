
// src/pages/creator/ManualManager.tsx
import React from 'react';
import { MANUALS_CONFIG, ManualConfig } from './manualsConfig';
import ManualUploadCard from './components/ManualUploadCard';

export default function ManualManager() {
  
  // Agrupar manuales por sección
  const groupedManuals = MANUALS_CONFIG.reduce((acc, manual) => {
    if (!acc[manual.section]) {
      acc[manual.section] = [];
    }
    acc[manual.section].push(manual);
    return acc;
  }, {} as Record<string, ManualConfig[]>);

  const sectionOrder: ManualConfig['section'][] = ['General', 'Creador', 'Administrador', 'Almacén', 'Profesor'];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">📚 Gestión de Manuales de Usuario</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Sube archivos de texto (.txt) para cada manual. La aplicación los convertirá automáticamente a formato legible para los usuarios.
        </p>
      </div>

      {sectionOrder.map(section => {
        const manuals = groupedManuals[section];
        if (!manuals) return null;

        return (
            <div key={section} className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
              <div className="h-1.5 bg-indigo-500"></div>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 border-b pb-2 dark:border-gray-700">{section}</h2>
                <div className="space-y-4">
                  {manuals.map(manual => (
                    <ManualUploadCard
                      key={manual.id}
                      manualId={manual.id}
                      title={manual.title}
                      description={manual.description}
                    />
                  ))}
                </div>
              </div>
            </div>
        );
      })}
    </div>
  );
}
