import { GoogleAuth } from 'google-auth-library'
import { ImageAnnotatorClient } from '@google-cloud/vision'
import { TestResult, ExtractedData, MedicalReport } from '@/types'

// Initialize Google Vision client
const client = new ImageAnnotatorClient({
  keyFile: process.env.GOOGLE_CLOUD_KEY_FILE,
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
})

export class OCRProcessor {
  private visionClient: ImageAnnotatorClient

  constructor() {
    this.visionClient = client
  }

  async processMedicalReport(imageBuffer: Buffer, fileName: string): Promise<ExtractedData> {
    try {
      // Perform OCR with Google Vision API
      const [result] = await this.visionClient.documentTextDetection({
        image: {
          content: imageBuffer,
        },
      })

      const fullTextAnnotation = result.fullTextAnnotation
      if (!fullTextAnnotation || !fullTextAnnotation.text) {
        throw new Error('No text found in the uploaded image')
      }

      // Extract structured data from OCR text
      const extractedData = this.parseMedicalReportText(fullTextAnnotation.text, fileName)

      return extractedData

    } catch (error) {
      console.error('OCR Processing Error:', error)
      throw new Error('Failed to process medical report. Please ensure the image is clear and contains medical information.')
    }
  }

  private parseMedicalReportText(ocrText: string, fileName: string): ExtractedData {
    const lines = ocrText.split('\n').map(line => line.trim()).filter(line => line.length > 0)

    const extractedData: ExtractedData = {
      test_results: [],
      patient_info: this.extractPatientInfo(lines),
      report_date: this.extractReportDate(lines),
      hospital_name: this.extractHospitalName(lines),
      doctor_name: this.extractDoctorName(lines)
    }

    // Extract test results
    extractedData.test_results = this.extractTestResults(lines)

    return extractedData
  }

  private extractPatientInfo(lines: string[]): { name: string; age: number; gender: string } | undefined {
    const patientInfo: any = {}

    // Look for patterns like "Name: John Doe", "Age: 35", "Sex: Male"
    lines.forEach(line => {
      const lowerLine = line.toLowerCase()

      if (lowerLine.includes('name') || lowerLine.includes('patient')) {
        const nameMatch = line.match(/(?:name|patient)[:\s]+([A-Za-z\s]+)/i)
        if (nameMatch) patientInfo.name = nameMatch[1].trim()
      }

      if (lowerLine.includes('age') || lowerLine.includes('yrs')) {
        const ageMatch = line.match(/(\d+)\s*(?:years?|yrs?)/i)
        if (ageMatch) patientInfo.age = parseInt(ageMatch[1])
      }

      if (lowerLine.includes('sex') || lowerLine.includes('gender')) {
        const genderMatch = line.match(/(?:sex|gender)[:\s]+(male|female|other)/i)
        if (genderMatch) patientInfo.gender = genderMatch[1].toLowerCase()
      }
    })

    return (patientInfo.name || patientInfo.age || patientInfo.gender) ? patientInfo : undefined
  }

  private extractReportDate(lines: string[]): string | undefined {
    // Look for date patterns in various formats
    const datePatterns = [
      /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/, // DD-MM-YYYY or DD/MM/YYYY
      /(\d{2,4}[-/]\d{1,2}[-/]\d{1,2})/, // YYYY-MM-DD or YYYY/MM/DD
      /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})/i, // DD Mon YYYY
    ]

    for (const line of lines) {
      for (const pattern of datePatterns) {
        const match = line.match(pattern)
        if (match) {
          return match[1]
        }
      }
    }

    return undefined
  }

  private extractHospitalName(lines: string[]): string | undefined {
    // Look for hospital/clinic names (usually at the top)
    const hospitalKeywords = ['hospital', 'clinic', 'medical centre', 'diagnostics', 'lab']

    for (const line of lines.slice(0, 5)) { // Check first 5 lines
      const lowerLine = line.toLowerCase()
      if (hospitalKeywords.some(keyword => lowerLine.includes(keyword))) {
        return line.trim()
      }
    }

    return undefined
  }

  private extractDoctorName(lines: string[]): string | undefined {
    // Look for doctor names with "Dr." prefix
    const doctorPattern = /(?:dr\.?|doctor)[:\s]+([A-Za-z\s]+)/i

    for (const line of lines) {
      const match = line.match(doctorPattern)
      if (match) {
        return match[1].trim()
      }
    }

    return undefined
  }

  private extractTestResults(lines: string[]): TestResult[] {
    const testResults: TestResult[] = []

    // Common test patterns and their normal ranges
    const testPatterns = [
      // Blood tests
      { name: 'hemoglobin', pattern: /haemoglobin|hemoglobin|hgb/i, unit: 'g/dL', normal: '12-16 (F), 13.5-17.5 (M)' },
      { name: 'wbc', pattern: /wbc|white.*blood.*cell/i, unit: 'cells/μL', normal: '4,000-11,000' },
      { name: 'rbc', pattern: /rbc|red.*blood.*cell/i, unit: 'million cells/μL', normal: '4.2-5.4 (F), 4.7-6.1 (M)' },
      { name: 'platelets', pattern: /platelet|plt/i, unit: 'cells/μL', normal: '150,000-450,000' },

      // Liver function
      { name: 'sgot', pattern: /sgot|ast/i, unit: 'U/L', normal: '10-40' },
      { name: 'sgpt', pattern: /sgpt|alt/i, unit: 'U/L', normal: '7-56' },
      { name: 'bilirubin', pattern: /bilirubin/i, unit: 'mg/dL', normal: '0.3-1.0' },

      // Kidney function
      { name: 'creatinine', pattern: /creatinine/i, unit: 'mg/dL', normal: '0.6-1.3' },
      { name: 'urea', pattern: /urea|bun/i, unit: 'mg/dL', normal: '7-20' },

      // Blood sugar
      { name: 'glucose', pattern: /glucose|blood.*sugar/i, unit: 'mg/dL', normal: '70-100 (fasting)' },

      // Lipids
      { name: 'cholesterol', pattern: /cholesterol|total.*cholesterol/i, unit: 'mg/dL', normal: '<200' },
      { name: 'hdl', pattern: /hdl|high.*density/i, unit: 'mg/dL', normal: '>40 (M), >50 (F)' },
      { name: 'ldl', pattern: /ldl|low.*density/i, unit: 'mg/dL', normal: '<100' },
      { name: 'triglycerides', pattern: /triglycerides|tg/i, unit: 'mg/dL', normal: '<150' },

      // Thyroid
      { name: 'tsh', pattern: /tsh|thyroid.*stimulating/i, unit: 'mIU/L', normal: '0.4-4.0' },
      { name: 't3', pattern: /t3|triiodothyronine/i, unit: 'ng/dL', normal: '80-200' },
      { name: 't4', pattern: /t4|thyroxine/i, unit: 'μg/dL', normal: '4.5-12.5' },
    ]

    // Process each line to extract test results
    lines.forEach((line, index) => {
      const lowerLine = line.toLowerCase()

      testPatterns.forEach(testPattern => {
        if (testPattern.pattern.test(lowerLine)) {
          const result = this.extractTestValue(line, testPattern)
          if (result) {
            testResults.push({
              test_name: testPattern.name,
              value: result.value,
              unit: testPattern.unit,
              normal_range: testPattern.normal,
              is_abnormal: result.isAbnormal,
              significance: this.getTestSignificance(testPattern.name, result.value, result.isAbnormal),
              category: this.getTestCategory(testPattern.name)
            })
          }
        }
      })
    })

    return testResults
  }

  private extractTestValue(line: string, testPattern: any): { value: number | string; isAbnormal: boolean } | null {
    // Extract numerical values and ranges
    const valuePatterns = [
      /(\d+\.?\d*)\s*([a-zA-Z/μµ]+)?/,  // Simple value with optional unit
      /(\d+\.?\d*)\s*[-–]\s*(\d+\.?\d*)/,  // Range value
      /(\d+\.?\d*)\s*[\(<]([^)\>]+)[\)>]/, // Value with reference range in parentheses
    ]

    for (const pattern of valuePatterns) {
      const match = line.match(pattern)
      if (match) {
        let value: number | string
        let isAbnormal = false

        if (match[2]) {
          // Range detected
          value = `${match[1]}-${match[2]}`
          isAbnormal = false // Ranges are typically normal values
        } else {
          // Single value
          value = parseFloat(match[1])

          // Check for abnormal indicators
          const abnormalIndicators = ['high', 'low', 'abnormal', '↑', '↓', 'H', 'L']
          isAbnormal = abnormalIndicators.some(indicator =>
            line.toLowerCase().includes(indicator)
          )
        }

        return { value, isAbnormal }
      }
    }

    return null
  }

  private getTestSignificance(testName: string, value: number | string, isAbnormal: boolean): string | undefined {
    if (!isAbnormal) return undefined

    const significanceMap: Record<string, string> = {
      'hemoglobin': 'May indicate anemia or polycythemia',
      'wbc': 'May indicate infection, inflammation, or blood disorders',
      'platelets': 'May indicate bleeding or clotting disorders',
      'sgot': 'May indicate liver damage or muscle injury',
      'sgpt': 'May indicate liver damage',
      'bilirubin': 'May indicate liver dysfunction or hemolysis',
      'creatinine': 'May indicate kidney dysfunction',
      'glucose': 'May indicate diabetes or hypoglycemia',
      'cholesterol': 'May indicate cardiovascular risk',
      'tsh': 'May indicate thyroid dysfunction'
    }

    return significanceMap[testName] || 'Abnormal value detected - clinical correlation needed'
  }

  private getTestCategory(testName: string): string {
    const categoryMap: Record<string, string> = {
      'hemoglobin': 'blood',
      'wbc': 'blood',
      'rbc': 'blood',
      'platelets': 'blood',
      'sgot': 'liver',
      'sgpt': 'liver',
      'bilirubin': 'liver',
      'creatinine': 'kidney',
      'urea': 'kidney',
      'glucose': 'metabolic',
      'cholesterol': 'lipid',
      'hdl': 'lipid',
      'ldl': 'lipid',
      'triglycerides': 'lipid',
      'tsh': 'thyroid',
      't3': 'thyroid',
      't4': 'thyroid'
    }

    return categoryMap[testName] || 'other'
  }

  // Alternative method for PDF processing (placeholder)
  async processPDFReport(pdfBuffer: Buffer): Promise<ExtractedData> {
    // This would use PDF parsing libraries in production
    // For now, return a placeholder
    throw new Error('PDF processing not yet implemented. Please upload as image.')
  }

  // Validate extracted data quality
  validateExtractedData(data: ExtractedData): { isValid: boolean; confidence: number; issues: string[] } {
    const issues: string[] = []
    let confidence = 1.0

    // Check if we have test results
    if (data.test_results.length === 0) {
      issues.push('No test results detected')
      confidence -= 0.5
    }

    // Check patient information completeness
    if (!data.patient_info) {
      issues.push('Patient information not detected')
      confidence -= 0.1
    }

    // Check report date
    if (!data.report_date) {
      issues.push('Report date not detected')
      confidence -= 0.1
    }

    // Validate test result values
    const invalidResults = data.test_results.filter(result =>
      result.value === null || result.value === undefined || result.value === ''
    )

    if (invalidResults.length > 0) {
      issues.push(`${invalidResults.length} test results have invalid values`)
      confidence -= 0.2
    }

    return {
      isValid: confidence >= 0.6,
      confidence: Math.max(0, confidence),
      issues
    }
  }
}

// Export singleton instance
export const ocrProcessor = new OCRProcessor()