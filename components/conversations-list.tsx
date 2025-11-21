"use client"

import type React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MessageCircle, Trash2 } from "lucide-react"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface ConversationsListProps {
  conversations: any[]
  currentUserId: string
}

export function ConversationsList({ conversations, currentUserId }: ConversationsListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()

  const handleDeleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setDeletingId(conversationId)

    try {
      const response = await fetch(`/api/conversations/delete?id=${conversationId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erro ao deletar conversa")
      }

      router.refresh()
    } catch (error) {
      console.error("Erro ao deletar conversa:", error)
      alert("Erro ao deletar conversa")
    } finally {
      setDeletingId(null)
    }
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <MessageCircle className="w-20 h-20 text-gray-600 mb-4" />
        <h2 className="text-white text-xl font-bold mb-2">Nenhuma mensagem ainda</h2>
        <p className="text-gray-400 text-center mb-6">Comece uma conversa procurando usuários na aba de pesquisa</p>
        <Link href="/search">
          <Button className="bg-orange-500 hover:bg-orange-600">Buscar Usuários</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="divide-y divide-zinc-800">
      {conversations.map((conversation) => (
        <div key={conversation.id} className="relative group">
          <Link href={`/messages/${conversation.id}`} className="block hover:bg-zinc-900/50 transition-colors">
            <div className="flex items-center gap-3 p-4 slide-in">
              <Avatar className="w-14 h-14 border-2 border-orange-500">
                <AvatarImage src={conversation.otherUser?.avatar_url || "/placeholder.svg?height=56&width=56"} />
                <AvatarFallback className="bg-orange-500 text-white">
                  {conversation.otherUser?.display_name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-white font-semibold truncate">
                    {conversation.otherUser?.display_name || "Usuário"}
                  </p>
                  {conversation.lastMessage && (
                    <p className="text-gray-400 text-xs">
                      {new Date(conversation.lastMessage.created_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-gray-400 text-sm truncate">
                    {conversation.lastMessage?.content || "Sem mensagens"}
                  </p>
                  {conversation.unreadCount > 0 && (
                    <span className="bg-orange-500 text-white text-xs rounded-full px-2 py-1 font-bold ml-2">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>

          <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  disabled={deletingId === conversation.id}
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-zinc-900 border-zinc-800">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Deletar conversa?</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-400">
                    Esta ação não pode ser desfeita. Todas as mensagens desta conversa serão permanentemente deletadas.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-zinc-800 text-white border-zinc-700">Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-500 hover:bg-red-600 text-white"
                    onClick={(e) => handleDeleteConversation(conversation.id, e)}
                  >
                    Deletar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      ))}
    </div>
  )
}
