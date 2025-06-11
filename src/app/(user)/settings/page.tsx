"use client"

import { useEffect } from "react"
import { redirect } from "next/navigation"
import { Separator } from "@/components/ui/separator"

export default function Settings() {

  useEffect(() => {
    redirect("/settings/profile");
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Settings</h3>
        <p className="text-sm text-muted-foreground">
          This is how others will see you on the site.
        </p>
      </div>
      <Separator />
    </div>
  )
}