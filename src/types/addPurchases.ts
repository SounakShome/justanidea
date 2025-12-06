// Database-aligned types for Purchase system

export type SizeData = {
    size: string;
    buyingPrice: number;
    sellingPrice: number;
    stock: number;
};

export type Supplier = {
    id: string;
    name: string;
    division: string;
    CIN: string;
    GSTIN: string;
    Supp_State: string;
    address: string;
    phone: string;
    PAN: string;
    Code: number;
};

export type Product = {
    id: string;
    name: string;
    HSN: number;
};

export type Variant = {
    id: string;
    productId: string;
    name: string; // Variant code like "1001 BOYLEG"
    supplierId: string | null;
    barcode: string | null;
    sizes: SizeData[]; // Array of size objects
    product: Product;
};

export type PurchaseItem = {
    variantId: string;
    size: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    totalPrice: number;
};

export type PurchaseFormValues = {
    invoiceNo: string;
    purchaseDate: Date;
    supplierId: string;
    status: 'PENDING' | 'ORDERED' | 'APPROVED' | 'RECEIVED' | 'CANCELLED';
    notes?: string;
    items: PurchaseItem[];
    subtotal: number;
    discount: number;
    discountType: 'percentage' | 'amount';
    taxableAmount: number;
    tax: 'igst' | 'sgst_cgst';
    igst?: number;
    cgst?: number;
    sgst?: number;
    totalAmount: number;
};

export type CompletedPurchase = {
    id: string;
    invoiceNo: string;
    Date: Date;
    status: 'PENDING' | 'ORDERED' | 'APPROVED' | 'RECEIVED' | 'CANCELLED';
    notes?: string | null;
    subtotal: number;
    discount: number;
    taxableAmount: number;
    cgst?: number | null;
    sgst?: number | null;
    igst?: number | null;
    totalAmount: number;
    createdAt: Date;
    updatedAt: Date;
    supplier: Supplier;
    items: Array<{
        id: string;
        variantId: string;
        size: string;
        quantity: number;
        unitPrice: number;
        discount: number;
        totalPrice: number;
        variant: {
            id: string;
            name: string;
            barcode: string | null;
            product: Product;
        };
    }>;
};
