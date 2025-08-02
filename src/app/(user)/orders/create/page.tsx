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
    // Directly fetch from database instead of API route for better performance
    const products = await prisma.products.findMany({
      include: {
        variants: true,
      },
    });

    if (!products || products.length === 0) {
      return <div>No products available.</div>;
    }
    
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