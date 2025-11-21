import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TopBar } from "@/components/top-bar"
import { BottomNav } from "@/components/bottom-nav"
import { Dumbbell, Flame, User, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"

const FIXED_PLANS = [
  {
    id: "academia",
    name: "Mensalidade Academia",
    description: "Acesso completo à academia com todos os equipamentos",
    icon: Dumbbell,
    price: 99.9,
    features: ["Acesso ilimitado", "Todos os equipamentos", "Horário livre", "Vestiário completo"],
  },
  {
    id: "cf75",
    name: "CF75 CrossFit",
    description: "Treinos funcionais de alta intensidade no nosso box CF75",
    icon: Flame,
    price: 149.9,
    features: ["Classes de CrossFit", "Treinadores especializados", "Comunidade ativa", "WODs diários"],
  },
  {
    id: "personal",
    name: "Personal Trainer",
    description: "Treino personalizado com acompanhamento individual",
    icon: User,
    price: 299.9,
    features: ["Treino personalizado", "Acompanhamento 1:1", "Plano exclusivo", "Avaliação física"],
  },
  {
    id: "combo_completo",
    name: "Combo Completo",
    description: "Academia + CF75 + Personal - Experiência completa!",
    icon: Package,
    price: 449.9,
    features: ["Todos os benefícios", "Desconto especial", "Suporte premium", "Prioridade nas aulas"],
    highlight: true,
  },
]

export default async function PlansPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-black pb-20">
      <TopBar title="Planos" showNotifications={false} />

      <main className="pt-16 max-w-lg mx-auto p-4">
        <div className="mb-6">
          <h2 className="text-white text-2xl font-bold mb-2">Escolha seu Plano</h2>
          <p className="text-gray-400 text-sm">Selecione o plano ideal para seus objetivos</p>
        </div>

        <div className="space-y-4">
          {FIXED_PLANS.map((plan) => {
            const Icon = plan.icon
            return (
              <Card
                key={plan.id}
                className={`bg-zinc-900 border-2 transition-all hover:scale-[1.02] ${
                  plan.highlight ? "border-orange-500" : "border-zinc-800"
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl ${plan.highlight ? "bg-orange-500/20" : "bg-zinc-800"}`}>
                        <Icon className={`w-6 h-6 ${plan.highlight ? "text-orange-500" : "text-white"}`} />
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg">{plan.name}</CardTitle>
                        {plan.highlight && (
                          <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full mt-1 inline-block">
                            Mais Popular
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">R$ {plan.price.toFixed(2).replace(".", ",")}</div>
                      <div className="text-xs text-gray-400">por mês</div>
                    </div>
                  </div>
                  <CardDescription className="text-gray-400 mt-2">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-300 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${
                      plan.highlight
                        ? "bg-orange-500 hover:bg-orange-600 text-white"
                        : "bg-zinc-800 hover:bg-zinc-700 text-white"
                    }`}
                  >
                    Contratar Plano
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="mt-8 p-4 bg-zinc-900 rounded-lg border border-zinc-800">
          <h3 className="text-orange-500 font-semibold mb-2 flex items-center gap-2">
            <span>💡</span> Dica de Economia
          </h3>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>• O Combo Completo oferece o melhor custo-benefício</li>
            <li>• Economize R$ 99,80 por mês com o plano combinado</li>
            <li>• Todos os planos têm renovação mensal automática</li>
            <li>• Cancele quando quiser, sem multas</li>
          </ul>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
