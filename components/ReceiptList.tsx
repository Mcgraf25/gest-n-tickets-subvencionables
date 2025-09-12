
import React from 'react';
import type { Receipt } from '../types';
// FIX: Changed Spinner import from './Spinner' to './icons' to use the correctly styled spinner for the reprocess button.
import { ViewIcon, TrashIcon, RefreshIcon, Spinner } from './icons';

interface ReceiptListProps {
    receipts: Receipt[];
    onViewReceipt: (receiptId: string) => void;
    onDeleteReceipt: (receiptId: string) => void;
    onReprocessReceipt: (receiptId: string) => void;
    reprocessingId: string | null;
}

export const ReceiptList: React.FC<ReceiptListProps> = ({ receipts, onViewReceipt, onDeleteReceipt, onReprocessReceipt, reprocessingId }) => {
    if (receipts.length === 0) {
        return (
            <div className="text-center py-10 text-slate-500 bg-white rounded-xl border border-slate-200">
                <h3 className="text-lg font-semibold text-dark">No hay recibos todavía</h3>
                <p className="mt-1 text-sm">Usa la pestaña 'Subir Recibos' para empezar a procesar gastos.</p>
            </div>
        );
    }
    return (
        <div className="space-y-6">
             <div>
                <h2 className="text-xl font-bold text-dark">Lista de Recibos</h2>
                <p className="text-sm text-slate-500">Todos los recibos procesados para el expediente actual.</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <ul className="divide-y divide-slate-200">
                    {receipts.map(receipt => (
                        <li key={receipt.id} className="p-4 hover:bg-slate-50 transition-colors">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-primary truncate">{receipt.storeName}</p>
                                    <p className="text-xs text-slate-500 mt-1">{receipt.fileName} - {new Date(receipt.transactionDate).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center space-x-2 sm:space-x-4 text-sm">
                                    <div className="text-right">
                                        <p className="font-bold text-dark">€{receipt.totalAmount.toFixed(2)}</p>
                                        <p className="text-xs text-slate-500">{receipt.items.length} artículos</p>
                                    </div>
                                    <button 
                                      onClick={() => onReprocessReceipt(receipt.id)} 
                                      disabled={!!reprocessingId}
                                      className="flex items-center text-sm bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold py-2 px-3 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {reprocessingId === receipt.id ? <Spinner /> : <RefreshIcon />}
                                        <span className="ml-2 hidden sm:inline">{reprocessingId === receipt.id ? 'Procesando...' : 'Reprocesar'}</span>
                                    </button>
                                    <button onClick={() => onViewReceipt(receipt.id)} className="flex items-center text-sm bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold py-2 px-3 rounded-lg transition duration-300">
                                        <ViewIcon />
                                        <span className="ml-2 hidden sm:inline">Ver</span>
                                    </button>
                                    <button onClick={() => onDeleteReceipt(receipt.id)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-md transition-colors" aria-label="Eliminar recibo">
                                        <TrashIcon />
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};
