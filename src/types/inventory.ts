export interface Variant {
    id: string;
    name: string;
    size: string;
    price: number;
    stock: number;
    productId: string;
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
    createdAt: string;
    updatedAt: string;
}