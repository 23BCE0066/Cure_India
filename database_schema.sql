-- Cure India Medical Triage Platform Database Schema
-- PostgreSQL schema for Supabase

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  preferred_language VARCHAR(10) DEFAULT 'en',
  city VARCHAR(100),
  emergency_contact JSONB,
  consent_given BOOLEAN DEFAULT FALSE,
  consent_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Symptom consultations
CREATE TABLE symptom_consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  language VARCHAR(10),
  response JSONB NOT NULL,
  ai_confidence DECIMAL(3,2),
  session_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medical reports
CREATE TABLE medical_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type VARCHAR(20) NOT NULL,
  extracted_data JSONB,
  interpretation JSONB,
  is_verified BOOLEAN DEFAULT FALSE,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Doctor database
CREATE TABLE doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  specialty VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  hospital VARCHAR(255),
  rating DECIMAL(2,1),
  experience_years INTEGER,
  consultation_fee_min INTEGER,
  consultation_fee_max INTEGER,
  contact_phone VARCHAR(20),
  contact_email VARCHAR(255),
  is_verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cost estimates
CREATE TABLE cost_estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  condition_name VARCHAR(255) NOT NULL,
  specialty VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  consultation_min INTEGER,
  consultation_max INTEGER,
  treatment_min INTEGER,
  treatment_max INTEGER,
  data_source VARCHAR(100),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions for chat continuity
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Audit log for compliance
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_symptom_consultations_user_id ON symptom_consultations(user_id);
CREATE INDEX idx_symptom_consultations_created_at ON symptom_consultations(created_at DESC);
CREATE INDEX idx_medical_reports_user_id ON medical_reports(user_id);
CREATE INDEX idx_medical_reports_upload_date ON medical_reports(upload_date DESC);
CREATE INDEX idx_doctors_city ON doctors(city);
CREATE INDEX idx_doctors_specialty ON doctors(specialty);
CREATE INDEX idx_doctors_rating ON doctors(rating DESC);
CREATE INDEX idx_cost_estimates_condition_city ON cost_estimates(condition_name, city);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);

-- RLS (Row Level Security) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Users can only access their own consultations
CREATE POLICY "Users can view own consultations" ON symptom_consultations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own consultations" ON symptom_consultations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only access their own reports
CREATE POLICY "Users can view own reports" ON medical_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own reports" ON medical_reports FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only access their own sessions
CREATE POLICY "Users can view own sessions" ON user_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own sessions" ON user_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON doctors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_sessions_updated_at BEFORE UPDATE ON user_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM user_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Sample data for doctors (can be removed in production)
INSERT INTO doctors (name, specialty, city, hospital, rating, experience_years, consultation_fee_min, consultation_fee_max, contact_phone) VALUES
('Dr. Rajesh Sharma', 'Cardiologist', 'Mumbai', 'Lilavati Hospital', 4.8, 20, 800, 2000, '+91-9876543210'),
('Dr. Priya Nair', 'Internal Medicine', 'Delhi', 'Apollo Hospital', 4.6, 15, 500, 1200, '+91-9876543211'),
('Dr. Amit Patel', 'Neurologist', 'Bangalore', 'Manipal Hospital', 4.7, 18, 1000, 2500, '+91-9876543212'),
('Dr. Sunita Reddy', 'Pediatrician', 'Chennai', 'Fortis Hospital', 4.9, 12, 400, 1000, '+91-9876543213'),
('Dr. Vikram Singh', 'Orthopedic', 'Kolkata', 'Apollo Gleneagles', 4.5, 22, 600, 1500, '+91-9876543214'),
('Dr. Anjali Gupta', 'Gynecologist', 'Pune', 'Jehangir Hospital', 4.8, 16, 700, 1800, '+91-9876543215'),
('Dr. Rahul Kumar', 'Dermatologist', 'Hyderabad', 'Yashoda Hospital', 4.6, 10, 300, 800, '+91-9876543216'),
('Dr. Meera Iyer', 'Endocrinologist', 'Ahmedabad', 'Sterling Hospital', 4.7, 14, 800, 2000, '+91-9876543217');

-- Sample cost estimates
INSERT INTO cost_estimates (condition_name, specialty, city, consultation_min, consultation_max, treatment_min, treatment_max, data_source) VALUES
('Fever', 'Internal Medicine', 'Mumbai', 400, 1000, 1000, 5000, 'Industry Average'),
('Diabetes', 'Endocrinologist', 'Delhi', 800, 2000, 5000, 20000, 'Hospital Data'),
('Hypertension', 'Cardiologist', 'Bangalore', 600, 1500, 3000, 15000, 'Medical Association'),
('Cough', 'Pulmonologist', 'Chennai', 500, 1200, 2000, 8000, 'Industry Average'),
('Headache', 'Neurologist', 'Kolkata', 800, 2000, 3000, 12000, 'Hospital Data');

-- Storage policies for Supabase Storage
-- Note: These need to be created via Supabase dashboard or SQL editor

-- INSERT INTO storage.buckets (id, name, public) VALUES ('medical-reports', 'medical-reports', false);
--
-- CREATE POLICY "Users can upload their own reports" ON storage.objects
--   FOR INSERT WITH CHECK (
--     bucket_id = 'medical-reports' AND
--     auth.role() = 'authenticated' AND
--     (auth.uid())::text = (storage.foldername(name))[1]
--   );
--
-- CREATE POLICY "Users can view their own reports" ON storage.objects
--   FOR SELECT USING (
--     bucket_id = 'medical-reports' AND
--     auth.role() = 'authenticated' AND
--     (auth.uid())::text = (storage.foldername(name))[1]
--   );