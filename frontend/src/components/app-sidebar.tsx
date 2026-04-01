"use client"

import * as React from "react"
import Link from "next/link"
import {
  Settings,
  User,
  Building2,
  Calendar,
  Users,
  CalendarDays,
  FileText,
  LayoutDashboard,
  Bell,
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
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
  const { user } = useAuth()
  const { isMobile, setOpen, controlMode } = useSidebar()

  // Generate user data from auth context
  const userData = {
    name: user?.full_name || user?.username || "Admin",
    email: user?.email || "admin@baiturrahim.id",
    avatar: user?.avatar_url || "/avatars/admin.jpg",
  }

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
      title: "Jadwal Sholat",
      url: "/jadwal",
      icon: Calendar,
      items: [
        {
          title: "Jadwal Harian",
          url: "/jadwal",
        },
        {
          title: "Jadwal Bulanan",
          url: "/jadwal/bulanan",
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
        {
          title: "Kategori",
          url: "/jamaah/kategori",
        },
      ],
    },
    {
      title: "Reservasi",
      url: "/reservasi",
      icon: CalendarDays,
      items: [
        {
          title: "Ruang Rapat",
          url: "/reservasi/ruang-rapat",
        },
        {
          title: "Acara Khusus",
          url: "/reservasi/acara-khusus",
        },
      ],
    },
    {
      title: "Donasi",
      url: "/donasi",
      icon: User,
      items: [
        {
          title: "Riwayat Donasi",
          url: "/donasi",
        },
        {
          title: "Laporan Donasi",
          url: "/donasi/laporan",
        },
      ],
    },
    {
      title: "Laporan",
      url: "/laporan",
      icon: FileText,
      items: [
        {
          title: "Laporan Bulanan",
          url: "/laporan/bulanan",
        },
        {
          title: "Laporan Tahunan",
          url: "/laporan/tahunan",
        },
      ],
    },
    {
      title: "Konten",
      url: "/konten",
      icon: Building2,
      items: [
        {
          title: "Berita & Artikel",
          url: "/konten/berita",
        },
        {
          title: "Pengumuman",
          url: "/konten/pengumuman",
        },
        {
          title: "Kegiatan",
          url: "/konten/kegiatan",
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
        {
          title: "Struktur Organisasi",
          url: "/pengaturan/struktur",
        },
        {
          title: "Pengguna",
          url: "/pengaturan/pengguna",
        },
      ],
    },
  ]

  const navSecondary = [
    {
      title: "Notifikasi",
      url: "/notifikasi",
      icon: Bell,
    },
    {
      title: "Bantuan",
      url: "/bantuan",
      icon: User,
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
          <NavUser user={userData} />
        </SidebarFooter>
        <SidebarRail />
    </Sidebar>
  );
}
