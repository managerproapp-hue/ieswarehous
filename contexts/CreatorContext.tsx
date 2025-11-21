

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