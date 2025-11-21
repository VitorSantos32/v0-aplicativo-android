import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TopBar } from "@/components/top-bar"
import { BottomNav } from "@/components/bottom-nav"
import { PostCard } from "@/components/post-card"

export const dynamic = "force-dynamic"

export default async function FeedPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch posts with user profiles, likes count, and user's like status
  const { data: posts } = await supabase
    .from("posts")
    .select(`
      *,
      profiles:user_id (
        id,
        display_name,
        avatar_url
      ),
      likes (count),
      comments (count)
    `)
    .order("created_at", { ascending: false })

  // Get user's likes
  const { data: userLikes } = await supabase.from("likes").select("post_id").eq("user_id", user.id)

  const likedPostIds = new Set(userLikes?.map((like) => like.post_id) || [])

  return (
    <div className="min-h-screen bg-black pb-20">
      <TopBar title="Mais Vida" showNotifications />

      <main className="pt-16 max-w-lg mx-auto">
        {posts && posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} isLiked={likedPostIds.has(post.id)} currentUserId={user.id} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
              <span className="text-3xl">💪</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Bem-vindo ao Mais Vida!</h2>
            <p className="text-gray-400 mb-6">Seja o primeiro a compartilhar sua jornada fitness</p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
