"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { MessageCircle } from "lucide-react"
import { ConversationList } from "@/components/messaging/conversation-list"
import { NewChatDialog } from "@/components/messaging/new-chat-dialog"
import { useAuth } from "@/components/auth/auth-provider"

export default function MessagesPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const { user } = useAuth()

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversationId(conversationId)
  }

  const handleConversationCreated = (conversationId: string) => {
    console.log("🆕 New conversation created:", conversationId)
    setSelectedConversationId(conversationId)
    // Refresh the page to show the new conversation
    window.location.reload()
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Sign in to access messages</h2>
              <p className="text-muted-foreground">You need to be logged in to view and send messages.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Your Conversations
            </CardTitle>
            <NewChatDialog onConversationCreated={handleConversationCreated} />
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            <ConversationList
              onConversationSelect={handleConversationSelect}
              selectedConversationId={selectedConversationId}
            />
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-2">
          <CardContent className="flex items-center justify-center h-full">
            {selectedConversationId ? (
              <div className="text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Chat Interface</h3>
                <p className="text-muted-foreground">Chat interface for conversation: {selectedConversationId}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  (Chat interface will be implemented in the next phase)
                </p>
              </div>
            ) : (
              <div className="text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                <p className="text-muted-foreground">Choose a conversation from the list to start messaging</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
