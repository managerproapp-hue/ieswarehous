
import { Role, NavLink, CreatorInfo, User } from './types';
import { DashboardIcon, UsersIcon, SettingsIcon, ProfileIcon, BookOpenIcon, TruckIcon, CalendarIcon, ClipboardIcon, PackageIcon, AppleIcon, BriefcaseIcon, ChartBarIcon, LifeBuoyIcon, MailIcon, ClipboardCheckIcon, BuildingIcon, PowerIcon, ReplenishIcon, StoreIcon, HistoryIcon } from './components/icons';

export const APP_NAME = "Manager Pro EDU-IES";

export const ROLE_STYLES: Record<Role, { gradient: string; name: string }> = {
  [Role.ADMIN]: { gradient: 'from-indigo-500 to-cyan-500', name: 'Administrador' },
  [Role.CREATOR]: { gradient: 'from-orange-500 to-yellow-500', name: 'Creador' },
  [Role.MANAGER]: { gradient: 'from-emerald-500 to-teal-500', name: 'Almacén' },
  [Role.TEACHER]: { gradient: 'from-sky-500 to-cyan-400', name: 'Profesor' },
  [Role.STUDENT]: { gradient: 'from-pink-500 to-rose-500', name: 'Estudiante' },
};

export const NAVIGATION_LINKS: NavLink[] = [
  // Admin
  { path: '/admin/dashboard', label: 'Panel de control', icon: DashboardIcon, roles: [Role.ADMIN] },
  { path: '/admin/events', label: 'Eventos', icon: CalendarIcon, roles: [Role.ADMIN] },
  { path: '/admin/service-planning', label: 'Planificación', icon: BriefcaseIcon, roles: [Role.ADMIN] },
  { path: '/admin/personnel', label: 'Personal', icon: UsersIcon, roles: [Role.ADMIN] },
  { path: '/admin/suppliers', label: 'Proveedores', icon: TruckIcon, roles: [Role.ADMIN] },
  { path: '/admin/products', label: 'Catálogo', icon: AppleIcon, roles: [Role.ADMIN] },
  { path: '/admin/academic-management', label: 'Asignaciones', icon: BookOpenIcon, roles: [Role.ADMIN] },
  { path: '/admin/expense-management', label: 'Estadísticas', icon: ChartBarIcon, roles: [Role.ADMIN] },
  { path: '/admin/company', label: 'Datos Empresa', icon: BuildingIcon, roles: [Role.ADMIN] },
  { path: '/admin/support', label: 'Soporte y Mantenimiento', icon: PowerIcon, roles: [Role.ADMIN] },
  
  // Creator
  { path: '/creator/dashboard', label: 'Panel de Creador', icon: SettingsIcon, roles: [Role.CREATOR] },
  { path: '/creator/users', label: 'Gestión de Usuarios', icon: UsersIcon, roles: [Role.CREATOR] },
  
  // Manager (Almacén)
  { path: '/manager/dashboard', label: 'Panel Principal', icon: DashboardIcon, roles: [Role.MANAGER] },
  { path: '/manager/process-orders', label: 'Procesar Pedidos', icon: PackageIcon, roles: [Role.MANAGER] },
  { path: '/manager/mini-economato', label: 'Mini-Economato', icon: StoreIcon, roles: [Role.MANAGER] },
  { path: '/manager/replenish-stock', label: 'Reposición Stock', icon: ReplenishIcon, roles: [Role.MANAGER] },
  { path: '/manager/reception', label: 'Recepción', icon: ClipboardCheckIcon, roles: [Role.MANAGER] },
  { path: '/manager/order-history', label: 'Historial de Pedidos', icon: HistoryIcon, roles: [Role.MANAGER] },
  
  // Teacher
  { path: '/teacher/dashboard', label: 'Panel Principal', icon: DashboardIcon, roles: [Role.TEACHER] },
  { path: '/teacher/order-portal', label: 'Portal de Pedidos', icon: ClipboardIcon, roles: [Role.TEACHER] },
  { path: '/teacher/order-history', label: 'Mi Historial de Pedidos', icon: HistoryIcon, roles: [Role.TEACHER] },
  { path: '/teacher/service-planning', label: 'Planificación', icon: BriefcaseIcon, roles: [Role.TEACHER] },
  
  // Common
  { path: '/messaging', label: 'Mensajería', icon: MailIcon, roles: [Role.ADMIN, Role.CREATOR, Role.MANAGER, Role.TEACHER] },
  { path: '/profile', label: 'Mi Perfil', icon: ProfileIcon, roles: [Role.ADMIN, Role.CREATOR, Role.MANAGER, Role.TEACHER] },
];

export const DEFAULT_CREATOR_INFO: CreatorInfo = {
  appName: 'Manager Pro EDU-IES',
  creatorName: 'Juan Codina',
  contactEmail: 'managerproapp@gmail.com',
  copyrightText: `© ${new Date().getFullYear()} Todos los derechos reservados`,
  logo: 'https://drive.google.com/uc?export=view&id=1DkCOqFGdw3PZbyNUnTQNgeaAGjBfv1_e',
  systemUpdateUrl: 'https://drive.google.com/drive/folders/1SnoOU-e5VdzpEu1Q8Gfa07oioVReX55h?usp=sharing',
  ordersFolderUrl: 'https://drive.google.com/drive/folders/18qj5vYAQUH6mDg9glLAT23yq4azKigU-?usp=sharing',
};

// Initial data for demo purposes
export const DEMO_USERS: User[] = [
    {
        id: 'user-alberto',
        name: 'Alberto',
        email: 'alberto.hernando@murciaeduca.es',
        password: 'IES1234',
        avatar: 'https://ui-avatars.com/api/?name=Alberto&background=random&size=200',
        roles: [Role.TEACHER, Role.MANAGER, Role.ADMIN],
        activityStatus: 'active',
        contractType: 'Titular',
        mustChangePassword: true,
    },
    {
        id: 'user-cristina',
        name: 'Cristina',
        email: 'cristina.gomez@murciaeduca.es',
        password: 'IES1234',
        avatar: 'https://ui-avatars.com/api/?name=Cristina&background=random&size=200',
        roles: [Role.TEACHER, Role.MANAGER],
        activityStatus: 'active',
        contractType: 'Titular',
        mustChangePassword: true,
    },
    {
        id: 'user-toni',
        name: 'Toñi',
        email: 'mariaantonia.lopez2@murciaeduca.es',
        password: 'IES1234',
        avatar: 'https://ui-avatars.com/api/?name=Toñi&background=random&size=200',
        roles: [Role.TEACHER, Role.MANAGER, Role.ADMIN],
        activityStatus: 'active',
        contractType: 'Titular',
        mustChangePassword: true,
    },
    {
        id: 'user-juan',
        name: 'Juan Codina Barranco',
        email: 'juan.codina@murciaeduca.es',
        password: 'IES1234',
        avatar: 'https://ui-avatars.com/api/?name=Juan+Codina&background=random&size=200',
        roles: [Role.TEACHER, Role.MANAGER, Role.ADMIN, Role.CREATOR],
        activityStatus: 'active',
        contractType: 'Titular',
        mustChangePassword: true,
    }
];

export const ROLE_DASHBOARD_PATHS: Record<Role, string> = {
    [Role.ADMIN]: '/admin/dashboard',
    [Role.CREATOR]: '/creator/dashboard',
    [Role.MANAGER]: '/manager/dashboard',
    [Role.TEACHER]: '/teacher/dashboard',
    [Role.STUDENT]: '/student/dashboard',
};

export const WAREHOUSE_INTERNAL_USER_ID = '0';
