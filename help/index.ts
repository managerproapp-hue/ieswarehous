import { HelpModule } from './types';
import { Role } from '../types';

// Import modules
import { gen01General } from './modules/gen-01-general';
import { cre01Dashboard } from './modules/creator/cre-01-dashboard';
import { adm01Personal } from './modules/admin/adm-01-personal';

export const HELP_MODULES: HelpModule[] = [
  // General
  gen01General,
  // Creator
  cre01Dashboard,
  // Admin
  adm01Personal,
];

// Function to filter modules based on the active role
export const getHelpModulesForRole = (role: Role | null): HelpModule[] => {
  if (!role) return [];
  return HELP_MODULES.filter(module => 
    module.role === 'ALL' || module.role === role
  );
};
