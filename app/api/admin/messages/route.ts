import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    const { data: messages, error } = await supabase
      .from("messages")
      .select(`
        *,
        sender:sender_id(full_name, email),
        receiver:receiver_id(full_name, email)
      `)
      .order("created_at", { ascending: false })
      .limit(100)

    if (error) {
      if (error.code === "42P01") {
        return NextResponse.json({ messages: [] })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform the data to match the expected format
    const transformedMessages = messages?.map((message) => ({
      id: message.id,
      sender_id: message.sender_id,
      sender_name: message.sender?.full_name || "Unknown",
      receiver_id: message.receiver_id,
      receiver_name: message.receiver?.full_name || "Unknown",
      content: message.content,
      is_read: message.is_read,
      created_at: message.created_at,
    })) || []

    return NextResponse.json({ messages: transformedMessages })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
} 