import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useData } from '../../contexts/DataContext';
import { CompanyInfo, Role } from '../../types';
import { DownloadIcon } from '../../components/icons';

// Add jsPDF declaration
declare global {
  interface Window {
    jspdf: any;
  }
}

const CompanyDataPage: React.FC = () => {
    const { companyInfo, updateCompanyInfo, users } = useData();
    const [formState, setFormState] = useState<CompanyInfo>(companyInfo);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

    useEffect(() => {
        setFormState(companyInfo);
    }, [companyInfo]);

    const warehouseManagers = users.filter(u => u.roles.includes(Role.MANAGER));

    const validateField = (name: string, value: string): string => {
        if (name === 'cif') {
            const cifRegex = /^[A-HJ-NP-SUVW]{1}[0-9]{7}[0-9A-J]{1}$|^[0-9]{8}[A-Z]{1}$/;
            if (!cifRegex.test(value)) return 'Formato de CIF/NIF inválido.';
        }
        if (name === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) return 'Formato de email inválido.';
        }
        if (name === 'phone') {
            const phoneRegex = /^[0-9\s+()-]+$/;
            if (!phoneRegex.test(value)) return 'El teléfono solo debe contener números.';
        }
        return '';
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>, field: 'logoUI' | 'logoPDF') => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setFormState(prev => ({ ...prev, [field]: event.target?.result as string }));
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const hasErrors = Object.values(errors).some(error => error);
        if (hasErrors) {
            alert('Por favor, corrige los errores en el formulario.');
            return;
        }
        updateCompanyInfo(formState);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
    };

    const generatePreviewPdf = () => {
        const { jsPDF } = window as any;
        const doc = new jsPDF();
        
        // Header
        if (formState.logoPDF) {
            doc.addImage(formState.logoPDF, 'PNG', 15, 10, 30, 15);
        }
        doc.setFontSize(10);
        doc.text(formState.name, 50, 15);
        doc.text(formState.address, 50, 20);
        doc.text(`CIF: ${formState.cif}`, 50, 25);

        // Body
        doc.setFontSize(16);
        doc.text('Hoja de Pedido (Ejemplo)', 14, 45);

        const managerName = warehouseManagers.find(m => m.id === formState.warehouseManagerId)?.name || 'N/A';
        doc.setFontSize(10);
        doc.text(`A la atención de: ${managerName}`, 14, 55);

        doc.autoTable({
            startY: 65,
            head: [['Ref.', 'Producto', 'Cantidad', 'Unidad']],
            body: [
                ['REF-001', 'Producto de Ejemplo 1', '10', 'kg'],
                ['REF-002', 'Producto de Ejemplo 2', '5', 'uds'],
            ],
        });
        
        doc.save('previsualizacion_pedido.pdf');
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Datos de la Empresa</h1>
            <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Identification */}
                <div className="card">
                    <div className="h-1.5 bg-indigo-500"></div>
                    <div className="p-6">
                        <h2 className="card-title">Información de Identificación</h2>
                        <div className="grid-form">
                            <div className="col-span-2">
                                <label className="label-style">Nombre de la Empresa</label>
                                <input name="name" value={formState.name} onChange={handleChange} className="input-style" />
                            </div>
                            <div>
                                <label className="label-style">CIF/NIF</label>
                                <input name="cif" value={formState.cif} onChange={handleChange} className="input-style" />
                                {errors.cif && <p className="error-text">{errors.cif}</p>}
                            </div>
                            <div>
                                <label className="label-style">Teléfono</label>
                                <input name="phone" value={formState.phone} onChange={handleChange} className="input-style" />
                                {errors.phone && <p className="error-text">{errors.phone}</p>}
                            </div>
                            <div>
                                <label className="label-style">Email</label>
                                <input name="email" value={formState.email} onChange={handleChange} className="input-style" />
                                {errors.email && <p className="error-text">{errors.email}</p>}
                            </div>
                            <div className="col-span-2">
                                <label className="label-style">Dirección</label>
                                <textarea name="address" value={formState.address} onChange={handleChange} className="input-style" rows={2}></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Branding */}
                <div className="card">
                    <div className="h-1.5 bg-indigo-500"></div>
                    <div className="p-6">
                        <h2 className="card-title">Identidad Visual (Branding)</h2>
                        <div className="grid-form">
                            <div>
                                <label className="label-style">Logo Principal (Interfaz)</label>
                                <p className="text-xs text-gray-500 mb-2">Recomendado: 200x50px, PNG o SVG.</p>
                                <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'logoUI')} className="input-file"/>
                                {formState.logoUI && <img src={formState.logoUI} alt="Preview UI" className="mt-2 h-12 bg-gray-200 p-1 rounded"/>}
                            </div>
                            <div>
                                <label className="label-style">Logo para Documentos (PDF)</label>
                                <p className="text-xs text-gray-500 mb-2">Recomendado: Blanco y negro, alto contraste.</p>
                                <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'logoPDF')} className="input-file"/>
                                {formState.logoPDF && <img src={formState.logoPDF} alt="Preview PDF" className="mt-2 h-12 bg-gray-200 p-1 rounded"/>}
                            </div>
                            <div className="col-span-2">
                                <label className="label-style">Color Corporativo</label>
                                <p className="text-xs text-gray-500 mb-2">Este color se usará en botones y elementos destacados de la interfaz.</p>
                                <input type="color" name="primaryColor" value={formState.primaryColor} onChange={handleChange} className="w-full h-10 p-1 bg-white border rounded-md cursor-pointer"/>
                            </div>
                        </div>
                    </div>
                </div>

                 {/* Operational Parameters */}
                <div className="card">
                    <div className="h-1.5 bg-indigo-500"></div>
                    <div className="p-6">
                        <h2 className="card-title">Parámetros Operativos y de Automatización</h2>
                        <div className="grid-form">
                            <div>
                                <label className="label-style">Encargado de Almacén</label>
                                <select name="warehouseManagerId" value={formState.warehouseManagerId} onChange={handleChange} className="input-style">
                                    <option value="">-- Seleccionar --</option>
                                    {warehouseManagers.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="label-style">Presupuesto por Defecto (€)</label>
                                <input type="number" name="defaultBudget" value={formState.defaultBudget} onChange={handleChange} className="input-style" min="0" />
                            </div>
                            <div className="col-span-2">
                                <label className="label-style">Semanas de Antelación para Eventos Automáticos</label>
                                <input type="number" name="eventWeeks" value={formState.eventWeeks} onChange={handleChange} className="input-style" min="1" max="52" />
                                <p className="text-xs text-gray-500 mt-1">Controla con cuántas semanas a futuro se generan los eventos de pedido regulares.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end items-center gap-4">
                     <button type="button" onClick={generatePreviewPdf} className="btn-secondary flex items-center gap-2">
                        <DownloadIcon className="w-4 h-4" /> Previsualizar Hoja de Pedido
                    </button>
                    <button type="submit" className={`btn-primary w-32 ${saveStatus === 'saved' ? 'bg-green-500' : ''}`}>
                        {saveStatus === 'saved' ? '¡Guardado!' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>

            <style>{`
                .card { background-color: white; border-radius: 0.75rem; box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1); overflow: hidden; }
                .dark .card { background-color: #1F2937; }
                .card-title { font-size: 1.125rem; font-weight: 600; margin-bottom: 1rem; border-bottom: 1px solid #E5E7EB; padding-bottom: 0.5rem; }
                .dark .card-title { border-bottom-color: #374151; }
                .grid-form { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.5rem; }
                .label-style { display: block; margin-bottom: 0.25rem; font-size: 0.875rem; font-weight: 500; }
                .input-style { display: block; width: 100%; border-radius: 0.375rem; padding: 0.5rem 0.75rem; border: 1px solid #D1D5DB; } 
                .dark .input-style { background-color: #374151; border-color: #4B5563; }
                .input-file { font-size: 0.875rem; }
                .error-text { font-size: 0.75rem; color: #EF4444; margin-top: 0.25rem; }
                .btn-primary { padding: 0.6rem 1rem; font-weight: 600; color: white; background-color: #4F46E5; border-radius: 0.5rem; transition: background-color 0.2s; }
                .btn-secondary { padding: 0.6rem 1rem; font-weight: 600; color: #374151; background-color: #F3F4F6; border: 1px solid #D1D5DB; border-radius: 0.5rem; }
                .dark .btn-secondary { background-color: #374151; border-color: #4B5563; color: #F9FAFB; }
            `}</style>
        </div>
    );
};

export default CompanyDataPage;