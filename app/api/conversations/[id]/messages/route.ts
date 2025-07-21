import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { randomUUID } from "crypto"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const conversationId = params.id
    console.log("📨 Fetching messages for conversation:", conversationId)

    if (!conversationId) {
      return NextResponse.json(
        {
          error: "Conversation ID is required",
          messages: [],
        },
        { status: 400 },
      )
    }

    // Get messages for the conversation
    const { data: messages, error: messagesError } = await supabase
      .from("messages")
      .select(`
        id,
        content,
        sender_id,
        conversation_id,
        created_at
      `)
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })

    if (messagesError) {
      console.error("❌ Error fetching messages:", messagesError)
      return NextResponse.json(
        {
          error: "Failed to fetch messages",
          details: messagesError.message,
          messages: [],
        },
        { status: 500 },
      )
    }

    console.log("✅ Found messages:", messages?.length || 0)

    // Get sender profiles for all messages
    const senderIds = [...new Set((messages || []).map((m) => m.sender_id))]
    let senderProfiles: Record<string, any> = {}

    if (senderIds.length > 0) {
      try {
        // Try to get profiles with all columns
        const { data: profiles, error: profilesError } = await supabase
          .from("author_profiles")
          .select("user_id, display_name, full_name, profile_picture_url")
          .in("user_id", senderIds)

        if (profilesError) {
          console.warn("⚠️ Error with full profile query, trying basic columns:", profilesError)

          // Fallback to basic columns
          const { data: basicProfiles, error: basicError } = await supabase
            .from("author_profiles")
            .select("user_id, display_name, full_name")
            .in("user_id", senderIds)

          if (basicError) {
            console.error("❌ Error fetching basic profiles:", basicError)
          } else {
            senderProfiles = (basicProfiles || []).reduce(
              (acc, profile) => {
                acc[profile.user_id] = {
                  ...profile,
                  profile_picture_url: null,
                }
                return acc
              },
              {} as Record<string, any>,
            )
          }
        } else {
          senderProfiles = (profiles || []).reduce(
            (acc, profile) => {
              acc[profile.user_id] = profile
              return acc
            },
            {} as Record<string, any>,
          )
        }
      } catch (error) {
        console.error("❌ Error fetching sender profiles:", error)
        // Create fallback profiles
        senderProfiles = senderIds.reduce(
          (acc, id) => {
            acc[id] = {
              user_id: id,
              display_name: "Unknown User",
              full_name: "Unknown User",
              profile_picture_url: null,
            }
            return acc
          },
          {} as Record<string, any>,
        )
      }
    }

    // Enrich messages with sender info
    const enrichedMessages = (messages || []).map((message) => ({
      ...message,
      sender: senderProfiles[message.sender_id] || {
        user_id: message.sender_id,
        display_name: "Unknown User",
        full_name: "Unknown User",
        profile_picture_url: null,
      },
    }))

    return NextResponse.json({
      messages: enrichedMessages,
    })
  } catch (error) {
    console.error("❌ Messages API error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        messages: [],
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const conversationId = params.id
    const body = await request.json()
    const { content, senderId } = body

    console.log("📨 Creating message for conversation:", conversationId)
    console.log("📨 Sender:", senderId)
    console.log("📨 Content:", content)

    if (!content || !senderId) {
      return NextResponse.json(
        {
          error: "Content and sender ID are required",
          message: null,
        },
        { status: 400 },
      )
    }

    // Verify sender exists in author_profiles
    const { data: senderProfile, error: senderError } = await supabase
      .from("author_profiles")
      .select("user_id, display_name, full_name")
      .eq("user_id", senderId)
      .single()

    if (senderError) {
      console.error("❌ Error verifying sender:", senderError)
      return NextResponse.json(
        {
          error: "Invalid sender",
          details: senderError.message,
          message: null,
        },
        { status: 400 },
      )
    }

    // Create message
    const messageId = randomUUID()
    const now = new Date().toISOString()

    const { data: message, error: messageError } = await supabase
      .from("messages")
      .insert({
        id: messageId,
        conversation_id: conversationId,
        sender_id: senderId,
        content: content,
        created_at: now,
      })
      .select(`
        id,
        content,
        sender_id,
        conversation_id,
        created_at
      `)
      .single()

    if (messageError) {
      console.error("❌ Error creating message:", messageError)
      return NextResponse.json(
        {
          error: "Failed to create message",
          details: messageError.message,
          message: null,
        },
        { status: 500 },
      )
    }

    // Update conversation's updated_at timestamp
    // await supabase.from("conversations").update({ updated_at: now }).eq("id", conversationId)

    console.log("✅ Message created successfully:", messageId)

    // Return message with sender info
    return NextResponse.json({
      message: {
        ...message,
        sender: senderProfile,
      },
    })
  } catch (error) {
    console.error("❌ Create message error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        message: null,
      },
      { status: 500 },
    )
  }
}
