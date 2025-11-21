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

    const { postId, isLiked } = await request.json()

    if (isLiked) {
      // Add like
      const { error } = await supabase.from("likes").insert({ user_id: user.id, post_id: postId })

      if (error) throw error

      const { data: post } = await supabase.from("posts").select("user_id").eq("id", postId).single()

      // Não criar notificação se o usuário curtiu o próprio post
      if (post && post.user_id !== user.id) {
        await supabase.from("notifications").insert({
          user_id: post.user_id,
          actor_id: user.id,
          post_id: postId,
          type: "like",
        })
      }
    } else {
      // Remove like
      const { error } = await supabase.from("likes").delete().eq("user_id", user.id).eq("post_id", postId)

      if (error) throw error

      await supabase.from("notifications").delete().eq("actor_id", user.id).eq("post_id", postId).eq("type", "like")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Error processing like" }, { status: 500 })
  }
}
