import QuickCreate from "@/components/pages/quickCreate";

export async function generateMetadata() {
    return {
        title: "Quick Create",
        description: "Quickly create new customers, suppliers, and products.",
    };

}

export default async function Page() {

    return (
        <div className="px-6 py-3">
            <QuickCreate />
        </div>
    );
}