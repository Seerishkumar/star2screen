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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    console.log("💬 Conversations API - GET request")
    console.log("💬 User ID:", userId)

    if (!userId) {
      return NextResponse.json(
        {
          error: "User ID is required",
          conversations: [],
        },
        { status: 400 },
      )
    }

    // First, check what columns exist in author_profiles table
    const { data: tableInfo, error: tableError } = await supabase.from("author_profiles").select("*").limit(1)

    console.log("📋 Checking author_profiles table structure...")

    if (tableError) {
      console.error("❌ Error checking table structure:", tableError)
    }

    // Get conversations where user is a participant
    const { data: conversations, error: conversationsError } = await supabase
      .from("conversations")
      .select(`
        id,
        title,
        type,
        created_at,
        updated_at,
        conversation_participants!inner (
          user_id,
          is_active
        )
      `)
      .eq("conversation_participants.user_id", userId)
      .eq("conversation_participants.is_active", true)
      .order("updated_at", { ascending: false })

    if (conversationsError) {
      console.error("❌ Error fetching conversations:", conversationsError)
      return NextResponse.json(
        {
          error: "Failed to fetch conversations",
          details: conversationsError.message,
          conversations: [],
        },
        { status: 500 },
      )
    }

    console.log("✅ Found conversations:", conversations?.length || 0)

    // For each conversation, get other participants with safe column selection
    const enrichedConversations = await Promise.all(
      (conversations || []).map(async (conversation) => {
        // Get participant IDs (except current user)
        const { data: participantRows, error: participantErr } = await supabase
          .from("conversation_participants")
          .select("user_id")
          .eq("conversation_id", conversation.id)
          .eq("is_active", true)
          .neq("user_id", userId)

        if (participantErr) {
          console.error("❌ Error fetching participant IDs:", participantErr)
          return { ...conversation, other_participants: [] }
        }

        const participantIds = (participantRows ?? []).map((p) => p.user_id)

        // Fetch profile data with safe column selection
        let profiles: {
          user_id: string
          display_name: string | null
          full_name: string | null
          profile_picture_url?: string | null
        }[] = []

        if (participantIds.length) {
          try {
            // Try to select with all columns first
            const { data: profileRows, error: profileErr } = await supabase
              .from("author_profiles")
              .select("user_id, display_name, full_name, profile_picture_url")
              .in("user_id", participantIds)

            if (profileErr) {
              console.warn("⚠️ Error with full profile query, trying basic columns:", profileErr)

              // Fallback to basic columns only
              const { data: basicProfileRows, error: basicProfileErr } = await supabase
                .from("author_profiles")
                .select("user_id, display_name, full_name")
                .in("user_id", participantIds)

              if (basicProfileErr) {
                console.error("❌ Error fetching basic profiles:", basicProfileErr)
              } else {
                profiles = (basicProfileRows ?? []).map((profile) => ({
                  ...profile,
                  profile_picture_url: null,
                }))
              }
            } else {
              profiles = profileRows ?? []
            }
          } catch (error) {
            console.error("❌ Error in profile fetching:", error)
            // Return empty profiles array as fallback
            profiles = participantIds.map((id) => ({
              user_id: id,
              display_name: "Unknown User",
              full_name: "Unknown User",
              profile_picture_url: null,
            }))
          }
        }

        return { ...conversation, other_participants: profiles }
      }),
    )

    return NextResponse.json({
      conversations: enrichedConversations,
    })
  } catch (error) {
    console.error("❌ Conversations API error:", error)
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
    const body = await request.json()
    const { participants, title, type = "direct" } = body

    console.log("💬 Creating new conversation")
    console.log("💬 Participants:", participants)
    console.log("💬 Title:", title)
    console.log("💬 Type:", type)

    if (!participants || !Array.isArray(participants) || participants.length < 2) {
      return NextResponse.json(
        {
          error: "At least 2 participants are required",
          conversation: null,
        },
        { status: 400 },
      )
    }

    // Generate conversation ID
    const conversationId = randomUUID()

    // Create conversation
    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .insert({
        id: conversationId,
        title: title || null,
        type: type,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (conversationError) {
      console.error("❌ Error creating conversation:", conversationError)
      return NextResponse.json(
        {
          error: "Failed to create conversation",
          details: conversationError.message,
          conversation: null,
        },
        { status: 500 },
      )
    }

    // Add participants
    const participantInserts = participants.map((userId) => ({
      id: randomUUID(),
      conversation_id: conversationId,
      user_id: userId,
      is_active: true,
      joined_at: new Date().toISOString(),
    }))

    const { error: participantsError } = await supabase.from("conversation_participants").insert(participantInserts)

    if (participantsError) {
      console.error("❌ Error adding participants:", participantsError)
      // Clean up conversation if participants failed
      await supabase.from("conversations").delete().eq("id", conversationId)

      return NextResponse.json(
        {
          error: "Failed to add participants",
          details: participantsError.message,
          conversation: null,
        },
        { status: 500 },
      )
    }

    console.log("✅ Conversation created successfully:", conversationId)

    // Return the created conversation with participants
    const { data: enrichedConversation } = await supabase
      .from("conversations")
      .select(`
        id,
        title,
        type,
        created_at,
        updated_at
      `)
      .eq("id", conversationId)
      .single()

    return NextResponse.json({
      conversation: enrichedConversation,
      message: "Conversation created successfully",
    })
  } catch (error) {
    console.error("❌ Create conversation error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        conversation: null,
      },
      { status: 500 },
    )
  }
}
