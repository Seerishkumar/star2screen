"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth/auth-provider"
import { MessagingInterface } from "@/components/messaging/messaging-interface"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, MessageSquare } from "lucide-react"

interface Contact {
  id: string
  display_name: string
  avatar_url?: string
  last_message?: string
  unread_count: number
}

export default function MessagesPage() {
  const { user } = useAuth()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadContacts()
    }
  }, [user])

  const loadContacts = async () => {
    try {
      // Get all conversations for the current user
      const { data: conversations, error } = await supabase
        .from("conversations")
        .select(`
          id,
          participant_1,
          participant_2,
          last_message_at,
          messages (
            content,
            created_at,
            sender_id
          )
        `)
        .or(`participant_1.eq.${user?.id},participant_2.eq.${user?.id}`)
        .order("last_message_at", { ascending: false })

      if (error) throw error

      // Get user profiles for all participants
      const participantIds = conversations?.flatMap((conv) => [conv.participant_1, conv.participant_2]) || []
      const uniqueParticipantIds = [...new Set(participantIds)].filter((id) => id !== user?.id)

      const { data: profiles } = await supabase
        .from("author_profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", uniqueParticipantIds)

      // Transform conversations to contacts
      const contactsData =
        conversations?.map((conv) => {
          const otherParticipantId = conv.participant_1 === user?.id ? conv.participant_2 : conv.participant_1
          const profile = profiles?.find((p) => p.user_id === otherParticipantId)
          const lastMessage = conv.messages?.[0]

          return {
            id: otherParticipantId,
            display_name: profile?.display_name || "Unknown User",
            avatar_url: profile?.avatar_url,
            last_message: lastMessage?.content || "No messages yet",
            unread_count: 0, // TODO: Calculate actual unread count
          }
        }) || []

      setContacts(contactsData)
    } catch (error) {
      console.error("Error loading contacts:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredContacts = contacts.filter((contact) =>
    contact.display_name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Contacts Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Messages
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedContact?.id === contact.id ? "bg-muted" : ""
                  }`}
                  onClick={() => setSelectedContact(contact)}
                >
                  <Avatar>
                    <AvatarImage src={contact.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>{contact.display_name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">{contact.display_name}</p>
                      {contact.unread_count > 0 && (
                        <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                          {contact.unread_count}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{contact.last_message}</p>
                  </div>
                </div>
              ))}

              {filteredContacts.length === 0 && (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No conversations found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <div className="lg:col-span-2">
          {selectedContact ? (
            <MessagingInterface
              recipientId={selectedContact.id}
              recipientName={selectedContact.display_name}
              recipientAvatar={selectedContact.avatar_url}
            />
          ) : (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                <p className="text-muted-foreground">Choose a contact from the sidebar to start messaging</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
