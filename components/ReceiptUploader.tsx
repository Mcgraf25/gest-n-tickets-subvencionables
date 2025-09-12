import React, { useState, useCallback } from 'react';
// FIX: Changed import to use the consolidated Spinner from icons.tsx for consistency.
import { Spinner } from './icons';

interface ReceiptUploaderProps {
    onProcessReceipts: (files: File[]) => void;
    isLoading: boolean;
}

export const ReceiptUploader: React.FC<ReceiptUploaderProps> = ({ onProcessReceipts, isLoading }) => {
    const [files, setFiles] = useState<File[]>([]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFiles(Array.from(event.target.files));
        }
    };

    const handleSubmit = useCallback(() => {
        onProcessReceipts(files);
        setFiles([]); // Clear files after submission
    }, [files, onProcessReceipts]);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-dark">Subir Recibos</h2>
                <p className="text-sm text-slate-500">Procesa nuevos gastos para el expediente actual. Las reglas de subvencionabilidad se pueden editar en la pestaña 'Revisión'.</p>
            </div>
            
            <div className="p-5 rounded-xl border border-slate-200 bg-white">
                <h3 className="text-lg font-semibold text-dark mb-2">Selecciona los Recibos</h3>
                <div className="p-6 border-2 border-dashed border-slate-300 rounded-lg text-center bg-slate-50">
                    <label htmlFor="receipt-files" className="cursor-pointer">
                        <p className="text-primary font-semibold">Haz clic para seleccionar los archivos</p>
                        <p className="text-xs text-slate-500 mt-1">(Puedes seleccionar múltiples imágenes o PDFs)</p>
                    </label>
                    <input id="receipt-files" type="file" multiple accept="image/*,application/pdf" onChange={handleFileChange} className="hidden" />
                    {files.length > 0 && (
                        <div className="mt-4 text-sm text-slate-600 text-left">
                            <p className="font-semibold">{files.length} archivo(s) seleccionado(s):</p>
                            <ul className="list-disc list-inside max-h-24 overflow-y-auto">
                                {files.map(f => <li key={f.name} className="truncate">{f.name}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            <button
                onClick={handleSubmit}
                disabled={isLoading || files.length === 0}
                className="w-full flex justify-center items-center bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition duration-300"
            >
                {isLoading ? <><Spinner className="-ml-1 mr-3" /> Procesando...</> : `Procesar ${files.length} Recibo(s)`}
            </button>
        </div>
    );
};
