"use client"

import React, { useState } from "react"
import {
  toast
} from "sonner"
import {
  useForm
} from "react-hook-form"
import {
  zodResolver
} from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Button
} from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Input
} from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Textarea
} from "@/components/ui/textarea"
import {
  Factory,
  X,
  Building2,
  Globe,
  MapPin,
  Users,
  FileText,
  Edit3,
  Sparkles,
  CheckCircle,
  ArrowRight
} from "lucide-react"
import { redirect } from "next/navigation"

const formSchema = z.object({
  companyName: z.string().min(1),
  industry: z.string().min(1),
  gstin: z.string().min(1),
  companySize: z.string(),
  address: z.string(),
  website: z.string().min(1).optional()
});

interface CompanyData {
  Name: string;
  Industry: string;
  GSTIN: string;
  CompanySize: string;
  Address: string;
  CompanyWebsite: string;
}

export default function MyForm({ data }: { data: CompanyData | null }) {

  const [edit, setEdit] = useState(!data);
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [gstin, setGstin] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),

  })

  async function onSubmit(e: { preventDefault: () => void }) {
    try {
      e.preventDefault();
      const values = {
        companyName,
        industry,
        gstin,
        companySize,
        address,
        website
      }
      console.log("Form submitted", values);
      await fetch("/api/company", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(values)
      });
      redirect("/dashboard");
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  return (
    <>
      {data && !edit && (
        <>
          {/* Hero Section */}
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
            <div className="relative p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">COMPANY PROFILE</span>
                  </div>
                  <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
                    {data?.Name || "Company Name"}
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
                    Managing your business operations with excellence and innovation.
                  </p>
                </div>
                <div className="flex flex-col items-end gap-4">
                  <div className="inline-flex items-center gap-3 px-6 py-3 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                    <Factory className="w-6 h-6 text-blue-500" />
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{data?.Industry || "Industry"}</span>
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">Verified Business</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Company Details Grid */}
          <div className="p-8 bg-gray-50 dark:bg-gray-900/50">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8 flex items-center gap-3">
                <Building2 className="w-6 h-6 text-blue-500" />
                Company Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* GSTIN Card */}
                <div className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">GSTIN</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">Tax Registration</p>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                      {data?.GSTIN || "GSTIN not provided"}
                    </p>
                  </div>
                </div>

                {/* Company Size Card */}
                <div className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-700">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Company Size</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">Employee Count</p>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                      {data?.CompanySize ? `${data.CompanySize} employees` : "Not specified"}
                    </p>
                  </div>
                </div>

                {/* Address Card */}
                <div className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-700 lg:col-span-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">Business Location</p>
                      </div>
                    </div>
                    <p className="font-medium text-gray-900 dark:text-gray-100 leading-relaxed">
                      {data?.Address || "Address not provided"}
                    </p>
                  </div>
                </div>
                
                {/* Website Card - Only show if website exists */}
                {data?.CompanyWebsite && (
                  <div className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-700 lg:col-span-2">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                          <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Website</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">Online Presence</p>
                        </div>
                      </div>
                      <a
                        href={data.CompanyWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors text-lg group"
                      >
                        {data.CompanyWebsite}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="flex justify-center pt-8">
                <Button
                  variant="default"
                  size="lg"
                  className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl border-0"
                  onClick={() => {
                    setEdit(true);
                    setCompanyName(data?.Name || "");
                    setIndustry(data?.Industry || "");
                    setGstin(data?.GSTIN || "");
                    setCompanySize(data?.CompanySize || "");
                    setAddress(data?.Address || "");
                    setWebsite(data?.CompanyWebsite || null);
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center gap-3">
                    <Edit3 className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                    <span className="font-semibold">Edit Company Details</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      
      {edit && (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
            <div className="relative px-8 py-12">
              <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12 relative">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-6">
                    <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">COMPANY REGISTRATION</span>
                  </div>
                  <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent mb-4">
                    {data ? 'Update Company Details' : 'Create Your Company Profile'}
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    {data ? 'Keep your company information up to date.' : 'Fill out the form below to set up your company profile.'}
                  </p>
                  {data && (
                    <Button
                      variant="ghost"
                      className="absolute top-0 right-0 p-3 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors group"
                      onClick={() => setEdit(false)}
                    >
                      <X className="w-6 h-6 text-gray-500 group-hover:text-red-500 transition-colors" />
                    </Button>
                  )}
                </div>

                {/* Form */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <div className="p-8 lg:p-12">
                    <Form {...form}>
                      <form onSubmit={onSubmit} className="space-y-8">

                        <FormField
                          control={form.control}
                          name="companyName"
                          render={({ }) => (
                            <FormItem className="space-y-3">
                              <FormLabel className="text-base font-semibold text-gray-700 dark:text-gray-300">
                                Company Name<span className="text-red-500 ml-1">*</span>
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                  <Input
                                    placeholder="Acme Inc."
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    value={companyName || ""}
                                    type="text"
                                    required
                                    className="pl-12 py-3 rounded-xl border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />                    <FormField
                      control={form.control}
                      name="industry"
                      render={({ }) => (
                        <FormItem>
                          <FormLabel>Industry <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Technology, Healthcare, etc."
                              onChange={(e) => setIndustry(e.target.value)}
                              value={industry || ""}
                              type="text"
                              required
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gstin"
                      render={({ }) => (
                        <FormItem>
                          <FormLabel>GSTIN<span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input
                              placeholder="GSTIN..."
                              onChange={(e) => setGstin(e.target.value)}
                              value={gstin || ""}
                              type="text"
                              required
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="companySize"
                      render={({ }) => (
                        <FormItem>
                          <FormLabel>Company Size<span className="text-red-500">*</span></FormLabel>
                          <Select onValueChange={setCompanySize} value={companySize} required >
                            <FormControl>
                              <SelectTrigger className="w-1/3 hover:cursor-pointer">
                                <SelectValue placeholder="Select a company size" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem className="cursor-pointer" value="1-10">1-10</SelectItem>
                              <SelectItem className="cursor-pointer" value="11-50">11-50</SelectItem>
                              <SelectItem className="cursor-pointer" value="51+">51+</SelectItem>
                            </SelectContent>
                          </Select>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ }) => (
                        <FormItem>
                          <FormLabel>Address<span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Address..."
                              className="resize-none"
                              rows={3}
                              onChange={(e) => setAddress(e.target.value)}
                              value={address || ""}
                              required
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="website"
                      render={({ }) => (
                        <FormItem>
                          <FormLabel>Company Website</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://yourcompany.com"
                              onChange={(e) => setWebsite(e.target.value)}
                              value={website || ""}
                              type="text"
                            />
                          </FormControl>
                          <FormDescription>This is your public display name.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      size="lg"
                      className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border-0 py-4 font-semibold"
                    >
                      {data ? 'Update Company' : 'Create Company'}
                    </Button>
                      </form>
                    </Form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}