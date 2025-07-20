import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { crypto } from "crypto"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  try {
    console.log("💬 Conversations API called")

    // Validate environment variables first
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("❌ Missing Supabase environment variables")
      return NextResponse.json(
        {
          error: "Server configuration error",
          conversations: [],
        },
        { status: 500 },
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    console.log("👤 Getting conversations for user:", userId)

    if (!userId) {
      console.log("❌ No user ID provided")
      return NextResponse.json({
        conversations: [],
        count: 0,
        message: "User ID is required",
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    console.log("🔍 Querying conversation_participants...")

    // Get conversations for the user using direct SQL query
    const { data: participantData, error: participantError } = await supabase
      .from("conversation_participants")
      .select(`
        conversation_id,
        conversations!inner(
          id,
          title,
          type,
          created_at,
          updated_at
        )
      `)
      .eq("user_id", userId)
      .eq("is_active", true)

    if (participantError) {
      console.error("❌ Error fetching conversation participants:", participantError)
      return NextResponse.json(
        {
          error: "Failed to fetch conversations",
          details: participantError.message,
          conversations: [],
        },
        { status: 500 },
      )
    }

    console.log("✅ Found participant data:", participantData?.length || 0)

    if (!participantData || participantData.length === 0) {
      console.log("ℹ️ No conversations found for user")
      return NextResponse.json({
        conversations: [],
        count: 0,
        message: "No conversations found",
      })
    }

    // Transform the data
    const conversations = participantData.map((item) => ({
      id: item.conversations.id,
      title: item.conversations.title || "Untitled Conversation",
      type: item.conversations.type || "direct",
      created_at: item.conversations.created_at,
      updated_at: item.conversations.updated_at,
      participants: [], // We'll populate this separately if needed
    }))

    console.log("✅ Returning conversations:", conversations.length)

    return NextResponse.json({
      conversations,
      count: conversations.length,
    })
  } catch (error) {
    console.error("❌ Unexpected error in conversations API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        conversations: [],
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("💬 Creating new conversation")

    // Validate environment variables first
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("❌ Missing Supabase environment variables")
      return NextResponse.json(
        {
          error: "Server configuration error",
        },
        { status: 500 },
      )
    }

    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error("❌ Error parsing request body:", parseError)
      return NextResponse.json(
        {
          error: "Invalid JSON in request body",
          details: parseError instanceof Error ? parseError.message : "Unknown parsing error",
        },
        { status: 400 },
      )
    }

    const { participants, currentUserId, title } = body

    console.log("📝 Conversation data:", { participants, currentUserId, title })

    if (!participants || !Array.isArray(participants) || participants.length === 0) {
      return NextResponse.json(
        {
          error: "Invalid participants",
          details: "Participants array is required and must not be empty",
        },
        { status: 400 },
      )
    }

    if (!currentUserId) {
      return NextResponse.json(
        {
          error: "Invalid user",
          details: "Current user ID is required",
        },
        { status: 400 },
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Generate a UUID for the conversation
    const conversationId = crypto.randomUUID()
    const now = new Date().toISOString()

    console.log("🆕 Creating conversation with ID:", conversationId)

    // Create the conversation
    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .insert({
        id: conversationId,
        title: title || "New Conversation",
        type: participants.length === 1 ? "direct" : "group",
        created_at: now,
        updated_at: now,
      })
      .select()
      .single()

    if (conversationError) {
      console.error("❌ Error creating conversation:", conversationError)
      return NextResponse.json(
        {
          error: "Failed to create conversation",
          details: conversationError.message,
        },
        { status: 500 },
      )
    }

    console.log("✅ Conversation created:", conversation)

    // Add all participants (including current user)
    const allParticipants = [currentUserId, ...participants]
    const uniqueParticipants = [...new Set(allParticipants)] // Remove duplicates

    console.log("👥 Adding participants:", uniqueParticipants)

    const participantInserts = uniqueParticipants.map((participantId) => ({
      conversation_id: conversationId,
      user_id: participantId,
      is_active: true,
      joined_at: now,
    }))

    const { error: participantsError } = await supabase.from("conversation_participants").insert(participantInserts)

    if (participantsError) {
      console.error("❌ Error adding participants:", participantsError)

      // Try to clean up the conversation
      try {
        await supabase.from("conversations").delete().eq("id", conversationId)
        console.log("🧹 Cleaned up conversation after participant error")
      } catch (cleanupError) {
        console.error("❌ Error cleaning up conversation:", cleanupError)
      }

      return NextResponse.json(
        {
          error: "Failed to add participants",
          details: participantsError.message,
        },
        { status: 500 },
      )
    }

    console.log("✅ Participants added successfully")

    return NextResponse.json({
      conversation_id: conversationId,
      title: conversation.title,
      type: conversation.type,
      participants: uniqueParticipants,
      message: "Conversation created successfully",
    })
  } catch (error) {
    console.error("❌ Unexpected error creating conversation:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
