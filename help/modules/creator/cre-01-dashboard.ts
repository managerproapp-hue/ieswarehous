import { HelpModule, HelpContext, HelpSection } from '../types';
import { Role } from '../../../types';

export const cre01Dashboard: HelpModule = {
  id: 'CRE-01',
  title: 'Panel de Creador y Mantenimiento Global',
  description: 'Firma de la app, copias de seguridad y reseteo.',
  role: Role.CREATOR,

  generateContent: (context: HelpContext): HelpSection[] => {
    const lastBackup = context.data.backupHistory?.[0];

    return [
      {
        title: '📌 Propósito',
        content: `<p>El Panel de Creador es el centro de control de más alto nivel de <strong>${context.appName}</strong>. Desde aquí puedes personalizar la identidad de la aplicación y realizar tareas críticas de mantenimiento.</p>`
      },
      {
        title: '✍️ Configura tu Firma',
        content: `
          <p>Personaliza la apariencia y la información de contacto que se muestra en toda la aplicación.</p>
          <ul class="list-disc pl-5">
            <li><strong>Nombre de la App:</strong> ${context.appName}</li>
            <li><strong>Nombre del Creador:</strong> ${context.creatorName}</li>
            <li>Puedes cambiar el logo, el email de contacto y el texto de copyright.</li>
          </ul>
        `
      },
      {
        title: '💾 Copias de Seguridad y Restauración',
        content: `
          <p>Es crucial realizar copias de seguridad periódicas para proteger los datos.</p>
          <ul class="list-disc pl-5">
            <li><strong>Descargar Copia:</strong> Genera un archivo <code>.json</code> con todos los datos de la aplicación.</li>
            <li><strong>Restaurar:</strong> Sube un archivo <code>.json</code> para sobreescribir todos los datos actuales. Úsalo con precaución.</li>
            ${lastBackup ? `<li>Tu última copia de seguridad fue el <strong>${new Date(lastBackup.date).toLocaleString()}</strong>.</li>` : '<li>Aún no has realizado ninguna copia de seguridad.</li>'}
          </ul>
        `
      },
       {
        title: '🚨 Zona Peligrosa',
        content: '<p>La opción de <strong>Restablecer la Aplicación</strong> es irreversible. Borra absolutamente todos los datos (usuarios, productos, pedidos, etc.) y devuelve la aplicación a su estado inicial. Solo debe usarse en casos extremos y asegurándote de tener una copia de seguridad reciente.</p>'
      }
    ];
  }
};
