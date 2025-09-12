export const CATEGORIES = [
    "Alimentación",
    "Material de Oficina",
    "Transporte",
    "Alojamiento",
    "Servicios Profesionales",
    "Tecnología",
    "Varios"
] as const;

export const ELIGIBILITY = [
    "Subvencionable",
    "No Subvencionable",
    "Dudoso"
] as const;

export const ELIGIBILITY_CLASSES: { [key in typeof ELIGIBILITY[number]]: string } = {
    'Subvencionable': 'bg-green-100 text-green-800',
    'No Subvencionable': 'bg-red-100 text-red-800',
    'Dudoso': 'bg-yellow-100 text-yellow-800'
};