"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth/auth-provider"
import { MessagingInterface } from "@/components/messaging/messaging-interface"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, MessageSquare, Plus, Users } from "lucide-react"

interface Contact {
  id: string
  display_name: string
  avatar_url?: string
  last_message?: string
  unread_count: number
  last_message_at?: string
}

interface Profile {
  id: string
  user_id: string
  display_name: string
  full_name: string
  avatar_url?: string
  primary_roles?: string[]
}

export default function MessagesPage() {
  const { user } = useAuth()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [allProfiles, setAllProfiles] = useState<Profile[]>([])
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showNewChat, setShowNewChat] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadContacts()
      loadAllProfiles()
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
        .select("user_id, display_name, full_name, avatar_url")
        .in("user_id", uniqueParticipantIds)

      // Transform conversations to contacts
      const contactsData =
        conversations?.map((conv) => {
          const otherParticipantId = conv.participant_1 === user?.id ? conv.participant_2 : conv.participant_1
          const profile = profiles?.find((p) => p.user_id === otherParticipantId)
          const lastMessage = conv.messages?.[0]

          return {
            id: otherParticipantId,
            display_name: profile?.display_name || profile?.full_name || "Unknown User",
            avatar_url: profile?.avatar_url,
            last_message: lastMessage?.content || "No messages yet",
            unread_count: 0, // TODO: Calculate actual unread count
            last_message_at: conv.last_message_at,
          }
        }) || []

      setContacts(contactsData)
    } catch (error) {
      console.error("Error loading contacts:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadAllProfiles = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from("author_profiles")
        .select("id, user_id, display_name, full_name, avatar_url, primary_roles")
        .neq("user_id", user?.id)
        .limit(50)

      if (error) throw error
      setAllProfiles(profiles || [])
    } catch (error) {
      console.error("Error loading profiles:", error)
    }
  }

  const startNewConversation = async (profileId: string) => {
    try {
      // Check if conversation already exists
      const existingContact = contacts.find((c) => c.id === profileId)
      if (existingContact) {
        setSelectedContact(existingContact)
        setShowNewChat(false)
        return
      }

      // Create new conversation
      const { data: newConversation, error } = await supabase
        .from("conversations")
        .insert({
          participant_1: user?.id,
          participant_2: profileId,
        })
        .select()
        .single()

      if (error) throw error

      // Get profile info
      const profile = allProfiles.find((p) => p.user_id === profileId)
      if (profile) {
        const newContact: Contact = {
          id: profileId,
          display_name: profile.display_name || profile.full_name || "Unknown User",
          avatar_url: profile.avatar_url,
          last_message: "No messages yet",
          unread_count: 0,
        }

        setContacts((prev) => [newContact, ...prev])
        setSelectedContact(newContact)
      }

      setShowNewChat(false)
    } catch (error) {
      console.error("Error starting conversation:", error)
    }
  }

  const filteredContacts = contacts.filter((contact) =>
    contact.display_name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredProfiles = allProfiles.filter((profile) =>
    (profile.display_name || profile.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()),
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
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Messages
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNewChat(!showNewChat)}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                New
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={showNewChat ? "Search professionals..." : "Search conversations..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1 max-h-[500px] overflow-y-auto">
              {showNewChat ? (
                // Show all profiles for new chat
                <>
                  <div className="px-4 py-2 text-sm font-medium text-muted-foreground border-b">
                    Start New Conversation
                  </div>
                  {filteredProfiles.map((profile) => (
                    <div
                      key={profile.id}
                      className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => startNewConversation(profile.user_id)}
                    >
                      <Avatar>
                        <AvatarImage src={profile.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback>
                          {(profile.display_name || profile.full_name || "U").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{profile.display_name || profile.full_name}</p>
                        {profile.primary_roles && profile.primary_roles.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {profile.primary_roles[0]}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  {filteredProfiles.length === 0 && (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No professionals found</p>
                    </div>
                  )}
                </>
              ) : (
                // Show existing conversations
                <>
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
                            <Badge
                              variant="destructive"
                              className="h-5 w-5 p-0 flex items-center justify-center text-xs"
                            >
                              {contact.unread_count}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{contact.last_message}</p>
                      </div>
                    </div>
                  ))}

                  {filteredContacts.length === 0 && !showNewChat && (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No conversations found</p>
                      <Button variant="outline" size="sm" onClick={() => setShowNewChat(true)} className="mt-2">
                        Start New Chat
                      </Button>
                    </div>
                  )}
                </>
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
                <p className="text-muted-foreground mb-4">Choose a contact from the sidebar to start messaging</p>
                <Button onClick={() => setShowNewChat(true)} variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Start New Chat
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
