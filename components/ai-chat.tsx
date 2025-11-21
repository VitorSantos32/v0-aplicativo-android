"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Send, Loader2, Activity, TrendingUp, TrendingDown } from "lucide-react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Label } from "@/components/ui/label"

export function AIChat() {
  const [weight, setWeight] = useState("")
  const [height, setHeight] = useState("")
  const [bodyFat, setBodyFat] = useState("")
  const [goal, setGoal] = useState<"lose" | "gain" | "maintain" | null>(null)
  const [showForm, setShowForm] = useState(true)

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/ai-coach" }),
  })

  const handleStartChat = () => {
    if (!weight || !height || !goal) return

    const goalText =
      goal === "lose" ? "perder gordura" : goal === "gain" ? "ganhar massa muscular" : "manter o corpo atual"
    const prompt = `Olá! Sou um usuário da academia Mais Vida. Meus dados são:
    - Peso: ${weight}kg
    - Altura: ${height}cm
    ${bodyFat ? `- Percentual de gordura: ${bodyFat}%` : ""}
    - Objetivo: ${goalText}
    
    Por favor, crie um plano de dieta personalizado para mim com orientações específicas e dicas.`

    sendMessage({ text: prompt })
    setShowForm(false)
  }

  const handleNewMessage = (e: React.FormEvent) => {
    e.preventDefault()
    const input = (e.target as any).message.value
    if (!input.trim()) return

    sendMessage({ text: input })
    ;(e.target as any).message.value = ""
  }

  return (
    <div className="flex flex-col h-full">
      {showForm ? (
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Bem-vindo ao Coach IA</h2>
            <p className="text-gray-400 text-sm">Preencha seus dados para receber um plano personalizado</p>
          </div>

          <Card className="bg-zinc-900 border-zinc-800 mb-6">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="weight" className="text-white">
                  Peso (kg)
                </Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="Ex: 75"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height" className="text-white">
                  Altura (cm)
                </Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="Ex: 175"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bodyFat" className="text-white">
                  Percentual de Gordura (%) - Opcional
                </Label>
                <Input
                  id="bodyFat"
                  type="number"
                  placeholder="Ex: 20"
                  value={bodyFat}
                  onChange={(e) => setBodyFat(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3 mb-6">
            <p className="text-white font-semibold">Qual é seu objetivo?</p>
            <div className="grid grid-cols-1 gap-3">
              <Button
                onClick={() => setGoal("lose")}
                variant={goal === "lose" ? "default" : "outline"}
                className={`h-auto py-4 justify-start ${
                  goal === "lose"
                    ? "bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
                    : "bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800"
                }`}
              >
                <TrendingDown className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">Perder Gordura</div>
                  <div className="text-xs opacity-80">Definição e emagrecimento</div>
                </div>
              </Button>

              <Button
                onClick={() => setGoal("gain")}
                variant={goal === "gain" ? "default" : "outline"}
                className={`h-auto py-4 justify-start ${
                  goal === "gain"
                    ? "bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
                    : "bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800"
                }`}
              >
                <TrendingUp className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">Ganhar Massa Muscular</div>
                  <div className="text-xs opacity-80">Hipertrofia e volume</div>
                </div>
              </Button>

              <Button
                onClick={() => setGoal("maintain")}
                variant={goal === "maintain" ? "default" : "outline"}
                className={`h-auto py-4 justify-start ${
                  goal === "maintain"
                    ? "bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
                    : "bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800"
                }`}
              >
                <Activity className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">Manter Forma Atual</div>
                  <div className="text-xs opacity-80">Equilíbrio e manutenção</div>
                </div>
              </Button>
            </div>
          </div>

          <Button
            onClick={handleStartChat}
            disabled={!weight || !height || !goal}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
          >
            Gerar Plano Personalizado
          </Button>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-orange-500 text-white"
                      : "bg-zinc-900 text-white border border-zinc-800"
                  }`}
                >
                  {message.parts.map((part, index) => {
                    if (part.type === "text") {
                      return (
                        <p key={index} className="text-sm whitespace-pre-wrap leading-relaxed">
                          {part.text}
                        </p>
                      )
                    }
                    return null
                  })}
                </div>
              </div>
            ))}

            {status === "in_progress" && (
              <div className="flex justify-start">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                  <span className="text-sm text-gray-400">Coach IA está pensando...</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-zinc-900 border-t border-zinc-800">
            <form onSubmit={handleNewMessage} className="flex gap-2">
              <Input
                name="message"
                placeholder="Faça uma pergunta..."
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500"
                disabled={status === "in_progress"}
              />
              <Button
                type="submit"
                size="icon"
                className="bg-orange-500 hover:bg-orange-600 shrink-0"
                disabled={status === "in_progress"}
              >
                <Send className="w-5 h-5" />
              </Button>
            </form>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Coach IA fornece orientações gerais. Consulte um nutricionista para planos personalizados.
            </p>
          </div>
        </>
      )}
    </div>
  )
}
