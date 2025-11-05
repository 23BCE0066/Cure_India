import Link from 'next/link'
import { Mic, Upload, MessageCircle, Heart, Shield, Globe, Brain } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background-primary">
      {/* Hero Section */}
      <section className="px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-text-primary mb-6">
            AI-Powered Medical Triage
            <span className="block text-accent-primary">for India</span>
          </h1>

          <p className="text-lg md:text-xl text-text-secondary mb-8">
            Get instant symptom analysis, medical report interpretation, and doctor recommendations
            in your preferred language. Powered by advanced AI with your safety as our priority.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/symptoms"
              className="bg-accent-primary hover:bg-accent-primary/90 text-background-primary font-semibold py-4 px-8 rounded-lg transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              <Mic className="w-5 h-5" />
              Start Symptom Check
            </Link>

            <Link
              href="/reports"
              className="bg-background-tertiary hover:bg-background-tertiary/80 text-text-primary font-semibold py-4 px-8 rounded-lg border border-border-primary transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Upload Medical Report
            </Link>
          </div>

          <p className="text-sm text-text-muted mb-4">
            ⚠️ This is not a medical diagnosis. Always consult qualified healthcare professionals.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16 bg-background-secondary">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-text-primary mb-12">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-background-tertiary p-6 rounded-lg border border-border-primary">
              <div className="w-12 h-12 bg-accent-primary/20 rounded-lg flex items-center justify-center mb-4">
                <Mic className="w-6 h-6 text-accent-primary" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">
                Voice or Text Input
              </h3>
              <p className="text-text-secondary">
                Describe your symptoms by typing or speaking in English, Hindi, Hinglish, or other Indian languages.
              </p>
            </div>

            <div className="bg-background-tertiary p-6 rounded-lg border border-border-primary">
              <div className="w-12 h-12 bg-accent-primary/20 rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-accent-primary" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">
                AI Analysis
              </h3>
              <p className="text-text-secondary">
                Our AI analyzes your symptoms, provides possible conditions with confidence scores, and suggests safe home remedies.
              </p>
            </div>

            <div className="bg-background-tertiary p-6 rounded-lg border border-border-primary">
              <div className="w-12 h-12 bg-accent-primary/20 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-accent-primary" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-3">
                Doctor Recommendations
              </h3>
              <p className="text-text-secondary">
                Get verified specialist recommendations in your city with consultation fees and estimated treatment costs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Features */}
      <section className="px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-text-primary mb-12">
            Your Safety First
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-emergency/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-emergency" />
              </div>
              <h3 className="font-semibold text-text-primary mb-2">
                Emergency Detection
              </h3>
              <p className="text-sm text-text-secondary">
                Instant red flag detection for life-threatening symptoms
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-accent-primary" />
              </div>
              <h3 className="font-semibold text-text-primary mb-2">
                Privacy Protected
              </h3>
              <p className="text-sm text-text-secondary">
                Your medical data is encrypted and never shared without consent
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-accent-primary" />
              </div>
              <h3 className="font-semibold text-text-primary mb-2">
                Multilingual Support
              </h3>
              <p className="text-sm text-text-secondary">
                Support for 8+ Indian languages including Hinglish
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-accent-primary" />
              </div>
              <h3 className="font-semibold text-text-primary mb-2">
                24/7 Availability
              </h3>
              <p className="text-sm text-text-secondary">
                Get instant medical guidance anytime, anywhere
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background-secondary border-t border-border-primary px-4 py-8">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-text-muted mb-2">
            © 2024 Cure India. All rights reserved.
          </p>
          <p className="text-sm text-text-muted">
            This platform provides educational information and triage guidance only.
            Not a substitute for professional medical diagnosis.
          </p>
        </div>
      </footer>
    </div>
  )
}