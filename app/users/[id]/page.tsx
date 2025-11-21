import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { TopBar } from "@/components/top-bar"
import { BottomNav } from "@/components/bottom-nav"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { MessageButton } from "@/components/message-button"

export default async function UserProfilePage({ params }: { params: { id: string } }) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", params.id).single()

  if (!profile) {
    redirect("/search")
  }

  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("user_id", params.id)
    .order("created_at", { ascending: false })

  const isOwnProfile = user.id === params.id

  return (
    <div className="min-h-screen bg-black pb-20 page-transition">
      <TopBar title={profile.display_name || "Perfil"} showNotifications={false} />

      <main className="pt-16 max-w-lg mx-auto">
        <div className="p-4">
          <div className="flex flex-col items-center gap-4 mb-8">
            <Avatar className="w-24 h-24 border-4 border-orange-500">
              <AvatarImage src={profile.avatar_url || "/placeholder.svg?height=96&width=96"} />
              <AvatarFallback className="bg-orange-500 text-white text-3xl">
                {profile.display_name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-1">{profile.display_name || "Usuário"}</h2>
              {profile.bio && <p className="text-gray-400 text-sm">{profile.bio}</p>}
            </div>

            {!isOwnProfile && <MessageButton otherUserId={params.id} currentUserId={user.id} />}
          </div>

          <div className="border-t border-zinc-800 pt-4">
            <h3 className="text-white font-semibold mb-4 text-lg">Publicações</h3>
            {posts && posts.length > 0 ? (
              <div className="grid grid-cols-3 gap-1">
                {posts.map((post) => (
                  <Link key={post.id} href={`/posts/${post.id}`} className="relative aspect-square">
                    <img
                      src={post.image_url || "/placeholder.svg"}
                      alt="Post"
                      className="w-full h-full object-cover bg-zinc-800"
                    />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400 text-sm">Nenhuma publicação ainda</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
