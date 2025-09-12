import React, { useState, useEffect } from 'react';
import type { CaseFile } from '../types';
import { CloseIcon, ResetIcon, TrashIcon } from './icons';

interface CaseFileConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (caseFile: { name: string; description: string }) => void;
    onReset: () => void;
    onDelete: () => void;
    caseFile: { name: string; description: string };
    isDeleteDisabled: boolean;
}

export const CaseFileConfigModal: React.FC<CaseFileConfigModalProps> = ({ isOpen, onClose, onSave, onReset, onDelete, caseFile, isDeleteDisabled }) => {
    const [name, setName] = useState(caseFile.name);
    const [description, setDescription] = useState(caseFile.description);

    useEffect(() => {
        if (isOpen) {
            setName(caseFile.name);
            setDescription(caseFile.description);
        }
    }, [caseFile, isOpen]);

    if (!isOpen) {
        return null;
    }
    
    const handleSave = () => {
        onSave({ name, description });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-slate-50 p-6 rounded-xl shadow-xl w-full max-w-lg relative" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                    <CloseIcon />
                </button>
                <div className="flex flex-col space-y-6">
                    <div>
                        <h2 id="modal-title" className="text-xl font-bold text-dark">Configurar Expediente</h2>
                        <p className="text-sm text-slate-500">Modifica la información del expediente actual</p>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="expediente-name" className="block text-sm font-medium text-slate-700 mb-1">
                                Nombre del Expediente <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="expediente-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-2 border bg-white border-slate-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
                            />
                        </div>
                        <div>
                            <label htmlFor="expediente-description" className="block text-sm font-medium text-slate-700 mb-1">
                                Descripción
                            </label>
                            <textarea
                                id="expediente-description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                placeholder="Ayudas subvencionables"
                                className="w-full p-2 border bg-white border-slate-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
                            />
                        </div>
                    </div>

                    <div className="p-4 border border-red-300 bg-red-50 rounded-lg">
                        <h3 className="text-md font-bold text-red-900">Acciones peligrosas</h3>
                        <div className="mt-3 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                             <button onClick={onReset} className="flex items-center justify-center text-sm bg-white hover:bg-red-100 shadow-sm border border-red-300 text-red-800 font-semibold py-2 px-3 rounded-lg transition duration-300">
                                <ResetIcon />
                                <span className="ml-2">Reiniciar datos</span>
                            </button>
                             <button 
                                onClick={onDelete} 
                                disabled={isDeleteDisabled}
                                className="flex items-center justify-center text-sm bg-red-600 hover:bg-red-700 shadow-sm border border-red-700 text-white font-semibold py-2 px-3 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-red-400"
                                title={isDeleteDisabled ? "No se puede eliminar el único expediente" : "Eliminar expediente permanentemente"}
                            >
                                <TrashIcon />
                                <span className="ml-2">Eliminar expediente</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3">
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