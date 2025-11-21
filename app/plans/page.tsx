import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TopBar } from "@/components/top-bar"
import { BottomNav } from "@/components/bottom-nav"
import { PlanCard } from "@/components/plan-card"
import { ActiveSubscriptions } from "@/components/active-subscriptions"
import { Dumbbell, Flame, User, Package } from "lucide-react"

export default async function PlansPage() {
  console.log("[v0] PlansPage - Starting page load")

  let supabase
  try {
    supabase = await createClient()
    console.log("[v0] PlansPage - Supabase client created successfully")
  } catch (error) {
    console.error("[v0] PlansPage - Error creating Supabase client:", error)
    throw error
  }

  let user
  try {
    const {
      data: { user: userData },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      console.error("[v0] PlansPage - Error getting user:", userError)
      throw userError
    }

    if (!userData) {
      console.log("[v0] PlansPage - No user found, redirecting to login")
      redirect("/auth/login")
    }

    user = userData
    console.log("[v0] PlansPage - User authenticated:", user.id)
  } catch (error) {
    console.error("[v0] PlansPage - Auth error:", error)
    redirect("/auth/login")
  }

  let subscriptions = []
  try {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] PlansPage - Error fetching subscriptions:", error)
    } else {
      subscriptions = data || []
      console.log("[v0] PlansPage - Subscriptions loaded:", subscriptions.length)
    }
  } catch (error) {
    console.error("[v0] PlansPage - Exception fetching subscriptions:", error)
  }

  const plans = [
    {
      id: "academia",
      name: "Mensalidade Academia",
      description: "Acesso completo à academia com todos os equipamentos",
      icon: Dumbbell,
      price: 99.9,
      features: ["Acesso ilimitado", "Todos os equipamentos", "Horário livre"],
    },
    {
      id: "cf75",
      name: "CF75 CrossFit",
      description: "Treinos funcionais de alta intensidade no nosso box CF75",
      icon: Flame,
      price: 149.9,
      features: ["Classes de CrossFit", "Treinadores especializados", "Comunidade ativa"],
    },
    {
      id: "personal",
      name: "Personal Trainer",
      description: "Treino personalizado com acompanhamento individual",
      icon: User,
      price: 299.9,
      features: ["Treino personalizado", "Acompanhamento 1:1", "Plano exclusivo"],
    },
    {
      id: "combo_completo",
      name: "Combo Completo",
      description: "Academia + CF75 + Personal - Experiência completa!",
      icon: Package,
      price: 449.9,
      features: ["Todos os benefícios", "Desconto especial", "Suporte premium"],
      highlight: true,
    },
  ]

  console.log("[v0] PlansPage - Rendering page")

  return (
    <div className="min-h-screen bg-black pb-20">
      <TopBar title="Planos" showNotifications={false} />

      <main className="pt-16 max-w-lg mx-auto p-4">
        {/* Active subscriptions */}
        {subscriptions && subscriptions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-white text-xl font-bold mb-4">Minhas Assinaturas</h2>
            <ActiveSubscriptions subscriptions={subscriptions} />
          </div>
        )}

        {/* Available plans */}
        <div>
          <h2 className="text-white text-xl font-bold mb-4">
            {subscriptions && subscriptions.length > 0 ? "Renovar ou Adicionar Plano" : "Escolha seu Plano"}
          </h2>
          <div className="space-y-4">
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} userId={user.id} />
            ))}
          </div>
        </div>

        <div className="mt-8 p-4 bg-zinc-900 rounded-lg border border-zinc-800">
          <h3 className="text-orange-500 font-semibold mb-2">💡 Dica de Economia</h3>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>• O Combo Completo oferece o melhor custo-benefício</li>
            <li>• Economize contratando planos combinados</li>
            <li>• Todos os planos têm renovação mensal automática</li>
          </ul>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
