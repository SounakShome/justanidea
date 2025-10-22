export type Customer = {
    id: string;
    name: string;
    phone: string;
    address: string;
    GSTIN: string;
    State_Name: string;
    Code: number;
};

export type Product = {
    id: string;
    name: string;
    HSN: number;
    variants: Variant[];
};

export type Variant = {
    id: string;
    name: string;
    size: string;
    price: number;
    stock: number;
    productId: string;
    barcode?: string | null;
    supplierId?: string | null;
};

export type OrderItem = {
    id: string;
    quantity: number;
    rate: number;
    total: number;
};

export type FormValues = {
    invoiceNo: string;
    orderDate: Date;
    customerId: string;
    status: string;
    notes?: string;
    items: OrderItem[];
    subTotal: number;
    totalAmount: number;
    billDiscountType?: 'percentage' | 'amount' | 'none';
    billDiscount?: number;
    remarks?: string;
};

export interface AddOrderProps {
    products: Product[];
}