export interface OrderItem {
  product: string;
  requestedQty: number;
  availableQty?: number;
  rate?: number;
  discount?: number;
  discountType?: 'percentage' | 'amount' | 'none';
  productId?: string;
  variantId?: string;
  variantName?: string;
  price?: number;
}

export interface BillDiscount {
  type: 'percentage' | 'amount';
  value: number | undefined;
}

export interface SpecialDiscount {
  type: 'percentage' | 'amount' | 'none';
  value: number | undefined;
}

export interface TaxConfig {
  type: 'igst' | 'cgst_sgst';
  igstRate?: number;
  cgstRate?: number;
  sgstRate?: number;
}

export interface Order {
  id: string;
  customerName: string;
  date: string;
  amount: number;
  status: 'pending' | 'review' | 'approved';
  items: OrderItem[];
  billDiscount?: BillDiscount;
  specialDiscount?: SpecialDiscount;
  taxConfig?: TaxConfig;
  notes?: string | null;
  remarks?: string | null;
}

export type OrderStatus = 'pending' | 'review' | 'approved';
