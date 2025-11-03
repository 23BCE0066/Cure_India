import { NextRequest, NextResponse } from 'next/server'
import { medicalAI, createAIResponse, handleAIError } from '@/lib/ai'
import { getCurrentUser } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()

    // Validate required fields
    if (!body.message || body.message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    if (!body.session_id) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    if (!body.context) {
      return NextResponse.json(
        { error: 'Context is required' },
        { status: 400 }
      )
    }

    // Validate message length
    if (body.message.length > 1000) {
      return NextResponse.json(
        { error: 'Message is too long (max 1000 characters)' },
        { status: 400 }
      )
    }

    // Process chat follow-up
    const response = await medicalAI.chatFollowUp(
      body.message,
      body.session_id,
      body.context
    )

    return NextResponse.json(
      createAIResponse({ response }),
      { status: 200 }
    )

  } catch (error) {
    console.error('Chat error:', error)
    const errorResponse = handleAIError(error)
    return NextResponse.json(errorResponse, { status: 500 })
  }
}