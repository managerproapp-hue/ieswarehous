import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCreator } from '../contexts/CreatorContext';
import { useData } from '../contexts/DataContext';
import { getHelpModulesForRole } from '../help';
import { HelpModule, HelpContext, HelpSection } from '../help/types';

interface ModuleWithContent extends HelpModule {
  sections: HelpSection[];
}

export default function SoportePage() {
  const { activeRole, currentUser } = useAuth();
  const { creatorInfo } = useCreator();
  const allDataContext = useData();
  
  const [modules, setModules] = useState<ModuleWithContent[]>([]);

  useEffect(() => {
    if (!activeRole || !currentUser) return;

    // Create the context object to pass to generators
    const context: HelpContext = {
      appName: creatorInfo.appName,
      creatorName: creatorInfo.creatorName,
      currentUser,
      activeRole,
      data: allDataContext
    };

    const filteredModules = getHelpModulesForRole(activeRole);
    
    // Generate content for each module
    const modulesWithContent = filteredModules.map(module => ({
      ...module,
      sections: module.generateContent(context)
    }));
    
    setModules(modulesWithContent);
  }, [activeRole, currentUser, creatorInfo, allDataContext]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">📚 Manual de Usuario – {activeRole}</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Esta documentación se genera en tiempo real para reflejar el estado actual de la aplicación.</p>
      </div>
      
      {modules.map(module => (
        <div key={module.id} className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <div className="h-1.5 bg-indigo-500"></div>
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">{module.id}: {module.title}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{module.description}</p>
            
            <div className="space-y-6">
              {module.sections?.map((section, i) => (
                <div key={i} className="border-t dark:border-gray-700 pt-4">
                  <h3 className="font-bold text-lg mb-2 text-indigo-700 dark:text-indigo-400">{section.title}</h3>
                  <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: section.content }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
       {modules.length === 0 && <p className="text-center text-gray-500">No hay módulos de ayuda disponibles para tu rol.</p>}
    </div>
  );
}