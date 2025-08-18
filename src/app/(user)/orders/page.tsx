import Orders from "@/components/pages/order";
import { Suspense } from "react";
import Loading from "@/app/(user)/loading";
import { auth } from "@/auth";

export async function generateMetadata() {
    return {
        title: "Orders",
        description: "View and manage your orders with ease.",
    };
}

export default async function Page() {
    const session = await auth();
    return (
        <Suspense fallback={<Loading />}>
            <Orders session={session} />
        </Suspense>
    );
}