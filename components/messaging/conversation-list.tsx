"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MessageCircle, Users, AlertCircle, RefreshCw } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

interface Conversation {
  id: string
  title: string
  type: "direct" | "group"
  created_at: string
  updated_at: string
  other_participants: Array<{
    user_id: string
    display_name?: string | null
    full_name?: string | null
    profile_picture_url?: string | null
  }>
}

interface ConversationListProps {
  onConversationSelect?: (conversation: Conversation) => void
  selectedConversationId?: string
  refreshTrigger?: number
}

export function ConversationList({
  onConversationSelect,
  selectedConversationId,
  refreshTrigger,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchConversations = async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      console.log("📋 Fetching conversations for user:", user.id)

      const response = await fetch(`/api/conversations?userId=${user.id}`)

      console.log("📋 Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Conversations API error:", response.status, errorText)
        setError(`Failed to load conversations (${response.status})`)
        return
      }

      const data = await response.json()
      console.log("📋 Conversations response:", data)

      setConversations(data.conversations || [])
    } catch (error) {
      console.error("❌ Error fetching conversations:", error)
      setError("Failed to load conversations. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConversations()
  }, [user?.id, refreshTrigger])

  const handleRetry = () => {
    fetchConversations()
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

      if (diffInHours < 24) {
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      } else if (diffInHours < 24 * 7) {
        return date.toLocaleDateString([], { weekday: "short" })
      } else {
        return date.toLocaleDateString([], { month: "short", day: "numeric" })
      }
    } catch {
      return "Unknown"
    }
  }

  const getConversationTitle = (c: Conversation) => {
    if (c.title) return c.title
    if (c.type === "direct" && c.other_participants.length) {
      const p = c.other_participants[0]
      return p.display_name || p.full_name || "Unknown User"
    }
    return "Group Chat"
  }

  if (loading) {
    return (
      <div className="space-y-2 p-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-3 p-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-3">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={handleRetry} className="ml-2 bg-transparent">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-8 px-3 text-muted-foreground">
        <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No conversations yet</p>
        <p className="text-xs">Start a new chat to begin messaging</p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-1 p-3">
        {conversations.map((conversation) => (
          <Button
            key={conversation.id}
            variant={selectedConversationId === conversation.id ? "secondary" : "ghost"}
            className="w-full justify-start h-auto p-3"
            onClick={() => onConversationSelect?.(conversation)}
          >
            <div className="flex items-center space-x-3 w-full">
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  {conversation.type === "group" ? (
                    <Users className="h-5 w-5 text-primary" />
                  ) : (
                    <MessageCircle className="h-5 w-5 text-primary" />
                  )}
                </div>
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="font-medium truncate">{getConversationTitle(conversation)}</p>
                <p className="text-xs text-muted-foreground">
                  {conversation.type === "group" ? "Group chat" : "Direct message"}
                </p>
              </div>
              <div className="text-xs text-muted-foreground">{formatDate(conversation.updated_at)}</div>
            </div>
          </Button>
        ))}
      </div>
    </ScrollArea>
  )
}
