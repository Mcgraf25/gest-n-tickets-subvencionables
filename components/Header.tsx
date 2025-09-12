import React, { useState, useEffect, useRef } from 'react';
import { ExportIcon, NewReceiptIcon } from './icons';

interface HeaderProps {
    onNewReceipt: () => void;
    onExportXLSX: () => void;
    onExportPDF: () => void;
    isExportDisabled: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onNewReceipt, onExportXLSX, onExportPDF, isExportDisabled }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef]);

    return (
        <header className="bg-white border-b border-slate-200 print:hidden shrink-0">
            <div className="container mx-auto px-4 md:px-6 py-3 flex justify-end items-center">
                <div className="flex items-center space-x-2 md:space-x-3">
                    <div className="relative">
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            disabled={isExportDisabled}
                            className="flex items-center text-sm bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold py-2 px-3 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                            <ExportIcon />
                            <span className="ml-2 hidden sm:inline">Exportar</span>
                        </button>
                        {isMenuOpen && (
                            <div ref={menuRef} className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-slate-200">
                                <button onClick={() => { onExportXLSX(); setIsMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors">
                                    A Excel (XLSX)
                                </button>
                                <button onClick={() => { onExportPDF(); setIsMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors">
                                    A PDF
                                </button>
                            </div>
                        )}
                    </div>

                    <button onClick={onNewReceipt} className="flex items-center text-sm bg-primary hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-lg transition duration-300">
                        <NewReceiptIcon />
                        <span className="ml-2 hidden sm:inline">Nuevo Recibo</span>
                    </button>
                </div>
            </div>
        </header>
    );
};