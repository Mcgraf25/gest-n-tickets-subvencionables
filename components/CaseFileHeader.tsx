import React from 'react';
import type { CaseFile } from '../types';
import { ConfigIcon, NewCaseIcon } from './icons';

interface CaseFileHeaderProps {
    caseFile: CaseFile | undefined;
    allCaseFiles: CaseFile[];
    onSwitchCase: (id: string) => void;
    onNewCase: () => void;
    onConfigureCase: () => void;
}

export const CaseFileHeader: React.FC<CaseFileHeaderProps> = ({ caseFile, allCaseFiles, onSwitchCase, onNewCase, onConfigureCase }) => {
    if (!caseFile) {
        return (
            <div className="flex justify-end items-center mb-6">
                 <button onClick={onNewCase} className="flex items-center text-sm bg-primary hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-lg transition duration-300">
                    <NewCaseIcon />
                    <span className="ml-2">Crear Primer Expediente</span>
                </button>
            </div>
        );
    }
    
    return (
        <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
            <div className="flex-1">
                {allCaseFiles.length > 1 ? (
                     <select 
                        value={caseFile.id}
                        onChange={(e) => onSwitchCase(e.target.value)}
                        className="text-xl md:text-2xl font-bold text-dark bg-transparent -ml-2 p-1 pr-8 border-0 focus:ring-2 focus:ring-primary rounded-md"
                        aria-label="Seleccionar expediente"
                    >
                        {allCaseFiles.map(cf => (
                            <option key={cf.id} value={cf.id}>{cf.name}</option>
                        ))}
                    </select>
                ) : (
                    <h2 className="text-xl md:text-2xl font-bold text-dark">{caseFile.name}</h2>
                )}
                <p className="text-sm text-slate-500 mt-1">{caseFile.description}</p>
            </div>
            <div className="flex items-center space-x-2 md:space-x-3 shrink-0 w-full md:w-auto">
                <button onClick={onNewCase} className="flex-1 sm:flex-none flex items-center justify-center text-sm bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold py-2 px-3 rounded-lg transition duration-300">
                    <NewCaseIcon />
                    <span className="ml-2">Nuevo Expediente</span>
                </button>
                <button onClick={onConfigureCase} className="flex-1 sm:flex-none flex items-center justify-center text-sm bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold py-2 px-3 rounded-lg transition duration-300">
                    <ConfigIcon />
                    <span className="ml-2">Configurar</span>
                </button>
            </div>
        </div>
    );
};
