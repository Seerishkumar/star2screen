"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { supabase } from "@/lib/supabase"
import type { Comment } from "@/types/blog"

interface CommentSectionProps {
  articleId: string
}

export function CommentSection({ articleId }: CommentSectionProps) {
  const router = useRouter()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isLoadingComments, setIsLoadingComments] = useState(true)

  // Load comments and check auth status
  useState(() => {
    const loadComments = async () => {
      const { data } = await supabase
        .from("comments")
        .select(`
          *,
          user:user_id (
            id,
            email,
            user_metadata
          )
        `)
        .eq("article_id", articleId)
        .eq("is_approved", true)
        .order("created_at", { ascending: false })

      setComments(data || [])
      setIsLoadingComments(false)
    }

    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }

    loadComments()
    checkAuth()
  }, [articleId])

  const handleSubmitComment = async () => {
    if (!user) {
      router.push("/login?redirect=" + encodeURIComponent(window.location.pathname))
      return
    }

    if (!newComment.trim()) return

    setIsLoading(true)

    const { data, error } = await supabase
      .from("comments")
      .insert({
        article_id: articleId,
        user_id: user.id,
        content: newComment,
        is_approved: true, // Auto-approve for now
      })
      .select(`
        *,
        user:user_id (
          id,
          email,
          user_metadata
        )
      `)

    setIsLoading(false)

    if (!error && data) {
      setComments([data[0], ...comments])
      setNewComment("")
    }
  }

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold mb-6">Comments</h3>

      {/* Comment form */}
      <div className="mb-8">
        <Textarea
          placeholder={user ? "Write a comment..." : "Login to comment"}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={!user || isLoading}
          className="mb-2"
          rows={4}
        />
        <div className="flex justify-end">
          <Button onClick={handleSubmitComment} disabled={!user || isLoading || !newComment.trim()}>
            {isLoading ? "Posting..." : "Post Comment"}
          </Button>
        </div>
      </div>

      {/* Comments list */}
      <div className="space-y-6">
        {isLoadingComments ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading comments...</p>
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="border-b pb-6 last:border-0">
              <div className="flex gap-4">
                <Avatar>
                  <AvatarImage src={comment.user?.user_metadata?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback>
                    {comment.user?.user_metadata?.full_name?.[0] || comment.user?.email?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium">
                      {comment.user?.user_metadata?.full_name || comment.user?.email?.split("@")[0] || "Anonymous"}
                    </h4>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{comment.content}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
    </div>
  )
}
