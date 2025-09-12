
import { CATEGORIES, ELIGIBILITY } from './constants';

export type Category = typeof CATEGORIES[number];
export type Eligibility = typeof ELIGIBILITY[number];

export interface ReceiptItem {
    id: string;
    description: string;
    quantity: number;
    price: number;
    category: Category;
    eligibilitySuggestion: Eligibility;
    manualEligibility: Eligibility;
}

export interface Receipt {
    id: string;
    fileName: string;
    fileUrl: string; // base64 data URL
    base64Content: string; // raw base64 data
    mimeType: string;
    storeName: string;
    transactionDate: string; // YYYY-MM-DD
    totalAmount: number;
    items: ReceiptItem[];
}

export interface CaseFile {
    id: string;
    name: string;
    description: string;
    receipts: Receipt[];
}
