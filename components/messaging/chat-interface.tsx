"use client"

import { useEffect } from "react"

import { useRef } from "react"

import { useState } from "react"

import type React from "react"
import { MessageCircle, AlertCircle, RefreshCw } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/components/auth/auth-provider"

interface Message {
  id: string
  content: string
  sender_id: string
  conversation_id: string
  created_at: string
  sender: {
    user_id: string
    display_name: string | null
    full_name: string | null
    profile_picture_url?: string | null
  }
}

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

interface ChatInterfaceProps {
  conversation: Conversation | null
  onBack?: () => void
}

export function ChatInterface({ conversation, onBack }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchMessages = async () => {
    if (!conversation?.id) return

    try {
      setLoading(true)
      setError(null)

      console.log("📨 Fetching messages for conversation:", conversation.id)

      const response = await fetch(`/api/conversations/${conversation.id}/messages`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Messages API error:", response.status, errorText)
        setError(`Failed to load messages (${response.status})`)
        return
      }

      const data = await response.json()
      console.log("📨 Messages response:", data)

      setMessages(data.messages || [])
      setTimeout(scrollToBottom, 100)
    } catch (error) {
      console.error("❌ Error fetching messages:", error)
      setError("Failed to load messages. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversation?.id || !user?.id || sending) return

    try {
      setSending(true)
      setError(null)

      console.log("📨 Sending message:", newMessage)

      const response = await fetch(`/api/conversations/${conversation.id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newMessage.trim(),
          senderId: user.id,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Send message error:", response.status, errorText)
        setError(`Failed to send message (${response.status})`)
        return
      }

      const data = await response.json()
      console.log("📨 Message sent:", data)

      // Add the new message to the list
      if (data.message) {
        setMessages((prev) => [...prev, data.message])
        setNewMessage("")
        setTimeout(scrollToBottom, 100)
      }
    } catch (error) {
      console.error("❌ Error sending message:", error)
      setError("Failed to send message. Please try again.")
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

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60)

      if (diffInMinutes < 1) {
        return "Just now"
      } else if (diffInMinutes < 60) {
        return `${Math.floor(diffInMinutes)}m ago`
      } else if (diffInMinutes < 24 * 60) {
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      } else {
        return date.toLocaleDateString([], { month: "short", day: "numeric" })
      }
    } catch {
      return "Unknown"
    }
  }

  const getConversationTitle = () => {
    if (!conversation) return "Chat"
    if (conversation.title) return conversation.title
    if (conversation.type === "direct" && conversation.other_participants.length > 0) {
      const participant = conversation.other_participants[0]
      return participant.display_name || participant.full_name || "Unknown User"
    }
    return "Group Chat"
  }

  const getSenderName = (message: Message) => {
    if (message.sender_id === user?.id) return "You"
    return message.sender?.display_name || message.sender?.full_name || "Unknown User"
  }

  useEffect(() => {
    if (conversation?.id) {
      fetchMessages()
    }
  }, [conversation?.id])

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Select a conversation</p>
          <p className="text-sm">Choose a conversation from the sidebar to start messaging</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-4 flex items-center gap-3">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack} className="md:hidden">
            ←
          </Button>
        )}
        <div className="flex-1">
          <h2 className="font-semibold">{getConversationTitle()}</h2>
          <p className="text-sm text-muted-foreground">
            {conversation.type === "group" ? "Group chat" : "Direct message"}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchMessages} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {loading && messages.length === 0 ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-16 w-full max-w-md" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={fetchMessages} className="ml-2 bg-transparent">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </AlertDescription>
          </Alert>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No messages yet</p>
            <p className="text-xs">Send a message to start the conversation</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const isOwn = message.sender_id === user?.id
              return (
                <div key={message.id} className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}>
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium">{getSenderName(message).charAt(0).toUpperCase()}</span>
                  </div>
                  <div className={`flex-1 max-w-md ${isOwn ? "text-right" : ""}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{getSenderName(message)}</span>
                      <span className="text-xs text-muted-foreground">{formatTime(message.created_at)}</span>
                    </div>
                    <div
                      className={`p-3 rounded-lg ${isOwn ? "bg-primary text-primary-foreground ml-auto" : "bg-muted"}`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Message Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1"
          />
          <Button onClick={sendMessage} disabled={!newMessage.trim() || sending} size="icon">
            <MessageCircle className="h-4 w-4" />
          </Button>
        </div>
        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
      </div>
    </div>
  )
}
