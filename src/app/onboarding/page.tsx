"use client";

import React, { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Mail, ArrowRight } from "lucide-react"
import { redirect } from 'next/navigation';
// import { Building2 } from "lucide-react"

const Page = () => {

  const [isVerified, setIsVerified] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  // const [complete, setComplete] = useState(false);
  // const [companyName, setCompanyName] = useState("");
  // const [industry, setIndustry] = useState("");
  // const [gstin, setGstin] = useState("");
  // const [companySize, setCompanySize] = useState("");
  // const [businessAddress, setBusinessAddress] = useState("");
  // const [website, setWebsite] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Handle complete registration here
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    const res = await fetch("/api/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, fullName }),
    })
    if (res.redirected) {
      redirect(res.url);
    }
    if (res.ok) {
      setIsLoading(false);
      redirect("/login");
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true);
    // Handle form submission here
    const res = await fetch("/api/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email })
    })
    if (res.redirected) {
      redirect(res.url);
    } else {
      setIsVerified(true);
      setIsLoading(false);
    }
  }

  // const handleCompanySetup = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setIsLoading(true);
  //   // Handle company setup here
  //   console.log({ companyName, industry, gstin, companySize, businessAddress, website });
  //   const res = await fetch("/api/companies", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({ companyName, industry, gstin, companySize, businessAddress, website })
  //   })
  //   console.log("page", res);
  //   setIsLoading(false);
  // }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100">
      {!isVerified && <div className="w-full max-w-md">
        <div className="grid grid-cols-1 gap-4 p-1">
          {/* Main bento card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Join our newsletter</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500">We&apos;ll never share your email with anyone else.</p>
                </div>

                <Button
                  disabled={isLoading}
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2 transition-all flex items-center justify-center group"
                >
                  <span>Continue</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>
            </div>

            <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>}

      {isVerified  && <div className="w-full max-w-md">
        <div className="grid grid-cols-1 gap-4 p-1">
          {/* Main bento card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-green-100 p-2 rounded-full">
                  <Mail className="h-5 w-5 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Create your account</h2>
              </div>

              {/* Password step */}
                <div className="space-y-4">

                  <div className="space-y-2">
                    <label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                      Full name
                    </label>
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      required
                      className="w-full rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Create a password
                    </label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500"
                    />
                    <p className="text-xs text-gray-500">Password must be at least 8 characters</p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                      Confirm password
                    </label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>

                  <Button
                    disabled={isLoading}
                    type="submit"
                    onClick={handleCompleteRegistration}
                    className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-2 transition-all flex items-center justify-center group"
                  >
                    <span>Complete Registration</span>
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
            </div>
          </div>
        </div>
      </div>}

      {/* {isVerified &&complete && <div className="w-full max-w-md">
        <div className="grid grid-cols-1 gap-4 p-1">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-purple-100 p-2 rounded-full">
                  <Building2 className="h-5 w-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Set up your company</h2>
              </div>

              <form onSubmit={handleCompanySetup} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="companyName" className="text-sm font-medium text-gray-700">
                    Company name
                  </label>
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    id="companyName"
                    type="text"
                    placeholder="Acme Inc."
                    required
                    className="w-full rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="industry" className="text-sm font-medium text-gray-700">
                    Industry
                  </label>
                  <Input
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    id="industry"
                    type="text"
                    placeholder="Technology, Healthcare, etc."
                    required
                    className="w-full rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="gstin" className="text-sm font-medium text-gray-700">
                    GSTIN
                  </label>
                  <Input
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    id="gstin"
                    type="text"
                    placeholder="GSTIN..."
                    required
                    className="w-full rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="companySize" className="text-sm font-medium text-gray-700">
                    Company size
                  </label>
                  <select
                    value={companySize}
                    onChange={(e) => setCompanySize(e.target.value)}
                    id="companySize"
                    className="w-full rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-purple-500 p-2"
                    required
                  >
                    <option value="" defaultChecked disabled>Select company size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="501+">501+ employees</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="businessAddress" className="text-sm font-medium text-gray-700">
                    Business address
                  </label>
                  <Input
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    id="businessAddress"
                    type="text"
                    placeholder="123 Business Street, City"
                    required
                    className="w-full rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="website" className="text-sm font-medium text-gray-700">
                    Company website (optional)
                  </label>
                  <Input
                    value={website || ""}
                    onChange={(e) => setWebsite(e.target.value)}
                    id="website"
                    type="url"
                    placeholder="https://yourcompany.com"
                    className="w-full rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>

                <Button
                  disabled={isLoading}
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl py-2 transition-all flex items-center justify-center group"
                >
                  <span>Complete Setup</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>
            </div>

            <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                This information helps us personalize your dashboard experience.
              </p>
            </div>
          </div>
        </div>
      </div>} */}

    </main>
  )
}

export default Page