
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { CreatorInfo } from '../types';
import storage from '../services/storageService';
import { DEFAULT_CREATOR_INFO } from '../constants';

interface CreatorContextType {
  creatorInfo: CreatorInfo;
  setCreatorInfo: (info: CreatorInfo) => void;
}

const CreatorContext = createContext<CreatorContextType | undefined>(undefined);

// Fix: Explicitly type CreatorProvider as a React.FC with a required children prop.
export const CreatorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [creatorInfo, setCreatorInfoState] = useState<CreatorInfo>(() =>
    storage.local.get<CreatorInfo>('creatorInfo', DEFAULT_CREATOR_INFO)
  );
  
  const setCreatorInfo = (info: CreatorInfo) => {
      setCreatorInfoState(info);
      storage.local.set('creatorInfo', info);
  };

  useEffect(() => {
    const storedInfo = storage.local.get<CreatorInfo | null>('creatorInfo', null);
    if (!storedInfo) {
      storage.local.set('creatorInfo', DEFAULT_CREATOR_INFO);
    } else {
        // Migration logic: Check if we have the old Google Drive export link format or the old specific ID
        // and upgrade it to the lh3.googleusercontent.com format which is more stable for images.
        const isOldFormat = storedInfo.logo.includes('drive.google.com/uc?export=view');
        const isSpecificOldId = storedInfo.logo.includes('1DkCOqFGdw3PZbyNUnTQNgeaAGjBfv1_e');
        
        if (isOldFormat || isSpecificOldId) {
            console.log("Migrating creator logo to new format...");
            const updatedInfo = { ...storedInfo, logo: DEFAULT_CREATOR_INFO.logo };
            setCreatorInfoState(updatedInfo);
            storage.local.set('creatorInfo', updatedInfo);
        }
    }
  }, []);

  return (
    <CreatorContext.Provider value={{ creatorInfo, setCreatorInfo }}>
      {children}
    </CreatorContext.Provider>
  );
};

export const useCreator = (): CreatorContextType => {
  const context = useContext(CreatorContext);
  if (!context) {
    throw new Error('useCreator must be used within a CreatorProvider');
  }
  return context;
};