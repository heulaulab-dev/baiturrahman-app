"use client"

import { Fragment } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Settings2 } from "lucide-react"
import { SearchForm } from "@/components/search-form"
import { NavUserHeader } from "@/components/nav-user"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  type SidebarControlMode,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  profil: "Profil masjid",
  jamaah: "Jamaah",
  kategori: "Kategori",
  reservasi: "Reservasi",
  "ruang-rapat": "Ruang rapat",
  "acara-khusus": "Acara khusus",
  donasi: "Donasi",
  inventaris: "Inventaris",
  laporan: "Laporan",
  konten: "Konten",
  berita: "Berita & artikel",
  pengumuman: "Pengumuman",
  kegiatan: "Kegiatan",
  pengaturan: "Pengaturan",
  struktur: "Struktur organisasi",
  pengguna: "Pengguna",
  bantuan: "Bantuan",
}

function formatSegmentLabel(segment: string): string {
  return (
    SEGMENT_LABELS[segment] ||
    segment
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
  )
}

function buildBreadcrumbs(pathname: string): { label: string; href: string }[] {
  const segments = pathname.split("/").filter(Boolean)

  if (segments.length === 0) {
    return [{ label: "Dashboard", href: "/dashboard" }]
  }

  if (segments.length === 1 && segments[0] === "dashboard") {
    return [{ label: "Dashboard", href: "/dashboard" }]
  }

  const crumbs: { label: string; href: string }[] = [
    { label: "Dashboard", href: "/dashboard" },
  ]

  segments.forEach((seg, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`
    if (href === "/dashboard") {
      return
    }
    crumbs.push({
      label: formatSegmentLabel(seg),
      href,
    })
  })

  return crumbs
}

export function SiteHeader() {
  const pathname = usePathname()
  const crumbs = buildBreadcrumbs(pathname)
  const { isMobile, controlMode, setControlMode } = useSidebar()
  const lastIndex = crumbs.length - 1

  return (
    <header
      className={cn(
        "sticky top-0 z-50 flex h-14 w-full shrink-0 items-center border-b border-border/80",
        "bg-background/95 shadow-sm backdrop-blur-md supports-backdrop-filter:bg-background/80"
      )}
    >
      <div className="flex h-full w-full min-w-0 items-center gap-2 px-3 sm:px-4">

        {isMobile === false ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0"
                  aria-label="Mode tampilan sidebar"
                >
                  <Settings2 className="size-4" />
                  <span className="sr-only">Mode sidebar</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                <DropdownMenuLabel className="font-normal text-muted-foreground">
                  Tampilan sidebar
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={controlMode}
                  onValueChange={(value) => setControlMode(value as SidebarControlMode)}
                >
                  <DropdownMenuRadioItem value="expanded">Buka penuh</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="collapsed">Ikon saja</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="hover">Buka saat di-hover</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
        ) : null}

        <Separator orientation="vertical" className="hidden h-6 sm:block" />

        {/* Desktop breadcrumb */}
        <Breadcrumb className="hidden min-w-0 flex-1 sm:flex">
          <BreadcrumbList className="flex-nowrap">
            {crumbs.map((crumb, i) => (
              <Fragment key={crumb.href}>
                <BreadcrumbItem className="min-w-0">
                  {i === lastIndex ? (
                    <BreadcrumbPage className="max-w-[40vw] truncate font-medium text-foreground md:max-w-none">
                      {crumb.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={crumb.href} className="max-w-[32vw] truncate md:max-w-56">
                        {crumb.label}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {i < lastIndex ? <BreadcrumbSeparator /> : null}
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        {/* Mobile: current page only */}
        <div className="flex min-w-0 flex-1 items-center sm:hidden">
          <span className="truncate text-sm font-medium text-foreground">
            {crumbs.at(-1)?.label ?? "Dashboard"}
          </span>
        </div>

        <div className="ml-auto flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
          <NavUserHeader />
          <Separator orientation="vertical" className="hidden h-6 sm:block" />
          <SearchForm className="w-[min(12rem,30vw)] sm:w-full sm:max-w-xs" />
        </div>
      </div>
    </header>
  )
}
