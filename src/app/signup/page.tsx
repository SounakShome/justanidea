import { Metadata } from "next"
import { Package } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { UserAuthForm } from "@/components/signup"
import { redirect } from "next/navigation"
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Authentication",
  description: "Authentication forms built using the components.",
}

export default async function AuthenticationPage() {

  const session = await auth();

  if(session?.user){
    redirect("/companies");
  }

  return (
    <div className="min-h-screen">
      <div className="container relative flex min-h-screen items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <Link
          href="/login"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "absolute right-4 top-4 md:right-8 md:top-8"
          )}
        >
          Login
        </Link>
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
          <div className="absolute inset-0 bg-zinc-900" />
          <div className="z-20 flex text-lg font-medium">
            <Link href="/" className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-indigo-600" />
              <span className="font-bold text-xl">StockMaster</span>
            </Link>
          </div>
        </div>
        <div className="w-full flex justify-center px-4 py-8 lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 max-w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <div className="lg:hidden z-20 justify-center py-2 flex text-lg font-medium">
                <Link href="/" className="flex items-center space-x-2">
                  <Package className="h-8 w-8 text-indigo-600" />
                  <span className="font-bold text-xl">StockMaster</span>
                </Link>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Create an account
              </h1>
            </div>
            <UserAuthForm />
            <p className="px-4 text-center text-sm text-muted-foreground sm:px-8">
              By clicking continue, you agree to our{" "}
              <Link
                href="/terms"
                className="underline underline-offset-4 hover:text-primary"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="underline underline-offset-4 hover:text-primary"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}