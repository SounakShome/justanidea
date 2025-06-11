export interface SizeDetail {
    size: string;
    qty: number;
    buyingPrice: number;
    sellingPrice: number;
  }
  
  export interface ProductVariant {
    name: string;
    sizes: SizeDetail[];
  }
  
  export interface Product {
    productId: string;
    variants: ProductVariant[];
  }