import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// Admin client for server-side operations
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
)

// Database helper functions
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

export async function updateUserProfile(userId: string, updates: any) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function createSymptomConsultation(consultation: any) {
  const { data, error } = await supabase
    .from('symptom_consultations')
    .insert(consultation)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getUserSymptomHistory(userId: string, limit = 10) {
  const { data, error } = await supabase
    .from('symptom_consultations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

export async function uploadMedicalReport(file: File, userId: string) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${Date.now()}.${fileExt}`

  const { data, error } = await supabase.storage
    .from('medical-reports')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from('medical-reports')
    .getPublicUrl(fileName)

  return publicUrl
}

export async function createMedicalReport(report: any) {
  const { data, error } = await supabase
    .from('medical_reports')
    .insert(report)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getUserMedicalReports(userId: string) {
  const { data, error } = await supabase
    .from('medical_reports')
    .select('*')
    .eq('user_id', userId)
    .order('upload_date', { ascending: false })

  if (error) throw error
  return data
}

export async function searchDoctors(params: {
  specialty?: string
  city?: string
  rating?: number
  limit?: number
}) {
  let query = supabase
    .from('doctors')
    .select('*')
    .eq('is_verified', true)

  if (params.specialty) {
    query = query.eq('specialty', params.specialty)
  }

  if (params.city) {
    query = query.eq('city', params.city)
  }

  if (params.rating) {
    query = query.gte('rating', params.rating)
  }

  query = query.order('rating', { ascending: false })
    .limit(params.limit || 10)

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function getCostEstimates(conditionName: string, city: string) {
  const { data, error } = await supabase
    .from('cost_estimates')
    .select('*')
    .eq('condition_name', conditionName)
    .eq('city', city)
    .single()

  if (error && error.code !== 'PGRST116') { // Ignore not found errors
    throw error
  }

  return data
}

export async function deleteUserAccount(userId: string) {
  // Delete user data (cascade delete should handle related records)
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId)

  if (error) throw error

  // Delete auth user
  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)
  if (authError) throw authError
}

// Real-time subscriptions
export function subscribeToUserConsultations(
  userId: string,
  callback: (payload: any) => void
) {
  return supabase
    .channel('symptom_consultations')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'symptom_consultations',
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe()
}

export function subscribeToUserReports(
  userId: string,
  callback: (payload: any) => void
) {
  return supabase
    .channel('medical_reports')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'medical_reports',
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe()
}