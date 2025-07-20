"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, MessageCircle, Plus, Users, AlertCircle, Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

interface User {
  id: string
  user_id: string
  display_name: string
  stage_name?: string
  full_name?: string
  bio?: string
  profession?: string
  profile_picture_url?: string
  category?: string
  location?: string
}

interface SearchResponse {
  users: User[]
  count: number
  query: string
}

interface NewChatDialogProps {
  onConversationCreated?: (conversationId: string) => void
}

export function NewChatDialog({ onConversationCreated }: NewChatDialogProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)
  const { user } = useAuth()

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch(searchQuery.trim())
      } else {
        setSearchResults([])
        setSearchError(null)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const performSearch = async (query: string) => {
    if (!query || query.length < 2) return

    try {
      setIsSearching(true)
      setSearchError(null)

      console.log("🔍 Searching for users:", query)

      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Search API error:", response.status, errorText)
        setSearchError(`Search failed (${response.status})`)
        setSearchResults([])
        return
      }

      const data = await response.json()
      console.log("🔍 Search response:", data)

      const searchData = data as SearchResponse
      const users = searchData.users || []

      // Filter out current user
      const filteredUsers = users.filter((u) => u.user_id !== user?.id)

      setSearchResults(filteredUsers)

      if (filteredUsers.length === 0 && query.length >= 2) {
        setSearchError("No users found matching your search")
      }
    } catch (error) {
      console.error("❌ Search error:", error)
      setSearchError("Failed to search users. Please try again.")
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleUserSelect = (selectedUser: User) => {
    // Prevent selecting the same user twice
    if (selectedUsers.find((u) => u.user_id === selectedUser.user_id)) {
      return
    }

    // Prevent selecting current user
    if (selectedUser.user_id === user?.id) {
      return
    }

    setSelectedUsers((prev) => [...prev, selectedUser])
  }

  const handleUserRemove = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.user_id !== userId))
  }

  const handleCreateConversation = async () => {
    if (selectedUsers.length === 0) {
      setCreateError("Please select at least one user")
      return
    }

    if (!user?.id) {
      setCreateError("You must be logged in to create a conversation")
      return
    }

    try {
      setIsCreating(true)
      setCreateError(null)

      console.log(
        "💬 Creating conversation with users:",
        selectedUsers.map((u) => u.user_id),
      )

      const requestBody = {
        participants: selectedUsers.map((u) => u.user_id),
        currentUserId: user.id,
        title:
          selectedUsers.length === 1
            ? `Chat with ${selectedUsers[0].display_name}`
            : `Group chat with ${selectedUsers.length} people`,
      }

      console.log("📤 Request body:", requestBody)

      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      console.log("📥 Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Create conversation API error:", response.status, errorText)

        try {
          const errorData = JSON.parse(errorText)
          setCreateError(errorData.details || errorData.error || "Failed to create conversation")
        } catch {
          setCreateError(`Failed to create conversation (${response.status})`)
        }
        return
      }

      const data = await response.json()
      console.log("💬 Create conversation response:", data)

      // Success!
      console.log("✅ Conversation created successfully:", data.conversation_id)

      // Reset form
      setSelectedUsers([])
      setSearchQuery("")
      setSearchResults([])
      setOpen(false)

      // Notify parent component
      if (onConversationCreated && data.conversation_id) {
        onConversationCreated(data.conversation_id)
      }
    } catch (error) {
      console.error("❌ Error creating conversation:", error)
      setCreateError("Failed to create conversation. Please try again.")
    } finally {
      setIsCreating(false)
    }
  }

  const resetDialog = () => {
    setSearchQuery("")
    setSearchResults([])
    setSelectedUsers([])
    setSearchError(null)
    setCreateError(null)
    setIsSearching(false)
    setIsCreating(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen)
        if (!newOpen) {
          resetDialog()
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
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
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">Selected ({selectedUsers.length})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((selectedUser) => (
                  <Badge key={selectedUser.user_id} variant="secondary" className="gap-2 pr-1">
                    <Avatar className="h-4 w-4">
                      <AvatarImage src={selectedUser.profile_picture_url || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs">
                        {selectedUser.display_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs">{selectedUser.display_name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleUserRemove(selectedUser.user_id)}
                    >
                      ×
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          <ScrollArea className="h-64">
            {searchError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{searchError}</AlertDescription>
              </Alert>
            ) : searchQuery.length >= 2 ? (
              isSearching ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3 p-2">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-1 flex-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-1">
                  {searchResults.map((searchUser) => {
                    const isSelected = selectedUsers.some((u) => u.user_id === searchUser.user_id)
                    const isCurrentUser = searchUser.user_id === user?.id

                    return (
                      <Button
                        key={searchUser.user_id}
                        variant={isSelected ? "secondary" : "ghost"}
                        className="w-full justify-start h-auto p-3"
                        onClick={() => handleUserSelect(searchUser)}
                        disabled={isSelected || isCurrentUser}
                      >
                        <div className="flex items-center space-x-3 w-full">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={searchUser.profile_picture_url || "/placeholder.svg"} />
                            <AvatarFallback>{searchUser.display_name.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 text-left min-w-0">
                            <p className="font-medium truncate">
                              {searchUser.display_name}
                              {isCurrentUser && " (You)"}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {searchUser.profession && (
                                <Badge variant="outline" className="text-xs">
                                  {searchUser.profession}
                                </Badge>
                              )}
                              {searchUser.location && <span className="text-xs">{searchUser.location}</span>}
                            </div>
                          </div>
                          {isSelected && (
                            <Badge variant="default" className="text-xs">
                              Selected
                            </Badge>
                          )}
                        </div>
                      </Button>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">No users found</p>
                  <p className="text-xs">Try searching for "sud", "suresh", or "sunita"</p>
                </div>
              )
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">Search for users to start a conversation</p>
                <p className="text-xs">Type at least 2 characters</p>
              </div>
            )}
          </ScrollArea>

          {/* Create Error */}
          {createError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{createError}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateConversation}
              disabled={selectedUsers.length === 0 || isCreating}
              className="gap-2"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <MessageCircle className="h-4 w-4" />
                  Create Chat ({selectedUsers.length})
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
