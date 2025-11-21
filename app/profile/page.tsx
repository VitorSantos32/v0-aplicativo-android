import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TopBar } from "@/components/top-bar"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { LogOut, Settings, CreditCard } from "lucide-react"
import { ProfilePosts } from "@/components/profile-posts"
import { ProfilePictureUpload } from "@/components/profile-picture-upload"
import Link from "next/link"

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: posts } = await supabase
    .from("posts")
    .select(
      `
      *,
      profiles(id, display_name, avatar_url)
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-black pb-20">
      <TopBar title="Perfil" showNotifications={false} />

      <main className="pt-16 max-w-lg mx-auto">
        <div className="p-4">
          <div className="flex flex-col items-center gap-4 mb-8">
            <ProfilePictureUpload currentAvatarUrl={profile?.avatar_url} userId={user.id} />
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-1">{profile?.display_name || "Usuário"}</h2>
              <p className="text-gray-400 text-sm">{user.email}</p>
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <Link href="/plans">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800 hover:text-orange-500"
              >
                <CreditCard className="w-5 h-5" />
                Meus Planos
              </Button>
            </Link>

            <Link href="/settings">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800 hover:text-orange-500"
              >
                <Settings className="w-5 h-5" />
                Configurações
              </Button>
            </Link>

            <form action="/api/auth/logout" method="post">
              <Button
                type="submit"
                variant="outline"
                className="w-full justify-start gap-2 bg-zinc-900 border-zinc-800 text-red-400 hover:bg-red-950 hover:text-red-400"
              >
                <LogOut className="w-5 h-5" />
                Sair
              </Button>
            </form>
          </div>

          <div className="border-t border-zinc-800 pt-4">
            <h3 className="text-white font-semibold mb-4 text-lg">Minhas Publicações</h3>
            <ProfilePosts posts={posts || []} currentUserId={user.id} />
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
