import React from 'react';
import type { Receipt } from '../types';
import { ReceiptIcon, CheckCircleIcon, ClockIcon, XCircleIcon } from './icons';

interface DashboardProps {
    receipts: Receipt[];
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
    <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center space-x-4">
        <div className={`p-3 rounded-full ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-slate-500 text-sm font-medium">{title}</p>
            <p className="text-dark text-2xl font-bold">{value}</p>
        </div>
    </div>
);


export const Dashboard: React.FC<DashboardProps> = ({ receipts }) => {
    const totalReceipts = receipts.length;
    const totalAmount = receipts.reduce((sum, receipt) => sum + receipt.totalAmount, 0);
    const allItems = receipts.flatMap(r => r.items);
    
    const eligibilityCounts = allItems.reduce((acc, item) => {
        acc[item.manualEligibility] = (acc[item.manualEligibility] || 0) + 1;
        return acc;
    }, {} as { [key in import('../types').Eligibility]: number });

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-dark">Panel de Control</h2>
                <p className="text-sm text-slate-500">Resumen del expediente actual.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard title="Recibos Totales" value={totalReceipts} icon={<ReceiptIcon />} color="bg-blue-100 text-blue-600" />
                <StatCard title="Gasto Total" value={`€${totalAmount.toFixed(2)}`} icon={<div className="font-bold text-xl text-green-600">€</div>} color="bg-green-100" />
                <StatCard title="Gastos Subvencionables" value={eligibilityCounts['Subvencionable'] || 0} icon={<CheckCircleIcon />} color="bg-green-100 text-green-600" />
                <StatCard title="Gastos No Subvencionables" value={eligibilityCounts['No Subvencionable'] || 0} icon={<XCircleIcon />} color="bg-red-100 text-red-600" />
                <StatCard title="Pendientes Revisión" value={eligibilityCounts['Dudoso'] || 0} icon={<ClockIcon />} color="bg-yellow-100 text-yellow-600" />
            </div>

             <div className="p-5 rounded-xl border border-slate-200 bg-white">
                <h3 className="font-bold text-dark mb-4">Próximos Pasos</h3>
                <ul className="list-disc list-inside space-y-2 text-slate-600">
                    <li>Revisa los <span className="font-semibold">{eligibilityCounts['Dudoso'] || 0}</span> gastos marcados como 'Dudosos' en la pestaña de <span className="font-semibold text-primary">Revisión</span>.</li>
                    <li>Sube más recibos usando la pestaña de <span className="font-semibold text-primary">Subir Recibos</span>.</li>
                    <li>Cuando todos los gastos estén revisados, puedes exportar el informe final (funcionalidad próximamente).</li>
                </ul>
            </div>
        </div>
    );
};