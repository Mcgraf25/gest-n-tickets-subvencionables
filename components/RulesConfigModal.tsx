import React, { useState, useEffect } from 'react';
import { CloseIcon } from './icons';

interface RulesConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (guidelines: string) => void;
    initialGuidelines: string;
}

export const RulesConfigModal: React.FC<RulesConfigModalProps> = ({ isOpen, onClose, onSave, initialGuidelines }) => {
    const [guidelines, setGuidelines] = useState(initialGuidelines);

    useEffect(() => {
        if (isOpen) {
            setGuidelines(initialGuidelines);
        }
    }, [initialGuidelines, isOpen]);

    if (!isOpen) {
        return null;
    }

    const handleSave = () => {
        onSave(guidelines);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-slate-50 p-6 rounded-xl shadow-xl w-full max-w-2xl h-[80vh] flex flex-col relative" role="dialog" aria-modal="true" aria-labelledby="rules-modal-title" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                    <CloseIcon />
                </button>
                <div className="flex flex-col space-y-4 h-full">
                    <div>
                        <h2 id="rules-modal-title" className="text-xl font-bold text-dark">Editar Reglas de Subvencionabilidad</h2>
                        <p className="text-sm text-slate-500">Modifica las bases que la IA utiliza para analizar los recibos.</p>
                    </div>
                    
                    <textarea
                        value={guidelines}
                        onChange={(e) => setGuidelines(e.target.value)}
                        className="w-full h-full p-3 border bg-white border-slate-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition duration-150 font-mono text-sm flex-1"
                        placeholder="Introduce aquí las bases de la subvención..."
                    />

                    <div className="flex justify-end space-x-3 shrink-0">
                        <button onClick={onClose} className="bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold py-2 px-4 rounded-lg transition duration-300">
                            Cancelar
                        </button>
                        <button onClick={handleSave} className="bg-primary hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                            Guardar Cambios
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};