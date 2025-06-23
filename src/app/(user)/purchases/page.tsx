import PurchasesPage from "@/components/pages/purchases";

export async function generateMetadata() {
    return {
        title: "Purchases",
        description: "View and manage your orders with ease.",
    };
}

export default async function Purchases(){
    return (
        <>
            <PurchasesPage />
        </>
    );
}