import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function DELETE(request: Request) {
  try {
    const { commentId } = await request.json()

    if (!commentId) {
      return NextResponse.json({ error: "Comment ID is required" }, { status: 400 })
    }

    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Buscar o comentário e o post relacionado
    const { data: comment, error: commentError } = await supabase
      .from("comments")
      .select("*, posts(user_id)")
      .eq("id", commentId)
      .single()

    if (commentError || !comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    // Verificar se o usuário é o dono do comentário OU o dono do post
    const isCommentOwner = comment.user_id === user.id
    const isPostOwner = comment.posts?.user_id === user.id

    if (!isCommentOwner && !isPostOwner) {
      return NextResponse.json({ error: "Unauthorized to delete this comment" }, { status: 403 })
    }

    // Deletar o comentário
    const { error: deleteError } = await supabase.from("comments").delete().eq("id", commentId)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting comment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
