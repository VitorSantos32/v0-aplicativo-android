"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Bell, Heart, MessageCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"
import Image from "next/image"

interface Notification {
  id: string
  type: "like" | "comment"
  content: string | null
  read: boolean
  created_at: string
  post_id: string
  actor: {
    id: string
    display_name: string
    avatar_url: string | null
  }
}

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetchNotifications()
    subscribeToNotifications()
  }, [])

  const fetchNotifications = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data } = await supabase
        .from("notifications")
        .select(`
          id,
          type,
          content,
          read,
          created_at,
          post_id,
          actor:actor_id (
            id,
            display_name,
            avatar_url
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20)

      if (data) {
        setNotifications(data as any)
        setUnreadCount(data.filter((n) => !n.read).length)
      }
    }
  }

  const subscribeToNotifications = () => {
    const supabase = createClient()

    supabase
      .channel("notifications")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () => {
        fetchNotifications()
      })
      .subscribe()
  }

  const markAsRead = async (notificationId: string) => {
    const supabase = createClient()
    await supabase.from("notifications").update({ read: true }).eq("id", notificationId)
    fetchNotifications()
  }

  const markAllAsRead = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false)
      fetchNotifications()
    }
  }

  const deleteNotification = async (notificationId: string) => {
    const supabase = createClient()
    await supabase.from("notifications").delete().eq("id", notificationId)
    fetchNotifications()
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="text-white hover:text-orange-500 relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-12 w-80 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-50 max-h-[500px] overflow-hidden flex flex-col animate-slideIn">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <h3 className="font-semibold text-white">Notificações</h3>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-orange-500 hover:text-orange-400"
                  onClick={markAllAsRead}
                >
                  Marcar todas como lidas
                </Button>
              )}
            </div>

            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-zinc-500">
                  <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma notificação</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors ${
                      !notification.read ? "bg-zinc-800/30" : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      <Link href={`/users/${notification.actor.id}`} onClick={() => setIsOpen(false)}>
                        {notification.actor.avatar_url ? (
                          <Image
                            src={notification.actor.avatar_url || "/placeholder.svg"}
                            alt={notification.actor.display_name}
                            width={40}
                            height={40}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold">
                            {notification.actor.display_name[0]?.toUpperCase()}
                          </div>
                        )}
                      </Link>

                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/posts/${notification.post_id}`}
                          onClick={() => {
                            markAsRead(notification.id)
                            setIsOpen(false)
                          }}
                          className="block"
                        >
                          <div className="flex items-start gap-2">
                            {notification.type === "like" ? (
                              <Heart className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
                            ) : (
                              <MessageCircle className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                            )}
                            <div className="flex-1">
                              <p className="text-sm text-white">
                                <span className="font-semibold">{notification.actor.display_name}</span>
                                {notification.type === "like"
                                  ? " curtiu sua publicação"
                                  : " comentou em sua publicação"}
                              </p>
                              {notification.content && notification.type === "comment" && (
                                <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{notification.content}</p>
                              )}
                              <p className="text-xs text-zinc-500 mt-1">
                                {formatDistanceToNow(new Date(notification.created_at), {
                                  addSuffix: true,
                                  locale: ptBR,
                                })}
                              </p>
                            </div>
                          </div>
                        </Link>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 w-6 h-6 text-zinc-500 hover:text-white"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
