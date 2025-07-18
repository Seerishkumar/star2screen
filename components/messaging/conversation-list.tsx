"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth/auth-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Users } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Conversation {
  id: string
  type: "direct" | "group"
  title?: string
  participants: Array<{
    user_id: string
    user: {
      id: string
      email: string
      full_name?: string
      avatar_url?: string
    }
  }>
  last_message?: {
    content: string
    created_at: string
    sender_id: string
  }
  unread_count: number
}

interface ConversationListProps {
  onSelectConversation: (conversation: Conversation) => void
  selectedConversationId?: string
}

export function ConversationList({ onSelectConversation, selectedConversationId }: ConversationListProps) {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    fetchConversations()

    // Subscribe to real-time updates
    const channel = supabase
      .channel("conversations")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => fetchConversations())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const fetchConversations = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("conversations")
        .select(`
          id,
          type,
          title,
          created_at,
          conversation_participants!inner (
            user_id,
            user:auth.users (
              id,
              email,
              raw_user_meta_data
            )
          ),
          messages (
            content,
            created_at,
            sender_id
          )
        `)
        .eq("conversation_participants.user_id", user.id)
        .eq("conversation_participants.is_active", true)
        .order("updated_at", { ascending: false })

      if (error) throw error

      // Process conversations to get last message and unread count
      const processedConversations =
        data?.map((conv) => ({
          ...conv,
          last_message: conv.messages?.[0] || null,
          unread_count: 0, // TODO: Calculate actual unread count
        })) || []

      setConversations(processedConversations)
    } catch (error) {
      console.error("Error fetching conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  const getConversationTitle = (conversation: Conversation) => {
    if (conversation.type === "group") {
      return conversation.title || "Group Chat"
    }

    // For direct messages, show the other participant's name
    const otherParticipant = conversation.participants.find((p) => p.user_id !== user?.id)
    return otherParticipant?.user.raw_user_meta_data?.full_name || otherParticipant?.user.email || "Unknown User"
  }

  const getConversationAvatar = (conversation: Conversation) => {
    if (conversation.type === "group") {
      return null // Group avatar logic
    }

    const otherParticipant = conversation.participants.find((p) => p.user_id !== user?.id)
    return otherParticipant?.user.raw_user_meta_data?.avatar_url
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => (
        <Card
          key={conversation.id}
          className={`cursor-pointer transition-colors hover:bg-muted/50 ${
            selectedConversationId === conversation.id ? "bg-muted" : ""
          }`}
          onClick={() => onSelectConversation(conversation)}
        >
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={getConversationAvatar(conversation) || "/placeholder.svg"} />
                  <AvatarFallback>
                    {conversation.type === "group" ? (
                      <Users className="h-4 w-4" />
                    ) : (
                      getConversationTitle(conversation).charAt(0).toUpperCase()
                    )}
                  </AvatarFallback>
                </Avatar>
                {conversation.type === "group" && (
                  <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1">
                    <Users className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium truncate">{getConversationTitle(conversation)}</h3>
                  {conversation.last_message && (
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(conversation.last_message.created_at), { addSuffix: true })}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm text-muted-foreground truncate">
                    {conversation.last_message?.content || "No messages yet"}
                  </p>
                  {conversation.unread_count > 0 && (
                    <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {conversation.unread_count}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {conversations.length === 0 && (
        <div className="text-center py-8">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No conversations yet</p>
          <p className="text-sm text-muted-foreground">Start a conversation with someone!</p>
        </div>
      )}
    </div>
  )
}
