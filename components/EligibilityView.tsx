import React, { useState, useMemo, useEffect, useRef } from 'react';
// FIX: Corrected import paths to be relative to the components directory.
import type { ReceiptItem, Eligibility } from '../types';
import { ELIGIBILITY, ELIGIBILITY_CLASSES } from '../constants';
import { EditIcon, ImportIcon, ViewIcon } from './icons';

interface ExtendedReceiptItem extends ReceiptItem {
    receiptFileName: string;
    receiptStore: string;
    receiptId: string;
}

interface EligibilityViewProps {
    items: ExtendedReceiptItem[];
    onEligibilityChange: (itemId: string, newEligibility: Eligibility) => void;
    onViewReceipt: (receiptId: string) => void;
    guidelines: string;
    onEditRules: () => void;
    onImportRules: (guidelines: string) => void;
}

export const EligibilityView: React.FC<EligibilityViewProps> = ({ items, onEligibilityChange, onViewReceipt, guidelines, onEditRules, onImportRules }) => {
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const itemsForReview = useMemo(() => {
        return items.filter(item => item.manualEligibility === 'Dudoso');
    }, [items]);

    const selectedItem = useMemo(() => {
        return items.find(item => item.id === selectedItemId) ?? null;
    }, [selectedItemId, items]);
    
    // Auto-select the first item if the list appears and nothing is selected
    useEffect(() => {
        if (!selectedItemId && itemsForReview.length > 0) {
            setSelectedItemId(itemsForReview[0].id);
        }
    }, [itemsForReview, selectedItemId]);

    // If the selected item is no longer in the review list, deselect it
    useEffect(() => {
        if (selectedItemId && !itemsForReview.some(item => item.id === selectedItemId)) {
            setSelectedItemId(null);
        }
    }, [itemsForReview, selectedItemId]);


    const handleConfirmDecision = (newDecision: Eligibility, comments: string) => {
        if (selectedItem) {
            onEligibilityChange(selectedItem.id, newDecision);
            // After changing, the item will be filtered out. The useEffect will clear selection.
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                onImportRules(content);
            };
            reader.readAsText(file);
        }
        // Reset file input to allow re-uploading the same file
        if(event.target) {
            event.target.value = "";
        }
    };

    return (
        <div>
            <h2 className="text-xl font-bold text-dark mb-4">Revisión de Subvencionabilidad</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 p-5 rounded-xl border border-slate-200 bg-white flex flex-col">
                    <h3 className="font-bold text-dark">Reglas de Subvencionabilidad</h3>
                    <p className="text-sm text-slate-500 mb-4">Criterios aplicados por la IA para la sugerencia inicial.</p>
                    <div className="flex-1 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-700 overflow-auto max-h-60 mb-4">
                        <pre className="whitespace-pre-wrap font-sans">{guidelines}</pre>
                    </div>
                    <div className="flex space-x-2">
                        <button onClick={onEditRules} className="flex-1 flex items-center justify-center text-sm bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold py-2 px-3 rounded-lg transition duration-300">
                           <EditIcon /> <span className="ml-2">Editar Reglas</span>
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".txt,.md" className="hidden" />
                        <button onClick={handleImportClick} className="flex-1 flex items-center justify-center text-sm bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold py-2 px-3 rounded-lg transition duration-300">
                           <ImportIcon /> <span className="ml-2">Importar</span>
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-5 rounded-xl border border-slate-200 bg-white">
                        <h3 className="font-bold text-dark">Pendientes de Revisión</h3>
                        <p className="text-sm text-slate-500 mb-4">{itemsForReview.length} gastos que requieren decisión manual</p>
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                            {itemsForReview.length > 0 ? itemsForReview.map(item => (
                                <button key={item.id} onClick={() => setSelectedItemId(item.id)} className={`w-full text-left p-3 rounded-lg border-2 ${selectedItem?.id === item.id ? 'border-primary bg-indigo-50' : 'border-slate-200 hover:bg-slate-100'}`}>
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold text-sm text-dark truncate">{item.description}</p>
                                        <p className="font-bold text-primary text-sm">€{item.price.toFixed(2)}</p>
                                    </div>
                                    <p className="text-xs text-slate-500">{item.receiptStore}</p>
                                    <div className="mt-2">
                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${ELIGIBILITY_CLASSES[item.eligibilitySuggestion]}`}>
                                            Sugerencia IA: {item.eligibilitySuggestion}
                                        </span>
                                    </div>
                                </button>
                            )) : <div className="flex items-center justify-center h-4/5"><p className="text-center text-slate-500">¡No hay gastos pendientes de revisión!</p></div>}
                        </div>
                    </div>

                    <div className="p-5 rounded-xl border-2 border-primary/20 bg-white">
                        <h3 className="font-bold text-dark">Revisar Gasto</h3>
                        <p className="text-sm text-slate-500 mb-4">Toma una decisión final sobre el gasto seleccionado.</p>
                        
                        {!selectedItem ? <div className="flex items-center justify-center h-4/5"><p className="text-center text-slate-500">Selecciona un gasto de la lista para revisarlo.</p></div> : (
                            <div className="space-y-4">
                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                                    <p className="font-bold text-dark">{selectedItem.description}</p>
                                    <div className="text-sm text-slate-600 mt-1 grid grid-cols-2 gap-x-2">
                                        <span>Establ.: <span className="font-semibold">{selectedItem.receiptStore}</span></span>
                                        <span>Importe: <span className="font-semibold">€{selectedItem.price.toFixed(2)}</span></span>
                                    </div>
                                    <button onClick={() => onViewReceipt(selectedItem.receiptId)} className="mt-2 text-primary hover:underline flex items-center text-sm font-semibold">
                                       <ViewIcon /> <span className="ml-1.5">Ver Recibo Original</span>
                                    </button>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                                    <h4 className="text-sm font-semibold mb-1 text-slate-600">Sugerencia de la IA</h4>
                                    <p className={`text-sm font-bold ${selectedItem.eligibilitySuggestion === 'Subvencionable' ? 'text-green-700' : selectedItem.eligibilitySuggestion === 'No Subvencionable' ? 'text-red-700' : 'text-yellow-700'}`}>
                                        {selectedItem.eligibilitySuggestion}
                                    </p>
                                </div>
                                <DecisionForm key={selectedItem.id} item={selectedItem} onConfirm={handleConfirmDecision} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

interface DecisionFormProps {
    item: ExtendedReceiptItem;
    onConfirm: (decision: Eligibility, comments: string) => void;
}

const DecisionForm: React.FC<DecisionFormProps> = ({ item, onConfirm }) => {
    const [decision, setDecision] = useState<Eligibility>(item.manualEligibility);
    const [comments, setComments] = useState('');

    useEffect(() => {
        setDecision(item.manualEligibility);
        setComments('');
    }, [item]);

    const handleSubmit = () => {
        if (decision !== 'Dudoso') {
            onConfirm(decision, comments);
        } else {
            alert("Por favor, selecciona 'Subvencionable' o 'No Subvencionable' para confirmar la decisión.");
        }
    };

    return (
        <div className="space-y-3 pt-2">
            <div>
                <label htmlFor="decision" className="block text-sm font-medium text-slate-700 mb-1">Tu Decisión Final:</label>
                <select id="decision" value={decision} onChange={e => setDecision(e.target.value as Eligibility)} className="w-full p-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-secondary focus:border-secondary">
                    {ELIGIBILITY.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="comments" className="block text-sm font-medium text-slate-700 mb-1">Comentarios (opcional):</label>
                <textarea id="comments" value={comments} onChange={e => setComments(e.target.value)} rows={2} className="w-full p-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-secondary focus:border-secondary" placeholder="Añade una justificación..."></textarea>
            </div>
            <div className="flex space-x-2">
                 <button onClick={handleSubmit} disabled={decision === 'Dudoso'} className="w-full bg-primary text-white font-bold py-2 px-3 rounded-lg hover:bg-indigo-700 transition duration-300 disabled:bg-slate-400 disabled:cursor-not-allowed">
                     Confirmar Decisión
                 </button>
            </div>
        </div>
    );
};