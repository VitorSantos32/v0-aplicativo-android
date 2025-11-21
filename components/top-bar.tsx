"use client"

import { Menu, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { NotificationsDropdown } from "@/components/notifications-dropdown"

interface TopBarProps {
  title?: string
  showNotifications?: boolean
  showMenu?: boolean
}

export function TopBar({ title = "Mais Vida", showNotifications = true, showMenu = false }: TopBarProps) {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchUnreadCount = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: conversations } = await supabase
          .from("conversations")
          .select("id")
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)

        if (conversations) {
          const conversationIds = conversations.map((c) => c.id)
          const { count } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .in("conversation_id", conversationIds)
            .neq("sender_id", user.id)
            .eq("read", false)

          setUnreadCount(count || 0)
        }
      }
    }

    fetchUnreadCount()
  }, [])

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

        <div className="flex items-center gap-2">
          <Link href="/messages">
            <Button variant="ghost" size="icon" className="text-white hover:text-orange-500 relative">
              <MessageCircle className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </Link>

          {showNotifications && <NotificationsDropdown />}
        </div>
      </div>
    </header>
  )
}
