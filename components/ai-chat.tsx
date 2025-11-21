"use client"
import { useChat } from "@ai-sdk/react"
import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Send, Bot, User, Loader2 } from "lucide-react"

interface AiChatProps {
  onClose?: () => void
}

export function AiChat({ onClose }: AiChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/ai-coach/chat",
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSuggestion = (suggestion: string) => {
    const syntheticEvent = {
      preventDefault: () => {},
      target: { value: suggestion },
    } as any
    handleInputChange(syntheticEvent)
    setTimeout(() => {
      const form = document.querySelector("form")
      if (form) {
        form.requestSubmit()
      }
    }, 100)
  }

  return (
    <div className="flex flex-col h-full bg-black">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-orange-500" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Personal Trainer IA</h3>
            <p className="text-gray-400 text-sm mb-6">
              Tire suas dúvidas sobre treinos, exercícios, técnicas e muito mais! Estou aqui para te ajudar 24/7.
            </p>
            <div className="grid grid-cols-1 gap-2 w-full max-w-sm">
              <Button
                variant="outline"
                className="bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800 text-left justify-start"
                onClick={() => handleSuggestion("Como fazer agachamento livre corretamente?")}
              >
                Como fazer agachamento livre corretamente?
              </Button>
              <Button
                variant="outline"
                className="bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800 text-left justify-start"
                onClick={() => handleSuggestion("Monte um treino ABC de hipertrofia")}
              >
                Monte um treino ABC de hipertrofia
              </Button>
              <Button
                variant="outline"
                className="bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800 text-left justify-start"
                onClick={() => handleSuggestion("Qual a diferença entre supino reto e inclinado?")}
              >
                Qual a diferença entre supino reto e inclinado?
              </Button>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}>
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                <Card
                  className={`max-w-[80%] ${
                    message.role === "user" ? "bg-orange-500 border-orange-500" : "bg-zinc-900 border-zinc-800"
                  }`}
                >
                  <CardContent className="p-3">
                    <div className="text-white text-sm whitespace-pre-wrap">{message.content}</div>
                  </CardContent>
                </Card>
                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardContent className="p-3">
                    <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                  </CardContent>
                </Card>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="p-4 border-t border-zinc-800">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Digite sua pergunta..."
            disabled={isLoading}
            className="flex-1 bg-zinc-900 border-zinc-700 text-white placeholder:text-gray-500"
          />
          <Button
            type="submit"
            disabled={!input || input.trim() === "" || isLoading}
            className="bg-orange-500 hover:bg-orange-600 shrink-0"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
      </div>
    </div>
  )
}
