
// src/pages/creator/manualsConfig.ts

export interface ManualConfig {
  id: string;
  title: string;
  description: string;
  section: 'General' | 'Creador' | 'Administrador' | 'Almacén' | 'Profesor';
}

export const MANUALS_CONFIG: ManualConfig[] = [
  // PARTE 1: General
  {
    id: 'GEN-01',
    title: 'Primeros Pasos y Funciones Comunes',
    description: 'Acceso, interfaz, perfil y mensajería.',
    section: 'General'
  },

  // PARTE 2: Creador
  {
    id: 'CRE-01',
    title: 'Panel de Creador y Mantenimiento Global',
    description: 'Firma de la app, copias de seguridad y reseteo.',
    section: 'Creador'
  },
  {
    id: 'CRE-02',
    title: 'Gestión Global de Usuarios',
    description: 'Visualización y suplantación de identidad.',
    section: 'Creador'
  },

  // PARTE 3: Administrador
  {
    id: 'ADM-01',
    title: 'Gestión de Personal y Estructura Académica',
    description: 'Alta/baja de personal, ciclos y asignaciones.',
    section: 'Administrador'
  },
  {
    id: 'ADM-02',
    title: 'Gestión de Catálogo y Proveedores',
    description: 'Administración de proveedores y catálogo de productos.',
    section: 'Administrador'
  },
  {
    id: 'ADM-03',
    title: 'Gestión de Eventos y Planificación de Servicios',
    description: 'Creación de eventos de pedido y planificación de servicios.',
    section: 'Administrador'
  },
  {
    id: 'ADM-05',
    title: 'Estadísticas y Control de Gastos',
    description: 'Dashboard de KPIs y análisis de gasto.',
    section: 'Administrador'
  },
  {
    id: 'ADM-06',
    title: 'Configuración del Sistema',
    description: 'Datos de empresa, branding y mantenimiento.',
    section: 'Administrador'
  },

  // PARTE 4: Almacén
  {
    id: 'ALM-01',
    title: 'Flujo de Trabajo de Pedidos',
    description: 'Procesamiento, recepción e historial de pedidos.',
    section: 'Almacén'
  },
  {
    id: 'ALM-02',
    title: 'Gestión del Inventario Interno',
    description: 'Mini-Economato y reposición de stock.',
    section: 'Almacén'
  },

  // PARTE 5: Profesor
  {
    id: 'PRO-01',
    title: 'Gestión de Pedidos',
    description: 'Portal de pedidos, creación y historial.',
    section: 'Profesor'
  },
  {
    id: 'PRO-03',
    title: 'Planificación y Ventas',
    description: 'Servicios, menús y registro de ventas.',
    section: 'Profesor'
  }
];
