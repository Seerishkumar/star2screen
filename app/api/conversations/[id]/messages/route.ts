import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { cookies } from "next/headers"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("sb-access-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = (page - 1) * limit

    const conversationId = params.id

    // Get messages with sender info
    const { data: messages, error } = await supabase
      .from("messages")
      .select(`
        *,
        author_profiles!messages_sender_id_fkey(
          display_name,
          full_name,
          profile_picture_url
        ),
        message_attachments(*),
        message_reactions(
          reaction,
          user_id,
          author_profiles!message_reactions_user_id_fkey(
            display_name,
            full_name
          )
        ),
        reply_to:messages!messages_reply_to_id_fkey(
          id,
          content,
          sender_id,
          author_profiles!messages_sender_id_fkey(
            display_name,
            full_name
          )
        )
      `)
      .eq("conversation_id", conversationId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error("Error fetching messages:", error)
      return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
    }

    return NextResponse.json({ messages: messages.reverse() })
  } catch (error) {
    console.error("Error in messages API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("sb-access-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { content, senderId, messageType = "text", replyToId, attachments } = body

    const conversationId = params.id

    if (!content && !attachments?.length) {
      return NextResponse.json({ error: "Message content or attachments required" }, { status: 400 })
    }

    if (!senderId) {
      return NextResponse.json({ error: "Sender ID is required" }, { status: 400 })
    }

    // Verify user is participant in conversation
    const { data: participant } = await supabase
      .from("conversation_participants")
      .select("id")
      .eq("conversation_id", conversationId)
      .eq("user_id", senderId)
      .single()

    if (!participant) {
      return NextResponse.json({ error: "User is not a participant in this conversation" }, { status: 403 })
    }

    // Create message
    const { data: message, error: messageError } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content,
        message_type: messageType,
        reply_to_id: replyToId,
      })
      .select(`
        *,
        author_profiles!messages_sender_id_fkey(
          display_name,
          full_name,
          profile_picture_url
        )
      `)
      .single()

    if (messageError) {
      console.error("Error creating message:", messageError)
      return NextResponse.json({ error: "Failed to create message" }, { status: 500 })
    }

    // Add attachments if any
    if (attachments?.length) {
      const attachmentData = attachments.map((att) => ({
        message_id: message.id,
        file_name: att.fileName,
        file_size: att.fileSize,
        file_type: att.fileType,
        file_url: att.fileUrl,
        thumbnail_url: att.thumbnailUrl,
      }))

      await supabase.from("message_attachments").insert(attachmentData)
    }

    // Update participant's last_read_at
    await supabase
      .from("conversation_participants")
      .update({ last_read_at: new Date().toISOString() })
      .eq("conversation_id", conversationId)
      .eq("user_id", senderId)

    return NextResponse.json({ message })
  } catch (error) {
    console.error("Error in send message API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
