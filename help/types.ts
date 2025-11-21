import { Role, User } from '../types';
import { DataContextType } from '../contexts/DataContext';

export interface HelpSection {
  title: string;
  content: string; // HTML
}

export interface HelpModule {
  id: string;
  title: string;
  description: string;
  role: Role | 'ALL';
  generateContent: (context: HelpContext) => HelpSection[];
}

export interface HelpContext {
  appName: string;
  creatorName: string;
  currentUser: User | null;
  activeRole: Role | null;
  data: Partial<DataContextType>; 
}
