'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import {
  Activity,
  FileText,
  Users,
  TrendingUp,
  Calendar,
  Clock,
  AlertTriangle,
  Heart,
  Brain,
  Eye,
  Stethoscope,
  LogOut,
  Settings,
  ChevronRight
} from 'lucide-react'

interface DashboardStats {
  totalConsultations: number
  totalReports: number
  averageConfidence: number
  lastConsultation: string
  recentConditions: string[]
  upcomingFollowUps: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalConsultations: 0,
    totalReports: 0,
    averageConfidence: 0,
    lastConsultation: '',
    recentConditions: [],
    upcomingFollowUps: 0
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  useEffect(() => {
    checkAuth()
    loadDashboardData()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth')
      } else {
        setUser(user)
      }
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/auth')
    } finally {
      setLoading(false)
    }
  }

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load user's consultation history
      const { data: consultations } = await supabase
        .from('symptom_consultations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      // Load user's medical reports
      const { data: reports } = await supabase
        .from('medical_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('upload_date', { ascending: false })
        .limit(10)

      // Calculate stats
      const totalConsultations = consultations?.length || 0
      const totalReports = reports?.length || 0

      // Calculate average confidence
      const avgConfidence = consultations && consultations.length > 0
        ? consultations.reduce((sum, c) => sum + c.ai_confidence, 0) / consultations.length
        : 0

      // Get last consultation date
      const lastConsultation = consultations && consultations.length > 0
        ? new Date(consultations[0].created_at).toLocaleDateString('en-IN')
        : 'No consultations yet'

      // Extract recent conditions
      const recentConditions: string[] = []
      consultations?.forEach(consultation => {
        const conditions = consultation.response?.conditions || []
        conditions.forEach((condition: any) => {
          if (!recentConditions.includes(condition.name)) {
            recentConditions.push(condition.name)
          }
        })
      })

      // Combine activity for timeline
      const activity = []

      consultations?.forEach(consultation => {
        activity.push({
          type: 'consultation',
          date: consultation.created_at,
          data: {
            query: consultation.query,
            conditions: consultation.response?.conditions || []
          }
        })
      })

      reports?.forEach(report => {
        activity.push({
          type: 'report',
          date: report.upload_date,
          data: {
            file_type: report.file_type,
            test_count: report.extracted_data?.test_results?.length || 0
          }
        })
      })

      // Sort by date
      activity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      setStats({
        totalConsultations,
        totalReports,
        averageConfidence: Math.round(avgConfidence * 100),
        lastConsultation,
        recentConditions: recentConditions.slice(0, 5),
        upcomingFollowUps: 0 // Would be calculated from appointment system
      })

      setRecentActivity(activity.slice(0, 5))

    } catch (error) {
      console.error('Dashboard data load error:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'consultation':
        return <Heart className="w-4 h-4 text-accent-primary" />
      case 'report':
        return <FileText className="w-4 h-4 text-accent-warning" />
      default:
        return <Activity className="w-4 h-4 text-text-muted" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Header */}
      <header className="bg-background-secondary border-b border-border-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-xl font-bold text-text-primary">
                Cure India
              </Link>
              <span className="text-text-muted">/</span>
              <span className="text-text-secondary">Dashboard</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-text-secondary">
                Welcome, {user.user_metadata?.name || user.email}
              </span>
              <button
                onClick={() => router.push('/symptoms')}
                className="px-4 py-2 bg-accent-primary hover:bg-accent-primary/90 text-background-primary font-medium rounded-lg text-sm"
              >
                New Symptom Check
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-text-muted hover:text-text-secondary rounded-lg"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Link
            href="/symptoms"
            className="bg-background-secondary border border-border-primary rounded-lg p-6 hover:border-accent-primary transition-colors"
          >
            <div className="flex items-center gap-3 mb-2">
              <Heart className="w-6 h-6 text-accent-primary" />
              <h3 className="font-semibold text-text-primary">Symptom Check</h3>
            </div>
            <p className="text-sm text-text-secondary">
              Analyze symptoms with AI
            </p>
          </Link>

          <Link
            href="/reports"
            className="bg-background-secondary border border-border-primary rounded-lg p-6 hover:border-accent-primary transition-colors"
          >
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-6 h-6 text-accent-warning" />
              <h3 className="font-semibold text-text-primary">Upload Report</h3>
            </div>
            <p className="text-sm text-text-secondary">
              Analyze medical reports
            </p>
          </Link>

          <Link
            href="/doctors"
            className="bg-background-secondary border border-border-primary rounded-lg p-6 hover:border-accent-primary transition-colors"
          >
            <div className="flex items-center gap-3 mb-2">
              <Stethoscope className="w-6 h-6 text-text-primary" />
              <h3 className="font-semibold text-text-primary">Find Doctors</h3>
            </div>
            <p className="text-sm text-text-secondary">
              Browse specialists
            </p>
          </Link>

          <Link
            href="/history"
            className="bg-background-secondary border border-border-primary rounded-lg p-6 hover:border-accent-primary transition-colors"
          >
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-6 h-6 text-text-muted" />
              <h3 className="font-semibold text-text-primary">History</h3>
            </div>
            <p className="text-sm text-text-secondary">
              View past consultations
            </p>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-background-secondary border border-border-primary rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-5 h-5 text-accent-primary" />
              <span className="text-text-muted text-sm">Total Consultations</span>
            </div>
            <div className="text-2xl font-bold text-text-primary">{stats.totalConsultations}</div>
          </div>

          <div className="bg-background-secondary border border-border-primary rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-accent-warning" />
              <span className="text-text-muted text-sm">Reports Analyzed</span>
            </div>
            <div className="text-2xl font-bold text-text-primary">{stats.totalReports}</div>
          </div>

          <div className="bg-background-secondary border border-border-primary rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Brain className="w-5 h-5 text-accent-primary" />
              <span className="text-text-muted text-sm">Avg. Confidence</span>
            </div>
            <div className="text-2xl font-bold text-text-primary">{stats.averageConfidence}%</div>
          </div>

          <div className="bg-background-secondary border border-border-primary rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-text-muted" />
              <span className="text-text-muted text-sm">Last Activity</span>
            </div>
            <div className="text-sm font-medium text-text-primary">{stats.lastConsultation}</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-background-secondary border border-border-primary rounded-lg p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4">Recent Activity</h2>

              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-text-muted mx-auto mb-4" />
                  <p className="text-text-muted">No recent activity</p>
                  <Link
                    href="/symptoms"
                    className="inline-flex items-center gap-2 mt-4 text-accent-primary hover:text-accent-primary/80"
                  >
                    Start your first symptom check
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-background-tertiary rounded-lg">
                      <div className="mt-1">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-text-primary capitalize">
                            {activity.type}
                          </span>
                          <span className="text-xs text-text-muted">
                            {formatDate(activity.date)}
                          </span>
                        </div>
                        {activity.type === 'consultation' ? (
                          <p className="text-sm text-text-secondary truncate">
                            {activity.data.query}
                          </p>
                        ) : (
                          <p className="text-sm text-text-secondary">
                            {activity.data.file_type.toUpperCase()} report with {activity.data.test_count} tests
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Conditions */}
          <div className="lg:col-span-1">
            <div className="bg-background-secondary border border-border-primary rounded-lg p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4">Recent Conditions</h2>

              {stats.recentConditions.length === 0 ? (
                <div className="text-center py-8">
                  <Eye className="w-12 h-12 text-text-muted mx-auto mb-4" />
                  <p className="text-text-muted text-sm">No conditions analyzed yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {stats.recentConditions.map((condition, index) => (
                    <div key={index} className="p-2 bg-background-tertiary rounded text-sm">
                      <span className="text-text-primary">{condition}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Health Tips */}
              <div className="mt-6 p-4 bg-accent-primary/10 border border-accent-primary/20 rounded-lg">
                <h3 className="font-medium text-text-primary mb-2">Health Tip</h3>
                <p className="text-sm text-text-secondary">
                  Keep track of your symptoms and consult doctors regularly for better health management.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Notice */}
        <div className="mt-8 p-4 bg-emergency/10 border border-emergency/20 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-emergency flex-shrink-0" />
            <p className="text-emergency text-sm">
              <strong>Emergency:</strong> If you are experiencing severe symptoms like chest pain, breathing difficulty, or loss of consciousness, call 112 (Emergency) or 108 (Ambulance) immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}