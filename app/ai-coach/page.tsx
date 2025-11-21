"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Bot, Dumbbell, MessageCircle, Utensils } from "lucide-react"
import { TopBar } from "@/components/top-bar"
import { BottomNav } from "@/components/bottom-nav"
import { AiChat } from "@/components/ai-chat"
import { NutritionCalculator } from "@/components/nutrition-calculator"

type CoachType = "chat" | "nutrition" | null

export default function AiCoachPage() {
  const [activeCoach, setActiveCoach] = useState<CoachType>(null)

  if (activeCoach === "chat") {
    return (
      <div className="flex flex-col h-screen bg-black">
        <TopBar title="Coach IA" showNotifications={false} />
        <div className="flex-1 pt-16 pb-16">
          <AiChat onClose={() => setActiveCoach(null)} />
        </div>
        <BottomNav />
      </div>
    )
  }

  if (activeCoach === "nutrition") {
    return (
      <div className="flex flex-col h-screen bg-black">
        <TopBar title="Coach Nutricional" showNotifications={false} />
        <div className="flex-1 pt-16 pb-16">
          <NutritionCalculator />
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-black">
      <TopBar title="Coach IA" showNotifications={false} />
      <div className="flex-1 overflow-y-auto pt-16 pb-16">
        <div className="p-4 space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <Bot className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white">Seu Coach Pessoal</h1>
            <p className="text-gray-400 text-sm">Escolha como quer ser acompanhado hoje</p>
          </div>

          <div className="space-y-4">
            <Card
              className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700 cursor-pointer hover:border-orange-500 transition-all"
              onClick={() => setActiveCoach("chat")}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-6 h-6 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg mb-2">Chat com IA</h3>
                    <p className="text-gray-400 text-sm mb-3">
                      Converse com seu coach pessoal sobre treinos, dúvidas de exercícios e motivação
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded">Treinos</span>
                      <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded">Exercícios</span>
                      <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded">Motivação</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700 cursor-pointer hover:border-orange-500 transition-all"
              onClick={() => setActiveCoach("nutrition")}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                    <Utensils className="w-6 h-6 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg mb-2">Coach Nutricional</h3>
                    <p className="text-gray-400 text-sm mb-3">
                      Calcule seus macros e receba um plano alimentar personalizado para seus objetivos
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Dieta</span>
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Macros</span>
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Refeições</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-blue-900/20 border-blue-700/50">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Dumbbell className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-blue-200 font-semibold text-sm mb-1">Dica do Coach</h4>
                  <p className="text-blue-300 text-xs">
                    Use o chat para tirar dúvidas sobre exercícios e o coach nutricional para planejar suas refeições.
                    Juntos, eles te ajudam a alcançar seus objetivos!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
