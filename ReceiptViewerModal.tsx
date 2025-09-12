import React from 'react';
import type { Receipt, Eligibility } from './types';
import { CloseIcon } from './components/icons';
import { ELIGIBILITY, ELIGIBILITY_CLASSES } from './constants';

interface ReceiptViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    receipt: Receipt;
    onEligibilityChange: (itemId: string, newEligibility: Eligibility) => void;
}

export const ReceiptViewerModal: React.FC<ReceiptViewerModalProps> = ({ isOpen, onClose, receipt, onEligibilityChange }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-slate-50 p-6 rounded-xl shadow-xl w-full max-w-6xl h-[90vh] flex flex-col relative" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10">
                    <CloseIcon />
                </button>
                <h2 className="text-xl font-bold text-dark mb-4 shrink-0">
                    Recibo: <span className="font-normal">{receipt.storeName} - {new Date(receipt.transactionDate).toLocaleDateString()}</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-hidden">
                    {/* Viewer with PDF support */}
                    <div className="bg-slate-200 rounded-lg flex items-center justify-center overflow-auto p-2">
                        {receipt.mimeType === 'application/pdf' ? (
                            <iframe 
                                src={receipt.fileUrl} 
                                title={`Recibo de ${receipt.fileName}`} 
                                className="w-full h-full border-0"
                            />
                        ) : receipt.fileUrl ? (
                            <img src={receipt.fileUrl} alt={`Recibo de ${receipt.fileName}`} className="max-w-full max-h-full object-contain" />
                        ) : (
                            <p className="text-slate-500">No hay previsualización disponible.</p>
                        )}
                    </div>

                    {/* Items List */}
                    <div className="flex flex-col overflow-hidden">
                         <div className="flex justify-between items-baseline mb-2">
                            <h3 className="font-bold text-dark">Artículos Extraídos</h3>
                            <p className="text-sm font-semibold">Total: <span className="text-lg text-primary">€{receipt.totalAmount.toFixed(2)}</span></p>
                         </div>
                        <div className="bg-white rounded-lg border border-slate-200 overflow-y-auto flex-1">
                            <table className="w-full text-sm">
                                <thead className="sticky top-0 bg-slate-50">
                                    <tr>
                                        <th className="text-left p-3 font-medium text-slate-600">Descripción</th>
                                        <th className="text-right p-3 font-medium text-slate-600">Precio</th>
                                        <th className="text-left p-3 font-medium text-slate-600">Subvencionable</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {receipt.items.map((item) => (
                                        <tr key={item.id} className="border-t">
                                            <td className="p-3">
                                                <p className="font-medium text-dark">{item.description}</p>
                                                <p className="text-xs text-slate-500">{item.quantity} x €{(item.price / item.quantity).toFixed(2)} - {item.category}</p>
                                            </td>
                                            <td className="p-3 text-right font-semibold">€{item.price.toFixed(2)}</td>
                                            <td className="p-3">
                                                <select
                                                    value={item.manualEligibility}
                                                    onChange={(e) => onEligibilityChange(item.id, e.target.value as Eligibility)}
                                                    className={`w-full text-xs font-semibold border border-slate-200 rounded-md p-1 focus:ring-2 focus:ring-primary ${ELIGIBILITY_CLASSES[item.manualEligibility]}`}
                                                >
                                                    {ELIGIBILITY.map(status => <option key={status} value={status}>{status}</option>)}
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};