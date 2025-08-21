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