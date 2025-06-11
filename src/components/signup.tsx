"use client"

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { redirect } from "next/navigation";

type UserAuthFormProps = React.HTMLAttributes<HTMLDivElement>

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [email, setEmail] = React.useState<string>("")
  const [error, setError] = React.useState<string | null>(null)
  const [otp, setOtp] = React.useState<number>()
  const [isSent, setIsSent] = React.useState<boolean>(false)

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault()
    setIsLoading(true)
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    })
    if (res.redirected) {
      redirect(res.url)
      return;
    }
    if (!res.ok) {
      setIsLoading(false)
      setError("Failed to send email! Please try again after some time.")
      return;
    }
    setIsLoading(false);
    setIsSent(true);
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value)
  }

  async function handleOtp() {
    setIsLoading(true)
    const res = await fetch("/api/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp }),
    })
    if (!res.ok) {
      const errorData = await res.json()
      if (errorData.error) {
        setError(errorData.error)
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
      return;
    } else {
      setIsLoading(false);
      redirect("/onboarding")
    }
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <div className={cn("grid gap-6", className)} {...props}>
        {!isSent && <form onSubmit={onSubmit}>
          <p className="text-sm text-muted-foreground">
            Enter your email below to create your account
          </p>
          <div className="grid gap-2">
            <div className="grid gap-1">
              <Label className="sr-only" htmlFor="email">
                Email
              </Label>
              <Input
                onChange={handleChange}
                value={email}
                id="email"
                placeholder="name@example.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isLoading}
                required
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              Sign In with Email
            </Button>
          </div>
          {error && (
            <div className="text-red-500 text-sm mt-2">{error}</div>
          )}
        </form>}
      </div>
      <div className="flex flex-col space-y-2 justify-center text-center">
        {isSent && (
          <div className="flex flex-col space-y-2 justify-center text-center">
            <div className="flex flex-col space-y-2 text-center justify-center">
              <Label htmlFor="otp">Enter the verification code sent to your email</Label>
              <InputOTP
                maxLength={6}
                value={otp?.toString() || ''}
                onChange={(value) => setOtp(Number(value))}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button onClick={handleOtp} disabled={isLoading}>Verify Code</Button>
          </div>
        )}
      </div>
    </div>
  )
}