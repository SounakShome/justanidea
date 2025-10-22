import AddOrder from "@/components/pages/addOrder";
import { SiteHeader } from "@/components/site-header";
import { prisma } from "@/lib/prisma";

export async function generateMetadata() {
  return {
    title: "Create Order",
    description: "Create a new order with ease.",
  };
}

export default async function Page() {
  try {
    // Fetch products with variants
    const productsRaw = await prisma.products.findMany({
      include: {
        variants: true,
      },
    });

    if (!productsRaw || productsRaw.length === 0) {
      return <div>No products available.</div>;
    }

    // Flatten variants with sizes into individual variant entries for compatibility
    const products = productsRaw.map(product => ({
      ...product,
      variants: product.variants.flatMap(variant => {
        // Parse sizes from JSON
        const sizes = Array.isArray(variant.sizes) ? variant.sizes : [];
        
        // Create a variant entry for each size
        return sizes.map((sizeData: any) => ({
          id: `${variant.id}-${sizeData.size}`,
          name: variant.name,
          size: sizeData.size,
          price: sizeData.sellingPrice || sizeData.buyingPrice,
          stock: sizeData.stock,
          productId: variant.productId,
          barcode: variant.barcode,
          supplierId: variant.supplierId,
        }));
      })
    }));
    
    return (
      <div className="px-6">
        <SiteHeader name="Create Order" />
        <AddOrder products={products} />
      </div>
    );
  } catch (error) {
    console.error('Error fetching products:', error);
    return <div>Error loading products. Please try again later.</div>;
  }
}