"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Calendar, CreditCard, X } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface Subscription {
  id: string
  plan_type: string
  status: string
  start_date: string
  end_date: string
  price: number
}

interface ActiveSubscriptionsProps {
  subscriptions: Subscription[]
}

const planNames: Record<string, string> = {
  academia: "Academia",
  cf75: "CF75 CrossFit",
  personal: "Personal Trainer",
  combo_academia_cf75: "Combo Academia + CF75",
  combo_academia_personal: "Combo Academia + Personal",
  combo_cf75_personal: "Combo CF75 + Personal",
  combo_completo: "Combo Completo",
}

export function ActiveSubscriptions({ subscriptions }: ActiveSubscriptionsProps) {
  const activeSubscriptions = subscriptions.filter((sub) => sub.status === "active")
  const [canceling, setCanceling] = useState<string | null>(null)
  const router = useRouter()

  const handleCancel = async (subscriptionId: string) => {
    setCanceling(subscriptionId)
    try {
      const response = await fetch("/api/subscriptions/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId }),
      })

      if (!response.ok) {
        throw new Error("Erro ao cancelar assinatura")
      }

      router.refresh()
    } catch (error) {
      console.error("Error canceling subscription:", error)
      alert("Erro ao cancelar assinatura. Tente novamente.")
    } finally {
      setCanceling(null)
    }
  }

  if (activeSubscriptions.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      {activeSubscriptions.map((subscription) => (
        <Card
          key={subscription.id}
          className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/30"
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-white font-semibold">
                  {planNames[subscription.plan_type] || subscription.plan_type}
                </h3>
                <Badge className="mt-1 bg-green-500/20 text-green-400 border-green-500/30">Ativo</Badge>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-orange-500 font-bold text-lg">R$ {subscription.price.toFixed(2)}</div>
                  <div className="text-gray-400 text-xs">por mês</div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      disabled={canceling === subscription.id}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-black border-orange-500/30">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white">Cancelar Plano</AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-400">
                        Tem certeza que deseja cancelar o plano{" "}
                        <span className="text-orange-500 font-semibold">{planNames[subscription.plan_type]}</span>? Esta
                        ação não pode ser desfeita e você perderá o acesso aos benefícios do plano.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700">
                        Voltar
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleCancel(subscription.id)}
                        className="bg-red-600 text-white hover:bg-red-700"
                        disabled={canceling === subscription.id}
                      >
                        {canceling === subscription.id ? "Cancelando..." : "Cancelar Plano"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-300">
                <Calendar className="w-4 h-4 text-orange-500" />
                <span>Início: {new Date(subscription.start_date).toLocaleDateString("pt-BR")}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <CreditCard className="w-4 h-4 text-orange-500" />
                <span>Vencimento: {new Date(subscription.end_date).toLocaleDateString("pt-BR")}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
