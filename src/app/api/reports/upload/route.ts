import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, uploadMedicalReport, createMedicalReport } from '@/lib/supabase'
import { ocrProcessor } from '@/lib/ocr'
import { medicalAI } from '@/lib/ai'
import { validateFileType, validateFileSize } from '@/lib/utils'

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

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file
    if (!validateFileType(file)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, and PDF files are supported.' },
        { status: 400 }
      )
    }

    if (!validateFileSize(file, 10)) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    const fileName = file.name

    // Process OCR
    let extractedData
    try {
      if (file.type === 'application/pdf') {
        extractedData = await ocrProcessor.processPDFReport(buffer)
      } else {
        extractedData = await ocrProcessor.processMedicalReport(buffer, fileName)
      }
    } catch (ocrError) {
      console.error('OCR Processing Error:', ocrError)
      return NextResponse.json(
        { error: 'Failed to process medical report. Please ensure the image is clear and contains medical information.' },
        { status: 422 }
      )
    }

    // Validate extracted data quality
    const validation = ocrProcessor.validateExtractedData(extractedData)
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: 'Unable to extract sufficient medical information from the report.',
          details: validation.issues,
          confidence: validation.confidence
        },
        { status: 422 }
      )
    }

    // Upload file to storage
    let fileUrl: string
    try {
      fileUrl = await uploadMedicalReport(file, user.id)
    } catch (uploadError) {
      console.error('File Upload Error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload file. Please try again.' },
        { status: 500 }
      )
    }

    // Analyze extracted data with AI
    let interpretation
    try {
      interpretation = await medicalAI.analyzeMedicalReport(extractedData)
    } catch (aiError) {
      console.error('AI Analysis Error:', aiError)
      // Continue with OCR results even if AI analysis fails
      interpretation = {
        summary: 'AI analysis temporarily unavailable. Please review the extracted data manually.',
        possible_conditions: [],
        confidence_scores: [],
        recommended_tests: [],
        recommended_specialists: [],
        urgency_level: 'medium' as const,
        key_findings: extractedData.test_results.filter(r => r.is_abnormal).map(r => r.test_name),
        abnormal_values: extractedData.test_results.filter(r => r.is_abnormal)
      }
    }

    // Save to database
    try {
      const medicalReport = await createMedicalReport({
        user_id: user.id,
        file_url: fileUrl,
        file_type: file.type === 'application/pdf' ? 'pdf' : 'image',
        extracted_data: extractedData,
        interpretation: interpretation,
        is_verified: false
      })

      return NextResponse.json({
        success: true,
        data: {
          report_id: medicalReport.id,
          file_url: fileUrl,
          extracted_data: extractedData,
          interpretation: interpretation,
          ocr_confidence: validation.confidence,
          ocr_issues: validation.issues.length > 0 ? validation.issues : undefined
        }
      }, { status: 201 })

    } catch (dbError) {
      console.error('Database Error:', dbError)
      return NextResponse.json(
        { error: 'Failed to save report. Please try again.' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Report Upload Error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing your report.' },
      { status: 500 }
    )
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
      endpoint: '/api/reports/upload',
      method: 'POST',
      description: 'Upload medical reports for OCR processing and AI analysis',
      authentication: 'Required',
      requestBody: {
        file: 'File (required) - Medical report in JPG, PNG, or PDF format (max 10MB)'
      },
      response: {
        success: 'boolean',
        data: {
          report_id: 'string',
          file_url: 'string',
          extracted_data: {
            test_results: [{
              test_name: 'string',
              value: 'number|string',
              unit: 'string',
              normal_range: 'string',
              is_abnormal: 'boolean',
              significance: 'string',
              category: 'string'
            }],
            patient_info: {
              name: 'string',
              age: 'number',
              gender: 'string'
            },
            report_date: 'string',
            hospital_name: 'string',
            doctor_name: 'string'
          },
          interpretation: {
            summary: 'string',
            possible_conditions: 'array<string>',
            confidence_scores: 'array<number>',
            recommended_tests: 'array<string>',
            recommended_specialists: 'array<object>',
            urgency_level: 'low|medium|high|emergency',
            key_findings: 'array<string>',
            abnormal_values: 'array<object>'
          },
          ocr_confidence: 'number (0-1)',
          ocr_issues: 'array<string> (if any)'
        },
        error: 'string (if failed)'
      },
      supportedFormats: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
      maxSize: '10MB',
      processing: {
        ocr: 'Google Vision API for text extraction',
        analysis: 'AI-powered interpretation of medical data',
        validation: 'Quality check on extracted data'
      },
      privacy: {
        storage: 'Encrypted storage in Supabase',
        access: 'Only accessible by the user',
        retention: 'User-configurable retention periods'
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