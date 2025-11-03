'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Upload,
  FileText,
  Image as ImageIcon,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Camera,
  RefreshCw,
  Download,
  Eye
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import ConsentModal from '@/components/ConsentModal'
import { validateFileType, validateFileSize, formatFileSize } from '@/lib/utils'
import { ExtractedData, ReportInterpretation } from '@/types'

export default function ReportsPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [showConsentModal, setShowConsentModal] = useState(false)
  const [hasConsent, setHasConsent] = useState(false)

  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [processingStage, setProcessingStage] = useState<'uploading' | 'processing' | 'completed' | 'error'>('uploading')

  // Results state
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)
  const [interpretation, setInterpretation] = useState<ReportInterpretation | null>(null)
  const [ocrConfidence, setOcrConfidence] = useState(0)
  const [error, setError] = useState('')
  const [editingMode, setEditingMode] = useState(false)
  const [editedData, setEditedData] = useState<ExtractedData | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        await checkUserConsent(user.id)
      } else {
        router.push('/auth')
      }
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/auth')
    }
  }

  const checkUserConsent = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('users')
        .select('consent_given')
        .eq('id', userId)
        .single()

      setHasConsent(data?.consent_given || false)
    } catch (error) {
      console.error('Consent check error:', error)
      setHasConsent(false)
    }
  }

  const handleConsentAccept = async (consentData: any) => {
    try {
      await supabase
        .from('users')
        .update({ consent_given: true, consent_data: consentData })
        .eq('id', user.id)

      setHasConsent(true)
      setShowConsentModal(false)
    } catch (error) {
      console.error('Consent save error:', error)
      setError('Failed to save consent. Please try again.')
    }
  }

  const handleConsentDecline = () => {
    setShowConsentModal(false)
    router.push('/')
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  const handleFileSelect = (file: File) => {
    if (!validateFileType(file)) {
      setError('Invalid file type. Please upload JPG, PNG, or PDF files.')
      return
    }

    if (!validateFileSize(file, 10)) {
      setError('File size too large. Maximum size is 10MB.')
      return
    }

    setSelectedFile(file)
    setError('')
    setExtractedData(null)
    setInterpretation(null)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !hasConsent) {
      if (!hasConsent) {
        setShowConsentModal(true)
      }
      return
    }

    setLoading(true)
    setError('')
    setUploadProgress(0)
    setProcessingStage('uploading')

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch('/api/reports/upload', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const data = await response.json()

      setProcessingStage('completed')
      setExtractedData(data.data.extracted_data)
      setInterpretation(data.data.interpretation)
      setOcrConfidence(data.data.ocr_confidence)

      if (data.data.ocr_issues) {
        console.warn('OCR Issues:', data.data.ocr_issues)
      }

    } catch (error: any) {
      console.error('Upload error:', error)
      setError(error.message || 'Failed to upload and process report')
      setProcessingStage('error')
    } finally {
      setLoading(false)
    }
  }

  const handleCameraCapture = () => {
    // Trigger file input with camera capture
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment'
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files && files[0]) {
        handleFileSelect(files[0])
      }
    }
    input.click()
  }

  const startEditing = () => {
    setEditedData(JSON.parse(JSON.stringify(extractedData)))
    setEditingMode(true)
  }

  const saveEdits = () => {
    setExtractedData(editedData)
    setEditingMode(false)
    // In production, this would save to backend
  }

  const cancelEditing = () => {
    setEditedData(null)
    setEditingMode(false)
  }

  const updateTestResult = (index: number, field: keyof any, value: any) => {
    if (!editedData) return

    const updatedTestResults = [...editedData.test_results]
    updatedTestResults[index] = {
      ...updatedTestResults[index],
      [field]: value
    }

    setEditedData({
      ...editedData,
      test_results: updatedTestResults
    })
  }

  const resetUpload = () => {
    setSelectedFile(null)
    setExtractedData(null)
    setInterpretation(null)
    setError('')
    setUploadProgress(0)
    setProcessingStage('uploading')
    setEditingMode(false)
    setEditedData(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatTestValue = (test: any) => {
    if (typeof test.value === 'number') {
      return `${test.value} ${test.unit}`
    }
    return test.value
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-primary">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-text-muted hover:text-text-secondary mb-4 inline-block"
          >
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Medical Report Analysis
          </h1>
          <p className="text-text-secondary">
            Upload your medical reports for AI-powered interpretation and analysis
          </p>
        </div>

        {!extractedData ? (
          /* Upload Section */
          <div className="max-w-2xl mx-auto">
            <div className="bg-background-secondary border border-border-primary rounded-lg p-8">
              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-accent-primary bg-accent-primary/5'
                    : 'border-border-primary hover:border-border-secondary'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-accent-primary/20 rounded-lg flex items-center justify-center mx-auto">
                      {selectedFile.type === 'application/pdf' ? (
                        <FileText className="w-8 h-8 text-accent-primary" />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-accent-primary" />
                      )}
                    </div>
                    <div>
                      <p className="text-text-primary font-medium">{selectedFile.name}</p>
                      <p className="text-text-muted text-sm">{formatFileSize(selectedFile.size)}</p>
                    </div>
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-background-tertiary hover:bg-background-tertiary/80 text-text-primary rounded-lg border border-border-primary"
                      >
                        Choose Different File
                      </button>
                      <button
                        onClick={handleUpload}
                        disabled={loading}
                        className="px-6 py-2 bg-accent-primary hover:bg-accent-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-background-primary font-semibold rounded-lg"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                            Processing...
                          </>
                        ) : (
                          'Analyze Report'
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-background-tertiary rounded-lg flex items-center justify-center mx-auto">
                      <Upload className="w-8 h-8 text-text-muted" />
                    </div>
                    <div>
                      <p className="text-text-primary font-medium mb-2">
                        Upload your medical report
                      </p>
                      <p className="text-text-muted text-sm">
                        Drag and drop or click to select files
                      </p>
                      <p className="text-text-muted text-xs mt-2">
                        Supports JPG, PNG, and PDF (max 10MB)
                      </p>
                    </div>
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-6 py-3 bg-accent-primary hover:bg-accent-primary/90 text-background-primary font-semibold rounded-lg"
                      >
                        <Upload className="w-4 h-4 inline mr-2" />
                        Choose File
                      </button>
                      <button
                        onClick={handleCameraCapture}
                        className="px-6 py-3 bg-background-tertiary hover:bg-background-tertiary/80 text-text-primary rounded-lg border border-border-primary"
                      >
                        <Camera className="w-4 h-4 inline mr-2" />
                        Take Photo
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Progress */}
              {loading && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-text-secondary">
                      {processingStage === 'uploading' ? 'Uploading file...' : 'Processing report...'}
                    </span>
                    <span className="text-sm text-text-secondary">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-background-input rounded-full h-2">
                    <div
                      className="bg-accent-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mt-6 p-4 bg-emergency/20 border border-emergency/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-emergency flex-shrink-0" />
                    <p className="text-emergency text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Quick Tips */}
              <div className="mt-6 p-4 bg-background-tertiary rounded-lg">
                <h3 className="font-medium text-text-primary mb-2">Quick Tips</h3>
                <ul className="text-sm text-text-secondary space-y-1">
                  <li>• Ensure good lighting and focus for photos</li>
                  <li>• Place documents on a flat, contrasting surface</li>
                  <li>• Avoid glare and shadows</li>
                  <li>• Include all relevant sections of the report</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          /* Results Section */
          <div className="space-y-8">
            {/* Actions Bar */}
            <div className="bg-background-secondary border border-border-primary rounded-lg p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-accent-primary" />
                  <span className="text-text-primary">
                    Report analyzed successfully
                  </span>
                  {ocrConfidence < 0.8 && (
                    <span className="text-xs text-accent-warning">
                      (Confidence: {Math.round(ocrConfidence * 100)}%)
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {!editingMode && (
                    <button
                      onClick={startEditing}
                      className="px-4 py-2 bg-background-tertiary hover:bg-background-tertiary/80 text-text-primary rounded-lg border border-border-primary text-sm"
                    >
                      <RefreshCw className="w-4 h-4 inline mr-1" />
                      Edit Data
                    </button>
                  )}
                  {editingMode && (
                    <>
                      <button
                        onClick={saveEdits}
                        className="px-4 py-2 bg-accent-primary hover:bg-accent-primary/90 text-background-primary rounded-lg text-sm"
                      >
                        <CheckCircle className="w-4 h-4 inline mr-1" />
                        Save
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="px-4 py-2 bg-background-tertiary hover:bg-background-tertiary/80 text-text-primary rounded-lg border border-border-primary text-sm"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  <button
                    onClick={resetUpload}
                    className="px-4 py-2 bg-background-tertiary hover:bg-background-tertiary/80 text-text-primary rounded-lg border border-border-primary text-sm"
                  >
                    <Upload className="w-4 h-4 inline mr-1" />
                    Upload Another
                  </button>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Extracted Data */}
              <div className="bg-background-secondary border border-border-primary rounded-lg p-6">
                <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-accent-primary" />
                  Extracted Data
                </h2>

                {/* Patient Information */}
                {(extractedData.patient_info || extractedData.report_date) && (
                  <div className="mb-6">
                    <h3 className="font-medium text-text-primary mb-3">Patient Information</h3>
                    <div className="space-y-2 text-sm">
                      {extractedData.patient_info?.name && (
                        <div className="flex justify-between">
                          <span className="text-text-muted">Name:</span>
                          <span className="text-text-primary">{extractedData.patient_info.name}</span>
                        </div>
                      )}
                      {extractedData.patient_info?.age && (
                        <div className="flex justify-between">
                          <span className="text-text-muted">Age:</span>
                          <span className="text-text-primary">{extractedData.patient_info.age} years</span>
                        </div>
                      )}
                      {extractedData.patient_info?.gender && (
                        <div className="flex justify-between">
                          <span className="text-text-muted">Gender:</span>
                          <span className="text-text-primary">{extractedData.patient_info.gender}</span>
                        </div>
                      )}
                      {extractedData.report_date && (
                        <div className="flex justify-between">
                          <span className="text-text-muted">Report Date:</span>
                          <span className="text-text-primary">{extractedData.report_date}</span>
                        </div>
                      )}
                      {extractedData.hospital_name && (
                        <div className="flex justify-between">
                          <span className="text-text-muted">Hospital:</span>
                          <span className="text-text-primary">{extractedData.hospital_name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Test Results */}
                <div>
                  <h3 className="font-medium text-text-primary mb-3">Test Results</h3>
                  <div className="space-y-3">
                    {(editingMode ? editedData : extractedData)?.test_results.map((test, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          test.is_abnormal
                            ? 'bg-emergency/10 border-emergency/20'
                            : 'bg-background-tertiary border-border-primary'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-text-primary capitalize">
                              {test.test_name.replace(/_/g, ' ')}
                            </div>
                            {editingMode ? (
                              <input
                                type="text"
                                value={editedData?.test_results[index]?.value || ''}
                                onChange={(e) => updateTestResult(index, 'value', e.target.value)}
                                className="mt-1 w-full px-2 py-1 bg-background-input border border-border-primary rounded text-sm text-text-primary"
                              />
                            ) : (
                              <div className="text-sm text-text-secondary">
                                Value: {formatTestValue(test)}
                              </div>
                            )}
                            <div className="text-xs text-text-muted mt-1">
                              Normal Range: {test.normal_range}
                            </div>
                            {test.significance && (
                              <div className="text-xs text-text-secondary mt-1">
                                {test.significance}
                              </div>
                            )}
                          </div>
                          {test.is_abnormal && (
                            <div className="ml-3">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emergency/20 text-emergency">
                                Abnormal
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Interpretation */}
              {interpretation && (
                <div className="bg-background-secondary border border-border-primary rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-accent-primary" />
                    AI Interpretation
                  </h2>

                  {/* Summary */}
                  <div className="mb-6">
                    <h3 className="font-medium text-text-primary mb-3">Summary</h3>
                    <p className="text-sm text-text-secondary">{interpretation.summary}</p>
                  </div>

                  {/* Key Findings */}
                  {interpretation.key_findings.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-medium text-text-primary mb-3">Key Findings</h3>
                      <ul className="space-y-1">
                        {interpretation.key_findings.map((finding, index) => (
                          <li key={index} className="text-sm text-text-secondary flex items-start gap-2">
                            <span className="text-accent-primary mt-1">•</span>
                            {finding}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Possible Conditions */}
                  {interpretation.possible_conditions.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-medium text-text-primary mb-3">Possible Conditions</h3>
                      <div className="space-y-2">
                        {interpretation.possible_conditions.map((condition, index) => (
                          <div key={index} className="p-2 bg-background-tertiary rounded text-sm">
                            <div className="font-medium text-text-primary">{condition}</div>
                            {interpretation.confidence_scores[index] && (
                              <div className="text-xs text-text-muted">
                                Confidence: {Math.round(interpretation.confidence_scores[index] * 100)}%
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Urgency Level */}
                  <div className="mb-6">
                    <h3 className="font-medium text-text-primary mb-3">Urgency Level</h3>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      interpretation.urgency_level === 'emergency' ? 'bg-emergency/20 text-emergency' :
                      interpretation.urgency_level === 'high' ? 'bg-accent-warning/20 text-accent-warning' :
                      interpretation.urgency_level === 'medium' ? 'bg-accent-primary/20 text-accent-primary' :
                      'bg-background-tertiary text-text-muted'
                    }`}>
                      {interpretation.urgency_level.toUpperCase()}
                    </div>
                  </div>

                  {/* Recommended Tests */}
                  {interpretation.recommended_tests.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-medium text-text-primary mb-3">Recommended Tests</h3>
                      <ul className="space-y-1">
                        {interpretation.recommended_tests.map((test, index) => (
                          <li key={index} className="text-sm text-text-secondary flex items-start gap-2">
                            <span className="text-accent-primary mt-1">•</span>
                            {test}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommended Specialists */}
                  {interpretation.recommended_specialists.length > 0 && (
                    <div>
                      <h3 className="font-medium text-text-primary mb-3">Recommended Specialists</h3>
                      <div className="space-y-2">
                        {interpretation.recommended_specialists.slice(0, 3).map((specialist, index) => (
                          <div key={index} className="p-3 bg-background-tertiary rounded-lg">
                            <div className="font-medium text-text-primary">{specialist.name}</div>
                            <div className="text-sm text-text-secondary">{specialist.specialty}</div>
                            <div className="text-xs text-text-muted">{specialist.consultation_fee_range}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Medical Disclaimer */}
            <div className="bg-emergency/10 border border-emergency/20 rounded-lg p-4">
              <p className="text-text-secondary text-sm">
                <strong>Medical Disclaimer:</strong> This AI interpretation is for educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
              </p>
            </div>
          </div>
        )}

        {/* Consent Modal */}
        <ConsentModal
          isOpen={showConsentModal}
          onAccept={handleConsentAccept}
          onDecline={handleConsentDecline}
        />
      </div>
    </div>
  )
}