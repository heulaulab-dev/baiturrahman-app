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
import { useAuth } from "@/context/AuthContext"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isMobile, setOpen, controlMode } = useSidebar()
  const { hasPermission } = useAuth()
  const canAccessDashboard = hasPermission('access_dashboard')
  const canAccessJamaah = hasPermission('access_jamaah')
  const canAccessReservasi = hasPermission('access_reservasi')
  const canAccessDonasiMenu = hasPermission('access_donasi_menu')
  const canAccessInventaris = hasPermission('access_inventaris')
  const canAccessLaporanMenu = hasPermission('access_laporan_menu')
  const canAccessKonten = hasPermission('access_konten')
  const canAccessPengaturan = hasPermission('access_pengaturan')
  const canAccessRbacSettings = hasPermission('access_rbac_settings')

  const navMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      hidden: !canAccessDashboard,
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
      hidden: !canAccessJamaah,
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
      hidden: !canAccessReservasi,
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
      hidden: !canAccessDonasiMenu,
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
      hidden: !canAccessInventaris,
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
      hidden: !canAccessLaporanMenu,
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
      hidden: !canAccessKonten,
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
      hidden: !canAccessPengaturan,
      items: [
        {
          title: "Pengaturan Umum",
          url: "/pengaturan",
        },
        {
          title: "Akses & RBAC",
          url: "/pengaturan/rbac",
          hidden: !canAccessRbacSettings,
        },
      ],
    },
  ]
    .map((item) => ({
      ...item,
      items: item.items?.filter((subItem: any) => !subItem.hidden),
    }))
    .filter((item) => !item.hidden)

  const navSecondary = [
    {
      title: "Bantuan",
      url: "/bantuan",
      icon: HelpCircle,
    },
  ]

  // Offcanvas menyembunyikan sidebar sepenuhnya → tidak ada area untuk hover.
  // Mode hover & ikon memakai collapsible "icon" agar strip samping tetap ada lalu melebar saat di-hover.
  const sidebarCollapsible =
    controlMode === "expanded" ? "offcanvas" : "icon"

  const desktopHoverHandlers =
    !isMobile && controlMode === "hover"
      ? {
          onMouseEnter: () => setOpen(true),
          onMouseLeave: () => setOpen(false),
        }
      : {}

  return (
    <Sidebar collapsible={sidebarCollapsible} {...desktopHoverHandlers} {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild tooltip="Masjid Baiturrahim">
                <Link href="/dashboard">
                  <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Building2 className="size-4" />
                  </div>
                  <div className="grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-semibold">
                      Masjid Baiturrahim
                    </span>
                    <span className="truncate text-xs text-sidebar-foreground/70">Sistem Manajemen</span>
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
