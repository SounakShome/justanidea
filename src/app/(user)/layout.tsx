import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner";
import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export async function generateMetadata() {
  const session = await auth();
  
  return {
    title: session.user.company.Name,
    description: `This is the  page.`,
  };
}


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (session?.user && session.user.company == null) {
    redirect('/company');
  }

  if (!session?.user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Please <Link className="text-blue-600 underline" href="/login">login</Link> to access this page
        </h1>
      </div>
    );
  }

  const userData = {
    name: session.user.username || "User",
    email: session.user.email || "",
    image: session.user.image || "./next.svg",
  }

  return (
    <div className="w-full">
      <SidebarProvider className="flex flex-row">
        <AppSidebar companyName={session.user.company.Name} userData={userData} variant="inset" />
        <div className="mt-2 flex flex-1 flex-col">
          <SidebarInset>
            <div className="pt-2 flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 md:gap-6">
                  {children}
                  <Toaster />
                </div>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
