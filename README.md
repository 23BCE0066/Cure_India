# Cure India - AI Medical Triage Platform

A comprehensive AI-powered medical triage website and assistant for the Indian market that provides symptom analysis, medical report interpretation, and doctor recommendations with cost estimates.

## 🏥 Features

### Core Functionality
- **AI-Powered Symptom Analysis**: Get instant analysis of symptoms with confidence scores and possible conditions
- **Medical Report Processing**: Upload and analyze medical reports (PDF, images) with OCR technology
- **Doctor Recommendations**: Find verified specialists with consultation fees and treatment cost estimates
- **Emergency Detection**: Automatic detection of red-flag symptoms with emergency protocols
- **Multilingual Support**: Support for 8+ Indian languages including English, Hindi, Hinglish, and more

### Safety & Privacy
- **Medical Consent**: Explicit user consent before processing medical data
- **Data Encryption**: End-to-end encryption for all medical data
- **Privacy Controls**: User data deletion and export capabilities
- **Disclaimer System**: Clear medical disclaimers on all AI-generated responses
- **Emergency Protocols**: Immediate guidance for life-threatening symptoms

### User Experience
- **Dark Theme**: Modern dark UI designed for reduced eye strain
- **Mobile-First**: Fully responsive design optimized for all devices
- **Voice Input**: Voice recording and transcription for hands-free use
- **Real-time Processing**: Fast AI analysis with progress indicators
- **Accessibility**: WCAG 2.1 AA compliance with screen reader support

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase (PostgreSQL)
- **AI/ML**: Google Gemini Pro for medical analysis
- **OCR**: Google Vision API for report processing
- **Authentication**: Supabase Auth with JWT tokens
- **Storage**: Supabase Storage for encrypted file uploads
- **Deployment**: Vercel (Frontend), Supabase (Backend/Database)

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Google Cloud account with APIs enabled
- Vercel account (for deployment)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd Cure_India
npm install
```

### 2. Environment Setup

Create a `.env.local` file with the following:

```env
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google Cloud APIs
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_pro_api_key
GOOGLE_CLOUD_PROJECT_ID=your_google_cloud_project_id
GOOGLE_CLOUD_KEY_FILE=./service-account-key.json

# Feature Flags
NEXT_PUBLIC_ENABLE_VOICE_ANALYSIS=true
NEXT_PUBLIC_ENABLE_REPORT_UPLOAD=true
NEXT_PUBLIC_ENABLE_MULTILINGUAL=true

# Emergency Configuration (India)
NEXT_PUBLIC_EMERGENCY_PHONE=112
NEXT_PUBLIC_AMBULANCE_PHONE=108

# Development
NODE_ENV=development
```

### 3. Database Setup

1. Create a new Supabase project
2. Run the SQL schema from `database_schema.sql` in your Supabase SQL editor
3. Set up storage policies for medical reports
4. Configure authentication providers

### 4. Google Cloud Setup

1. Create a Google Cloud project
2. Enable the following APIs:
   - Generative Language API (Gemini Pro)
   - Cloud Vision API
   - Cloud Speech-to-Text API (optional for voice features)
3. Create a service account and download the JSON key file
4. Place the key file as `service-account-key.json` in the project root

### 5. Start Development

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API endpoints
│   │   ├── symptoms/      # Symptom analysis APIs
│   │   ├── reports/       # Report upload/processing APIs
│   │   ├── doctors/       # Doctor search APIs
│   │   └── costs/         # Cost estimation APIs
│   ├── auth/              # Authentication pages
│   ├── symptoms/          # Symptom analysis UI
│   ├── reports/           # Report upload UI
│   └── dashboard/         # User dashboard
├── components/            # Reusable React components
│   ├── ConsentModal.tsx   # Medical consent component
│   └── ...                # Other UI components
├── lib/                   # Utility libraries
│   ├── supabase.ts        # Supabase client
│   ├── ai.ts              # AI integration (Gemini)
│   ├── ocr.ts             # OCR processing
│   └── utils.ts           # Helper functions
└── types/                 # TypeScript type definitions
    ├── index.ts           # Main types
    └── database.ts        # Database types
```

## 🔧 Configuration

### Supabase Setup
1. Create a new project at [supabase.com](https://supabase.com)
2. Run the database schema from `database_schema.sql`
3. Set up authentication providers
4. Configure storage policies for medical reports

### Google Cloud Setup
1. Create a project at [console.cloud.google.com](https://console.cloud.google.com)
2. Enable:
   - Generative Language API
   - Cloud Vision API
   - Cloud Speech-to-Text API (optional)
3. Create service account with appropriate permissions
4. Download and configure service account key

### Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `GOOGLE_GENERATIVE_AI_API_KEY`: Gemini Pro API key
- `GOOGLE_CLOUD_PROJECT_ID`: Google Cloud project ID

## 📊 Database Schema

The application uses PostgreSQL with the following main tables:

- `users` - User profiles and preferences
- `symptom_consultations` - AI analysis results
- `medical_reports` - Uploaded medical reports and OCR data
- `doctors` - Verified doctor database
- `cost_estimates` - Treatment cost estimates by condition and city
- `audit_log` - Compliance and audit logging

## 🔒 Security Features

- **Authentication**: Secure login with Supabase Auth
- **Authorization**: Row-level security (RLS) on all user data
- **Encryption**: Medical data encrypted at rest and in transit
- **Consent Management**: Explicit consent for medical data processing
- **Audit Logging**: Complete audit trail for compliance
- **Rate Limiting**: API abuse prevention
- **Input Validation**: Comprehensive validation on all inputs

## 🌍 Multilingual Support

The platform supports:
- English 🇺🇸
- Hindi (हिंदी) 🇮🇳
- Hinglish 🇮🇳
- Gujarati (ગુજરાતી) 🇮🇳
- Tamil (தமிழ்) 🇮🇳
- Telugu (తెలుగు) 🇮🇳
- Bengali (বাংলা) 🇮🇳
- Marathi (मरााठी) 🇮🇳

## 🚨 Emergency Features

- **Red Flag Detection**: Automatic detection of life-threatening symptoms
- **Emergency Guidance**: Clear instructions for emergency situations
- **Local Emergency Numbers**: Integration with Indian emergency services (112, 108)
- **Urgent Care Recommendations**: When to seek immediate medical attention

## 📱 Mobile Features

- **PWA Support**: Progressive Web App capabilities
- **Touch-Friendly UI**: Optimized for mobile interactions
- **Voice Recording**: On-device audio recording for symptoms
- **Camera Integration**: Direct camera capture for medical reports
- **Offline Support**: Basic functionality without internet connection

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Run tests (when implemented)
npm run test
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📈 Monitoring

- **Performance**: Vercel Analytics for frontend metrics
- **Error Tracking**: Sentry integration (optional)
- **API Monitoring**: Supabase dashboards
- **Medical Safety**: Confidence score tracking and alerting

## ⚖️ Legal & Compliance

- **Medical Disclaimer**: All AI responses include clear disclaimers
- **Data Privacy**: Compliance with Indian data protection regulations
- **User Consent**: Explicit consent for medical data processing
- **Audit Trail**: Complete logging for regulatory compliance
- **Emergency Protocols**: Proper emergency guidance and disclaimers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For medical emergencies: **Call 112 (Emergency) or 108 (Ambulance)**

For technical support:
- Create an issue in the repository
- Check the documentation
- Review existing issues

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Medical Disclaimer

This platform provides educational information and triage guidance only. It is not a substitute for professional medical diagnosis, treatment, or advice. Always seek the advice of qualified healthcare professionals with any questions you may have regarding a medical condition.

**In case of medical emergency, call 112 or 108 immediately.**

---

Built with ❤️ for India's healthcare needs