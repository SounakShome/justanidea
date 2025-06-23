"use client"

import * as React from "react"
import {
  IconClipboard,
  IconLayoutDashboard,
  IconReceiptRupee,
  IconTransactionRupee,
  IconHelp,
  IconInnerShadowTop,
  IconArchive,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
  IconBriefcase,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconLayoutDashboard,
    },
    {
      title: "Inventory",
      url: "/inventory",
      icon: IconArchive,
    },
    {
      title: "Purchases",
      url: "/purchases",
      icon: IconClipboard,
    },
    {
      title: "Finance",
      url: "#",
      icon: IconTransactionRupee,
    },
    {
      title: "Team",
      url: "#",
      icon: IconUsers,
    },
    {
      title: "Orders",
      url: "/orders",
      icon: IconReceiptRupee,
    },
    {
      title: "Reports",
      url: "#",
      icon: IconReport,
    },
    {
      title: "Customers",
      url: "/customers",
      icon: IconBriefcase,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ]
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userData: {
    name: string;
    email: string;
    image: string;
  },
  companyName?: string;
} 

export function AppSidebar({ companyName, userData, ...props }: AppSidebarProps) {
  return (
    <Sidebar className="rounded-2xl" collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="rounded-2xl data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">{companyName}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{ name: userData.name, email: userData.email, avatar: userData.image }} />
      </SidebarFooter>
    </Sidebar>
  )
}
