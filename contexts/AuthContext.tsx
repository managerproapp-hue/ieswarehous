
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, Role, SimulatedRole } from '../types';
import storage from '../services/storageService';
import { useData } from './DataContext';

interface AuthContextType {
  currentUser: User | null;
  realUser: User | null;
  activeRole: Role | null;
  isAuthenticated: boolean;
  impersonatingUser: User | null;
  login: (email: string, password: string) => User | null;
  logout: () => void;
  setActiveRole: (role: Role) => void;
  startImpersonation: (user: User) => void;
  stopImpersonation: () => void;
  updateCurrentUser: (user: User) => void;
  changePassword: (passwordData: { currentPassword?: string; newPassword: string; confirmPassword: string; }) => Promise<{ success: boolean; message: string; }>;
  setSimulatedRole: (role: SimulatedRole | null) => void;
  simulatedRole: SimulatedRole | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { getUserById, updateUser } = useData();
  const [currentUser, setCurrentUser] = useState<User | null>(() => storage.session.get('currentUser', null));
  const [activeRole, setActiveRoleState] = useState<Role | null>(() => storage.session.get('activeRole', null));
  const [impersonatingUser, setImpersonatingUser] = useState<User | null>(() => storage.session.get('impersonatingUser', null));
  const [simulatedRole, setSimulatedRoleState] = useState<SimulatedRole | null>(null);
  
  useEffect(() => {
    const originalAdmin = storage.session.get<User | null>('originalAdmin', null);
    if(impersonatingUser && originalAdmin) {
      setCurrentUser(originalAdmin);
    }
  }, [impersonatingUser]);

  const login = (email: string, password: string): User | null => {
    const usersWithAuth = storage.local.get<User[]>('users_auth', []);
    const user = usersWithAuth.find(u => u.email === email && u.password === password);
    
    if (user) {
      // Deny login if user is inactive
      if (user.activityStatus === 'inactive') {
        console.warn(`Login attempt for inactive user: ${email}`);
        return null;
      }
      const { password, ...userToStore } = user;
      setCurrentUser(userToStore);
      storage.session.set('currentUser', userToStore);
      return user;
    }
    return null;
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveRoleState(null);
    setImpersonatingUser(null);
    setSimulatedRoleState(null);
    sessionStorage.clear();
  };

  const setActiveRole = (role: Role) => {
    if (currentUser?.roles.includes(role)) {
      setActiveRoleState(role);
      storage.session.set('activeRole', role);
    }
  };

  const startImpersonation = (userToImpersonate: User) => {
    if (currentUser && (currentUser.roles.includes(Role.ADMIN) || currentUser.roles.includes(Role.CREATOR))) {
      storage.session.set('originalAdmin', currentUser);
      setImpersonatingUser(userToImpersonate);
      storage.session.set('impersonatingUser', userToImpersonate);
      
      setCurrentUser(userToImpersonate);
      storage.session.set('currentUser', userToImpersonate);

      const firstRole = userToImpersonate.roles[0];
      setActiveRole(firstRole);
    }
  };

  const stopImpersonation = () => {
    const originalAdmin = storage.session.get<User | null>('originalAdmin', null);
    if (originalAdmin) {
      setCurrentUser(originalAdmin);
      storage.session.set('currentUser', originalAdmin);
      setActiveRole(Role.ADMIN);
      storage.session.set('activeRole', Role.ADMIN);
      setImpersonatingUser(null);
      storage.session.remove('impersonatingUser');
      storage.session.remove('originalAdmin');
    }
  };
  
  const updateCurrentUser = (user: User) => {
    setCurrentUser(user);
    storage.session.set('currentUser', user);

    if (impersonatingUser && impersonatingUser.id === user.id) {
        setImpersonatingUser(user);
        storage.session.set('impersonatingUser', user);
    }
  };

  const changePassword = async (passwordData: { currentPassword?: string; newPassword: string; confirmPassword: string; }): Promise<{ success: boolean; message: string; }> => {
    const userForPasswordChange = impersonatingUser ? null : currentUser;

    if (!userForPasswordChange) {
        return { success: false, message: "No hay un usuario válido para cambiar la contraseña." };
    }

    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (newPassword !== confirmPassword) {
        return { success: false, message: "Las nuevas contraseñas no coinciden." };
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
        return { success: false, message: "La contraseña no es segura. Debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo (@$!%*?&)." };
    }

    const usersWithAuth = storage.local.get<User[]>('users_auth', []);
    const userAuthIndex = usersWithAuth.findIndex(u => u.id === userForPasswordChange.id);

    if (userAuthIndex === -1) {
        return { success: false, message: "No se encontró el usuario para actualizar." };
    }
    
    const userAuthData = usersWithAuth[userAuthIndex];

    if (userAuthData.password === newPassword) {
        return { success: false, message: "La nueva contraseña no puede ser igual a la actual." };
    }

    if (!userAuthData.mustChangePassword) {
        if (!currentPassword || userAuthData.password !== currentPassword) {
            return { success: false, message: "La contraseña actual es incorrecta." };
        }
    }

    const updatedUserAuthData = { ...userAuthData, password: newPassword, mustChangePassword: false };
    usersWithAuth[userAuthIndex] = updatedUserAuthData;
    storage.local.set('users_auth', usersWithAuth);
    
    const updatedUser: User = { ...userForPasswordChange, mustChangePassword: false };
    updateUser(updatedUser);
    updateCurrentUser(updatedUser);

    return { success: true, message: "Contraseña actualizada correctamente." };
  };


  return (
    <AuthContext.Provider value={{ 
      currentUser: impersonatingUser ? getUserById(impersonatingUser.id) : currentUser,
      realUser: currentUser,
      activeRole, 
      isAuthenticated: !!currentUser,
      impersonatingUser: impersonatingUser ? getUserById(impersonatingUser.id) : null,
      login, 
      logout, 
      setActiveRole,
      startImpersonation,
      stopImpersonation,
      updateCurrentUser,
      changePassword,
      setSimulatedRole: setSimulatedRoleState,
      simulatedRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
