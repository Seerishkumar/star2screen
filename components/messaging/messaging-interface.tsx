"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth/auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Phone, Video, MoreVertical, Smile } from "lucide-react"

interface Message {
  id: string
  content: string
  sender_id: string
  created_at: string
  message_type: string
  is_read: boolean
}

interface Conversation {
  id: string
  participant_1: string
  participant_2: string
  last_message_at: string
}

interface MessagingInterfaceProps {
  recipientId: string
  recipientName: string
  recipientAvatar?: string
}

export function MessagingInterface({ recipientId, recipientName, recipientAvatar }: MessagingInterfaceProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [isOnline, setIsOnline] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user || !recipientId) return

    initializeConversation()
  }, [user, recipientId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const initializeConversation = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Find or create conversation
      let { data: existingConversation } = await supabase
        .from("conversations")
        .select("*")
        .or(
          `and(participant_1.eq.${user.id},participant_2.eq.${recipientId}),and(participant_1.eq.${recipientId},participant_2.eq.${user.id})`,
        )
        .single()

      if (!existingConversation) {
        // Create new conversation
        const { data: newConversation, error } = await supabase
          .from("conversations")
          .insert({
            participant_1: user.id,
            participant_2: recipientId,
            last_message_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (error) throw error
        existingConversation = newConversation
      }

      setConversation(existingConversation)
      await loadMessages(existingConversation.id)

      // Subscribe to new messages
      const channel = supabase
        .channel(`conversation-${existingConversation.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${existingConversation.id}`,
          },
          (payload) => {
            const newMessage = payload.new as Message
            setMessages((prev) => [...prev, newMessage])
            scrollToBottom()
          },
        )
        .subscribe()

      // Simulate online status (in real app, you'd track this properly)
      setIsOnline(Math.random() > 0.5)

      return () => {
        supabase.removeChannel(channel)
      }
    } catch (error) {
      console.error("Error initializing conversation:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })

      if (error) throw error
      setMessages(data || [])

      // Mark messages as read
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("conversation_id", conversationId)
        .neq("sender_id", user?.id)
    } catch (error) {
      console.error("Error loading messages:", error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversation || !user || sending) return

    setSending(true)
    try {
      const { error } = await supabase.from("messages").insert({
        conversation_id: conversation.id,
        sender_id: user.id,
        content: newMessage.trim(),
        message_type: "text",
        is_read: false,
      })

      if (error) throw error

      // Update conversation last message time
      await supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", conversation.id)

      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Failed to send message. Please try again.")
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  if (loading) {
    return (
      <Card className="h-[600px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading conversation...</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="h-[600px] flex flex-col">
      {/* Header */}
      <CardHeader className="flex-row items-center space-y-0 pb-4 border-b">
        <div className="flex items-center space-x-3 flex-1">
          <div className="relative">
            <Avatar>
              <AvatarImage src={recipientAvatar || "/placeholder.svg"} />
              <AvatarFallback>{recipientName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            {isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>
          <div>
            <CardTitle className="text-lg">{recipientName}</CardTitle>
            <p className="text-sm text-muted-foreground">{isOnline ? "Online" : "Last seen recently"}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" title="Voice call">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" title="Video call">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" title="More options">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message, index) => {
                const isOwnMessage = message.sender_id === user?.id
                const showAvatar = index === 0 || messages[index - 1].sender_id !== message.sender_id
                const showTime =
                  index === messages.length - 1 ||
                  new Date(messages[index + 1].created_at).getTime() - new Date(message.created_at).getTime() > 300000 // 5 minutes

                return (
                  <div key={message.id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`flex items-end space-x-2 max-w-[70%] ${isOwnMessage ? "flex-row-reverse space-x-reverse" : ""}`}
                    >
                      {!isOwnMessage && showAvatar && (
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={recipientAvatar || "/placeholder.svg"} />
                          <AvatarFallback className="text-xs">{recipientName.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      )}
                      {!isOwnMessage && !showAvatar && <div className="w-6" />}

                      <div
                        className={`rounded-lg px-3 py-2 ${
                          isOwnMessage ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                        {showTime && (
                          <p
                            className={`text-xs mt-1 ${
                              isOwnMessage ? "text-primary-foreground/70" : "text-muted-foreground/70"
                            }`}
                          >
                            {formatMessageTime(message.created_at)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>

      {/* Message Input */}
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" className="px-2">
            <Smile className="h-4 w-4" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1"
            disabled={sending}
          />
          <Button onClick={sendMessage} disabled={!newMessage.trim() || sending} size="sm">
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Press Enter to send, Shift+Enter for new line</p>
      </div>
    </Card>
  )
}
