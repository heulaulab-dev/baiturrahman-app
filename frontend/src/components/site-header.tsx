"use client"

import { usePathname } from "next/navigation"
import { SearchForm } from "@/components/search-form"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

function getBreadcrumbTitle(pathname: string): { title: string; href: string } {
  const segments = pathname.split("/").filter(Boolean)

  if (segments.length === 0 || pathname === "/dashboard") {
    return { title: "Dashboard", href: "/dashboard" }
  }

  const pathMap: Record<string, string> = {
    "dashboard": "Dashboard",
    "profil": "Profil Masjid",
    "jadwal": "Jadwal Sholat",
    "bulanan": "Jadwal Bulanan",
    "jamaah": "Jamaah",
    "kategori": "Kategori",
    "reservasi": "Reservasi",
    "ruang-rapat": "Ruang Rapat",
    "acara-khusus": "Acara Khusus",
    "donasi": "Donasi",
    "laporan": "Laporan",
    "konten": "Konten",
    "berita": "Berita & Artikel",
    "pengumuman": "Pengumuman",
    "kegiatan": "Kegiatan",
    "pengaturan": "Pengaturan",
    "struktur": "Struktur Organisasi",
    "pengguna": "Pengguna",
    "notifikasi": "Notifikasi",
    "bantuan": "Bantuan",
  }

  const currentTitle = pathMap[segments[segments.length - 1]] || segments[segments.length - 1]

  return {
    title: currentTitle,
    href: pathname,
  }
}

export function SiteHeader() {
  const pathname = usePathname()
  const breadcrumb = getBreadcrumbTitle(pathname)

  return (
    <header className="flex sticky top-0 z-50 h-14 w-full items-center border-b bg-background">
      <div className="flex h-full w-full items-center gap-2 px-4">
        <SidebarTrigger />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            {pathname !== "/dashboard" && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{breadcrumb.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
        <SearchForm className="w-full sm:ml-auto sm:w-auto" />
      </div>
    </header>
  )
}
