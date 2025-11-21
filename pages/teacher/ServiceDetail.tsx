
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { Service, SERVICE_ROLES, ServiceMenuDish, EventType, OrderStatus, EventStatus } from '../../types';
import { TrashIcon, ArrowUpIcon, ArrowDownIcon } from '../../components/icons';
import SelectRecipeModal from '../../components/SelectRecipeModal';
// Fix: Import useCreator to get creatorInfo
import { useCreator } from '../../contexts/CreatorContext';

// Add jsPDF declaration
declare global {
  interface Window {
    jspdf: any;
  }
}

const ServiceDetail: React.FC = () => {
    const { serviceId } = useParams<{ serviceId: string }>();
    const navigate = useNavigate();
    const { 
        services, updateService, recipes, users, serviceGroups, 
        // Fix: Remove creatorInfo from useData destructuring
        products, addEvent, saveOrder, companyInfo
    } = useData();
    // Fix: Get creatorInfo from useCreator
    const { creatorInfo } = useCreator();

    const [isRecipeModalOpen, setRecipeModalOpen] = useState(false);
    
    const service = useMemo(() => services.find(s => s.id === serviceId), [services, serviceId]);
    const recipeMap = useMemo(() => new Map(recipes.map(r => [r.id, r])), [recipes]);
    const productMap = useMemo(() => new Map(products.map(p => [p.id, p])), [products]);

    const groupMembers = useMemo(() => {
        if (!service) return [];
        const group = serviceGroups.find(g => g.id === service.serviceGroupId);
        return group ? users.filter(u => group.memberIds.includes(u.id)) : [];
    }, [service, serviceGroups, users]);
    
    if (!service) return <div>Servicio no encontrado.</div>;
    
    const handleAddDish = (recipe: any) => {
        const newDish: ServiceMenuDish = { id: `dish-${Date.now()}`, recipeId: recipe.id };
        updateService({ ...service, menu: [...service.menu, newDish] });
    };
    
    const handleRemoveDish = (dishId: string) => {
        updateService({ ...service, menu: service.menu.filter(d => d.id !== dishId) });
    };

    const handleMoveDish = (index: number, direction: 'up' | 'down') => {
        const newMenu = [...service.menu];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newMenu.length) return;
        
        [newMenu[index], newMenu[targetIndex]] = [newMenu[targetIndex], newMenu[index]]; // Swap
        updateService({ ...service, menu: newMenu });
    };
    
    const handleRoleAssignment = (role: string, teacherId: string) => {
        const newAssignments = { ...service.roleAssignments, [role]: teacherId };
        updateService({ ...service, roleAssignments: newAssignments });
    };
    
    const addPdfFooter = (doc: any) => {
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.text(
                `${creatorInfo.appName} - ${creatorInfo.copyrightText} | Generado: ${new Date().toLocaleString()}`,
                doc.internal.pageSize.getWidth() / 2,
                doc.internal.pageSize.getHeight() - 10,
                { align: 'center' }
            );
        }
    };

    const generateAllergenReport = () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const allAllergens = new Set<string>();
        service.menu.forEach(dish => {
            const recipe = recipeMap.get(dish.recipeId);
            recipe?.ingredients.forEach(ing => {
                const product = productMap.get(ing.productId);
                product?.allergens.forEach(allergen => allAllergens.add(allergen));
            });
        });

        // Header
        if (companyInfo.logoPDF) {
            doc.addImage(companyInfo.logoPDF, 'PNG', 15, 10, 30, 15);
        }
        doc.setFontSize(10);
        doc.text(companyInfo.name, 50, 15);
        doc.text(new Date().toLocaleDateString(), 170, 15);
        doc.line(15, 30, 195, 30);
        
        // Body
        doc.setFontSize(18);
        doc.text('Informe de Alérgenos', 15, 40);
        doc.setFontSize(12);
        doc.text(`Servicio: ${service.name}`, 15, 48);

        if (allAllergens.size > 0) {
            doc.autoTable({
                startY: 55,
                head: [['Alérgenos Presentes en el Menú']],
                body: Array.from(allAllergens).map(a => [a]),
                theme: 'grid'
            });
        } else {
            doc.text('No se han identificado alérgenos en los platos del menú.', 15, 60);
        }
        
        addPdfFooter(doc);
        const fileName = `Informe_Alergenos_${service.name.replace(/\s/g, '_')}.pdf`;
        doc.save(fileName);
    };

    const generateServiceOrder = () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Header
        if (companyInfo.logoPDF) {
            doc.addImage(companyInfo.logoPDF, 'PNG', 15, 10, 30, 15);
        }
        doc.setFontSize(10);
        doc.text(companyInfo.name, 50, 15);
        doc.text(new Date(service.date).toLocaleString(), 150, 15);
        doc.line(15, 30, 195, 30);
        
        // Body
        doc.setFontSize(18);
        doc.text('Orden de Servicio', 15, 40);
        doc.setFontSize(12);
        doc.text(`Servicio: ${service.name}`, 15, 48);

        const tableBody = service.menu.map(dish => {
            const recipe = recipeMap.get(dish.recipeId);
            if (!recipe) return [dish.id, 'Receta no encontrada', '', '', ''];
            // Fix: Replaced 'platingNotes' with 'presentation' to match the type definition.
            return [
                recipe.name,
                recipe.serviceDetails.servingTemp,
                recipe.serviceDetails.presentation,
                recipe.serviceDetails.passTime,
            ];
        });

        if (service.menu.length > 0) {
             doc.autoTable({
                startY: 55,
                head: [['Plato', 'Temp. Servicio', 'Emplatado', 'Tiempo de Pase']],
                body: tableBody,
                theme: 'striped'
            });
        } else {
            doc.text('El menú de este servicio está vacío.', 15, 60);
        }
        
        addPdfFooter(doc);
        const fileName = `Orden_Servicio_${service.name.replace(/\s/g, '_')}.pdf`;
        doc.save(fileName);
    };

    const generateOrderDraft = () => {
        if (!service.menu.length) {
            alert("El menú está vacío. Añade platos para poder generar un pedido.");
            return;
        }

        if (service.associatedEventId) {
            alert("Ya se ha generado un pedido para este servicio. Redirigiendo...");
            // Logic to find the order and navigate
            return;
        }

        const ingredientMap = new Map<string, { quantity: number; unit: string; name: string }>();
        service.menu.forEach(dish => {
            const recipe = recipeMap.get(dish.recipeId);
            recipe?.ingredients.forEach(ing => {
                const product = productMap.get(ing.productId);
                if (product) {
                    const existing = ingredientMap.get(ing.productId);
                    if (existing) {
                        existing.quantity += ing.quantity;
                    } else {
                        ingredientMap.set(ing.productId, { quantity: ing.quantity, unit: ing.unit, name: product.name });
                    }
                }
            });
        });
        
        const newEvent = addEvent({
            name: `Pedido para Servicio: ${service.name}`,
            type: EventType.EXTRAORDINARY,
            status: EventStatus.ACTIVE,
            startDate: new Date().toISOString(),
            endDate: service.date,
            budget: 0,
            authorizedTeacherIds: [groupMembers[0]?.id || ''],
        });

        const orderItems = Array.from(ingredientMap.entries()).map(([productId, data]) => ({
            productId,
            productName: data.name,
            quantity: data.quantity,
            unit: data.unit,
            isOutOfCatalog: false
        }));

        const newOrder = saveOrder({
            eventId: newEvent.id,
            teacherId: groupMembers[0]?.id || '',
            status: OrderStatus.DRAFT,
            notes: `Pedido autogenerado para el servicio "${service.name}".`
        }, orderItems);
        
        updateService({ ...service, associatedEventId: newEvent.id });
        alert("Borrador de pedido generado con éxito. Serás redirigido para revisarlo.");
        navigate(`/teacher/create-order/${newEvent.id}?orderId=${newOrder.id}`);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Gestionar Servicio: {service.name}</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Menu & Roles */}
                <div className="space-y-6">
                    <div className="card">
                        <h2 className="card-title">Planificación del Menú</h2>
                        <ul className="divide-y dark:divide-gray-700">
                            {service.menu.map((dish, index) => (
                                <li key={dish.id} className="py-2 flex justify-between items-center group">
                                    <span>{index + 1}. {recipeMap.get(dish.recipeId)?.name || 'Receta no encontrada'}</span>
                                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleMoveDish(index, 'up')} disabled={index === 0} className="p-1 disabled:opacity-30"><ArrowUpIcon className="w-4 h-4" /></button>
                                        <button onClick={() => handleMoveDish(index, 'down')} disabled={index === service.menu.length - 1} className="p-1 disabled:opacity-30"><ArrowDownIcon className="w-4 h-4" /></button>
                                        <button onClick={() => handleRemoveDish(dish.id)} className="p-1"><TrashIcon className="w-5 h-5 text-red-500"/></button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <button onClick={() => setRecipeModalOpen(true)} className="btn-secondary w-full mt-4">Añadir Plato</button>
                    </div>

                    <div className="card">
                        <h2 className="card-title">Asignación de Roles</h2>
                        <div className="space-y-3">
                            {SERVICE_ROLES.map(role => (
                                <div key={role}>
                                    <label className="text-sm font-medium">{role}</label>
                                    <select 
                                        value={service.roleAssignments[role] || ''} 
                                        onChange={e => handleRoleAssignment(role, e.target.value)}
                                        className="input-style w-full mt-1"
                                    >
                                        <option value="">-- Sin Asignar --</option>
                                        {groupMembers.map(member => <option key={member.id} value={member.id}>{member.name}</option>)}
                                    </select>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Actions */}
                <div className="space-y-6">
                    <div className="card">
                        <h2 className="card-title">Generación de Documentación Automática</h2>
                        <div className="flex flex-col gap-3">
                            <button onClick={generateAllergenReport} className="btn-secondary">Informe de Alérgenos (PDF)</button>
                            <button onClick={generateServiceOrder} className="btn-secondary">Orden de Servicio (PDF)</button>
                        </div>
                    </div>
                    <div className="card border-2 border-green-500/50">
                        <h2 className="card-title">Creación Automática de Pedido</h2>
                        <p className="text-sm text-gray-500 mb-4">Analiza el menú y genera un borrador de pedido con todos los ingredientes necesarios.</p>
                        <button onClick={generateOrderDraft} className="btn-primary bg-green-600 hover:bg-green-700 w-full">Generar Borrador de Pedido</button>
                    </div>
                </div>
            </div>

            <SelectRecipeModal
                isOpen={isRecipeModalOpen}
                onClose={() => setRecipeModalOpen(false)}
                onSelect={handleAddDish}
                currentMenuRecipeIds={service.menu.map(d => d.recipeId)}
            />
            
            <style>{`
                .card { background-color: white; padding: 1.5rem; border-radius: 0.5rem; box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1); }
                .dark .card { background-color: #1F2937; }
                .card-title { font-size: 1.125rem; font-weight: 600; margin-bottom: 1rem; }
                .input-style { background-color: #F3F4F6; border-radius: 0.375rem; padding: 0.5rem 0.75rem; border: 1px solid #D1D5DB; } 
                .dark .input-style { background-color: #374151; border-color: #4B5563; }
                .btn-primary { padding: 0.5rem 1rem; font-weight: 500; color: white; background-color: #4F46E5; border-radius: 0.375rem; }
                .btn-secondary { padding: 0.5rem 1rem; font-weight: 500; color: #374151; background-color: #F3F4F6; border-radius: 0.375rem; }
                .dark .btn-secondary { background-color: #4B5563; color: #D1D5DB; }
            `}</style>
        </div>
    );
};

export default ServiceDetail;
