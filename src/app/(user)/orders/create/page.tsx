import AddOrder from "@/components/pages/addOrder";
import { SiteHeader } from "@/components/site-header";

export async function generateMetadata() {
  return {
    title: "Create Order",
    description: "Create a new order with ease.",
  };
}

export default async function Page() {
  await new Promise((resolve) => setTimeout(resolve, 3000)); // Simulate a delay for demonstration
  return (
    <div className="px-6">
      <SiteHeader name="Create Order" />
      <AddOrder />
    </div>
  );
}