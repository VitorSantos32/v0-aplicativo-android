"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface SearchUsersProps {
  currentUserId: string
}

export function SearchUsers({ currentUserId }: SearchUsersProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)

  const handleSearch = async (query: string) => {
    setSearchQuery(query)

    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setSearching(true)

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .neq("id", currentUserId)
        .ilike("display_name", `%${query}%`)
        .limit(20)

      if (error) {
        console.error("Erro ao buscar usuários:", error)
        return
      }

      setSearchResults(data || [])
    } catch (error) {
      console.error("Erro ao buscar usuários:", error)
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="p-4">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Buscar usuários..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="bg-zinc-900 border-zinc-800 text-white placeholder:text-gray-500 pl-10"
        />
      </div>

      {searching && (
        <div className="text-center py-8">
          <p className="text-gray-400 text-sm">Procurando...</p>
        </div>
      )}

      {!searching && searchQuery && searchResults.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400 text-sm">Nenhum usuário encontrado</p>
        </div>
      )}

      <div className="space-y-2">
        {searchResults.map((profile) => (
          <Link
            key={profile.id}
            href={`/users/${profile.id}`}
            className="flex items-center gap-3 p-3 bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <Avatar className="w-12 h-12 border-2 border-orange-500">
              <AvatarImage src={profile.avatar_url || "/placeholder.svg?height=48&width=48"} />
              <AvatarFallback className="bg-orange-500 text-white">
                {profile.display_name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-white font-semibold">{profile.display_name || "Usuário"}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
