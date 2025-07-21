"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ConversationList } from "@/components/messaging/conversation-list"
import { ChatInterface } from "@/components/messaging/chat-interface"
import { NewChatDialog } from "@/components/messaging/new-chat-dialog"
import { Plus, MessageCircle } from "lucide-react"
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

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [showNewChatDialog, setShowNewChatDialog] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [showMobileChat, setShowMobileChat] = useState(false)
  const { user } = useAuth()

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    setShowMobileChat(true)
  }

  const handleNewConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    setShowMobileChat(true)
    setRefreshTrigger((prev) => prev + 1)
    setShowNewChatDialog(false)
  }

  const handleBackToList = () => {
    setShowMobileChat(false)
    setSelectedConversation(null)
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h1 className="text-2xl font-bold mb-2">Messages</h1>
          <p className="text-muted-foreground">Please log in to access your messages</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">Connect with other film industry professionals</p>
        </div>
        <Button onClick={() => setShowNewChatDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <div className={`lg:col-span-1 ${showMobileChat ? "hidden lg:block" : ""}`}>
          <div className="border rounded-lg h-full flex flex-col">
            <div className="p-4 border-b">
              <h2 className="font-semibold flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Your Conversations
              </h2>
            </div>
            <ConversationList
              onConversationSelect={handleConversationSelect}
              selectedConversationId={selectedConversation?.id}
              refreshTrigger={refreshTrigger}
            />
          </div>
        </div>

        {/* Chat Interface */}
        <div className={`lg:col-span-2 ${!showMobileChat ? "hidden lg:block" : ""}`}>
          <div className="border rounded-lg h-full flex flex-col">
            <ChatInterface conversation={selectedConversation} onBack={handleBackToList} />
          </div>
        </div>
      </div>

      <NewChatDialog
        open={showNewChatDialog}
        onOpenChange={setShowNewChatDialog}
        onConversationCreated={handleNewConversation}
      />
    </div>
  )
}
