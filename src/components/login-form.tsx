"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EyeIcon, EyeClosed, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"


export function LoginForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"div">) {

    const searchParams = useSearchParams()
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Get error from URL params (Auth.js redirects with error)
    const authError = searchParams.get("error");

    const getErrorMessage = (error: string | null) => {
        if (!error) return null;
        
        switch (error) {
            case "CredentialsSignin":
                return "Invalid email or password. Please try again.";
            case "Configuration":
                return "Server configuration error. Please contact support.";
            case "AccessDenied":
                return "Access denied. You don't have permission to sign in.";
            case "Verification":
                return "Please verify your email before logging in.";
            default:
                return "An error occurred. Please try again.";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const result = await signIn("credentials", { 
                email, 
                password,
                redirect: false, // Don't redirect automatically
            });

            if (result?.error) {
                setError(getErrorMessage(result.error) || "Login failed. Please try again.");
            } else if (result?.ok) {
                // Successful login, redirect to dashboard
                window.location.href = "/dashboard";
            }
        } catch (err) {
            console.error("Login error:", err);
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        if (id === "email") {
            setEmail(value);
        } else if (id === "password") {
            setPassword(value);
        }
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Welcome back</CardTitle>
                    <CardDescription>
                        Login with your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="grid gap-6">
                        {(error || authError) && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    {error || getErrorMessage(authError)}
                                </AlertDescription>
                            </Alert>
                        )}
                        <div className="grid gap-6">                            
                            <div className="grid gap-6">                                
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        onChange={handleChange}
                                        value={email}
                                        id="email"
                                        type="email"
                                        placeholder="m@example.com"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <div className="flex items-center">
                                        <Label htmlFor="password">Password</Label>
                                        <a
                                            href="#"
                                            className="ml-auto text-sm underline-offset-4 hover:underline"
                                        >
                                            Forgot your password?
                                        </a>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            onChange={handleChange}
                                            value={password}
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter your password"
                                            required
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-1/2 -translate-y-1/2 px-3 h-full"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {!showPassword ? <EyeClosed className="h-4 w-4 text-black" /> : <EyeIcon className="h-4 w-4 text-black" />}
                                            <span className="sr-only">{showPassword ? "Hide" : "Show"} password</span>
                                        </Button>
                                    </div>
                                </div>
                                <Button disabled={loading} type="submit" className="w-full cursor-pointer">
                                    {loading ? "Logging in..." : "Login"}
                                </Button>
                            </div>
                            <div className="text-center text-sm">
                                Don&apos;t have an account?{" "}
                                <a href="/signup" className="underline underline-offset-4">
                                    Sign up
                                </a>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
            <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
                By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
                and <a href="#">Privacy Policy</a>.
            </div>
        </div>
    )
}