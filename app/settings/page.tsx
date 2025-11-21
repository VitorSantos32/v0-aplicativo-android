import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TopBar } from "@/components/top-bar"
import { BottomNav } from "@/components/bottom-nav"
import { ChangePasswordForm } from "@/components/change-password-form"
import { InstallButton } from "@/components/install-button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-black pb-20">
      <TopBar title="Configurações" showNotifications={false} />

      <main className="pt-16 max-w-lg mx-auto">
        <div className="p-4 space-y-4">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>

          <InstallButton />

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-2">Segurança</h2>
            <p className="text-gray-400 text-sm mb-6">Altere sua senha ou recupere o acesso à sua conta</p>

            <ChangePasswordForm userEmail={user.email || ""} />
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
