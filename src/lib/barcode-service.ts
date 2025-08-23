import { prisma } from '@/lib/prisma';

export interface ProductLookupResult {
  success: boolean;
  product?: {
    id: string;
    name: string;
    HSN: number;
    barcode: string | null;
    barcodeType: string | null;
    variants: Array<{
      id: string;
      name: string;
      size: string;
      price: number;
      sellingPrice: number;
      stock: number;
      supplier?: {
        id: string;
        name: string;
      } | null;
    }>;
  };
  error?: string;
}

export class BarcodeService {
  /**
   * Lookup product by barcode
   */
  static async lookupProductByBarcode(barcode: string): Promise<ProductLookupResult> {
    try {
      const product = await prisma.products.findUnique({
        where: {
          barcode: barcode.trim()
        },
        include: {
          variants: {
            include: {
              supplier: {
                select: {
                  id: true,
                  name: true
                }
              }
            },
            orderBy: {
              name: 'asc'
            }
          }
        }
      });

      if (!product) {
        return {
          success: false,
          error: 'Product not found for this barcode'
        };
      }

      return {
        success: true,
        product: {
          id: product.id,
          name: product.name,
          HSN: product.HSN,
          barcode: product.barcode,
          barcodeType: product.barcodeType,
          variants: product.variants.map(variant => ({
            id: variant.id,
            name: variant.name,
            size: variant.size,
            price: variant.price,
            sellingPrice: variant.sellingPrice,
            stock: variant.stock,
            supplier: variant.supplier
          }))
        }
      };
    } catch (error) {
      console.error('Error looking up product by barcode:', error);
      return {
        success: false,
        error: 'Database error while looking up product'
      };
    }
  }

  /**
   * Search products by partial barcode or name
   */
  static async searchProducts(query: string, limit: number = 10): Promise<ProductLookupResult[]> {
    try {
      const products = await prisma.products.findMany({
        where: {
          OR: [
            {
              barcode: {
                contains: query.trim(),
                mode: 'insensitive'
              }
            },
            {
              name: {
                contains: query.trim(),
                mode: 'insensitive'
              }
            }
          ]
        },
        include: {
          variants: {
            include: {
              supplier: {
                select: {
                  id: true,
                  name: true
                }
              }
            },
            orderBy: {
              name: 'asc'
            }
          }
        },
        take: limit,
        orderBy: [
          {
            barcode: 'asc'
          },
          {
            name: 'asc'
          }
        ]
      });

      return products.map(product => ({
        success: true,
        product: {
          id: product.id,
          name: product.name,
          HSN: product.HSN,
          barcode: product.barcode,
          barcodeType: product.barcodeType,
          variants: product.variants.map(variant => ({
            id: variant.id,
            name: variant.name,
            size: variant.size,
            price: variant.price,
            sellingPrice: variant.sellingPrice,
            stock: variant.stock,
            supplier: variant.supplier
          }))
        }
      }));
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  /**
   * Add or update barcode for a product
   */
  static async updateProductBarcode(
    productId: string, 
    barcode: string, 
    barcodeType: string = 'CODE128'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if barcode already exists on another product
      const existingProduct = await prisma.products.findFirst({
        where: {
          barcode: barcode.trim(),
          NOT: {
            id: productId
          }
        }
      });

      if (existingProduct) {
        return {
          success: false,
          error: 'This barcode is already assigned to another product'
        };
      }

      await prisma.products.update({
        where: {
          id: productId
        },
        data: {
          barcode: barcode.trim(),
          barcodeType: barcodeType as any
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating product barcode:', error);
      return {
        success: false,
        error: 'Failed to update product barcode'
      };
    }
  }

  /**
   * Remove barcode from a product
   */
  static async removeProductBarcode(productId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await prisma.products.update({
        where: {
          id: productId
        },
        data: {
          barcode: null,
          barcodeType: null
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Error removing product barcode:', error);
      return {
        success: false,
        error: 'Failed to remove product barcode'
      };
    }
  }

  /**
   * Get all products with barcodes
   */
  static async getProductsWithBarcodes(limit: number = 50): Promise<ProductLookupResult[]> {
    try {
      const products = await prisma.products.findMany({
        where: {
          barcode: {
            not: null
          }
        },
        include: {
          variants: {
            include: {
              supplier: {
                select: {
                  id: true,
                  name: true
                }
              }
            },
            orderBy: {
              name: 'asc'
            }
          }
        },
        take: limit,
        orderBy: {
          name: 'asc'
        }
      });

      return products.map(product => ({
        success: true,
        product: {
          id: product.id,
          name: product.name,
          HSN: product.HSN,
          barcode: product.barcode,
          barcodeType: product.barcodeType,
          variants: product.variants.map(variant => ({
            id: variant.id,
            name: variant.name,
            size: variant.size,
            price: variant.price,
            sellingPrice: variant.sellingPrice,
            stock: variant.stock,
            supplier: variant.supplier
          }))
        }
      }));
    } catch (error) {
      console.error('Error getting products with barcodes:', error);
      return [];
    }
  }

  /**
   * Validate barcode format
   */
  static validateBarcode(barcode: string, format?: string): { isValid: boolean; message?: string } {
    const trimmedBarcode = barcode.trim();
    
    if (!trimmedBarcode) {
      return { isValid: false, message: 'Barcode cannot be empty' };
    }

    if (trimmedBarcode.length < 3) {
      return { isValid: false, message: 'Barcode must be at least 3 characters long' };
    }

    if (trimmedBarcode.length > 128) {
      return { isValid: false, message: 'Barcode cannot exceed 128 characters' };
    }

    // Basic format validation based on type
    if (format) {
      switch (format) {
        case 'EAN13':
          if (!/^\d{13}$/.test(trimmedBarcode)) {
            return { isValid: false, message: 'EAN-13 must be exactly 13 digits' };
          }
          break;
        case 'EAN8':
          if (!/^\d{8}$/.test(trimmedBarcode)) {
            return { isValid: false, message: 'EAN-8 must be exactly 8 digits' };
          }
          break;
        case 'UPC_A':
          if (!/^\d{12}$/.test(trimmedBarcode)) {
            return { isValid: false, message: 'UPC-A must be exactly 12 digits' };
          }
          break;
        case 'CODE39':
          if (!/^[A-Z0-9\-. $\/+%*]+$/.test(trimmedBarcode)) {
            return { 
              isValid: false, 
              message: 'Code 39 allows only A-Z, 0-9, and special characters (- . $ / + % *)' 
            };
          }
          break;
      }
    }

    return { isValid: true };
  }
}
