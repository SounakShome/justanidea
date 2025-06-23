import Orders from "@/components/pages/order";
import { Suspense } from "react";
import Loading from "@/app/(user)/loading";

export async function generateMetadata() {
    return {
        title: "Orders",
        description: "View and manage your orders with ease.",
    };
}

export default async function Page() {
    await new Promise((resolve) => setTimeout(resolve, 3000)); // Simulate a delay for demonstration
    return (
        <Suspense fallback={<Loading />}>
            <Orders />
        </Suspense>
    );
}