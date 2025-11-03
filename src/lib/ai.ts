import { GoogleGenerativeAI } from '@google/generative-ai'
import {
  SymptomRequest,
  SymptomResponse,
  Condition,
  Specialist,
  ReportInterpretation,
  AIAnalysisRequest,
  AIAnalysisResponse,
  TestResult
} from '@/types'
import { detectEmergencySymptoms, hasEmergencySymptoms, detectLanguage } from '@/lib/utils'

// Initialize Gemini Pro
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!)

// Medical system prompt based on planning.md specifications
const MEDICAL_SYSTEM_PROMPT = `You are a medical triage assistant for the Indian healthcare system. Follow these rules strictly:

1. ANALYZE INPUT: Parse user symptoms or medical report data, detect language, identify key findings
2. CONFIDENCE SCORING: Assign confidence scores (0-1) for each condition. Mark ≥0.9 as "High confidence"
3. ALWAYS INCLUDE:
   - Possible conditions with confidence scores and rankings
   - Safe home remedies (non-prescription only)
   - Red flags and emergency symptoms
   - Recommended specialists with India-specific context
   - Cost estimates in Indian Rupees
   - Sources and medical references
   - Clear medical disclaimer

4. SAFETY RULES:
   - Never provide prescription medication
   - For OTC medicines, give standard dosing ranges only
   - Always recommend clinical confirmation
   - If any life-threatening symptoms detected, prioritize emergency instructions

5. MULTILINGUAL: Respond in detected language. Support Hindi, Hinglish, Bengali, Tamil, Telugu, Marathi, Gujarati, and English

6. OUTPUT FORMAT: Return both JSON (using specified schema) and human-readable summary

7. INDIAN CONTEXT: Consider local disease prevalence, available specialties, and typical costs in Indian healthcare system

Disclaimer: This is not a medical diagnosis. Always consult qualified healthcare professionals.`

const RESPONSE_SCHEMA = {
  query: "user symptom text or report data",
  language: "detected language code",
  conditions: [
    {
      name: "condition name",
      confidence: 0.92,
      probability_rank: 1,
      notes: "explanation of symptoms correlation",
      is_high_confidence: true,
      urgency_level: "low|medium|high|emergency"
    }
  ],
  interpretation: "clinical interpretation of findings",
  home_remedies: ["safe home remedy 1", "safe home remedy 2"],
  red_flags: ["emergency symptom 1", "urgent symptom 2"],
  recommended_specialists: [
    {
      id: "unique_id",
      specialty: "Internal Medicine",
      city: "Mumbai",
      name: "Dr. A Sharma",
      rating: 4.6,
      experience_years: 15,
      consultation_fee_range: "400-1200",
      estimated_treatment_cost_range: "₹5,000 - ₹50,000",
      hospital: "Lilavati Hospital",
      contact: "+91-9876543210"
    }
  ],
  confidence_overall: 0.92,
  sources: ["medical source 1", "clinical guideline 2"],
  disclaimer: "This is not a diagnosis. See a qualified physician for confirmation."
}

export class MedicalAI {
  private model: any

  constructor() {
    this.model = genAI.getGenerativeModel({
      model: "gemini-pro",
      systemInstruction: MEDICAL_SYSTEM_PROMPT
    })
  }

  async analyzeSymptoms(request: SymptomRequest): Promise<SymptomResponse> {
    try {
      // Detect emergency symptoms first
      if (hasEmergencySymptoms(request.content)) {
        const emergencySymptoms = detectEmergencySymptoms(request.content)
        return this.createEmergencyResponse(request, emergencySymptoms)
      }

      // Detect language
      const detectedLanguage = request.language || detectLanguage(request.content)

      // Create the analysis prompt
      const prompt = this.createSymptomAnalysisPrompt(request, detectedLanguage)

      // Get AI response
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // Parse the JSON response
      const aiResponse = this.parseAIResponse(text)

      // Validate and enhance response
      return this.validateAndEnhanceResponse(aiResponse, request, detectedLanguage)

    } catch (error) {
      console.error('AI Analysis Error:', error)
      throw new Error('Failed to analyze symptoms. Please try again.')
    }
  }

  async analyzeMedicalReport(extractedData: any): Promise<ReportInterpretation> {
    try {
      const prompt = this.createReportAnalysisPrompt(extractedData)

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      const interpretation = this.parseReportInterpretation(text)
      return this.validateReportInterpretation(interpretation)

    } catch (error) {
      console.error('Report Analysis Error:', error)
      throw new Error('Failed to analyze medical report. Please try again.')
    }
  }

  private createSymptomAnalysisPrompt(request: SymptomRequest, language: string): string {
    return `Analyze the following symptoms and provide a medical triage assessment:

Patient Input:
- Type: ${request.type}
- Content: "${request.content}"
- Language: ${language}
- Duration: ${request.duration_days || 'Not specified'} days
- Severity: ${request.severity || 'Not specified'}/10
- Additional symptoms: ${request.additional_symptoms?.join(', ') || 'None'}

Please provide a comprehensive analysis following the medical system prompt instructions.
Return the response in this exact JSON format:
${JSON.stringify(RESPONSE_SCHEMA, null, 2)}

Prioritize safety and include emergency warnings if any red flags are detected.`
  }

  private createReportAnalysisPrompt(extractedData: any): string {
    return `Analyze the following medical report data and provide clinical interpretation:

Extracted Data:
${JSON.stringify(extractedData, null, 2)}

Please provide:
1. Summary of key findings
2. Possible conditions with confidence scores
3. Recommended additional tests
4. Recommended specialists
5. Urgency level assessment
6. Any abnormal values that need attention

Consider Indian healthcare context and provide specialist recommendations appropriate for the detected conditions.`
  }

  private parseAIResponse(text: string): any {
    try {
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response')
      }
      return JSON.parse(jsonMatch[0])
    } catch (error) {
      console.error('Failed to parse AI response:', error)
      throw new Error('Invalid AI response format')
    }
  }

  private parseReportInterpretation(text: string): ReportInterpretation {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in report interpretation')
      }
      return JSON.parse(jsonMatch[0])
    } catch (error) {
      console.error('Failed to parse report interpretation:', error)
      throw new Error('Invalid report interpretation format')
    }
  }

  private validateAndEnhanceResponse(
    response: any,
    request: SymptomRequest,
    language: string
  ): SymptomResponse {
    // Ensure required fields exist
    const validatedResponse: SymptomResponse = {
      query: request.content,
      language: language,
      conditions: response.conditions || [],
      interpretation: response.interpretation || 'Unable to provide interpretation at this time.',
      home_remedies: response.home_remedies || [],
      red_flags: response.red_flags || [],
      recommended_specialists: response.recommended_specialists || [],
      confidence_overall: response.confidence_overall || 0.5,
      sources: response.sources || [],
      disclaimer: response.disclaimer || 'This is not a medical diagnosis. Always consult qualified healthcare professionals.',
      created_at: new Date().toISOString(),
      session_id: this.generateSessionId()
    }

    // Add urgency levels to conditions
    validatedResponse.conditions = validatedResponse.conditions.map(condition => ({
      ...condition,
      urgency_level: this.determineUrgencyLevel(condition.name, condition.confidence)
    }))

    // Generate specialist IDs if missing
    validatedResponse.recommended_specialists = validatedResponse.recommended_specialists.map(
      (specialist, index) => ({
        ...specialist,
        id: specialist.id || `specialist_${Date.now()}_${index}`
      })
    )

    return validatedResponse
  }

  private validateReportInterpretation(interpretation: any): ReportInterpretation {
    return {
      summary: interpretation.summary || 'Unable to provide summary at this time.',
      possible_conditions: interpretation.possible_conditions || [],
      confidence_scores: interpretation.confidence_scores || [],
      recommended_tests: interpretation.recommended_tests || [],
      recommended_specialists: interpretation.recommended_specialists || [],
      urgency_level: interpretation.urgency_level || 'medium',
      key_findings: interpretation.key_findings || [],
      abnormal_values: interpretation.abnormal_values || []
    }
  }

  private determineUrgencyLevel(conditionName: string, confidence: number): 'low' | 'medium' | 'high' | 'emergency' {
    const emergencyConditions = [
      'heart attack', 'stroke', 'septic shock', 'anaphylaxis', 'pulmonary embolism'
    ]

    const highUrgencyConditions = [
      'pneumonia', 'dengue', 'malaria', 'typhoid', 'appendicitis', 'gallstones'
    ]

    const lowerConditionName = conditionName.toLowerCase()

    if (emergencyConditions.some(cond => lowerConditionName.includes(cond))) {
      return 'emergency'
    }

    if (highUrgencyConditions.some(cond => lowerConditionName.includes(cond)) || confidence >= 0.8) {
      return 'high'
    }

    if (confidence >= 0.6) {
      return 'medium'
    }

    return 'low'
  }

  private createEmergencyResponse(request: SymptomRequest, emergencySymptoms: any[]): SymptomResponse {
    const emergencyDescriptions = emergencySymptoms.map(s => s.description)
    const emergencyActions = emergencySymptoms.map(s => s.action)

    return {
      query: request.content,
      language: detectLanguage(request.content),
      conditions: [{
        name: 'Medical Emergency',
        confidence: 1.0,
        probability_rank: 1,
        notes: 'Emergency symptoms detected - immediate medical attention required',
        is_high_confidence: true,
        urgency_level: 'emergency'
      }],
      interpretation: 'Based on the symptoms described, this appears to be a medical emergency requiring immediate attention.',
      home_remedies: [],
      red_flags: emergencyDescriptions,
      recommended_specialists: [],
      confidence_overall: 1.0,
      sources: ['Emergency medical guidelines'],
      disclaimer: 'This is a medical emergency. Call emergency services immediately.',
      created_at: new Date().toISOString(),
      session_id: this.generateSessionId()
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Chat functionality for follow-up questions
  async chatFollowUp(message: string, sessionId: string, context: any): Promise<string> {
    try {
      const prompt = `Previous consultation context:
${JSON.stringify(context, null, 2)}

User follow-up question: "${message}"

Provide a helpful follow-up response that addresses the user's question while maintaining medical safety.
Do not provide new diagnoses, but can clarify previous recommendations and suggest when to seek medical care.`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error('Chat follow-up error:', error)
      throw new Error('Unable to process follow-up question. Please try again.')
    }
  }
}

// Singleton instance
export const medicalAI = new MedicalAI()

// Helper functions for API responses
export function createAIResponse(data: any, error?: string): AIAnalysisResponse {
  if (error) {
    return {
      success: false,
      error
    }
  }

  return {
    success: true,
    data,
    processing_time: Date.now(),
    model_version: 'gemini-pro'
  }
}

export function handleAIError(error: unknown): AIAnalysisResponse {
  console.error('AI Service Error:', error)

  if (error instanceof Error) {
    return {
      success: false,
      error: error.message
    }
  }

  return {
    success: false,
    error: 'An unexpected error occurred while processing your request.'
  }
}