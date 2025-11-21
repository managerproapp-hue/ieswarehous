// This is a new file: components/LabelPreviewModal.tsx

import React from 'react';
import { Recipe } from '../types';
import { useData } from '../contexts/DataContext';
import Modal from './Modal';

interface LabelPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe;
}

const LabelPreviewModal: React.FC<LabelPreviewModalProps> = ({ isOpen, onClose, recipe }) => {
    const { companyInfo, products } = useData();
    const productMap = new Map(products.map(p => [p.id, p]));

    const allergens = Array.from(new Set(
        recipe.ingredients.flatMap(ing => productMap.get(ing.productId)?.allergens || [])
    ));

    const handlePrint = () => {
        const printContents = document.getElementById('label-to-print')?.innerHTML;
        const originalContents = document.body.innerHTML;
        if (printContents) {
            const printWindow = window.open('', '', 'height=600,width=800');
            if(printWindow) {
                printWindow.document.write('<html><head><title>Imprimir Etiqueta</title>');
                printWindow.document.write('<style>body{font-family:sans-serif; text-align:center;} .label-container{border:2px solid black; padding:1rem; max-width:400px; margin:2rem auto;} .logo{height:3rem; margin-bottom:1rem} .recipe-name{font-size:1.5rem; font-weight:bold; text-transform:uppercase; margin-bottom:0.5rem;} .date-line{font-size:0.875rem; margin-bottom:1rem;} .ingredients{font-size:0.75rem; text-align:left;} .allergens-section{border-top:2px solid black; padding-top:0.5rem; margin-top:1rem;} .allergens-title{font-weight:bold; font-size:1.125rem; text-transform:uppercase;} .allergens-list{font-weight:bold; text-transform:uppercase;} </style>');
                printWindow.document.write('</head><body>');
                printWindow.document.write(printContents);
                printWindow.document.write('</body></html>');
                printWindow.document.close();
                printWindow.focus();
                printWindow.print();
                printWindow.close();
            }
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Previsualización de Etiqueta">
            <div id="label-to-print">
                <div className="label-container w-full max-w-md mx-auto border-2 border-black p-4 font-sans text-black bg-white">
                    {companyInfo.logoPDF && <img src={companyInfo.logoPDF} alt="Logo" className="logo h-12 mx-auto mb-4"/>}
                    <h2 className="recipe-name text-2xl font-bold text-center mb-2 uppercase">{recipe.name}</h2>
                    <p className="date-line text-center text-sm mb-4"><strong>Elaborado:</strong> {new Date().toLocaleDateString()}</p>
                    
                    <div className="ingredients text-xs">
                        <p><strong>Ingredientes:</strong> {recipe.ingredients.map(ing => productMap.get(ing.productId)?.name).join(', ')}.</p>
                    </div>

                    <div className="allergens-section mt-4 border-t-2 border-black pt-2">
                        <h3 className="allergens-title text-center font-bold text-lg">ALÉRGENOS</h3>
                        <p className="allergens-list text-center font-bold uppercase">
                            {/* Fix: Explicitly type 'a' as string to resolve toUpperCase error. */}
                            {allergens.length > 0 ? allergens.map((a: string) => a.toUpperCase()).join(', ') : 'No contiene alérgenos de declaración obligatoria.'}
                        </p>
                    </div>
                </div>
            </div>
            <div className="non-printable flex justify-end gap-4 mt-6">
                <button onClick={onClose} className="btn-secondary">Cancelar</button>
                <button onClick={handlePrint} className="btn-primary">Imprimir Etiqueta</button>
            </div>
             <style>{`
                .btn-primary { padding: 0.5rem 1rem; font-weight: 600; color: white; background-color: #4F46E5; border-radius: 0.5rem; }
                .btn-secondary { padding: 0.5rem 1rem; font-weight: 600; border: 1px solid #D1D5DB; border-radius: 0.5rem; }
            `}</style>
        </Modal>
    );
};

export default LabelPreviewModal;