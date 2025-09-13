import React, { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ReceiptUploader } from './components/ReceiptUploader';
import { ReceiptList } from './components/ReceiptList';
import { EligibilityView } from './components/EligibilityView';
import { ReceiptViewerModal } from './components/ReceiptViewerModal';
import { RulesConfigModal } from './components/RulesConfigModal';
import { CaseFileHeader } from './components/CaseFileHeader';
import { CaseFileConfigModal } from './components/CaseFileConfigModal';
import { DashboardIcon, UploadIcon, ListIcon, EligibilityIcon } from './components/icons';

import { extractReceiptInfo, isAIAvailable } from './services/geminiService';
import type { CaseFile, Receipt, Eligibility } from './types';

// Extend jsPDF with autoTable for TypeScript
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

const DEFAULT_GUIDELINES = `1. Gastos de alimentación son elegibles si son para reuniones de trabajo.
2. Material de oficina como bolígrafos, papel, etc. es elegible.
3. El transporte público es elegible. Taxis y VTC requieren justificación.
4. El alojamiento es elegible si es para viajes de trabajo fuera de la ciudad.
5. Software y hardware de tecnología son elegibles si son para uso profesional.
6. Cualquier gasto personal es estrictamente no elegible.
7. Los gastos marcados como 'Varios' deben ser revisados manualmente (Dudoso).`;

type Tab = 'dashboard' | 'upload' | 'list' | 'review';

const App: React.FC = () => {
  const [caseFiles, setCaseFiles] = useState<CaseFile[]>([]);
  const [currentCaseFileId, setCurrentCaseFileId] = useState<string | null>(null);
  const [guidelines, setGuidelines] = useState(DEFAULT_GUIDELINES);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [reprocessingId, setReprocessingId] = useState<string | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<Receipt | null>(null);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isCaseConfigModalOpen, setIsCaseConfigModalOpen] = useState(false);

  // IA disponible (clave en .env local). En producción, si no hay clave, queda desactivada.
  const aiEnabled = isAIAvailable();

  // Load data from localStorage on initial render
  useEffect(() => {
    try {
      const savedCaseFiles = localStorage.getItem('caseFiles');
      const savedCaseFileId = localStorage.getItem('currentCaseFileId');
      const savedGuidelines = localStorage.getItem('guidelines');

      const loadedFiles: CaseFile[] = savedCaseFiles ? JSON.parse(savedCaseFiles) : [];
      setCaseFiles(loadedFiles);

      if (savedCaseFileId && loadedFiles.some(cf => cf.id === savedCaseFileId)) {
        setCurrentCaseFileId(savedCaseFileId);
      } else if (loadedFiles.length > 0) {
        setCurrentCaseFileId(loadedFiles[0].id);
      } else {
        handleNewCase(true);
      }

      if (savedGuidelines) {
        setGuidelines(savedGuidelines);
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      handleNewCase(true);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('caseFiles', JSON.stringify(caseFiles));
      if (currentCaseFileId) {
        localStorage.setItem('currentCaseFileId', currentCaseFileId);
      }
      localStorage.setItem('guidelines', guidelines);
    } catch (error) {
      console.error("Failed to save data to localStorage", error);
    }
  }, [caseFiles, currentCaseFileId, guidelines]);

  const currentCaseFile = useMemo(
    () => caseFiles.find(cf => cf.id === currentCaseFileId),
    [caseFiles, currentCaseFileId]
  );

  const updateCaseFile = (updatedFile: Partial<CaseFile>) => {
    if (!currentCaseFileId) return;
    setCaseFiles(prev =>
      prev.map(cf => (cf.id === currentCaseFileId ? { ...cf, ...updatedFile } : cf))
    );
  };

  const processFileToReceipt = async (file: File): Promise<Receipt | null> => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = async e => {
        try {
          const fileUrl = e.target?.result as string;
          const base64Content = fileUrl.split(',')[1];
          const mimeType = file.type;

          const extractedData = await extractReceiptInfo(
            base64Content,
            mimeType,
            guidelines
          );

          if (extractedData) {
            const newReceipt: Receipt = {
              id: uuidv4(),
              fileName: file.name,
              fileUrl,
              base64Content,
              mimeType,
              ...extractedData,
              items: extractedData.items.map(item => ({
                ...item,
                id: uuidv4(),
                manualEligibility: item.eligibilitySuggestion
              }))
            };
            resolve(newReceipt);
          } else {
            resolve(null);
          }
        } catch (error) {
          console.error("Error processing file:", error);
          reject(error);
        }
      };
      reader.onerror = error => {
        console.error("FileReader error:", error);
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleProcessReceipts = async (files: File[]) => {
    if (!currentCaseFile) {
      alert("Por favor, crea o selecciona un expediente primero.");
      return;
    }
    if (!aiEnabled) {
      // No rompemos la app: informamos que no habrá análisis automático
      alert(
        "La reclasificación automática por IA está desactivada (no hay clave configurada). " +
        "Puedes subir y gestionar recibos igualmente; si activas la clave en local, hará el análisis automático."
      );
    }

    setIsLoading(true);
    try {
      const receiptPromises = files.map(file => processFileToReceipt(file));
      const newReceipts = (await Promise.all(receiptPromises)).filter(
        (r): r is Receipt => r !== null
      );

      if (newReceipts.length > 0) {
        updateCaseFile({
          receipts: [...(currentCaseFile?.receipts || []), ...newReceipts]
        });
      }

      if (newReceipts.length < files.length) {
        alert(
          `Se procesaron ${newReceipts.length} de ${files.length} recibos. Algunos archivos no pudieron ser procesados automáticamente.`
        );
      }
    } catch {
      alert(`Ocurrió un error al procesar los recibos.`);
    } finally {
      setIsLoading(false);
      if (files.length > 0) setActiveTab('list');
    }
  };

  const handleReprocessReceipt = async (receiptId: string) => {
    const receipt = currentCaseFile?.receipts.find(r => r.id === receiptId);
    if (!receipt) return;

    setReprocessingId(receiptId);
    try {
      const extractedData = await extractReceiptInfo(
        receipt.base64Content,
        receipt.mimeType,
        guidelines
      );
      if (extractedData) {
        const updatedReceipt: Receipt = {
          ...receipt,
          ...extractedData,
          items: extractedData.items.map(item => ({
            ...item,
            id: uuidv4(),
            manualEligibility: item.eligibilitySuggestion
          }))
        };
        updateCaseFile({
          receipts:
            currentCaseFile?.receipts.map(r =>
              r.id === receiptId ? updatedReceipt : r
            ) || []
        });
      } else {
        alert(`No se pudo reprocesar el recibo: ${receipt.fileName}`);
      }
    } catch (error) {
      console.error("Failed to reprocess receipt:", error);
      alert("Ocurrió un error al reprocesar el recibo.");
    } finally {
      setReprocessingId(null);
    }
  };

  const handleDeleteReceipt = (receiptId: string) => {
    if (!currentCaseFileId) return;
    if (window.confirm("¿Eliminar este recibo?")) {
      setCaseFiles(prevCaseFiles =>
        prevCaseFiles.map(caseFile => {
          if (caseFile.id === currentCaseFileId) {
            const updatedReceipts = caseFile.receipts.filter(r => r.id !== receiptId);
            return { ...caseFile, receipts: updatedReceipts };
          }
          return caseFile;
        })
      );
    }
  };

  const handleEligibilityChange = (itemId: string, newEligibility: Eligibility) => {
    const updatedReceipts =
      currentCaseFile?.receipts.map(r => ({
        ...r,
        items: r.items.map(item =>
          item.id === itemId ? { ...item, manualEligibility: newEligibility } : item
        )
      })) || [];
    updateCaseFile({ receipts: updatedReceipts });
  };

  const handleSaveGuidelines = (newGuidelines: string) => {
    setGuidelines(newGuidelines);
    setIsRulesModalOpen(false);
  };

  const handleNewCase = (isInitial = false) => {
    const newCase: CaseFile = {
      id: uuidv4(),
      name: `Expediente #${caseFiles.length + 1}`,
      description: "Nuevo expediente de subvenciones.",
      receipts: []
    };
    const updatedCaseFiles = [...caseFiles, newCase];
    setCaseFiles(updatedCaseFiles);
    setCurrentCaseFileId(newCase.id);
    if (!isInitial) setActiveTab('dashboard');
  };

  const handleSaveCaseConfig = (config: { name: string; description: string }) => {
    updateCaseFile(config);
    setIsCaseConfigModalOpen(false);
  };

  const handleResetCaseData = () => {
    if (!currentCaseFileId || !currentCaseFile) return;
    if (
      window.confirm(
        `¿Estás seguro? Se eliminarán TODOS los recibos del expediente "${currentCaseFile.name}". Esta acción no se puede deshacer.`
      )
    ) {
      const updatedCaseFiles = caseFiles.map(cf => {
        if (cf.id === currentCaseFileId) {
          return { ...cf, receipts: [] };
        }
        return cf;
      });
      setCaseFiles(updatedCaseFiles);
      setIsCaseConfigModalOpen(false);
    }
  };

  const handleDeleteCaseFile = () => {
    const caseNameToDelete = currentCaseFile?.name;
    if (!currentCaseFileId || !caseNameToDelete || caseFiles.length <= 1) {
      alert("No se puede eliminar el único expediente. Crea otro antes de borrar este.");
      return;
    }
    if (
      window.confirm(
        `¿Seguro que quieres ELIMINAR el expediente "${caseNameToDelete}"? Acción permanente.`
      )
    ) {
      const idToDelete = currentCaseFileId;
      const indexToDelete = caseFiles.findIndex(cf => cf.id === idToDelete);
      const newCaseFiles = caseFiles.filter(cf => cf.id !== idToDelete);
      setCaseFiles(newCaseFiles);
      const newActiveIndex = Math.max(0, indexToDelete - 1);
      setCurrentCaseFileId(
        newCaseFiles.length > 0 ? newCaseFiles[newActiveIndex].id : null
      );
      setIsCaseConfigModalOpen(false);
    }
  };

  const handleSwitchCase = (id: string) => {
    setCurrentCaseFileId(id);
    setActiveTab('dashboard');
  };

  const handleExportXLSX = () => {
    if (!currentCaseFile || currentCaseFile.receipts.length === 0) return;
    const dataToExport = currentCaseFile.receipts.flatMap(receipt =>
      receipt.items.map(item => ({
        Expediente: currentCaseFile.name,
        Recibo: receipt.fileName,
        Tienda: receipt.storeName,
        Fecha: new Date(receipt.transactionDate).toLocaleDateString(),
        Artículo: item.description,
        Cantidad: item.quantity,
        'Precio (€)': item.price,
        Subvencionable: item.manualEligibility
      }))
    );
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Gastos");
    XLSX.writeFile(workbook, `${currentCaseFile.name.replace(/\s+/g, '_')}_gastos.xlsx`);
  };

  const handleExportPDF = () => {
    if (!currentCaseFile || currentCaseFile.receipts.length === 0) return;
    const doc = new jsPDF() as jsPDFWithAutoTable;
    doc.setFontSize(18);
    doc.text(`Informe de Gastos: ${currentCaseFile.name}`, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(currentCaseFile.description, 14, 30);

    const tableColumn = ["Tienda", "Fecha", "Artículo", "Precio (€)", "Subvencionable"];
    const tableRows: (string | number)[][] = [];
    currentCaseFile.receipts.forEach(receipt => {
      receipt.items.forEach(item => {
        tableRows.push([
          receipt.storeName,
          new Date(receipt.transactionDate).toLocaleDateString(),
          item.description,
          item.price.toFixed(2),
          item.manualEligibility
        ]);
      });
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid'
    });
    doc.save(`${currentCaseFile.name.replace(/\s+/g, '_')}_informe.pdf`);
  };

  const allItems = useMemo(() => {
    return (
      currentCaseFile?.receipts.flatMap(r =>
        r.items.map(item => ({
          ...item,
          receiptFileName: r.fileName,
          receiptStore: r.storeName,
          receiptId: r.id
        }))
      ) || []
    );
  }, [currentCaseFile]);

  const renderContent = () => {
    if (!currentCaseFile) {
      return (
        <div className="text-center py-10 bg-white rounded-xl border">
          <h2 className="text-xl font-bold">No hay ningún expediente seleccionado</h2>
          <p className="text-slate-500 mt-2">Crea un nuevo expediente para empezar.</p>
        </div>
      );
    }
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard receipts={currentCaseFile.receipts} />;
      case 'upload':
        return (
          <ReceiptUploader
            onProcessReceipts={handleProcessReceipts}
            isLoading={isLoading}
          />
        );
      case 'list':
        return (
          <ReceiptList
            receipts={currentCaseFile.receipts}
            onViewReceipt={id =>
              setViewingReceipt(currentCaseFile.receipts.find(r => r.id === id) || null)
            }
            onDeleteReceipt={handleDeleteReceipt}
            onReprocessReceipt={handleReprocessReceipt}
            reprocessingId={reprocessingId}
          />
        );
      case 'review':
        return (
          <EligibilityView
            items={allItems}
            onEligibilityChange={handleEligibilityChange}
            onViewReceipt={id =>
              setViewingReceipt(currentCaseFile.receipts.find(r => r.id === id) || null)
            }
            guidelines={guidelines}
            onEditRules={() => setIsRulesModalOpen(true)}
            onImportRules={imported => setGuidelines(imported)}
          />
        );
      default:
        return null;
    }
  };

  const mainContent = renderContent();

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-800">
      <aside className="w-16 sm:w-56 bg-white flex flex-col shrink-0 border-r border-slate-200">
        <div className="p-4 border-b border-slate-200 flex items-center space-x-3">
          <div className="bg-primary p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold text-dark">Gestión de Gastos</h1>
            <p className="text-xs text-slate-500">Ayuntamiento</p>
          </div>
        </div>
        <nav className="p-4 flex-1 space-y-2">
          <TabButton tab="dashboard" label="Panel de Control" icon={<DashboardIcon />} activeTab={activeTab} setActiveTab={setActiveTab} />
          <TabButton tab="upload" label="Subir Recibos" icon={<UploadIcon />} activeTab={activeTab} setActiveTab={setActiveTab} />
          <TabButton tab="list" label="Lista de Recibos" icon={<ListIcon />} activeTab={activeTab} setActiveTab={setActiveTab} />
          <TabButton tab="review" label="Revisión" icon={<EligibilityIcon />} activeTab={activeTab} setActiveTab={setActiveTab} />
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onNewReceipt={() => setActiveTab('upload')}
          onExportPDF={handleExportPDF}
          onExportXLSX={handleExportXLSX}
          isExportDisabled={!currentCaseFile || currentCaseFile.receipts.length === 0}
        />

        {!aiEnabled && (
          <div className="mx-4 md:mx-6 mt-3 p-3 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 text-sm">
            La IA está desactivada (no hay API key configurada). Puedes usar la app con normalidad;
            si quieres análisis automático en local, crea un archivo <code>.env</code> con <code>VITE_GEMINI_API_KEY=... </code> (no lo subas).
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {currentCaseFile && (
            <CaseFileHeader
              caseFile={currentCaseFile}
              allCaseFiles={caseFiles}
              onSwitchCase={handleSwitchCase}
              onNewCase={() => handleNewCase()}
              onConfigureCase={() => setIsCaseConfigModalOpen(true)}
            />
          )}
          {mainContent}
        </main>
      </div>

      {viewingReceipt && (
        <ReceiptViewerModal
          isOpen={!!viewingReceipt}
          onClose={() => setViewingReceipt(null)}
          receipt={viewingReceipt}
          onEligibilityChange={handleEligibilityChange}
        />
      )}

      <RulesConfigModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
        onSave={handleSaveGuidelines}
        initialGuidelines={guidelines}
      />

      {currentCaseFile && (
        <CaseFileConfigModal
          isOpen={isCaseConfigModalOpen}
          onClose={() => setIsCaseConfigModalOpen(false)}
          onSave={handleSaveCaseConfig}
          onReset={handleResetCaseData}
          onDelete={handleDeleteCaseFile}
          caseFile={{ name: currentCaseFile.name, description: currentCaseFile.description }}
          isDeleteDisabled={caseFiles.length <= 1}
        />
      )}
    </div>
  );
};

const TabButton: React.FC<{
  tab: Tab;
  label: string;
  icon: React.ReactNode;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}> = ({ tab, label, icon, activeTab, setActiveTab }) => (
  <button
    onClick={() => setActiveTab(tab)}
    className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
      activeTab === tab ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'
    }`}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);

export default App;
