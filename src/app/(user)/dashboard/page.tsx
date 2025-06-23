import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { Loading } from "@/app/(user)/dashboard/load"

import data from "./data.json"
import { Suspense } from "react"
import { getUserFromDb } from "@/utils/auth"

export async function generateMetadata() {
  return {
    title: "Dashboard",
    description: "Manage your inventory efficiently with our user-friendly interface.",
  };
}


export default async function Page() {

  await getUserFromDb("sounakshome@gmail.com", "Sounak@2004").then((user) => {
    if (!user) {
      // redirect('/login')
    }
  });

  return (
    <>
      <div className="px-6">
        <SiteHeader name="Dashboard" />
      </div>
      <Suspense fallback={<Loading />}>
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
      </Suspense>
    </>
  )
}
