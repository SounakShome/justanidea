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
import { Factory, X } from "lucide-react"

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

export default function MyForm({ data }: { data: CompanyData }) {

  const [edit, setEdit] = useState(false);
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
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  return (
    <>
      <div className="p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <span className="inline-block text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">COMPANY PROFILE</span>
            <h2 className="text-3xl font-bold tracking-tight">{data.Name || "Company Name"}</h2>
          </div>
          <div className="inline-flex items-center px-3 py-1 gap-4 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            <Factory className="w-4 h-4" />{data.Industry || "Industry"}
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">GSTIN</p>
            </div>
            <p className="font-medium">{data.GSTIN || "GSTIN not provided"}</p>
          </div>

          <div className="space-y-2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Company Size</p>
            </div>
            <p className="font-medium">{data.CompanySize || "Not specified"}</p>
          </div>

          <div className="space-y-2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md md:col-span-2">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</p>
            </div>
            <p className="font-medium">{data.Address || "Address not provided"}</p>
          </div>

          {data.CompanyWebsite && (
            <div className="space-y-2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md md:col-span-2">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Website</p>
              </div>
              <a
                href={data.CompanyWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                {data.CompanyWebsite}
              </a>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          {(!edit) ?  <Button
            variant="default"
            className="hover:cursor-pointer flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md"
            onClick={() => {
              setEdit(true);
              setCompanyName(data.Name || "");
              setIndustry(data.Industry || "");
              setGstin(data.GSTIN || "");
              setCompanySize(data.CompanySize || "");
              setAddress(data.Address || "");
              setWebsite(data.CompanyWebsite || null);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
            </svg>
            Edit Details
          </Button> : <X className="w-6 h-6 hover:cursor-pointer" onClick={() => setEdit(false)} />}
        </div>
        {edit && <Form {...form}>
          <div className="mb-8 pt-5 w-full text-center">
            <h2 className="text-3xl font-bold tracking-tight">Company Registration</h2>
            <p className="text-muted-foreground mt-2">
              Please fill out the form below with your company details.
            </p>
          </div>
          <form onSubmit={onSubmit} className="w-full mx-auto space-y-8 max-w-3xl py-10">
  
            <FormField
              control={form.control}
              name="companyName"
              render={({ }) => (
                <FormItem>
                  <FormLabel>Company Name<span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Acme Inc."
                      onChange={(e) => setCompanyName(e.target.value)}
                      value={companyName || ""}
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
            <Button type="submit">Submit</Button>
          </form>
        </Form>}
      </div>
    </>
  )
}