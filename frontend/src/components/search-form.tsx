import type { ComponentProps } from "react"
import { Search } from "lucide-react"

import { Label } from "@/components/ui/label"
import { SidebarInput } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export function SearchForm({
  className,
  placeholder = "Cari di panel…",
  ...props
}: ComponentProps<"form"> & { placeholder?: string }) {
  return (
    <form className={cn(className)} {...props}>
      <div className="relative">
        <Label htmlFor="search" className="sr-only">
          Cari
        </Label>
        <SidebarInput
          id="search"
          placeholder={placeholder}
          className="h-8 pl-7"
        />
        <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50" />
      </div>
    </form>
  )
}
