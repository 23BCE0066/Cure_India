import { NextRequest, NextResponse } from 'next/server'
import { medicalAI, createAIResponse, handleAIError } from '@/lib/ai'
import { createSymptomConsultation, getCurrentUser } from '@/lib/supabase'
import { SymptomRequest } from '@/types'

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
    const body: SymptomRequest = await request.json()

    // Validate required fields
    if (!body.content || body.content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Symptom description is required' },
        { status: 400 }
      )
    }

    // Validate content length
    if (body.content.length > 2000) {
      return NextResponse.json(
        { error: 'Symptom description is too long (max 2000 characters)' },
        { status: 400 }
      )
    }

    // Validate severity range
    if (body.severity && (body.severity < 1 || body.severity > 10)) {
      return NextResponse.json(
        { error: 'Severity must be between 1 and 10' },
        { status: 400 }
      )
    }

    // Validate duration
    if (body.duration_days && (body.duration_days < 0 || body.duration_days > 365)) {
      return NextResponse.json(
        { error: 'Duration must be between 0 and 365 days' },
        { status: 400 }
      )
    }

    // Analyze symptoms with AI
    const analysisResult = await medicalAI.analyzeSymptoms(body)

    // Save consultation to database
    try {
      await createSymptomConsultation({
        user_id: user.id,
        query: body.content,
        language: analysisResult.language,
        response: analysisResult,
        ai_confidence: analysisResult.confidence_overall,
        session_id: analysisResult.session_id
      })
    } catch (dbError) {
      console.error('Failed to save consultation:', dbError)
      // Continue with response even if database save fails
    }

    // Return successful response
    return NextResponse.json(
      createAIResponse(analysisResult),
      { status: 200 }
    )

  } catch (error) {
    console.error('Symptom analysis error:', error)
    const errorResponse = handleAIError(error)
    return NextResponse.json(errorResponse, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Return API documentation
    const documentation = {
      endpoint: '/api/symptoms/analyze',
      method: 'POST',
      description: 'Analyze symptoms using AI and get medical triage recommendations',
      authentication: 'Required',
      requestBody: {
        type: 'text | voice',
        content: 'string (required, max 2000 chars)',
        language: 'string (optional, auto-detected)',
        duration_days: 'number (optional, 0-365)',
        additional_symptoms: 'array<string> (optional)',
        severity: 'number (optional, 1-10 scale)'
      },
      response: {
        success: 'boolean',
        data: {
          query: 'string',
          language: 'string',
          conditions: [{
            name: 'string',
            confidence: 'number (0-1)',
            probability_rank: 'number',
            notes: 'string',
            is_high_confidence: 'boolean',
            urgency_level: 'low|medium|high|emergency'
          }],
          interpretation: 'string',
          home_remedies: 'array<string>',
          red_flags: 'array<string>',
          recommended_specialists: [{
            id: 'string',
            specialty: 'string',
            city: 'string',
            name: 'string',
            rating: 'number',
            experience_years: 'number',
            consultation_fee_range: 'string',
            estimated_treatment_cost_range: 'string',
            hospital: 'string',
            contact: 'string'
          }],
          confidence_overall: 'number',
          sources: 'array<string>',
          disclaimer: 'string',
          created_at: 'string',
          session_id: 'string'
        },
        error: 'string (if failed)',
        processing_time: 'number',
        model_version: 'string'
      },
      examples: [
        {
          description: 'Basic symptom analysis',
          request: {
            type: 'text',
            content: 'I have fever, headache, and body pain for 2 days',
            severity: 6,
            duration_days: 2
          }
        },
        {
          description: 'Voice symptom analysis',
          request: {
            type: 'voice',
            content: 'मुझे बुखार और सिर दर्द हो रहा है',
            language: 'hi'
          }
        }
      ],
      safety: {
        emergency_detection: 'Automatic detection of emergency symptoms',
        confidence_thresholds: {
          high: '≥0.9',
          medium: '0.7-0.89',
          low: '<0.7'
        },
        disclaimer: 'This is not a medical diagnosis. Always consult qualified healthcare professionals.'
      }
    }

    return NextResponse.json(documentation, { status: 200 })

  } catch (error) {
    console.error('API documentation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}