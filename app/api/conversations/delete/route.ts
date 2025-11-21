import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function DELETE(request: Request) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get("id")

    if (!conversationId) {
      return NextResponse.json({ error: "ID da conversa não fornecido" }, { status: 400 })
    }

    // Verificar se o usuário faz parte da conversa
    const { data: conversation } = await supabase.from("conversations").select("*").eq("id", conversationId).single()

    if (!conversation) {
      return NextResponse.json({ error: "Conversa não encontrada" }, { status: 404 })
    }

    if (conversation.user1_id !== user.id && conversation.user2_id !== user.id) {
      return NextResponse.json({ error: "Sem permissão para deletar esta conversa" }, { status: 403 })
    }

    // Deletar a conversa (as mensagens serão deletadas automaticamente pelo CASCADE)
    const { error } = await supabase.from("conversations").delete().eq("id", conversationId)

    if (error) {
      console.error("Erro ao deletar conversa:", error)
      return NextResponse.json({ error: "Erro ao deletar conversa" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao processar requisição:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
