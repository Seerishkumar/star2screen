"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Plus, X, Check } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

interface User {
  user_id: string
  display_name: string
  full_name: string
  bio?: string
  profile_picture_url?: string
  category?: string
  location?: string
}

interface NewChatDialogProps {
  onConversationCreated: (conversationId: string) => void
}

export function NewChatDialog({ onConversationCreated }: NewChatDialogProps) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const [searching, setSearching] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setSearching(true)
    setError(null)

    try {
      console.log("🔍 Searching for users:", query)

      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()

      console.log("🔍 Search response:", data)

      if (!response.ok) {
        setError(data.error || "Search failed")
        setSearchResults([])
        return
      }

      // Filter out current user from results
      const filteredUsers = (data.users || []).filter((u: User) => u.user_id !== user?.id)
      setSearchResults(filteredUsers)
    } catch (error) {
      console.error("❌ Search error:", error)
      setError("Search failed. Please try again.")
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    searchUsers(value)
  }

  const toggleUserSelection = (selectedUser: User) => {
    setSelectedUsers((prev) => {
      const isSelected = prev.some((u) => u.user_id === selectedUser.user_id)
      if (isSelected) {
        return prev.filter((u) => u.user_id !== selectedUser.user_id)
      } else {
        return [...prev, selectedUser]
      }
    })
  }

  const removeSelectedUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.user_id !== userId))
  }

  const createConversation = async () => {
    if (selectedUsers.length === 0 || !user) return

    setCreating(true)
    setError(null)

    try {
      console.log(
        "🆕 Creating conversation with users:",
        selectedUsers.map((u) => u.user_id),
      )

      // Include current user in participants
      const participants = [user.id, ...selectedUsers.map((u) => u.user_id)]

      // Generate title for direct messages
      let title = null
      if (selectedUsers.length === 1) {
        title = `Chat with ${selectedUsers[0].display_name || selectedUsers[0].full_name}`
      }

      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          participants,
          title,
          type: selectedUsers.length === 1 ? "direct" : "group",
        }),
      })

      const data = await response.json()

      console.log("🆕 Create conversation response:", data)

      if (!response.ok) {
        setError(data.error || "Failed to create conversation")
        return
      }

      console.log("✅ Conversation created:", data.conversation.id)

      // Reset form and close dialog
      setSearchQuery("")
      setSearchResults([])
      setSelectedUsers([])
      setOpen(false)

      // Notify parent component
      onConversationCreated(data.conversation.id)
    } catch (error) {
      console.error("❌ Create conversation error:", error)
      setError("Failed to create conversation. Please try again.")
    } finally {
      setCreating(false)
    }
  }

  const resetDialog = () => {
    setSearchQuery("")
    setSearchResults([])
    setSelectedUsers([])
    setError(null)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen)
        if (!newOpen) resetDialog()
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" />
          New Chat
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Start New Conversation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for users..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Selected ({selectedUsers.length}):</p>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((user) => (
                  <Badge key={user.user_id} variant="secondary" className="flex items-center gap-1">
                    {user.display_name || user.full_name}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => removeSelectedUser(user.user_id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">{error}</div>}

          {/* Search Results */}
          <ScrollArea className="h-64">
            {searching ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-pulse text-muted-foreground">Searching...</div>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map((searchUser) => {
                  const isSelected = selectedUsers.some((u) => u.user_id === searchUser.user_id)

                  return (
                    <div
                      key={searchUser.user_id}
                      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        isSelected ? "bg-primary/10 border border-primary" : "hover:bg-muted border border-transparent"
                      }`}
                      onClick={() => toggleUserSelection(searchUser)}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={searchUser.profile_picture_url || "/placeholder.svg"} />
                        <AvatarFallback>
                          {(searchUser.display_name || searchUser.full_name || "U")[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{searchUser.display_name || searchUser.full_name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="text-red-500">📍 {searchUser.location || "Not specified"}</span>
                          <span className="text-blue-500">🎭 {searchUser.category || "Not specified"}</span>
                        </div>
                      </div>

                      {isSelected && <Check className="h-5 w-5 text-primary" />}
                    </div>
                  )
                })}
              </div>
            ) : searchQuery.length >= 2 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No users found</p>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Type to search for users</p>
              </div>
            )}
          </ScrollArea>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createConversation} disabled={selectedUsers.length === 0 || creating}>
              {creating ? "Creating..." : `Create Chat (${selectedUsers.length})`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
