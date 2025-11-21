"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { NotificationsDropdown } from "@/components/notifications-dropdown"

interface TopBarProps {
  title?: string
  showNotifications?: boolean
  showMenu?: boolean
}

export function TopBar({ title = "Mais Vida", showNotifications = true, showMenu = false }: TopBarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-800">
      <div className="flex items-center justify-between h-16 px-4 max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          {showMenu && (
            <Button variant="ghost" size="icon" className="text-white hover:text-orange-500">
              <Menu className="w-6 h-6" />
            </Button>
          )}
          <div className="flex items-center gap-2">
            <Image
              src="/images/logo-mais-vida.jpg"
              alt="Academia Mais Vida"
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
            <span className="text-lg font-bold text-white">{title}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">{showNotifications && <NotificationsDropdown />}</div>
      </div>
    </header>
  )
}
