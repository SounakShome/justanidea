import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { Metadata } from "next"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"

import data from "./data.json"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Streamline your inventory management with our powerful yet easy-to-use system. Perfect for businesses of all sizes.",
};

export default function Page() {
  return (
    <>
      <div className="px-6">
        <SiteHeader name="Dashboard" />
      </div>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards />
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive />
            </div>
            <DataTable data={data} />
          </div>
        </div>
      </div>
    </>
  )
}
