import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Language, EmergencySymptom } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency for Indian context
export function formatCurrency(amount: number, currency = '₹'): string {
  return `${currency}${amount.toLocaleString('en-IN')}`
}

// Format currency range
export function formatCurrencyRange(min: number, max: number, currency = '₹'): string {
  return `${currency}${min.toLocaleString('en-IN')} - ${currency}${max.toLocaleString('en-IN')}`
}

// Confidence level helpers
export function getConfidenceLevel(confidence: number): 'high' | 'medium' | 'low' {
  if (confidence >= 0.9) return 'high'
  if (confidence >= 0.7) return 'medium'
  return 'low'
}

export function getConfidenceColor(confidence: number): string {
  const level = getConfidenceLevel(confidence)
  switch (level) {
    case 'high': return 'text-accent-primary'
    case 'medium': return 'text-accent-warning'
    case 'low': return 'text-emergency'
    default: return 'text-text-muted'
  }
}

export function getConfidenceBadgeColor(confidence: number): string {
  const level = getConfidenceLevel(confidence)
  switch (level) {
    case 'high': return 'bg-accent-primary/20 text-accent-primary border-accent-primary/30'
    case 'medium': return 'bg-accent-warning/20 text-accent-warning border-accent-warning/30'
    case 'low': return 'bg-emergency/20 text-emergency border-emergency/30'
    default: return 'bg-background-tertiary text-text-muted border-border-primary'
  }
}

// Emergency detection helpers
export const EMERGENCY_SYMPTOMS: EmergencySymptom[] = [
  {
    symptom: 'chest_pain',
    severity: 'emergency',
    description: 'Chest pain, pressure, or tightness',
    action: 'Call emergency services immediately',
    phone_numbers: ['112', '108']
  },
  {
    symptom: 'breathing_difficulty',
    severity: 'emergency',
    description: 'Severe difficulty breathing or shortness of breath',
    action: 'Call emergency services immediately',
    phone_numbers: ['112', '108']
  },
  {
    symptom: 'uncontrolled_bleeding',
    severity: 'emergency',
    description: 'Uncontrolled or severe bleeding',
    action: 'Apply pressure and call emergency services',
    phone_numbers: ['112', '108']
  },
  {
    symptom: 'loss_of_consciousness',
    severity: 'emergency',
    description: 'Fainting or loss of consciousness',
    action: 'Call emergency services immediately',
    phone_numbers: ['112', '108']
  },
  {
    symptom: 'severe_head_injury',
    severity: 'emergency',
    description: 'Severe head injury or trauma',
    action: 'Call emergency services immediately',
    phone_numbers: ['112', '108']
  },
  {
    symptom: 'stroke_symptoms',
    severity: 'emergency',
    description: 'Facial drooping, arm weakness, speech difficulty',
    action: 'Call emergency services immediately (Remember FAST)',
    phone_numbers: ['112', '108']
  },
  {
    symptom: 'high_fever_with_rash',
    severity: 'urgent',
    description: 'High fever (>103°F/39.4°C) with rash',
    action: 'Seek immediate medical care'
  },
  {
    symptom: 'severe_headache_neck_stiffness',
    severity: 'urgent',
    description: 'Severe headache with neck stiffness',
    action: 'Seek immediate medical care'
  },
  {
    symptom: 'vision_changes',
    severity: 'urgent',
    description: 'Sudden vision changes or eye pain',
    action: 'Seek immediate medical care'
  },
  {
    symptom: 'confusion_disorientation',
    severity: 'urgent',
    description: 'Sudden confusion or disorientation',
    action: 'Seek immediate medical care'
  }
]

export function detectEmergencySymptoms(text: string): EmergencySymptom[] {
  const lowerText = text.toLowerCase()
  const detectedSymptoms: EmergencySymptom[] = []

  EMERGENCY_SYMPTOMS.forEach(symptom => {
    // Simple keyword matching - in production, this would use more sophisticated NLP
    const keywords = symptom.description.toLowerCase().split(' ')
    const hasKeywords = keywords.some(keyword => lowerText.includes(keyword))

    if (hasKeywords) {
      detectedSymptoms.push(symptom)
    }
  })

  return detectedSymptoms
}

export function hasEmergencySymptoms(text: string): boolean {
  const detected = detectEmergencySymptoms(text)
  return detected.some(s => s.severity === 'emergency')
}

// Language support
export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  { code: 'hn', name: 'Hinglish', nativeName: 'Hinglish', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' }
]

export function getLanguageByCode(code: string): Language | undefined {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code)
}

export function detectLanguage(text: string): string {
  // Simple language detection - in production, use a proper language detection library
  const hindiRegex = /[\u0900-\u097F]/
  const hinglishKeywords = ['main', 'hai', 'hain', 'mein', 'mujhe', 'kya', 'kaise', 'kidhar', 'kyun']

  if (hindiRegex.test(text)) {
    return 'hi'
  }

  const lowerText = text.toLowerCase()
  if (hinglishKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'hn'
  }

  return 'en'
}

// File validation
export function validateFileType(file: File): boolean {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
  return allowedTypes.includes(file.type)
}

export function validateFileSize(file: File, maxSizeMB = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxSizeBytes
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Date formatting
export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Text processing
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Rating display
export function renderRating(rating: number): JSX.Element {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 !== 0
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

  return (
    <div className="flex items-center gap-1">
      {[...Array(fullStars)].map((_, i) => (
        <span key={`full-${i}`} className="text-accent-primary">★</span>
      ))}
      {hasHalfStar && <span className="text-accent-primary">☆</span>}
      {[...Array(emptyStars)].map((_, i) => (
        <span key={`empty-${i}`} className="text-border-tertiary">★</span>
      ))}
      <span className="text-text-secondary ml-1">({rating})</span>
    </div>
  )
}

// Error handling
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}

export function isApiError(error: unknown): error is { message: string; status?: number } {
  return typeof error === 'object' && error !== null && 'message' in error
}

// URL and navigation helpers
export function createWhatsAppMessage(doctorName: string, hospital: string): string {
  const message = `Hi, I'm interested in booking a consultation with Dr. ${doctorName} at ${hospital}.`
  return `https://wa.me/?text=${encodeURIComponent(message)}`
}

export function createPhoneLink(phoneNumber: string): string {
  return `tel:${phoneNumber.replace(/[^0-9+]/g, '')}`
}

// Session storage helpers
export function getSessionStorage(key: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    return sessionStorage.getItem(key)
  } catch {
    return null
  }
}

export function setSessionStorage(key: string, value: string): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(key, value)
  } catch {
    // Ignore storage errors
  }
}

export function removeSessionStorage(key: string): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(key)
  } catch {
    // Ignore storage errors
  }
}