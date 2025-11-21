import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TopBar } from "@/components/top-bar"
import { BottomNav } from "@/components/bottom-nav"
import { PostDetail } from "@/components/post-detail"

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch post with all details
  const { data: post } = await supabase
    .from("posts")
    .select(`
      *,
      profiles:user_id (
        id,
        display_name,
        avatar_url
      ),
      likes (count),
      comments (
        *,
        profiles:user_id (
          id,
          display_name,
          avatar_url
        )
      )
    `)
    .eq("id", id)
    .single()

  if (!post) {
    redirect("/feed")
  }

  // Get user's like status
  const { data: userLike } = await supabase
    .from("likes")
    .select("id")
    .eq("user_id", user.id)
    .eq("post_id", id)
    .maybeSingle()

  return (
    <div className="min-h-screen bg-black pb-20">
      <TopBar title="Post" showNotifications={false} />

      <main className="pt-16 max-w-lg mx-auto">
        <PostDetail post={post} isLiked={!!userLike} currentUserId={user.id} />
      </main>

      <BottomNav />
    </div>
  )
}
