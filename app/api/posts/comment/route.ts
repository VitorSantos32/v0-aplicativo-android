import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { postId, content } = await request.json()

    if (!content?.trim()) {
      return NextResponse.json({ error: "Content required" }, { status: 400 })
    }

    const { data: comment, error } = await supabase
      .from("comments")
      .insert({
        user_id: user.id,
        post_id: postId,
        content: content.trim(),
      })
      .select()
      .single()

    if (error) throw error

    const { data: post } = await supabase.from("posts").select("user_id").eq("id", postId).single()

    // Não criar notificação se o usuário comentou no próprio post
    if (post && post.user_id !== user.id) {
      await supabase.from("notifications").insert({
        user_id: post.user_id,
        actor_id: user.id,
        post_id: postId,
        type: "comment",
        content: content.trim().substring(0, 100), // Primeiros 100 caracteres
      })
    }

    return NextResponse.json({ success: true, comment })
  } catch (error) {
    return NextResponse.json({ error: "Error creating comment" }, { status: 500 })
  }
}
