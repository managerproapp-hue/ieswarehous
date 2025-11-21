import { Sale } from '../types';

export const DEMO_SALES: Sale[] = [
    {
        id: 'sale-1',
        teacherId: 'user-2', // Ana García
        amount: 150.75,
        date: '2023-10-15T10:00:00Z',
        description: 'Venta de menús para evento Rectorado',
        category: 'Restaurante',
    },
    {
        id: 'sale-2',
        teacherId: 'user-4', // Carlos Pérez
        amount: 85.50,
        date: '2023-10-18T14:30:00Z',
        description: 'Venta de postres especiales',
        category: 'Pastelería',
    },
    {
        id: 'sale-3',
        teacherId: 'user-2', // Ana García
        amount: 220.00,
        date: '2023-11-05T12:00:00Z',
        description: 'Catering para jornada de puertas abiertas',
        category: 'Eventos',
    },
    {
        id: 'sale-4',
        teacherId: 'user-4', // Carlos Pérez
        amount: 125.00,
        date: '2023-11-10T09:30:00Z',
        description: 'Desayunos para claustro',
        category: 'Cafetería',
    },
];