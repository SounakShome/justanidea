export interface Variant {
  name: string;
  size: string;
  qty: number;
  buyingPrice: number;
  sellingPrice?: number;
}

export interface PurchaseProduct {
  productId: string;
  variants: Variant[];
}

export interface Purchase {
  purchaseId: string;
  date?: Date | string;
  products: PurchaseProduct[];
}
