"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { LucideIcon } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Check, Loader2 } from "lucide-react"

interface Plan {
  id: string
  name: string
  description: string
  icon: LucideIcon
  price: number
  features: string[]
  highlight?: boolean
}

interface PlanCardProps {
  plan: Plan
  userId: string
}

export function PlanCard({ plan, userId }: PlanCardProps) {
  const [subscribing, setSubscribing] = useState(false)
  const router = useRouter()
  const Icon = plan.icon

  const handleSubscribe = async () => {
    setSubscribing(true)

    try {
      const supabase = createClient()

      const startDate = new Date()
      const endDate = new Date()
      endDate.setMonth(endDate.getMonth() + 1) // 1 month subscription

      const { data, error } = await supabase
        .from("subscriptions")
        .insert({
          user_id: userId,
          plan_type: plan.id,
          status: "active",
          start_date: startDate.toISOString().split("T")[0],
          end_date: endDate.toISOString().split("T")[0],
          price: plan.price,
        })
        .select()

      if (error) {
        console.error("[v0] Error subscribing to plan:", error)
        throw error
      }

      if (data) {
        alert("Plano contratado com sucesso!")
        router.refresh()
      }
    } catch (error: any) {
      console.error("[v0] Error subscribing:", error)
      alert(error?.message || "Erro ao contratar plano. Tente novamente.")
    } finally {
      setSubscribing(false)
    }
  }

  return (
    <Card
      className={`bg-zinc-900 border-2 transition-all hover:scale-[1.02] ${
        plan.highlight ? "border-orange-500 shadow-lg shadow-orange-500/20" : "border-zinc-800"
      }`}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              plan.highlight ? "bg-orange-500" : "bg-zinc-800"
            }`}
          >
            <Icon className={`w-6 h-6 ${plan.highlight ? "text-black" : "text-orange-500"}`} />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold text-lg mb-1">{plan.name}</h3>
            <p className="text-gray-400 text-sm">{plan.description}</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-baseline gap-1 mb-3">
            <span className="text-3xl font-bold text-orange-500">R$ {plan.price.toFixed(2)}</span>
            <span className="text-gray-400 text-sm">/mês</span>
          </div>

          <ul className="space-y-2">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-gray-300 text-sm">
                <Check className="w-4 h-4 text-orange-500 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <Button
          onClick={handleSubscribe}
          disabled={subscribing}
          className={`w-full ${
            plan.highlight ? "bg-orange-500 hover:bg-orange-600 text-black" : "bg-zinc-800 hover:bg-zinc-700 text-white"
          }`}
        >
          {subscribing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processando...
            </>
          ) : (
            "Contratar Plano"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
