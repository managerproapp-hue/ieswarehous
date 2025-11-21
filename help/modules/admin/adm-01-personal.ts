import { HelpModule, HelpContext, HelpSection } from '../../types';
import { Role } from '../../../types';

export const adm01Personal: HelpModule = {
  id: 'ADM-01',
  title: 'Gestión de Personal y Estructura Académica',
  description: 'Administra usuarios, ciclos, módulos, grupos y asignaciones.',
  role: Role.ADMIN,

  generateContent: (context: HelpContext): HelpSection[] => {
    const totalUsers = context.data.users?.length || 0;
    const activeTeachers = context.data.users?.filter((u: any) => 
      u.roles?.includes(Role.TEACHER) && u.activityStatus === 'active'
    ).length || 0;

    return [
      {
        title: '📌 Propósito',
        content: '<p>Esta sección te proporciona las herramientas para configurar la estructura humana y académica del centro, desde el alta de personal hasta la asignación de profesores a grupos.</p>'
      },
      {
        title: '📊 Tu Centro en Números',
        content: `
          <ul class="list-disc pl-5">
            <li>Total de usuarios en el sistema: <strong>${totalUsers}</strong></li>
            <li>Profesores actualmente activos: <strong>${activeTeachers}</strong></li>
            <li>Ciclos formativos definidos: <strong>${context.data.cycles?.length || 0}</strong></li>
            <li>Módulos totales: <strong>${context.data.modules?.length || 0}</strong></li>
            <li>Grupos creados: <strong>${context.data.groups?.length || 0}</strong></li>
          </ul>
        `
      },
      {
        title: '⚙️ Funcionalidades Clave',
        content: `
          <p>Desde las páginas correspondientes en tu panel de administrador, puedes:</p>
          <ul class="list-disc pl-5">
            <li><strong>Gestión de Personal</strong>: Dar de alta nuevo personal (Administradores, Profesores, Almacén), editar sus datos, cambiar su estado a "De Baja" o eliminarlos permanentemente.</li>
            <li><strong>Estructura Académica</strong>: Crear y organizar la jerarquía completa de Ciclos Formativos, Módulos y Grupos.</li>
            <li><strong>Asignaciones</strong>: Vincular a los profesores definidos en "Personal" con los grupos creados en la "Estructura Académica".</li>
          </ul>
        `
      }
    ];
  }
};
