"use client"

import Link from "next/link"
import {
  ChevronsUpDown,
  HelpCircle,
  LogOut,
  Settings,
  User,
} from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import type { OrgRole, UserRole } from "@/types"

function initialsFromName(fullName: string, email: string): string {
  const trimmed = fullName.trim()
  if (!trimmed) {
    return email.slice(0, 2).toUpperCase()
  }
  const parts = trimmed.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    const first = parts.at(0) ?? ""
    const last = parts.at(-1) ?? ""
    const a = first[0] ?? ""
    const b = last[0] ?? ""
    if (a && b) return `${a}${b}`.toUpperCase()
  }
  return trimmed.slice(0, 2).toUpperCase()
}

function userRoleLabel(role: UserRole): string {
  switch (role) {
    case "super_admin":
      return "Super admin"
    case "admin":
      return "Admin"
    case "editor":
      return "Editor"
    default:
      return role
  }
}

function orgRoleLabel(role: OrgRole): string {
  switch (role) {
    case "ketua":
      return "Ketua"
    case "sekretaris":
      return "Sekretaris"
    case "bendahara":
      return "Bendahara"
    case "humas":
      return "Humas"
    case "imam_syah":
      return "Imam Syah"
    case "muadzin":
      return "Muadzin"
    case "dai_amil":
      return "Dai Amil"
    case "marbot":
      return "Marbot"
    case "lainnya":
      return "Lainnya"
    default:
      return role
  }
}

function UserAccountMenuBody({
  displayName,
  email,
  avatarSrc,
  initials,
  role,
  orgRole,
  onLogout,
}: Readonly<{
  displayName: string
  email: string
  avatarSrc: string | undefined
  initials: string
  role: UserRole
  orgRole: OrgRole
  onLogout: () => void
}>) {
  return (
    <>
      <DropdownMenuLabel className="p-0 font-normal">
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar className="size-10 rounded-lg">
            <AvatarImage src={avatarSrc} alt={displayName} />
            <AvatarFallback className="rounded-lg bg-primary/15 text-sm font-semibold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="grid min-w-0 flex-1 text-left leading-tight">
            <span className="truncate font-semibold">{displayName}</span>
            <span className="truncate text-xs text-muted-foreground">{email}</span>
            <Badge variant="outline" className="mt-2 w-fit text-[10px] font-normal tracking-wide">
              {`${userRoleLabel(role)} • ${orgRoleLabel(orgRole)}`}
            </Badge>
          </div>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/dashboard/profil">
            <User />
            Profil masjid
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/pengaturan">
            <Settings />
            Pengaturan
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/bantuan">
            <HelpCircle />
            Bantuan
          </Link>
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
        onClick={onLogout}
      >
        <LogOut />
        Keluar
      </DropdownMenuItem>
    </>
  )
}

/** Menu akun di sidebar footer */
export function NavUser() {
  const { isMobile, state } = useSidebar()
  const { user, logout } = useAuth()

  if (!user) {
    return null
  }

  const displayName = user.full_name?.trim() || user.username || "Pengguna"
  const email = user.email
  const avatarSrc = user.avatar_url?.trim() || undefined
  const initials = initialsFromName(user.full_name || user.username, user.email)

  const handleLogout = async () => {
    try {
      await logout()
      toast.success("Anda telah keluar")
    } catch {
      toast.error("Gagal keluar, coba lagi")
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              title={!isMobile && state === "collapsed" ? displayName : undefined}
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="size-8 shrink-0 rounded-lg">
                <AvatarImage src={avatarSrc} alt={displayName} />
                <AvatarFallback className="rounded-lg bg-sidebar-primary/15 text-xs font-semibold text-sidebar-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-semibold">{displayName}</span>
                <span className="truncate text-xs text-sidebar-foreground/70">{email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 shrink-0 opacity-60 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-64 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <UserAccountMenuBody
              displayName={displayName}
              email={email}
              avatarSrc={avatarSrc}
              initials={initials}
              role={user.role}
              orgRole={user.org_role}
              onLogout={handleLogout}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

/** Menu akun kompak di site header (avatar) */
export function NavUserHeader({ className }: Readonly<{ className?: string }>) {
  const { user, logout } = useAuth()

  if (!user) {
    return null
  }

  const displayName = user.full_name?.trim() || user.username || "Pengguna"
  const email = user.email
  const avatarSrc = user.avatar_url?.trim() || undefined
  const initials = initialsFromName(user.full_name || user.username, user.email)

  const handleLogout = async () => {
    try {
      await logout()
      toast.success("Anda telah keluar")
    } catch {
      toast.error("Gagal keluar, coba lagi")
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "size-9 shrink-0 rounded-full border border-transparent bg-background ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring",
            className
          )}
          aria-label={`Menu akun: ${displayName}`}
        >
          <Avatar className="size-8">
            <AvatarImage src={avatarSrc} alt={displayName} />
            <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-64 rounded-lg" side="bottom" align="end" sideOffset={6}>
        <UserAccountMenuBody
          displayName={displayName}
          email={email}
          avatarSrc={avatarSrc}
          initials={initials}
          role={user.role}
          orgRole={user.org_role}
          onLogout={handleLogout}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
