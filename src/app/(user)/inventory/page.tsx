import Inventory from "@/components/pages/inventory";

export async function generateMetadata() {
    return {
        title: "Inventory",
        description: "Manage your inventory efficiently with our user-friendly interface.",
    };
}

export default async function Page() {

    return (
        <>
            <div>
                <Inventory />
            </div>
        </>
    );
}