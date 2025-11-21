"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

interface ChatInterfaceProps {
  conversationId: string
  currentUserId: string
  initialMessages: any[]
}

export function ChatInterface({ conversationId, currentUserId, initialMessages }: ChatInterfaceProps) {
  const [messages, setMessages] = useState(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [realtimeStatus, setRealtimeStatus] = useState<"connecting" | "connected" | "error">("connecting")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)

  useEffect(() => {
    try {
      supabaseRef.current = createClient()
    } catch (error) {
      console.error("[Production Error] Failed to create Supabase client:", error)
      setRealtimeStatus("error")
    }
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!supabaseRef.current) return

    const channel = supabaseRef.current
      .channel(`conversation:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => {
            const exists = prev.find((m) => m.id === payload.new.id)
            if (exists) return prev
            return [...prev, payload.new]
          })
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setRealtimeStatus("connected")
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setRealtimeStatus("error")
        }
      })

    return () => {
      if (supabaseRef.current) {
        supabaseRef.current.removeChannel(channel)
      }
    }
  }, [conversationId])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isSubmitting || !supabaseRef.current) return

    setIsSubmitting(true)

    try {
      const { data, error } = await supabaseRef.current
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: currentUserId,
          content: newMessage.trim(),
        })
        .select()
        .single()

      if (error) {
        console.error("[Production Error] Failed to send message:", error)
        alert("Erro ao enviar mensagem. Verifique sua conexão.")
        return
      }

      if (data) {
        setNewMessage("")
        setMessages((prev) => {
          const exists = prev.find((m) => m.id === data.id)
          if (exists) return prev
          return [...prev, data]
        })

        // Atualizar o timestamp da conversa
        await supabaseRef.current
          .from("conversations")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", conversationId)
      }
    } catch (error) {
      console.error("[Production Error] Exception sending message:", error)
      alert("Erro ao enviar mensagem. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {realtimeStatus === "error" && (
        <div className="bg-red-500/10 text-red-400 text-xs p-2 text-center">
          Conexão em tempo real indisponível. Recarregue a página para ver novas mensagens.
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">Nenhuma mensagem ainda. Envie a primeira!</div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender_id === currentUserId
            return (
              <div key={message.id} className={cn("flex", isOwn ? "justify-end" : "justify-start", "slide-in")}>
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2",
                    isOwn ? "bg-orange-500 text-white rounded-br-none" : "bg-zinc-800 text-white rounded-bl-none",
                  )}
                >
                  <p className="text-sm break-words">{message.content}</p>
                  <p className={cn("text-xs mt-1", isOwn ? "text-orange-100" : "text-gray-400")}>
                    {new Date(message.created_at).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="flex gap-2 px-4 py-3 bg-zinc-900 border-t border-zinc-800">
        <Input
          placeholder="Digite uma mensagem..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500"
          maxLength={1000}
        />
        <Button
          type="submit"
          size="icon"
          className="bg-orange-500 hover:bg-orange-600"
          disabled={!newMessage.trim() || isSubmitting}
        >
          <Send className="w-5 h-5" />
        </Button>
      </form>
    </div>
  )
}
