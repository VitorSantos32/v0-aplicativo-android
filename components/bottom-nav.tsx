"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, PlusSquare, MessageSquare, User, Search } from "lucide-react"
import { cn } from "@/lib/utils"

export function BottomNav() {
  const pathname = usePathname()

  const links = [
    { href: "/feed", icon: Home, label: "Feed" },
    { href: "/create", icon: PlusSquare, label: "Postar" },
    { href: "/search", icon: Search, label: "Pesquisar" },
    { href: "/ai-coach", icon: MessageSquare, label: "IA Coach" },
    { href: "/profile", icon: User, label: "Perfil" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-900 border-t border-zinc-800">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
        {links.map((link) => {
          const isActive = pathname === link.href
          const Icon = link.icon

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-colors",
                isActive ? "text-orange-500" : "text-gray-400 hover:text-white",
              )}
            >
              <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-xs font-medium">{link.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
