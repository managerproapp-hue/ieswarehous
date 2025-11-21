// src/pages/creator/components/ManualUploadCard.tsx
import React, { useState, useEffect } from 'react';
import { txtToHtml } from './utils/txtToHtml';

interface Props {
  manualId: string;
  title: string;
  description: string;
}

// Fix: Changed component to React.FC to correctly handle the 'key' prop passed in ManualManager.tsx.
const ManualUploadCard: React.FC<Props> = ({ manualId, title, description }) => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');

  // Cargar contenido guardado al montar
  useEffect(() => {
    const saved = localStorage.getItem(`manual_${manualId}`);
    if (saved) {
      setHtmlContent(saved);
      setFileName('(Guardado)');
    }
  }, [manualId]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const html = txtToHtml(text);
      setHtmlContent(html);
      setFileName(file.name);
      localStorage.setItem(`manual_${manualId}`, html);
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const template = `# ${title}

## 📌 Propósito
[Describe el propósito del manual]

## 👥 Público Objetivo
- ${description}

## ⚙️ Contenido
### [Sección 1]
1. Paso 1
2. Paso 2

💡 Consejo: [Añade consejos útiles]
`;
    const blob = new Blob([template], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plantilla-${manualId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-4">
      <h3 className="font-bold text-lg mb-1 text-gray-800 dark:text-white">{manualId}: {title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{description}</p>
      
      <div className="flex gap-2 mb-3">
        <label className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer hover:bg-indigo-700">
          Subir .txt
          <input
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
        <button
          type="button"
          onClick={downloadTemplate}
          className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          Descargar plantilla
        </button>
      </div>

      {fileName && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Archivo: {fileName}</p>
      )}

      {htmlContent && (
        <details className="mt-3">
            <summary className="text-sm font-medium text-indigo-600 cursor-pointer">Ver previsualización</summary>
            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-900/50 rounded max-h-40 overflow-y-auto prose prose-sm dark:prose-invert">
                <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
            </div>
        </details>
      )}
    </div>
  );
}

export default ManualUploadCard;
