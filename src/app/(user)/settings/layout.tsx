import { Metadata } from "next"
import { SiteHeader } from "@/components/site-header"

export const metadata: Metadata = {
  title: "Settings",
  description: "Advanced form example using react-hook-form and Zod.",
}

// const sidebarNavItems = [
//   {
//     title: "Profile",
//     href: "/settings/profile",
//   },
//   {
//     title: "Account",
//     href: "/settings/account",
//   },
//   {
//     title: "Company",
//     href: "/settings/company",
//   },
//   {
//     title: "Notifications",
//     href: "/settings/notifications",
//   },
// ]

interface SettingsLayoutProps {
  children: React.ReactNode
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <>
      <div className="px-6 pb-16">
        <div className="pb-10">
          <SiteHeader name="Settings" />
        </div>
        <div className="">
          <aside className="-mx-4 lg:w-1/5">
            {/* <SidebarNav items={sidebarNavItems} /> */}
          </aside>
          <div className="">{children}</div>
        </div>
      </div>
    </>
  )
}