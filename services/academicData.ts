import { Cycle, Module, Group } from '../types';

export const initialCycles: Cycle[] = [
    { id: 'cycle-1', name: 'Técnico en Cocina y Gastronomía' },
    { id: 'cycle-2', name: 'Técnico en Servicios en Restauración' },
    { id: 'cycle-3', name: 'Técnico Superior en Dirección de Cocina' },
    { id: 'cycle-4', name: 'Técnico Superior en Dirección de Servicios de Restauración' },
    { id: 'cycle-5', name: 'Especialista en Panadería y Bollería Artesanales' },
    { id: 'cycle-6', name: 'Técnico en Panadería, Repostería y Confitería' },
];

export const initialModules: Module[] = [
    // Técnico en Cocina y Gastronomía
    { id: 'mod-c1-1', name: 'Preelaboración y conservación de alimentos', course: 1, cycleId: 'cycle-1' },
    { id: 'mod-c1-2', name: 'Técnicas culinarias', course: 1, cycleId: 'cycle-1' },
    { id: 'mod-c1-3', name: 'Procesos básicos de pastelería y repostería', course: 1, cycleId: 'cycle-1' },
    { id: 'mod-c1-4', name: 'Productos culinarios', course: 2, cycleId: 'cycle-1' },
    { id: 'mod-c1-5', name: 'Postres en restauración', course: 2, cycleId: 'cycle-1' },
    { id: 'mod-c1-6', name: 'Sostenibilidad aplicada al sistema productivo', course: 2, cycleId: 'cycle-1' },
    { id: 'mod-c1-7', name: 'Optativa', course: 2, cycleId: 'cycle-1' },
    // Shared modules (also in Técnico en Servicios en Restauración)
    { id: 'mod-s-1', name: 'Operaciones básicas en bar-cafetería', course: 1, cycleId: 'cycle-1' },
    { id: 'mod-s-2', name: 'Operaciones básicas en restaurante', course: 1, cycleId: 'cycle-1' },
    { id: 'mod-s-3', name: 'Servicios en bar-cafetería', course: 2, cycleId: 'cycle-1' },
    { id: 'mod-s-4', name: 'Servicios en restaurante y eventos especiales', course: 2, cycleId: 'cycle-1' },
    { id: 'mod-s-5', name: 'El vino y su servicio', course: 2, cycleId: 'cycle-1' },

    // Técnico en Servicios en Restauración (shares modules with cycle-1)
    { id: 'mod-s-1-c2', name: 'Operaciones básicas en bar-cafetería', course: 1, cycleId: 'cycle-2' },
    { id: 'mod-s-2-c2', name: 'Operaciones básicas en restaurante', course: 1, cycleId: 'cycle-2' },
    { id: 'mod-s-3-c2', name: 'Servicios en bar-cafetería', course: 2, cycleId: 'cycle-2' },
    { id: 'mod-s-4-c2', name: 'Servicios en restaurante y eventos especiales', course: 2, cycleId: 'cycle-2' },
    { id: 'mod-s-5-c2', name: 'El vino y su servicio', course: 2, cycleId: 'cycle-2' },

    // Técnico Superior en Dirección de Cocina
    { id: 'mod-c3-1', name: 'Procesos de preelaboración y conservación en cocina', course: 1, cycleId: 'cycle-3' },
    { id: 'mod-c3-2', name: 'Elaboraciones de pastelería y repostería en cocina', course: 1, cycleId: 'cycle-3' },
    { id: 'mod-c3-3', name: 'Procesos de elaboración culinaria', course: 1, cycleId: 'cycle-3' },
    { id: 'mod-c3-4', name: 'Gestión de la producción en cocina', course: 1, cycleId: 'cycle-3' },
    { id: 'mod-c3-5', name: 'Control del aprovisionamiento de materias primas', course: 2, cycleId: 'cycle-3' },
    { id: 'mod-c3-6', name: 'Gestión de la calidad y de la seguridad e higiene alimentaria', course: 2, cycleId: 'cycle-3' },
    { id: 'mod-c3-7', name: 'Gastronomía y nutrición', course: 2, cycleId: 'cycle-3' },

    // Técnico Superior en Dirección de Servicios de Restauración
    { id: 'mod-c4-1', name: 'Procesos de servicios en bar-cafetería', course: 1, cycleId: 'cycle-4' },
    { id: 'mod-c4-2', name: 'Procesos de servicios en restaurante', course: 1, cycleId: 'cycle-4' },
    { id: 'mod-c4-3', name: 'Sumillería', course: 1, cycleId: 'cycle-4' },
    { id: 'mod-c4-4', name: 'Planificación y dirección de servicios y eventos en restauración', course: 1, cycleId: 'cycle-4' },
    { id: 'mod-c4-5', name: 'Control del aprovisionamiento de materias primas', course: 2, cycleId: 'cycle-4' },

    // Especialista en Panadería y Bollería Artesanales
    { id: 'mod-c5-1', name: 'Masas madre de cultivo y prefermentos', course: 1, cycleId: 'cycle-5' },
    { id: 'mod-c5-2', name: 'Tecnología del frío aplicada a la panadería artesanal', course: 1, cycleId: 'cycle-5' },
    { id: 'mod-c5-3', name: 'Panes artesanos de cereales tradicionales, especiales y pseudocereales', course: 1, cycleId: 'cycle-5' },
    { id: 'mod-c5-4', name: 'Bollería artesanal y hojaldres', course: 1, cycleId: 'cycle-5' },
    { id: 'mod-c5-5', name: 'Cata y maridaje de productos de panificación', course: 1, cycleId: 'cycle-5' },

    // Técnico en Panadería, Repostería y Confitería
    { id: 'mod-c6-1', name: 'Elaboraciones de panadería-bollería', course: 1, cycleId: 'cycle-6' },
    { id: 'mod-c6-2', name: 'Procesos básicos de pastelería y repostería', course: 1, cycleId: 'cycle-6' },
    { id: 'mod-c6-3', name: 'Operaciones y control de almacén en la industria alimentaria', course: 1, cycleId: 'cycle-6' },
    { id: 'mod-c6-4', name: 'Presentación y venta de productos de panadería y pastelería', course: 1, cycleId: 'cycle-6' },
    { id: 'mod-c6-5', name: 'Materias primas y procesos en panadería, pastelería y repostería', course: 1, cycleId: 'cycle-6' },
    { id: 'mod-c6-6', name: 'Elaboraciones de confitería y otras especialidades', course: 2, cycleId: 'cycle-6' },
    { id: 'mod-c6-7', name: 'Postres en restauración', course: 2, cycleId: 'cycle-6' },
    { id: 'mod-c6-8', name: 'Productos de obrador', course: 2, cycleId: 'cycle-6' },
    { id: 'mod-c6-9', name: 'Optativa', course: 2, cycleId: 'cycle-6' },
];

export const initialGroups: Group[] = [
    // Técnico en Cocina y Gastronomía
    { id: 'group-c1-1-a', name: '1HCA', shift: 'Mañana', moduleId: 'mod-c1-1' },
    { id: 'group-c1-1-b', name: '1HCB', shift: 'Mañana', moduleId: 'mod-c1-1' },
    { id: 'group-c1-1-c', name: '1HCC', shift: 'Tarde', moduleId: 'mod-c1-1' },
    { id: 'group-c1-2-a', name: '1HCA', shift: 'Mañana', moduleId: 'mod-c1-2' },
    { id: 'group-c1-2-b', name: '1HCB', shift: 'Mañana', moduleId: 'mod-c1-2' },
    { id: 'group-c1-2-c', name: '1HCC', shift: 'Tarde', moduleId: 'mod-c1-2' },
    { id: 'group-c1-3-a', name: '1HCA', shift: 'Mañana', moduleId: 'mod-c1-3' },
    { id: 'group-c1-3-b', name: '1HCB', shift: 'Mañana', moduleId: 'mod-c1-3' },
    { id: 'group-c1-3-c', name: '1HCC', shift: 'Tarde', moduleId: 'mod-c1-3' },
    { id: 'group-c1-4-a', name: '2HCA', shift: 'Mañana', moduleId: 'mod-c1-4' },
    { id: 'group-c1-4-b', name: '2HCB', shift: 'Tarde', moduleId: 'mod-c1-4' },
    { id: 'group-c1-5-a', name: '2HCA', shift: 'Mañana', moduleId: 'mod-c1-5' },
    { id: 'group-c1-5-b', name: '2HCB', shift: 'Tarde', moduleId: 'mod-c1-5' },
    { id: 'group-c1-6-a', name: '2HCA', shift: 'Mañana', moduleId: 'mod-c1-6' },
    { id: 'group-c1-6-b', name: '2HCB', shift: 'Tarde', moduleId: 'mod-c1-6' },
    { id: 'group-c1-7-a', name: '2HCA', shift: 'Mañana', moduleId: 'mod-c1-7' },
    { id: 'group-c1-7-b', name: '2HCB', shift: 'Tarde', moduleId: 'mod-c1-7' },
    { id: 'group-s-1-a', name: 'IHS', shift: 'Mañana', moduleId: 'mod-s-1' },
    { id: 'group-s-2-a', name: '1HS', shift: 'Mañana', moduleId: 'mod-s-2' },
    { id: 'group-s-3-a', name: '2HS', shift: 'Mañana', moduleId: 'mod-s-3' },
    { id: 'group-s-4-a', name: '2HS', shift: 'Mañana', moduleId: 'mod-s-4' },
    { id: 'group-s-5-a', name: '2HS', shift: 'Mañana', moduleId: 'mod-s-5' },

    // Técnico en Servicios en Restauración
    { id: 'group-s-1-c2-a', name: 'IHS', shift: 'Mañana', moduleId: 'mod-s-1-c2' },
    { id: 'group-s-2-c2-a', name: '1HS', shift: 'Mañana', moduleId: 'mod-s-2-c2' },
    { id: 'group-s-3-c2-a', name: '2HS', shift: 'Mañana', moduleId: 'mod-s-3-c2' },
    { id: 'group-s-4-c2-a', name: '2HS', shift: 'Mañana', moduleId: 'mod-s-4-c2' },
    { id: 'group-s-5-c2-a', name: '2HS', shift: 'Mañana', moduleId: 'mod-s-5-c2' },

    // Técnico Superior en Dirección de Cocina
    { id: 'group-c3-1-a', name: '3HDC', shift: 'Tarde', moduleId: 'mod-c3-1' },
    { id: 'group-c3-2-a', name: '3HDC', shift: 'Tarde', moduleId: 'mod-c3-2' },
    { id: 'group-c3-3-a', name: '3HDC', shift: 'Tarde', moduleId: 'mod-c3-3' },
    { id: 'group-c3-4-a', name: '3HDC', shift: 'Tarde', moduleId: 'mod-c3-4' },
    { id: 'group-c3-5-a', name: '4HDC', shift: 'Tarde', moduleId: 'mod-c3-5' },
    { id: 'group-c3-6-a', name: '4HDC', shift: 'Tarde', moduleId: 'mod-c3-6' },
    { id: 'group-c3-7-a', name: '4HDC', shift: 'Tarde', moduleId: 'mod-c3-7' },
    
    // Técnico Superior en Dirección de Servicios de Restauración
    { id: 'group-c4-1-a', name: '3HDS', shift: 'Tarde', moduleId: 'mod-c4-1' },
    { id: 'group-c4-2-a', name: '3HDS', shift: 'Tarde', moduleId: 'mod-c4-2' },
    { id: 'group-c4-3-a', name: '3HDS', shift: 'Tarde', moduleId: 'mod-c4-3' },
    { id: 'group-c4-4-a', name: '3HDS', shift: 'Tarde', moduleId: 'mod-c4-4' },
    { id: 'group-c4-5-a', name: '4HDS', shift: 'Tarde', moduleId: 'mod-c4-5' },

    // Especialista en Panadería y Bollería Artesanales
    { id: 'group-c5-1-a', name: '5PBA', shift: 'Tarde', moduleId: 'mod-c5-1' },
    { id: 'group-c5-2-a', name: '5PBA', shift: 'Tarde', moduleId: 'mod-c5-2' },
    { id: 'group-c5-3-a', name: '5PBA', shift: 'Tarde', moduleId: 'mod-c5-3' },
    { id: 'group-c5-4-a', name: '5PBA', shift: 'Tarde', moduleId: 'mod-c5-4' },
    { id: 'group-c5-5-a', name: '5PBA', shift: 'Tarde', moduleId: 'mod-c5-5' },

    // Técnico en Panadería, Repostería y Confitería
    { id: 'group-c6-1-a', name: '1YP', shift: 'Mañana', moduleId: 'mod-c6-1' },
    { id: 'group-c6-2-a', name: '1YP', shift: 'Mañana', moduleId: 'mod-c6-2' },
    { id: 'group-c6-3-a', name: '1YP', shift: 'Mañana', moduleId: 'mod-c6-3' },
    { id: 'group-c6-4-a', name: '1YP', shift: 'Mañana', moduleId: 'mod-c6-4' },
    { id: 'group-c6-5-a', name: '1YP', shift: 'Mañana', moduleId: 'mod-c6-5' },
    { id: 'group-c6-6-a', name: '2YP', shift: 'Mañana', moduleId: 'mod-c6-6' },
    { id: 'group-c6-7-a', name: '2YP', shift: 'Mañana', moduleId: 'mod-c6-7' },
    { id: 'group-c6-8-a', name: '2YP', shift: 'Mañana', moduleId: 'mod-c6-8' },
    { id: 'group-c6-9-a', name: '2YP', shift: 'Mañana', moduleId: 'mod-c6-9' },
];

export const initialAcademicData = {
    cycles: initialCycles,
    modules: initialModules,
    groups: initialGroups,
};
