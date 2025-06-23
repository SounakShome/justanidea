import { Package } from "lucide-react"
import Link from "next/link";
import { LoginForm } from "@/components/login-form"
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {

  const session = await auth();
  if (session?.user) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted px-6 md:px-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" className="flex justify-center items-center space-x-2">
          <Package className="h-8 w-8 text-indigo-600" />
          <span className="font-bold text-xl text-gray-900 dark:text-white">StockMaster</span>
        </Link>
        <LoginForm />
      </div>
    </div>
  );
}
