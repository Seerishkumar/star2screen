"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle, Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { useRouter } from "next/navigation"

interface MessageButtonProps {
  recipientId: string
  recipientName?: string
  variant?: "default" | "outline" | "ghost" | "secondary"
  size?: "sm" | "default" | "lg"
  className?: string
}

export function MessageButton({
  recipientId,
  recipientName,
  variant = "default",
  size = "default",
  className,
}: MessageButtonProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleStartConversation = async () => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    if (user.id === recipientId) {
      return // Can't message yourself
    }

    setLoading(true)
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient_id: recipientId,
          type: "direct",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create conversation")
      }

      const { conversation_id } = await response.json()
      router.push(`/messages?conversation=${conversation_id}`)
    } catch (error) {
      console.error("Error starting conversation:", error)
      alert("Failed to start conversation. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!user || user.id === recipientId) {
    return null
  }

  return (
    <Button variant={variant} size={size} className={className} onClick={handleStartConversation} disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <MessageCircle className="h-4 w-4 mr-2" />}
      {loading ? "Starting..." : `Message${recipientName ? ` ${recipientName}` : ""}`}
    </Button>
  )
}
