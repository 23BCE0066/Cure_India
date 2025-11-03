'use client'

import { useState } from 'react'
import { Shield, FileText, Eye, X } from 'lucide-react'

interface ConsentModalProps {
  isOpen: boolean
  onAccept: (consentData: ConsentData) => void
  onDecline: () => void
  language?: string
}

interface ConsentData {
  medical_data_processing: boolean
  not_diagnosis_understanding: boolean
  privacy_policy_accepted: boolean
  terms_accepted: boolean
  timestamp: string
}

export default function ConsentModal({ isOpen, onAccept, onDecline, language = 'en' }: ConsentModalProps) {
  const [consentData, setConsentData] = useState<ConsentData>({
    medical_data_processing: false,
    not_diagnosis_understanding: false,
    privacy_policy_accepted: false,
    terms_accepted: false,
    timestamp: ''
  })

  const [loading, setLoading] = useState(false)

  const content = {
    en: {
      title: 'Medical Consent & Privacy',
      description: 'Before we proceed, please review and accept the following important information:',
      medicalData: {
        title: 'Medical Data Processing',
        description: 'I consent to processing my medical data (symptoms, reports, consultations) for AI-powered symptom analysis and recommendations.'
      },
      notDiagnosis: {
        title: 'Not a Medical Diagnosis',
        description: 'I understand this is not a medical diagnosis and always consult qualified healthcare professionals for medical advice.'
      },
      privacy: {
        title: 'Privacy Policy',
        description: 'I have read and agree to the Privacy Policy regarding my data protection and rights.'
      },
      terms: {
        title: 'Terms of Service',
        description: 'I have read and agree to the Terms of Service governing my use of this platform.'
      },
      acceptButton: 'Accept & Continue',
      declineButton: 'Decline',
      requiredNotice: 'All checkboxes are required to continue.'
    },
    hi: {
      title: 'मेडिकल सहमति और गोपनीयता',
      description: 'आगे बढ़ने से पहले, कृपया निम्नलिखित महत्वपूर्ण जानकारी की समीक्षा करें और स्वीकार करें:',
      medicalData: {
        title: 'मेडिकल डेटा प्रोसेसिंग',
        description: 'मैं AI-संचालित लक्षण विश्लेषण और सिफारिशों के लिए अपने मेडिकल डेटा (लक्षण, रिपोर्ट, परामर्श) को प्रोसेस करने के लिए सहमति देता हूं।'
      },
      notDiagnosis: {
        title: 'मेडिकल निदान नहीं',
        description: 'मुझे समझ में आता है कि यह एक मेडिकल निदान नहीं है और मैं हमेशा मेडिकल सलाह के लिए योग्य हेल्थकेयर पेशेवरों से परामर्श करूंगा।'
      },
      privacy: {
        title: 'गोपनीयता नीति',
        description: 'मैंने अपने डेटा संरक्षण और अधिकारों के संबंध में गोपनीयता नीति पढ़ी है और इससे सहमत हूं।'
      },
      terms: {
        title: 'सेवा की शर्तें',
        description: 'मैंने इस प्लेटफॉर्म के उपयोग को नियंत्रित करने वाली सेवा की शर्तों को पढ़ा है और इससे सहमत हूं।'
      },
      acceptButton: 'स्वीकार करें और जारी रखें',
      declineButton: 'अस्वीकार करें',
      requiredNotice: 'जारी रखने के लिए सभी चेकबॉक्स आवश्यक हैं।'
    }
  }

  const t = content[language as keyof typeof content] || content.en

  const handleConsentChange = (field: keyof ConsentData, value: boolean) => {
    setConsentData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAccept = async () => {
    setLoading(true)

    const updatedConsentData = {
      ...consentData,
      timestamp: new Date().toISOString()
    }

    // Simulate API call to save consent
    await new Promise(resolve => setTimeout(resolve, 500))

    onAccept(updatedConsentData)
    setLoading(false)
  }

  const handleDecline = () => {
    onDecline()
  }

  const isAllConsented = Object.values(consentData).every(value =>
    typeof value === 'boolean' ? value : false
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background-secondary border border-border-primary rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="p-6 border-b border-border-primary">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent-primary/20 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-accent-primary" />
              </div>
              <h2 className="text-xl font-semibold text-text-primary">
                {t.title}
              </h2>
            </div>
            <button
              onClick={handleDecline}
              className="text-text-muted hover:text-text-secondary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-text-secondary mb-6">
            {t.description}
          </p>

          <div className="space-y-4">
            {/* Medical Data Processing Consent */}
            <div className="bg-background-tertiary border border-border-primary rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentData.medical_data_processing}
                  onChange={(e) => handleConsentChange('medical_data_processing', e.target.checked)}
                  className="mt-1 w-4 h-4 text-accent-primary bg-background-input border-border-primary rounded focus:ring-accent-primary focus:ring-2"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-text-primary mb-1">
                    {t.medicalData.title}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {t.medicalData.description}
                  </p>
                </div>
              </label>
            </div>

            {/* Not a Diagnosis Understanding */}
            <div className="bg-background-tertiary border border-border-primary rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentData.not_diagnosis_understanding}
                  onChange={(e) => handleConsentChange('not_diagnosis_understanding', e.target.checked)}
                  className="mt-1 w-4 h-4 text-accent-primary bg-background-input border-border-primary rounded focus:ring-accent-primary focus:ring-2"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-text-primary mb-1">
                    {t.notDiagnosis.title}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {t.notDiagnosis.description}
                  </p>
                </div>
              </label>
            </div>

            {/* Privacy Policy */}
            <div className="bg-background-tertiary border border-border-primary rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentData.privacy_policy_accepted}
                  onChange={(e) => handleConsentChange('privacy_policy_accepted', e.target.checked)}
                  className="mt-1 w-4 h-4 text-accent-primary bg-background-input border-border-primary rounded focus:ring-accent-primary focus:ring-2"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-text-primary mb-1 flex items-center gap-2">
                    {t.privacy.title}
                    <button
                      type="button"
                      className="text-accent-primary hover:text-accent-primary/80 text-sm flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </button>
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {t.privacy.description}
                  </p>
                </div>
              </label>
            </div>

            {/* Terms of Service */}
            <div className="bg-background-tertiary border border-border-primary rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentData.terms_accepted}
                  onChange={(e) => handleConsentChange('terms_accepted', e.target.checked)}
                  className="mt-1 w-4 h-4 text-accent-primary bg-background-input border-border-primary rounded focus:ring-accent-primary focus:ring-2"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-text-primary mb-1 flex items-center gap-2">
                    {t.terms.title}
                    <button
                      type="button"
                      className="text-accent-primary hover:text-accent-primary/80 text-sm flex items-center gap-1"
                    >
                      <FileText className="w-3 h-3" />
                      View
                    </button>
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {t.terms.description}
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Required Notice */}
          <div className="mt-6 p-3 bg-background-input border border-border-primary rounded-lg">
            <p className="text-xs text-text-muted">
              <span className="font-medium">Note:</span> {t.requiredNotice}
            </p>
          </div>

          {/* Emergency Notice */}
          <div className="mt-4 p-3 bg-emergency/10 border border-emergency/20 rounded-lg">
            <p className="text-xs text-text-secondary">
              <span className="font-medium text-emergency">Emergency:</span> If you are experiencing a medical emergency, please call 112 (Emergency) or 108 (Ambulance) immediately.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-border-primary bg-background-tertiary">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDecline}
              className="flex-1 px-6 py-3 bg-background-input hover:bg-background-input/80 text-text-secondary font-medium rounded-lg transition-colors"
            >
              {t.declineButton}
            </button>
            <button
              onClick={handleAccept}
              disabled={!isAllConsented || loading}
              className="flex-1 bg-accent-primary hover:bg-accent-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-background-primary font-semibold py-3 px-6 rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                t.acceptButton
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}