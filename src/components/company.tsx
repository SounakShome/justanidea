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

const formSchema = z.object({
  companyName: z.string().min(1),
  industry: z.string().min(1),
  gstin: z.string().min(1),
  companySize: z.string(),
  address: z.string(),
  website: z.string().min(1).optional()
});

export default function MyForm() {

  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [gstin, setGstin] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState<string | null>(null);

  const form = useForm < z.infer < typeof formSchema >> ({
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
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  return (
    <div className="flex flex-col justify-center mx-auto min-h-screen py-2">
     <Form {...form}>
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
          render={({  }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl>
                <Input 
                placeholder="Acme Inc."
                onChange={(e) => setCompanyName(e.target.value)}
                value={companyName || ""}
                type="text"
                 />
              </FormControl>
              <FormDescription>This is your public display name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="industry"
          render={({  }) => (
            <FormItem>
              <FormLabel>Industry</FormLabel>
              <FormControl>
                <Input 
                placeholder="Technology, Healthcare, etc."
                onChange={(e) => setIndustry(e.target.value)}
                value={industry || ""}
                type="text"
                 />
              </FormControl>
              <FormDescription>This is your public display name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="gstin"
          render={({  }) => (
            <FormItem>
              <FormLabel>GSTIN</FormLabel>
              <FormControl>
                <Input 
                placeholder="GSTIN..."
                onChange={(e) => setGstin(e.target.value)}
                value={gstin || ""}
                type="text"
                />
              </FormControl>
              <FormDescription>This is your public display name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="companySize"
          render={({  }) => (
            <FormItem>
              <FormLabel>Company Size</FormLabel>
              <Select onValueChange={setCompanySize} value={companySize} >
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
          render={({  }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Address..."
                  className="resize-none"
                  rows={3}
                  onChange={(e) => setAddress(e.target.value)}
                  value={address || ""}
                />
              </FormControl>
              <FormDescription>You can @mention other users and organizations.</FormDescription>
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
    </Form>
    </div>
  )
}