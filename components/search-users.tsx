"use client"

import { useState } from "react"
import { Search, MessageCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface SearchUsersProps {
  currentUserId: string
}

export function SearchUsers({ currentUserId }: SearchUsersProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [startingChat, setStartingChat] = useState<string | null>(null)
  const router = useRouter()

  const handleSearch = async (query: string) => {
    setSearchQuery(query)

    if (query.trim().length < 2) {
      setUsers([])
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error("Erro ao pesquisar usuários:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartChat = async (userId: string) => {
    setStartingChat(userId)

    try {
      const response = await fetch("/api/conversations/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otherUserId: userId }),
      })

      if (response.ok) {
        const { conversationId } = await response.json()
        router.push(`/messages/${conversationId}`)
      }
    } catch (error) {
      console.error("Error creating conversation:", error)
    } finally {
      setStartingChat(null)
    }
  }

  return (
    <div className="p-4">
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Pesquisar usuários..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-gray-500 focus:border-orange-500"
        />
      </div>

      <div className="space-y-2">
        {isLoading && <p className="text-gray-400 text-sm text-center py-4">Pesquisando...</p>}

        {!isLoading && searchQuery.length >= 2 && users.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-4">Nenhum usuário encontrado</p>
        )}

        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-3 p-3 bg-zinc-900 rounded-lg border border-zinc-800 hover:border-orange-500 transition-colors slide-in"
          >
            <button
              onClick={() => handleStartChat(user.id)}
              disabled={startingChat === user.id || user.id === currentUserId}
              className="flex items-center gap-3 flex-1 text-left disabled:opacity-50"
            >
              <Avatar className="w-12 h-12 border-2 border-orange-500">
                <AvatarImage src={user.avatar_url || "/placeholder.svg?height=48&width=48"} />
                <AvatarFallback className="bg-orange-500 text-white">
                  {user.display_name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-white font-semibold">{user.display_name || "Usuário"}</p>
                {user.bio && <p className="text-gray-400 text-sm line-clamp-1">{user.bio}</p>}
              </div>
              {user.id !== currentUserId && <MessageCircle className="w-5 h-5 text-orange-500" />}
            </button>

            {user.id !== currentUserId && (
              <Link href={`/users/${user.id}`}>
                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white text-xs">
                  Ver perfil
                </Button>
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
