import { prisma } from "@/lib/prisma";

export interface MappedPurchaseItem {
  id: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
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
}

export interface MappedPurchase {
  id: string;
  invoiceNo: string;
  purchaseDate: Date;
  status: string;
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
  items: MappedPurchaseItem[];
  itemsSummary: {
    totalItems: number;
    totalQuantity: number;
    uniqueProducts: number;
    uniqueVariants: number;
  };
}

export interface PurchasesResponse {
  success: boolean;
  data: MappedPurchase[];
  summary: {
    totalPurchases: number;
    totalAmount: number;
    totalItems: number;
    statusBreakdown: Record<string, number>;
    supplierBreakdown: Record<string, number>;
  };
}

/**
 * Fetches all purchases with complete mapping of variants and products
 * Returns a clean, non-redundant JSON object with all related data
 */
export async function fetchMappedPurchases(): Promise<PurchasesResponse> {
  try {
    const purchases = await prisma.purchaseOrder.findMany({
      include: {
        supplier: true,
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Map the purchases to a clean structure
    const mappedPurchases: MappedPurchase[] = purchases.map((purchase) => ({
      id: purchase.id,
      invoiceNo: purchase.invoiceNo,
      purchaseDate: purchase.Date,
      status: purchase.status,
      notes: purchase.notes || undefined,
      subtotal: purchase.subtotal,
      discount: purchase.discount,
      taxableAmount: purchase.taxableAmount,
      cgst: purchase.cgst || undefined,
      sgst: purchase.sgst || undefined,
      igst: purchase.igst || undefined,
      totalAmount: purchase.totalAmount,
      createdAt: purchase.createdAt,
      updatedAt: purchase.updatedAt,
      supplier: {
        id: purchase.supplier.id,
        name: purchase.supplier.name,
        phone: purchase.supplier.phone,
        address: purchase.supplier.address,
        GSTIN: purchase.supplier.GSTIN,
        PAN: purchase.supplier.PAN,
        CIN: purchase.supplier.CIN,
        Code: purchase.supplier.Code,
        Supp_State: purchase.supplier.Supp_State,
        division: purchase.supplier.division,
      },
      items: purchase.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        totalPrice: item.totalPrice,
        variant: {
          id: item.variant.id,
          name: item.variant.name,
          size: item.variant.size,
          price: item.variant.price,
          stock: item.variant.stock,
          sellingPrice: item.variant.sellingPrice,
        },
        product: {
          id: item.variant.product.id,
          name: item.variant.product.name,
          HSN: item.variant.product.HSN,
        },
      })),
      itemsSummary: {
        totalItems: purchase.items.length,
        totalQuantity: purchase.items.reduce((sum, item) => sum + item.quantity, 0),
        uniqueProducts: new Set(purchase.items.map(item => item.variant.productId)).size,
        uniqueVariants: purchase.items.length,
      },
    }));

    // Generate summary statistics
    const summary = {
      totalPurchases: mappedPurchases.length,
      totalAmount: mappedPurchases.reduce((sum, purchase) => sum + purchase.totalAmount, 0),
      totalItems: mappedPurchases.reduce((sum, purchase) => sum + purchase.itemsSummary.totalItems, 0),
      statusBreakdown: mappedPurchases.reduce((breakdown, purchase) => {
        breakdown[purchase.status] = (breakdown[purchase.status] || 0) + 1;
        return breakdown;
      }, {} as Record<string, number>),
      supplierBreakdown: mappedPurchases.reduce((breakdown, purchase) => {
        breakdown[purchase.supplier.name] = (breakdown[purchase.supplier.name] || 0) + 1;
        return breakdown;
      }, {} as Record<string, number>),
    };

    return {
      success: true,
      data: mappedPurchases,
      summary,
    };
  } catch (error) {
    console.error("Error fetching mapped purchases:", error);
    throw error;
  }
}

/**
 * Fetches a single purchase by ID with complete mapping
 */
export async function fetchMappedPurchaseById(purchaseId: string): Promise<MappedPurchase | null> {
  try {
    const purchase = await prisma.purchaseOrder.findUnique({
      where: { id: purchaseId },
      include: {
        supplier: true,
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!purchase) {
      return null;
    }

    return {
      id: purchase.id,
      invoiceNo: purchase.invoiceNo,
      purchaseDate: purchase.Date,
      status: purchase.status,
      notes: purchase.notes || undefined,
      subtotal: purchase.subtotal,
      discount: purchase.discount,
      taxableAmount: purchase.taxableAmount,
      cgst: purchase.cgst || undefined,
      sgst: purchase.sgst || undefined,
      igst: purchase.igst || undefined,
      totalAmount: purchase.totalAmount,
      createdAt: purchase.createdAt,
      updatedAt: purchase.updatedAt,
      supplier: {
        id: purchase.supplier.id,
        name: purchase.supplier.name,
        phone: purchase.supplier.phone,
        address: purchase.supplier.address,
        GSTIN: purchase.supplier.GSTIN,
        PAN: purchase.supplier.PAN,
        CIN: purchase.supplier.CIN,
        Code: purchase.supplier.Code,
        Supp_State: purchase.supplier.Supp_State,
        division: purchase.supplier.division,
      },
      items: purchase.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        totalPrice: item.totalPrice,
        variant: {
          id: item.variant.id,
          name: item.variant.name,
          size: item.variant.size,
          price: item.variant.price,
          stock: item.variant.stock,
          sellingPrice: item.variant.sellingPrice,
        },
        product: {
          id: item.variant.product.id,
          name: item.variant.product.name,
          HSN: item.variant.product.HSN,
        },
      })),
      itemsSummary: {
        totalItems: purchase.items.length,
        totalQuantity: purchase.items.reduce((sum, item) => sum + item.quantity, 0),
        uniqueProducts: new Set(purchase.items.map(item => item.variant.productId)).size,
        uniqueVariants: purchase.items.length,
      },
    };
  } catch (error) {
    console.error(`Error fetching purchase ${purchaseId}:`, error);
    throw error;
  }
}

/**
 * Filters purchases by various criteria
 */
export async function fetchFilteredPurchases(filters: {
  supplierId?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
}): Promise<PurchasesResponse> {
  try {
    const whereClause: any = {};

    if (filters.supplierId) {
      whereClause.supplierId = filters.supplierId;
    }

    if (filters.status) {
      whereClause.status = filters.status;
    }

    if (filters.startDate || filters.endDate) {
      whereClause.Date = {};
      if (filters.startDate) {
        whereClause.Date.gte = filters.startDate;
      }
      if (filters.endDate) {
        whereClause.Date.lte = filters.endDate;
      }
    }

    if (filters.minAmount || filters.maxAmount) {
      whereClause.totalAmount = {};
      if (filters.minAmount) {
        whereClause.totalAmount.gte = filters.minAmount;
      }
      if (filters.maxAmount) {
        whereClause.totalAmount.lte = filters.maxAmount;
      }
    }

    const purchases = await prisma.purchaseOrder.findMany({
      where: whereClause,
      include: {
        supplier: true,
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Map the purchases (reuse mapping logic)
    const mappedPurchases: MappedPurchase[] = purchases.map((purchase) => ({
      id: purchase.id,
      invoiceNo: purchase.invoiceNo,
      purchaseDate: purchase.Date,
      status: purchase.status,
      notes: purchase.notes || undefined,
      subtotal: purchase.subtotal,
      discount: purchase.discount,
      taxableAmount: purchase.taxableAmount,
      cgst: purchase.cgst || undefined,
      sgst: purchase.sgst || undefined,
      igst: purchase.igst || undefined,
      totalAmount: purchase.totalAmount,
      createdAt: purchase.createdAt,
      updatedAt: purchase.updatedAt,
      supplier: {
        id: purchase.supplier.id,
        name: purchase.supplier.name,
        phone: purchase.supplier.phone,
        address: purchase.supplier.address,
        GSTIN: purchase.supplier.GSTIN,
        PAN: purchase.supplier.PAN,
        CIN: purchase.supplier.CIN,
        Code: purchase.supplier.Code,
        Supp_State: purchase.supplier.Supp_State,
        division: purchase.supplier.division,
      },
      items: purchase.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        totalPrice: item.totalPrice,
        variant: {
          id: item.variant.id,
          name: item.variant.name,
          size: item.variant.size,
          price: item.variant.price,
          stock: item.variant.stock,
          sellingPrice: item.variant.sellingPrice,
        },
        product: {
          id: item.variant.product.id,
          name: item.variant.product.name,
          HSN: item.variant.product.HSN,
        },
      })),
      itemsSummary: {
        totalItems: purchase.items.length,
        totalQuantity: purchase.items.reduce((sum, item) => sum + item.quantity, 0),
        uniqueProducts: new Set(purchase.items.map(item => item.variant.productId)).size,
        uniqueVariants: purchase.items.length,
      },
    }));

    // Generate summary
    const summary = {
      totalPurchases: mappedPurchases.length,
      totalAmount: mappedPurchases.reduce((sum, purchase) => sum + purchase.totalAmount, 0),
      totalItems: mappedPurchases.reduce((sum, purchase) => sum + purchase.itemsSummary.totalItems, 0),
      statusBreakdown: mappedPurchases.reduce((breakdown, purchase) => {
        breakdown[purchase.status] = (breakdown[purchase.status] || 0) + 1;
        return breakdown;
      }, {} as Record<string, number>),
      supplierBreakdown: mappedPurchases.reduce((breakdown, purchase) => {
        breakdown[purchase.supplier.name] = (breakdown[purchase.supplier.name] || 0) + 1;
        return breakdown;
      }, {} as Record<string, number>),
    };

    return {
      success: true,
      data: mappedPurchases,
      summary,
    };
  } catch (error) {
    console.error("Error fetching filtered purchases:", error);
    throw error;
  }
}
