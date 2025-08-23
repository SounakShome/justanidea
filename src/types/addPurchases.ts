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

export type Variants = {
    id: string;
    name: string;
    size: string;
    price: number;
    product: Product;
};

export type Product = {
    id: string;
    name: string;
    HSN: number;
};

export type PurchaseItem = {
    id: string;
    quantity: number;
    price: number;
    discount: number;
    total: number;
};

export type PurchaseFormValues = {
    invoiceNo: string;
    purchaseDate: Date;
    supplierId: string;
    status: string;
    notes?: string;
    items: PurchaseItem[];
    subTotal: number;
    discount: number;
    taxableAmount: number;
    tax: string;
    igst?: number;
    cgst?: number;
    sgst?: number;
    totalAmount: number;
};

export type CompletedPurchase = {
    id: string;
    invoiceNo: string;
    purchaseOrderNumber?: string; // Optional for backward compatibility
    purchaseDate: Date;
    status: 'PENDING' | 'RECEIVED' | 'CANCELLED' | 'pending' | 'approved' | 'ordered' | 'received' | 'cancelled';
    notes?: string;
    subtotal: number;
    discount: number;
    taxableAmount: number;
    cgst?: number;
    sgst?: number;
    igst?: number;
    totalAmount: number;
    createdAt: Date;
    updatedAt: Date;
    supplier: {
        id: string;
        name: string;
        phone: string;
        address: string;
        GSTIN: string;
        PAN: string;
        CIN: string;
        Code: number;
        Supp_State: string;
        division: string;
    };
    items: Array<{
        id: string;
        quantity: number;
        unitPrice: number;
        discount: number;
        totalPrice: number;
        productName: string; // Derived from variant.product.name
        variantName: string; // Derived from variant.name
        size: string; // Derived from variant.size
        variant: {
            id: string;
            name: string;
            size: string;
            price: number;
            stock: number;
            sellingPrice: number;
        };
        product: {
            id: string;
            name: string;
            HSN: number;
        };
    }>;
    itemsSummary: {
        totalItems: number;
        totalQuantity: number;
        uniqueProducts: number;
        uniqueVariants: number;
    };
};