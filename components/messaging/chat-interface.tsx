"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Send, Paperclip, Smile, Reply, Heart, ThumbsUp, Laugh, Users } from "lucide-react"
import { format } from "date-fns"

interface Message {
  id: string
  content: string
  message_type: string
  created_at: string
  sender_id: string
  author_profiles: {
    display_name: string
    full_name: string
    profile_picture_url?: string
  }
  message_attachments: Array<{
    id: string
    file_name: string
    file_type: string
    file_url: string
    thumbnail_url?: string
  }>
  message_reactions: Array<{
    reaction: string
    user_id: string
    author_profiles: {
      display_name: string
      full_name: string
    }
  }>
  reply_to?: {
    id: string
    content: string
    sender_id: string
    author_profiles: {
      display_name: string
      full_name: string
    }
  }
}

interface Conversation {
  id: string
  type: "direct" | "group"
  title?: string
  other_participants: Array<{
    user_id: string
    author_profiles: {
      display_name: string
      full_name: string
      profile_picture_url?: string
    }
  }>
}

interface ChatInterfaceProps {
  /** Can be undefined while the user has not yet picked a chat */
  conversation?: Conversation
}

export function ChatInterface({ conversation }: ChatInterfaceProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const loadMessages = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/conversations/${conversation?.id}/messages`)
      if (!response.ok) throw new Error("Failed to fetch messages")

      const { messages } = await response.json()
      setMessages(messages)
    } catch (error) {
      console.error("Error loading messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || sending) return

    setSending(true)
    try {
      const response = await fetch(`/api/conversations/${conversation?.id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newMessage.trim(),
          senderId: user.id,
          messageType: "text",
          replyToId: replyingTo?.id,
        }),
      })

      if (!response.ok) throw new Error("Failed to send message")

      const { message } = await response.json()
      setMessages((prev) => [...prev, message])
      setNewMessage("")
      setReplyingTo(null)
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Failed to send message. Please try again.")
    } finally {
      setSending(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getConversationTitle = () => {
    if (conversation?.title) return conversation.title

    const participants = conversation?.other_participants ?? []
    if (conversation?.type === "direct" && participants.length > 0) {
      const participant = participants[0]
      return participant.author_profiles?.display_name || participant.author_profiles?.full_name || "Unknown User"
    }

    return "Group Chat"
  }

  const getConversationAvatar = () => {
    const participants = conversation?.other_participants ?? []
    if (conversation?.type === "direct" && participants.length > 0) {
      const participant = participants[0]
      return {
        src: participant.author_profiles?.profile_picture_url,
        fallback: (participant.author_profiles?.display_name ||
          participant.author_profiles?.full_name ||
          "U")[0].toUpperCase(),
      }
    }

    return {
      src: undefined,
      fallback: "G",
    }
  }

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return format(date, "HH:mm")
    } else if (diffInHours < 168) {
      // 7 days
      return format(date, "EEE HH:mm")
    } else {
      return format(date, "MMM dd, HH:mm")
    }
  }

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {}

    messages.forEach((message) => {
      const date = format(new Date(message.created_at), "yyyy-MM-dd")
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(message)
    })

    return groups
  }

  const avatar = getConversationAvatar()
  const messageGroups = groupMessagesByDate(messages)

  useEffect(() => {
    if (conversation) {
      loadMessages()
    }
  }, [conversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <CardHeader className="flex flex-row items-center space-y-0 pb-4 border-b">
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage src={avatar.src || "/placeholder.svg"} />
          <AvatarFallback>{avatar.fallback}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold">{getConversationTitle()}</h3>
          <p className="text-sm text-muted-foreground">
            {conversation?.type === "direct" ? "Direct Message" : "Group Chat"}
            {conversation?.other_participants && conversation.other_participants.length > 0 && (
              <span> • {conversation.other_participants.length + 1} members</span>
            )}
          </p>
        </div>
        {conversation?.type === "group" && <Users className="h-5 w-5 text-muted-foreground" />}
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[calc(100vh-300px)] p-4" ref={scrollAreaRef}>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-pulse text-muted-foreground">Loading messages...</div>
            </div>
          ) : (
            Object.entries(messageGroups).map(([date, dayMessages]) => (
              <div key={date}>
                {/* Date Separator */}
                <div className="flex items-center justify-center my-4">
                  <Separator className="flex-1" />
                  <Badge variant="secondary" className="mx-4">
                    {format(new Date(date), "MMMM dd, yyyy")}
                  </Badge>
                  <Separator className="flex-1" />
                </div>

                {/* Messages for this date */}
                {dayMessages.map((message, index) => {
                  const isOwnMessage = message.sender_id === user?.id
                  const showAvatar =
                    !isOwnMessage && (index === 0 || dayMessages[index - 1]?.sender_id !== message.sender_id)

                  return (
                    <div
                      key={message.id}
                      className={`flex items-end space-x-2 ${isOwnMessage ? "justify-end" : "justify-start"}`}
                    >
                      {!isOwnMessage && (
                        <Avatar className={`h-8 w-8 ${showAvatar ? "" : "invisible"}`}>
                          <AvatarImage src={message.author_profiles?.profile_picture_url || "/placeholder.svg"} />
                          <AvatarFallback>
                            {(message.author_profiles?.display_name ||
                              message.author_profiles?.full_name ||
                              "U")[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div className={`max-w-[70%] ${isOwnMessage ? "order-first" : ""}`}>
                        {/* Reply indicator */}
                        {message.reply_to && (
                          <div className="mb-1 p-2 bg-muted/50 rounded-t-lg border-l-2 border-primary">
                            <p className="text-xs text-muted-foreground">
                              Replying to {message.reply_to.author_profiles?.display_name || "Someone"}
                            </p>
                            <p className="text-sm truncate">{message.reply_to.content}</p>
                          </div>
                        )}

                        {/* Message bubble */}
                        <div
                          className={`p-3 rounded-lg ${
                            isOwnMessage ? "bg-primary text-primary-foreground" : "bg-muted"
                          } ${message.reply_to ? "rounded-tl-none" : ""}`}
                        >
                          {!isOwnMessage && showAvatar && (
                            <p className="text-xs font-semibold mb-1">
                              {message.author_profiles?.display_name || message.author_profiles?.full_name}
                            </p>
                          )}

                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                          {/* Attachments */}
                          {message.message_attachments?.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {message.message_attachments.map((attachment) => (
                                <div
                                  key={attachment.id}
                                  className="flex items-center space-x-2 p-2 bg-background/10 rounded"
                                >
                                  <Paperclip className="h-4 w-4" />
                                  <span className="text-sm">{attachment.file_name}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs opacity-70">{formatMessageTime(message.created_at)}</span>

                            {/* Message reactions */}
                            {message.message_reactions?.length > 0 && (
                              <div className="flex items-center space-x-1">
                                {message.message_reactions.map((reaction, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {reaction.reaction}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Message actions */}
                        <div className="flex items-center space-x-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" onClick={() => setReplyingTo(message)}>
                            <Reply className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Heart className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <ThumbsUp className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Laugh className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </ScrollArea>
      </CardContent>

      {/* Message Input */}
      <div className="border-t p-4">
        {/* Reply indicator */}
        {replyingTo && (
          <div className="mb-2 p-2 bg-muted rounded-lg flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">
                Replying to {replyingTo.author_profiles?.display_name || "Someone"}
              </p>
              <p className="text-sm truncate">{replyingTo.content}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>
              ×
            </Button>
          </div>
        )}

        <div className="flex items-end space-x-2">
          <Button variant="ghost" size="sm">
            <Paperclip className="h-4 w-4" />
          </Button>

          <div className="flex-1">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              disabled={sending}
            />
          </div>

          <Button variant="ghost" size="sm">
            <Smile className="h-4 w-4" />
          </Button>

          <Button onClick={sendMessage} disabled={!newMessage.trim() || sending} size="sm">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
