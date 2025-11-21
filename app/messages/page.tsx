import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TopBar } from "@/components/top-bar"
import { BottomNav } from "@/components/bottom-nav"
import { ConversationsList } from "@/components/conversations-list"
import { SearchUsers } from "@/components/search-users"

export default async function MessagesPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Buscar conversas do usuário
  const { data: conversations } = await supabase
    .from("conversations")
    .select(`
      id,
      user1_id,
      user2_id,
      updated_at,
      messages (
        content,
        created_at,
        sender_id,
        read
      )
    `)
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .order("updated_at", { ascending: false })

  // Buscar perfis dos outros usuários
  const otherUserIds = conversations?.map((conv) => (conv.user1_id === user.id ? conv.user2_id : conv.user1_id)) || []

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url")
    .in("id", otherUserIds)

  const conversationsWithProfiles = conversations?.map((conv) => {
    const otherUserId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id
    const otherUserProfile = profiles?.find((p) => p.id === otherUserId)
    const lastMessage = conv.messages?.[0]
    const unreadCount = conv.messages?.filter((m: any) => m.sender_id !== user.id && !m.read).length || 0

    return {
      ...conv,
      otherUser: otherUserProfile,
      lastMessage,
      unreadCount,
    }
  })

  return (
    <div className="min-h-screen bg-black pb-20 pt-16">
      <TopBar title="Mensagens" showNotifications={false} />

      <main className="max-w-lg mx-auto page-transition">
        {!conversationsWithProfiles || conversationsWithProfiles.length === 0 ? (
          <div className="p-4">
            <div className="text-center mb-6 mt-8">
              <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h2 className="text-white text-xl font-bold mb-2">Nenhuma conversa ainda</h2>
              <p className="text-gray-400 text-sm mb-6">Pesquise usuários abaixo para iniciar uma conversa</p>
            </div>
            <SearchUsers currentUserId={user.id} />
          </div>
        ) : (
          <ConversationsList conversations={conversationsWithProfiles} currentUserId={user.id} />
        )}
      </main>

      <BottomNav />
    </div>
  )
}
