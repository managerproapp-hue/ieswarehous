import { HelpModule, HelpContext, HelpSection } from '../types';

export const gen01General: HelpModule = {
  id: 'GEN-01',
  title: 'Primeros Pasos y Funciones Comunes',
  description: 'Guía para todos los perfiles: acceso, interfaz, perfiles, mensajería.',
  role: 'ALL',

  generateContent: (context: HelpContext): HelpSection[] => {
    const { currentUser, activeRole, data, appName } = context;
    const activeEvents = data.events?.filter((e: any) => e.status === 'Activo').length || 0;
    
    return [
      {
        title: '📌 Propósito',
        content: `<p>Esta es una guía esencial para todos los usuarios de <strong>${appName}</strong>. Explica las funciones básicas disponibles para todos los perfiles de usuario.</p>`
      },
      {
        title: '👥 Tu Perfil Actual',
        content: `
          <p>Hola, <strong>${currentUser?.name || 'Usuario'}</strong>.</p>
          <p>Actualmente estás usando el rol de: <strong>${activeRole}</strong>.</p>
          <p>En total, tienes <strong>${currentUser?.roles?.length || 0}</strong> roles asignados en tu cuenta.</p>
        `
      },
      {
        title: '🧭 Estado Actual del Sistema',
        content: `
          <ul class="list-disc pl-5">
            <li>Hay <strong>${activeEvents}</strong> evento(s) de pedido activo(s) en este momento.</li>
            <li>El sistema gestiona un total de <strong>${data.products?.length || 0}</strong> productos en el catálogo general.</li>
          </ul>
        `
      },
      {
        title: '💡 Documentación Dinámica',
        content: '<p>Este manual se genera automáticamente con los datos actuales de la aplicación. La información que ves (como tu nombre o el número de eventos) es siempre precisa y está actualizada.</p>'
      }
    ];
  }
};
