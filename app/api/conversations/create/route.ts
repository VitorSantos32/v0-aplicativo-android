import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { otherUserId } = await request.json()

    if (!otherUserId) {
      return NextResponse.json({ error: "Other user ID is required" }, { status: 400 })
    }

    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Não permitir conversa consigo mesmo
    if (user.id === otherUserId) {
      return NextResponse.json({ error: "Cannot create conversation with yourself" }, { status: 400 })
    }

    // Verificar se já existe uma conversa entre esses usuários
    const { data: existingConversation } = await supabase
      .from("conversations")
      .select("id")
      .or(
        `and(user1_id.eq.${user.id},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${user.id})`,
      )
      .maybeSingle()

    if (existingConversation) {
      return NextResponse.json({ conversationId: existingConversation.id })
    }

    // Criar nova conversa
    const { data: newConversation, error } = await supabase
      .from("conversations")
      .insert({
        user1_id: user.id,
        user2_id: otherUserId,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating conversation:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ conversationId: newConversation.id })
  } catch (error) {
    console.error("Error in create conversation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
