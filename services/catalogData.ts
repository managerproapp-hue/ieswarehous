import { CatalogFamily, CatalogCategory } from '../types';

export const DEFAULT_FAMILIES: CatalogFamily[] = [
    { id: 'CAR', name: 'Carnes' },
    { id: 'PES', name: 'Pescados y Mariscos' },
    { id: 'VER', name: 'Verduras y Hortalizas' },
    { id: 'FRU', name: 'Frutas' },
    { id: 'LAC', name: 'Lácteos y Huevos' },
    { id: 'PAN', name: 'Panadería y Pastelería' },
    { id: 'ACE', name: 'Aceites y Grasas' },
    { id: 'LEG', name: 'Legumbres' },
    { id: 'ESP', name: 'Especias y Condimentos' },
    { id: 'BEB', name: 'Bebidas' },
    { id: 'CON', name: 'Conservas' },
    { id: 'VAR', name: 'Varios / Otros' },
];

export const DEFAULT_CATEGORIES: CatalogCategory[] = [
    // Carnes
    { id: 'VAC', name: 'Vacuno', familyId: 'CAR' },
    { id: 'CER', name: 'Cerdo', familyId: 'CAR' },
    { id: 'AVE', name: 'Aves', familyId: 'CAR' },
    // Pescados y Mariscos
    { id: 'PES', name: 'Pescado', familyId: 'PES' },
    { id: 'MAR', name: 'Marisco', familyId: 'PES' },
    { id: 'MOL', name: 'Moluscos', familyId: 'PES' },
    // Verduras y Hortalizas
    { id: 'HOR', name: 'Hortalizas', familyId: 'VER' },
    { id: 'HOJ', name: 'Hojas', familyId: 'VER' },
    // Panadería y Pastelería
    { id: 'HAR', name: 'Harinas', familyId: 'PAN' },
    { id: 'LEV', name: 'Levaduras', familyId: 'PAN' },
    // Aceites
    { id: 'AOV', name: 'Aceite de Oliva', familyId: 'ACE' },
    // Especias
    { id: 'CON', name: 'Condimentos', familyId: 'ESP' },
];

export const DEFAULT_PRODUCT_STATES: string[] = [
  'Fresco', 
  'Congelado', 
  'Conservas', 
  'Ahumado',
  'Desalado',
  'UHT',
  'Esterilizado',
  'Enlatado',
  'Deshidratado',
  'No perecedero',
  'Otros'
];