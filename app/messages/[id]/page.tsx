import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ChatInterface } from "@/components/chat-interface"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DeleteConversationButton } from "@/components/delete-conversation-button"

export default async function ConversationPage({ params }: { params: { id: string } }) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const conversationId = params.id

  // Buscar a conversa
  const { data: conversation } = await supabase.from("conversations").select("*").eq("id", conversationId).single()

  if (!conversation) {
    redirect("/messages")
  }

  // Verificar se o usuário faz parte da conversa
  if (conversation.user1_id !== user.id && conversation.user2_id !== user.id) {
    redirect("/messages")
  }

  // Buscar o perfil do outro usuário
  const otherUserId = conversation.user1_id === user.id ? conversation.user2_id : conversation.user1_id
  const { data: otherUserProfile } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url")
    .eq("id", otherUserId)
    .single()

  // Buscar mensagens
  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })

  // Marcar mensagens como lidas
  await supabase
    .from("messages")
    .update({ read: true })
    .eq("conversation_id", conversationId)
    .neq("sender_id", user.id)
    .eq("read", false)

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-800">
        <div className="flex items-center gap-3 h-16 px-4 max-w-lg mx-auto">
          <Link href="/messages">
            <ArrowLeft className="w-6 h-6 text-white" />
          </Link>

          <Avatar className="w-10 h-10 border-2 border-orange-500">
            <AvatarImage src={otherUserProfile?.avatar_url || "/placeholder.svg?height=40&width=40"} />
            <AvatarFallback className="bg-orange-500 text-white">
              {otherUserProfile?.display_name?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <p className="text-white font-semibold">{otherUserProfile?.display_name || "Usuário"}</p>
          </div>

          <DeleteConversationButton conversationId={conversationId} />
        </div>
      </header>

      <main className="flex-1 pt-16 pb-4 max-w-lg mx-auto w-full page-transition">
        <ChatInterface conversationId={conversationId} currentUserId={user.id} initialMessages={messages || []} />
      </main>
    </div>
  )
}
