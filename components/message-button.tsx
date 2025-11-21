"use client"

import { useState } from "react"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface MessageButtonProps {
  otherUserId: string
  currentUserId: string
}

export function MessageButton({ otherUserId, currentUserId }: MessageButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleStartConversation = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/conversations/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otherUserId }),
      })

      if (response.ok) {
        const { conversationId } = await response.json()
        router.push(`/messages/${conversationId}`)
      }
    } catch (error) {
      console.error("Error creating conversation:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleStartConversation}
      disabled={isLoading}
      className="bg-orange-500 hover:bg-orange-600 gap-2 w-full max-w-xs"
    >
      <MessageCircle className="w-5 h-5" />
      {isLoading ? "Carregando..." : "Enviar Mensagem"}
    </Button>
  )
}
