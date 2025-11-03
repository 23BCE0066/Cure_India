// Core user and authentication types
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  preferred_language: string;
  city?: string;
  emergency_contact?: {
    name: string;
    phone: string;
    relation: string;
  };
  created_at: string;
  updated_at: string;
}

// Symptom analysis types
export interface SymptomRequest {
  type: 'text' | 'voice';
  content: string;
  language?: string;
  duration_days?: number;
  additional_symptoms?: string[];
  severity?: number; // 1-10 scale
}

export interface SymptomResponse {
  query: string;
  language: string;
  conditions: Condition[];
  interpretation: string;
  home_remedies: string[];
  red_flags: string[];
  recommended_specialists: Specialist[];
  confidence_overall: number;
  sources: string[];
  disclaimer: string;
  created_at: string;
  session_id?: string;
}

export interface Condition {
  name: string;
  confidence: number;
  probability_rank: number;
  notes: string;
  is_high_confidence: boolean;
  urgency_level: 'low' | 'medium' | 'high' | 'emergency';
}

export interface Specialist {
  id: string;
  specialty: string;
  city: string;
  name: string;
  rating: number;
  experience_years: number;
  consultation_fee_range: string;
  estimated_treatment_cost_range: string;
  hospital?: string;
  contact?: string;
  availability?: string;
}

// Medical report types
export interface MedicalReport {
  id: string;
  user_id: string;
  file_url: string;
  file_type: 'pdf' | 'image';
  extracted_data: ExtractedData;
  interpretation: ReportInterpretation;
  upload_date: string;
  verified: boolean;
}

export interface ExtractedData {
  test_results: TestResult[];
  patient_info?: {
    name: string;
    age: number;
    gender: string;
  };
  report_date?: string;
  hospital_name?: string;
  doctor_name?: string;
}

export interface TestResult {
  test_name: string;
  value: number | string;
  unit: string;
  normal_range: string;
  is_abnormal: boolean;
  significance?: string;
  category?: string; // e.g., 'blood', 'urine', 'radiology'
}

export interface ReportInterpretation {
  summary: string;
  possible_conditions: string[];
  confidence_scores: number[];
  recommended_tests: string[];
  recommended_specialists: Specialist[];
  urgency_level: 'low' | 'medium' | 'high' | 'emergency';
  key_findings: string[];
  abnormal_values: TestResult[];
}

// AI and API response types
export interface AIAnalysisRequest {
  input: string;
  type: 'symptom' | 'report' | 'chat';
  language?: string;
  context?: string;
  user_profile?: Partial<User>;
}

export interface AIAnalysisResponse {
  success: boolean;
  data?: SymptomResponse | ReportInterpretation;
  error?: string;
  processing_time?: number;
  model_version?: string;
}

// Database types for Supabase
export interface DatabaseUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  preferred_language: string;
  city?: string;
  emergency_contact?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SymptomConsultation {
  id: string;
  user_id: string;
  query: string;
  language: string;
  response: Record<string, any>;
  ai_confidence: number;
  session_id: string;
  created_at: string;
}

export interface DoctorRecord {
  id: string;
  name: string;
  specialty: string;
  city: string;
  hospital?: string;
  rating: number;
  experience_years: number;
  consultation_fee_min: number;
  consultation_fee_max: number;
  contact_phone?: string;
  contact_email?: string;
  is_verified: boolean;
}

export interface CostEstimate {
  id: string;
  condition_name: string;
  specialty: string;
  city: string;
  consultation_min: number;
  consultation_max: number;
  treatment_min: number;
  treatment_max: number;
  data_source: string;
  last_updated: string;
}

// UI and component types
export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export interface ConsentData {
  medical_data_processing: boolean;
  not_diagnosis_understanding: boolean;
  privacy_policy_accepted: boolean;
  terms_accepted: boolean;
  timestamp: string;
}

export interface VoiceRecordingState {
  isRecording: boolean;
  transcript: string;
  audioBlob?: Blob;
  duration: number;
  language: string;
  confidence: number;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  message?: string;
}

// Emergency and safety types
export interface EmergencySymptom {
  symptom: string;
  severity: 'emergency' | 'urgent' | 'moderate';
  description: string;
  action: string;
  phone_numbers?: string[];
}

export interface SafetyCheck {
  has_red_flags: boolean;
  emergency_symptoms: EmergencySymptom[];
  urgent_symptoms: EmergencySymptom[];
  recommended_action: string;
}

// Chat and conversation types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  language?: string;
  attachments?: Attachment[];
}

export interface Attachment {
  type: 'image' | 'pdf' | 'audio';
  url: string;
  name: string;
  size: number;
}

export interface ChatSession {
  id: string;
  user_id: string;
  messages: ChatMessage[];
  context: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Error handling types
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, any>;
}

export interface ValidationError extends ApiError {
  field: string;
  value: any;
}

// Configuration types
export interface AppConfig {
  emergency_phone: string;
  ambulance_phone: string;
  supported_languages: Language[];
  max_file_size: number;
  supported_file_types: string[];
  ai_confidence_thresholds: {
    high: number;
    medium: number;
    low: number;
  };
}