
import { Recipe, ServiceGroup, Service } from '../types';

export const DEMO_RECIPES: Recipe[] = [
    {
        id: 'recipe-1',
        name: 'Solomillo a la Plancha con Patatas',
        creatorId: 'user-2', // Ana García
        isPublic: true,
        // Fix: Added missing properties yieldQuantity, yieldUnit, and category to match the Recipe type.
        yieldQuantity: 1,
        yieldUnit: 'ración',
        category: 'Platos Principales',
        ingredients: [
            { productId: 'prod-1', quantity: 0.25, unit: 'kg' }, // Solomillo de Ternera
            { productId: 'prod-7', quantity: 0.05, unit: 'litro' }, // Aceite de Oliva
        ],
        instructions: '1. Sellar el solomillo a fuego fuerte.\n2. Bajar fuego y cocinar al punto deseado.\n3. Freír patatas (no incluidas en ingredientes) y servir.',
        // Fix: Renamed 'platingNotes' to 'presentation' and added missing fields to match the type definition.
        serviceDetails: {
            presentation: 'Colocar el solomillo trinchado sobre una cama de patatas.',
            servingTemp: '65°C',
            cutlery: '',
            passTime: '10 minutos',
            serviceType: '',
            clientDescription: '',
        }
    },
    {
        id: 'recipe-2',
        name: 'Tomates Aliñados de la Huerta',
        creatorId: 'user-4', // Carlos Pérez
        isPublic: true,
        // Fix: Added missing properties yieldQuantity, yieldUnit, and category to match the Recipe type.
        yieldQuantity: 1,
        yieldUnit: 'ración',
        category: 'Entrantes',
        ingredients: [
            { productId: 'prod-3', quantity: 0.3, unit: 'kg' }, // Tomate pera
            { productId: 'prod-7', quantity: 0.03, unit: 'litro' }, // Aceite de Oliva
        ],
        instructions: '1. Cortar los tomates en rodajas.\n2. Aliñar con aceite y sal.',
        // Fix: Renamed 'platingNotes' to 'presentation' and added missing fields to match the type definition.
        serviceDetails: {
            presentation: 'Servir en plato hondo.',
            servingTemp: 'Ambiente',
            cutlery: '',
            passTime: '5 minutos',
            serviceType: '',
            clientDescription: '',
        }
    },
     {
        id: 'recipe-3',
        name: 'Pollo al Ajillo',
        creatorId: 'user-2', // Ana García
        isPublic: false,
        // Fix: Added missing properties yieldQuantity, yieldUnit, and category to match the Recipe type.
        yieldQuantity: 1,
        yieldUnit: 'ración',
        category: 'Platos Principales',
        ingredients: [
            { productId: 'prod-2', quantity: 0.3, unit: 'kg' }, // Pechuga de Pollo
            { productId: 'prod-7', quantity: 0.05, unit: 'litro' }, // Aceite de Oliva
        ],
        instructions: '1. Dorar ajos en aceite.\n2. Añadir el pollo y cocinar hasta que esté dorado.\n3. Servir caliente.',
        // Fix: Renamed 'platingNotes' to 'presentation' and added missing fields to match the type definition.
        serviceDetails: {
            presentation: 'Emplatar en cazuela de barro.',
            servingTemp: '70°C',
            cutlery: '',
            passTime: '15 minutos',
            serviceType: '',
            clientDescription: '',
        }
    }
];

export const DEMO_SERVICE_GROUPS: ServiceGroup[] = [
    {
        id: 'sgroup-1',
        name: 'Brigada Miércoles Mediodía',
        memberIds: ['user-2', 'user-4'] // Ana García, Carlos Pérez
    }
];

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow.setHours(13, 30, 0, 0);

export const DEMO_SERVICES: Service[] = [
    {
        id: 'service-1',
        name: 'Comida VIP Rectorado',
        date: tomorrow.toISOString(),
        serviceGroupId: 'sgroup-1',
        menu: [],
        roleAssignments: {},
    }
];
