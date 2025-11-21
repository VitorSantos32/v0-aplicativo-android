import { createClient } from "@/lib/supabase/server"
import { TopBar } from "@/components/top-bar"
import { BottomNav } from "@/components/bottom-nav"
import { SearchUsers } from "@/components/search-users"
import { redirect } from "next/navigation"

export default async function SearchPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-black pb-20">
      <TopBar title="Pesquisar" showNotifications={false} />

      <main className="pt-16 max-w-lg mx-auto">
        <SearchUsers currentUserId={user.id} />
      </main>

      <BottomNav />
    </div>
  )
}
