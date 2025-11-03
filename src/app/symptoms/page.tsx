'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mic, MicOff, Send, Upload, AlertTriangle, Clock, Gauge, Heart } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import ConsentModal from '@/components/ConsentModal'
import { hasEmergencySymptoms, detectEmergencySymptoms, SUPPORTED_LANGUAGES } from '@/lib/utils'
import { SymptomRequest, SymptomResponse } from '@/types'

export default function SymptomsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [showConsentModal, setShowConsentModal] = useState(false)
  const [hasConsent, setHasConsent] = useState(false)

  // Form state
  const [symptomText, setSymptomText] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [duration, setDuration] = useState('')
  const [severity, setSeverity] = useState(5)
  const [additionalSymptoms, setAdditionalSymptoms] = useState<string[]>([])
  const [newSymptom, setNewSymptom] = useState('')

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [transcript, setTranscript] = useState('')

  // Analysis results
  const [analysisResult, setAnalysisResult] = useState<SymptomResponse | null>(null)
  const [error, setError] = useState('')

  // Emergency detection
  const [emergencyDetected, setEmergencyDetected] = useState(false)
  const [emergencySymptoms, setEmergencySymptoms] = useState<any[]>([])

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    // Check for emergency symptoms in real-time
    if (symptomText) {
      const emergencies = detectEmergencySymptoms(symptomText)
      setEmergencySymptoms(emergencies)
      setEmergencyDetected(emergencies.some(e => e.severity === 'emergency'))
    }
  }, [symptomText])

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        // Check if user has given consent
        checkUserConsent(user.id)
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
      // Update user consent in database
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

  const startRecording = () => {
    // Placeholder for voice recording functionality
    // In production, this would use Web Speech API or a voice recording library
    setIsRecording(true)
    setRecordingTime(0)

    const interval = setInterval(() => {
      setRecordingTime(prev => prev + 1)
    }, 1000)

    // Simulate recording for 5 seconds
    setTimeout(() => {
      clearInterval(interval)
      stopRecording()
    }, 5000)
  }

  const stopRecording = () => {
    setIsRecording(false)
    // Simulate transcription result
    const simulatedTranscript = "I have been experiencing fever and headache for the past 2 days"
    setTranscript(simulatedTranscript)
    setSymptomText(simulatedTranscript)
  }

  const addSymptom = () => {
    if (newSymptom.trim() && !additionalSymptoms.includes(newSymptom.trim())) {
      setAdditionalSymptoms([...additionalSymptoms, newSymptom.trim()])
      setNewSymptom('')
    }
  }

  const removeSymptom = (symptomToRemove: string) => {
    setAdditionalSymptoms(additionalSymptoms.filter(s => s !== symptomToRemove))
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()

    if (!hasConsent) {
      setShowConsentModal(true)
      return
    }

    if (!symptomText.trim()) {
      setError('Please describe your symptoms')
      return
    }

    setLoading(true)
    setError('')

    try {
      const request: SymptomRequest = {
        type: transcript ? 'voice' : 'text',
        content: symptomText,
        language: selectedLanguage,
        duration_days: duration ? parseInt(duration) : undefined,
        severity: severity,
        additional_symptoms: additionalSymptoms.length > 0 ? additionalSymptoms : undefined
      }

      const response = await fetch('/api/symptoms/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      })

      const data = await response.json()

      if (response.ok) {
        setAnalysisResult(data.data)
      } else {
        setError(data.error || 'Failed to analyze symptoms')
      }
    } catch (error) {
      console.error('Analysis error:', error)
      setError('An error occurred while analyzing your symptoms')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Show loading state while checking auth
  if (!user) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Emergency Alert */}
      {emergencyDetected && (
        <div className="bg-emergency/10 border-b border-emergency/20 px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-emergency flex-shrink-0" />
            <div className="flex-1">
              <p className="text-emergency font-medium">
                Emergency symptoms detected. Please call 112 (Emergency) or 108 (Ambulance) immediately.
              </p>
              <p className="text-emergency/80 text-sm mt-1">
                Detected: {emergencySymptoms.map(s => s.description).join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-text-muted hover:text-text-secondary mb-4 inline-block"
          >
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Symptom Analysis
          </h1>
          <p className="text-text-secondary">
            Describe your symptoms and get AI-powered medical guidance
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-2">
            <div className="bg-background-secondary border border-border-primary rounded-lg p-6">
              {/* Language Selection */}
              <div className="mb-6">
                <label className="block text-text-secondary text-sm font-medium mb-2">
                  Preferred Language
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full px-4 py-2 bg-background-input border border-border-primary rounded-lg text-text-primary focus:outline-none focus:border-accent-primary"
                >
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.nativeName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Voice/Text Input */}
              <div className="mb-6">
                <label className="block text-text-secondary text-sm font-medium mb-2">
                  Describe Your Symptoms
                </label>

                <div className="space-y-4">
                  {/* Voice Recording */}
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`p-4 rounded-full transition-all ${
                        isRecording
                          ? 'bg-emergency hover:bg-emergency/90 animate-pulse-glow'
                          : 'bg-accent-primary hover:bg-accent-primary/90'
                      }`}
                    >
                      {isRecording ? (
                        <MicOff className="w-6 h-6 text-background-primary" />
                      ) : (
                        <Mic className="w-6 h-6 text-background-primary" />
                      )}
                    </button>
                    <div className="flex-1">
                      {isRecording ? (
                        <div>
                          <p className="text-text-primary font-medium">Recording...</p>
                          <p className="text-text-muted text-sm">{formatTime(recordingTime)}</p>
                        </div>
                      ) : (
                        <p className="text-text-muted">Click to record or type below</p>
                      )}
                    </div>
                  </div>

                  {/* Text Input */}
                  <textarea
                    value={symptomText}
                    onChange={(e) => setSymptomText(e.target.value)}
                    placeholder="Describe your symptoms in detail (e.g., 'I have fever, headache, and body pain for 2 days')"
                    className="w-full px-4 py-3 bg-background-input border border-border-primary rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary resize-none"
                    rows={4}
                  />
                </div>

                {transcript && (
                  <div className="mt-3 p-3 bg-accent-primary/10 border border-accent-primary/20 rounded-lg">
                    <p className="text-sm text-text-secondary mb-1">Voice transcript:</p>
                    <p className="text-text-primary">{transcript}</p>
                  </div>
                )}
              </div>

              {/* Duration and Severity */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-text-secondary text-sm font-medium mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    How many days?
                  </label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="2"
                    min="0"
                    max="365"
                    className="w-full px-4 py-2 bg-background-input border border-border-primary rounded-lg text-text-primary focus:outline-none focus:border-accent-primary"
                  />
                </div>

                <div>
                  <label className="block text-text-secondary text-sm font-medium mb-2">
                    <Gauge className="w-4 h-4 inline mr-1" />
                    Severity (1-10)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={severity}
                      onChange={(e) => setSeverity(parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="w-8 text-center font-medium text-text-primary">
                      {severity}
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional Symptoms */}
              <div className="mb-6">
                <label className="block text-text-secondary text-sm font-medium mb-2">
                  Additional Symptoms
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newSymptom}
                    onChange={(e) => setNewSymptom(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSymptom()}
                    placeholder="Add another symptom"
                    className="flex-1 px-4 py-2 bg-background-input border border-border-primary rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary"
                  />
                  <button
                    type="button"
                    onClick={addSymptom}
                    className="px-4 py-2 bg-background-tertiary hover:bg-background-tertiary/80 text-text-primary rounded-lg border border-border-primary"
                  >
                    Add
                  </button>
                </div>

                {additionalSymptoms.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {additionalSymptoms.map((symptom, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-accent-primary/20 text-accent-primary rounded-full text-sm"
                      >
                        {symptom}
                        <button
                          type="button"
                          onClick={() => removeSymptom(symptom)}
                          className="hover:text-accent-primary/80"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={loading || !symptomText.trim()}
                className="w-full bg-accent-primary hover:bg-accent-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-background-primary font-semibold py-3 px-6 rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing Symptoms...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Analyze Symptoms
                  </>
                )}
              </button>

              {error && (
                <div className="mt-4 p-4 bg-emergency/20 border border-emergency/30 rounded-lg">
                  <p className="text-emergency text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-1">
            {analysisResult ? (
              <div className="bg-background-secondary border border-border-primary rounded-lg p-6">
                <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-accent-primary" />
                  Analysis Results
                </h2>

                {/* Conditions */}
                <div className="mb-6">
                  <h3 className="font-medium text-text-primary mb-3">Possible Conditions</h3>
                  <div className="space-y-2">
                    {analysisResult.conditions.map((condition, index) => (
                      <div key={index} className="p-3 bg-background-tertiary rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-text-primary">
                            {condition.name}
                          </span>
                          <span className={`text-sm px-2 py-1 rounded ${
                            condition.confidence >= 0.9
                              ? 'bg-accent-primary/20 text-accent-primary'
                              : condition.confidence >= 0.7
                              ? 'bg-accent-warning/20 text-accent-warning'
                              : 'bg-emergency/20 text-emergency'
                          }`}>
                            {Math.round(condition.confidence * 100)}%
                          </span>
                        </div>
                        <p className="text-sm text-text-secondary">{condition.notes}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Home Remedies */}
                {analysisResult.home_remedies.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-medium text-text-primary mb-3">Safe Home Remedies</h3>
                    <ul className="space-y-1">
                      {analysisResult.home_remedies.map((remedy, index) => (
                        <li key={index} className="text-sm text-text-secondary flex items-start gap-2">
                          <span className="text-accent-primary mt-1">•</span>
                          {remedy}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Red Flags */}
                {analysisResult.red_flags.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-medium text-emergency mb-3">⚠️ When to Seek Care</h3>
                    <ul className="space-y-1">
                      {analysisResult.red_flags.map((flag, index) => (
                        <li key={index} className="text-sm text-emergency flex items-start gap-2">
                          <span className="mt-1">•</span>
                          {flag}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Specialists */}
                {analysisResult.recommended_specialists.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-medium text-text-primary mb-3">Recommended Specialists</h3>
                    <div className="space-y-2">
                      {analysisResult.recommended_specialists.slice(0, 3).map((specialist, index) => (
                        <div key={index} className="p-3 bg-background-tertiary rounded-lg">
                          <div className="font-medium text-text-primary">{specialist.name}</div>
                          <div className="text-sm text-text-secondary">{specialist.specialty}</div>
                          <div className="text-sm text-text-muted">{specialist.consultation_fee_range}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Disclaimer */}
                <div className="p-3 bg-background-input border border-border-primary rounded-lg">
                  <p className="text-xs text-text-muted">
                    {analysisResult.disclaimer}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-background-secondary border border-border-primary rounded-lg p-6">
                <div className="text-center py-8">
                  <Upload className="w-12 h-12 text-text-muted mx-auto mb-4" />
                  <p className="text-text-muted">
                    Enter your symptoms and click analyze to see results here
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Consent Modal */}
      <ConsentModal
        isOpen={showConsentModal}
        onAccept={handleConsentAccept}
        onDecline={handleConsentDecline}
        language={selectedLanguage}
      />
    </div>
  )
}