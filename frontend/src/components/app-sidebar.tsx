"use client"

import * as React from "react"
import Link from "next/link"
import {
  Settings,
  User,
  Building2,
  Users,
  CalendarDays,
  FileText,
  LayoutDashboard,
  Boxes,
  HelpCircle,
} from "lucide-react"
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
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isMobile, setOpen, controlMode } = useSidebar()
  const navMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
      items: [
        {
          title: "Profil Masjid",
          url: "/dashboard/profil",
        },
      ],
    },
    {
      title: "Jamaah",
      url: "/jamaah",
      icon: Users,
      items: [
        {
          title: "Daftar Jamaah",
          url: "/jamaah",
        },
      ],
    },
    {
      title: "Reservasi",
      url: "/reservasi",
      icon: CalendarDays,
      items: [
        {
          title: "Manajemen Reservasi",
          url: "/reservasi",
        },
      ],
    },
    {
      title: "Donasi",
      url: "/donasi",
      icon: User,
      items: [
        {
          title: "Manajemen Donasi",
          url: "/donasi",
        },
      ],
    },
    {
      title: "Inventaris",
      url: "/inventaris",
      icon: Boxes,
      items: [
        {
          title: "Manajemen Inventaris",
          url: "/inventaris",
        },
      ],
    },
    {
      title: "Laporan",
      url: "/laporan",
      icon: FileText,
      items: [
        {
          title: "Ringkasan Laporan",
          url: "/laporan",
        },
      ],
    },
    {
      title: "Konten",
      url: "/konten",
      icon: Building2,
      items: [
        {
          title: "Manajemen Konten",
          url: "/konten",
        },
      ],
    },
    {
      title: "Pengaturan",
      url: "/pengaturan",
      icon: Settings,
      items: [
        {
          title: "Pengaturan Umum",
          url: "/pengaturan",
        },
      ],
    },
  ]

  const navSecondary = [
    {
      title: "Bantuan",
      url: "/bantuan",
      icon: HelpCircle,
    },
  ]

  const desktopHoverHandlers =
    !isMobile && controlMode === "hover"
      ? {
          onMouseEnter: () => setOpen(true),
          onMouseLeave: () => setOpen(false),
        }
      : {}

  return (
    <Sidebar collapsible="offcanvas" {...desktopHoverHandlers} {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size='lg' asChild>
                <Link href='/dashboard'>
                  <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
                    <Building2 className='size-4' />
                  </div>
                  <div className='grid flex-1 text-left text-sm leading-tight'>
                    <span className='truncate font-semibold'>
                      Masjid Baiturrahim
                    </span>
                    <span className='truncate text-xs text-sidebar-foreground/70'>Sistem Manajemen</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={navMain} />
          <NavSecondary items={navSecondary} className='mt-auto' />
        </SidebarContent>
        <SidebarFooter>
          <NavUser />
        </SidebarFooter>
        <SidebarRail />
    </Sidebar>
  );
}
