export interface SizeData {
    size: string;
    buyingPrice: number;
    sellingPrice: number;
    stock: number;
}

export interface Variant {
    id: string;
    name: string;
    sizes: SizeData[];
    productId: string;
    barcode?: string | null;
    supplierId?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface Product {
    id: string;
    name: string;
    HSN: number;
    createdAt: string;
    updatedAt: string;
    variants: Variant[];
}

export interface ExtendedVariant extends Variant {
    productName: string;
    HSN: number;
}