import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { postId } = await request.json()

    // Verificar se o post pertence ao usuário
    const { data: post } = await supabase.from("posts").select("*").eq("id", postId).single()

    if (!post || post.user_id !== user.id) {
      return NextResponse.json({ error: "Post não encontrado ou não autorizado" }, { status: 403 })
    }

    // Deletar a imagem do storage se existir
    if (post.image_url) {
      const imagePath = post.image_url.split("/").slice(-2).join("/")
      await supabase.storage.from("images").remove([imagePath])
    }

    // Deletar o post (likes e comments serão deletados automaticamente por CASCADE)
    const { error } = await supabase.from("posts").delete().eq("id", postId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
