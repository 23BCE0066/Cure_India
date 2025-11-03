import { NextRequest, NextResponse } from 'next/server'
import { searchDoctors, getCostEstimates } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Extract query parameters
    const specialty = searchParams.get('specialty') || undefined
    const city = searchParams.get('city') || undefined
    const rating = searchParams.get('rating') ? parseFloat(searchParams.get('rating')!) : undefined
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10
    const condition = searchParams.get('condition') || undefined

    // Validate parameters
    if (rating && (rating < 0 || rating > 5)) {
      return NextResponse.json(
        { error: 'Rating must be between 0 and 5' },
        { status: 400 }
      )
    }

    if (limit && (limit < 1 || limit > 50)) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 50' },
        { status: 400 }
      )
    }

    // Search doctors
    const doctors = await searchDoctors({
      specialty,
      city,
      rating,
      limit
    })

    // If condition is provided, get cost estimates
    let costEstimates = null
    if (condition && city) {
      costEstimates = await getCostEstimates(condition, city)
    }

    // Enhance doctor data with cost estimates if available
    const enhancedDoctors = doctors.map(doctor => {
      const enhanced = { ...doctor }

      // Add consultation fee range string
      enhanced.consultation_fee_range = `₹${doctor.consultation_fee_min.toLocaleString('en-IN')} - ₹${doctor.consultation_fee_max.toLocaleString('en-IN')}`

      // Add estimated treatment cost if we have cost estimates
      if (costEstimates) {
        enhanced.estimated_treatment_cost_range = `₹${costEstimates.treatment_min.toLocaleString('en-IN')} - ₹${costEstimates.treatment_max.toLocaleString('en-IN')}`
      } else {
        // Default estimate based on specialty
        const defaultCosts = getDefaultTreatmentCosts(doctor.specialty)
        enhanced.estimated_treatment_cost_range = `₹${defaultCosts.min.toLocaleString('en-IN')} - ₹${defaultCosts.max.toLocaleString('en-IN')}`
      }

      return enhanced
    })

    return NextResponse.json({
      success: true,
      data: {
        doctors: enhancedDoctors,
        total: enhancedDoctors.length,
        cost_estimates: costEstimates,
        search_params: {
          specialty,
          city,
          rating,
          limit,
          condition
        }
      }
    }, { status: 200 })

  } catch (error) {
    console.error('Doctor search error:', error)
    return NextResponse.json(
      { error: 'Failed to search doctors' },
      { status: 500 }
    )
  }
}

function getDefaultTreatmentCosts(specialty: string): { min: number; max: number } {
  const costMap: Record<string, { min: number; max: number }> = {
    'Internal Medicine': { min: 2000, max: 15000 },
    'General Physician': { min: 1500, max: 10000 },
    'Cardiologist': { min: 5000, max: 50000 },
    'Neurologist': { min: 4000, max: 40000 },
    'Pediatrician': { min: 2000, max: 20000 },
    'Gynecologist': { min: 3000, max: 25000 },
    'Orthopedic': { min: 5000, max: 100000 },
    'Dermatologist': { min: 1500, max: 15000 },
    'Psychiatrist': { min: 2000, max: 20000 },
    'Endocrinologist': { min: 3000, max: 30000 },
    'Gastroenterologist': { min: 4000, max: 35000 },
    'Pulmonologist': { min: 3000, max: 25000 },
    'Nephrologist': { min: 4000, max: 40000 },
    'Oncologist': { min: 10000, max: 200000 },
    'Urologist': { min: 4000, max: 30000 }
  }

  return costMap[specialty] || { min: 2000, max: 15000 }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.specialty || !body.city) {
      return NextResponse.json(
        { error: 'Specialty and city are required' },
        { status: 400 }
      )
    }

    // Search doctors with specific criteria
    const doctors = await searchDoctors({
      specialty: body.specialty,
      city: body.city,
      rating: body.rating,
      limit: body.limit || 5
    })

    // Get cost estimates if condition provided
    let costEstimates = null
    if (body.condition) {
      costEstimates = await getCostEstimates(body.condition, body.city)
    }

    // Enhance doctor data
    const enhancedDoctors = doctors.map(doctor => {
      const enhanced = { ...doctor }
      enhanced.consultation_fee_range = `₹${doctor.consultation_fee_min.toLocaleString('en-IN')} - ₹${doctor.consultation_fee_max.toLocaleString('en-IN')}`

      if (costEstimates) {
        enhanced.estimated_treatment_cost_range = `₹${costEstimates.treatment_min.toLocaleString('en-IN')} - ₹${costEstimates.treatment_max.toLocaleString('en-IN')}`
      } else {
        const defaultCosts = getDefaultTreatmentCosts(doctor.specialty)
        enhanced.estimated_treatment_cost_range = `₹${defaultCosts.min.toLocaleString('en-IN')} - ₹${defaultCosts.max.toLocaleString('en-IN')}`
      }

      return enhanced
    })

    return NextResponse.json({
      success: true,
      data: {
        doctors: enhancedDoctors,
        cost_estimates: costEstimates
      }
    }, { status: 200 })

  } catch (error) {
    console.error('Doctor search POST error:', error)
    return NextResponse.json(
      { error: 'Failed to search doctors' },
      { status: 500 }
    )
  }
}