import { NextRequest, NextResponse } from 'next/server'
import { getCostEstimates, searchDoctors } from '@/lib/supabase'

interface CostEstimateDetails {
  condition_name: string
  specialty: string
  city: string
  consultation_min: number
  consultation_max: number
  treatment_min: number
  treatment_max: number
  data_source: string
  last_updated: string
  breakdown: {
    consultation: { min: number; max: number; description: string }
    diagnostics: { min: number; max: number; description: string; tests: string[] }
    treatment: { min: number; max: number; description: string; procedures: string[] }
    follow_up: { min: number; max: number; description: string }
  }
  factors: {
    hospital_type: 'government' | 'private' | 'premium'
    location_tier: 'metro' | 'tier1' | 'tier2' | 'tier3'
    complexity: 'simple' | 'moderate' | 'complex'
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { conditionId: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const conditionId = decodeURIComponent(params.conditionId)
    const city = searchParams.get('city')

    if (!city) {
      return NextResponse.json(
        { error: 'City parameter is required' },
        { status: 400 }
      )
    }

    // Get base cost estimates from database
    const baseEstimates = await getCostEstimates(conditionId, city)

    // If no specific estimates found, generate based on condition category
    let costDetails: CostEstimateDetails

    if (baseEstimates) {
      costDetails = await generateDetailedCostEstimate(baseEstimates, conditionId, city)
    } else {
      costDetails = await generateDefaultCostEstimate(conditionId, city)
    }

    // Get relevant doctors for the condition
    const specialty = determineSpecialtyForCondition(conditionId)
    const doctors = await searchDoctors({
      specialty,
      city,
      limit: 3
    })

    return NextResponse.json({
      success: true,
      data: {
        cost_estimate: costDetails,
        recommended_doctors: doctors.map(doctor => ({
          ...doctor,
          consultation_fee_range: `₹${doctor.consultation_fee_min.toLocaleString('en-IN')} - ₹${doctor.consultation_fee_max.toLocaleString('en-IN')}`
        })),
        city_info: getCityCostInfo(city),
        last_updated: new Date().toISOString()
      }
    }, { status: 200 })

  } catch (error) {
    console.error('Cost estimation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate cost estimate' },
      { status: 500 }
    )
  }
}

async function generateDetailedCostEstimate(
  baseEstimate: any,
  conditionName: string,
  city: string
): Promise<CostEstimateDetails> {
  const cityInfo = getCityCostInfo(city)
  const factors = determineCostFactors(conditionName, city)

  // Adjust base costs based on city tier and factors
  const costMultiplier = cityInfo.cost_multiplier * getComplexityMultiplier(factors.complexity)

  return {
    condition_name: baseEstimate.condition_name,
    specialty: baseEstimate.specialty,
    city: city,
    consultation_min: Math.round(baseEstimate.consultation_min * costMultiplier),
    consultation_max: Math.round(baseEstimate.consultation_max * costMultiplier),
    treatment_min: Math.round(baseEstimate.treatment_min * costMultiplier),
    treatment_max: Math.round(baseEstimate.treatment_max * costMultiplier),
    data_source: baseEstimate.data_source,
    last_updated: baseEstimate.last_updated,
    breakdown: generateCostBreakdown(baseEstimate, factors, costMultiplier),
    factors
  }
}

async function generateDefaultCostEstimate(
  conditionName: string,
  city: string
): Promise<CostEstimateDetails> {
  const specialty = determineSpecialtyForCondition(conditionName)
  const cityInfo = getCityCostInfo(city)
  const factors = determineCostFactors(conditionName, city)

  // Default cost ranges based on specialty and condition category
  const defaultCosts = getDefaultCostsByCondition(conditionName)
  const costMultiplier = cityInfo.cost_multiplier * getComplexityMultiplier(factors.complexity)

  return {
    condition_name: conditionName,
    specialty: specialty,
    city: city,
    consultation_min: Math.round(defaultCosts.consultation.min * costMultiplier),
    consultation_max: Math.round(defaultCosts.consultation.max * costMultiplier),
    treatment_min: Math.round(defaultCosts.treatment.min * costMultiplier),
    treatment_max: Math.round(defaultCosts.treatment.max * costMultiplier),
    data_source: 'AI-generated estimate',
    last_updated: new Date().toISOString(),
    breakdown: generateDefaultCostBreakdown(defaultCosts, factors, costMultiplier),
    factors
  }
}

function determineSpecialtyForCondition(conditionName: string): string {
  const conditionLower = conditionName.toLowerCase()

  const specialtyMap: Record<string, string> = {
    // Heart conditions
    'chest pain': 'Cardiologist',
    'heart attack': 'Cardiologist',
    'hypertension': 'Cardiologist',
    'palpitations': 'Cardiologist',
    'angina': 'Cardiologist',

    // Brain/Nerve conditions
    'headache': 'Neurologist',
    'migraine': 'Neurologist',
    'stroke': 'Neurologist',
    'seizure': 'Neurologist',
    'dizziness': 'Neurologist',

    // Digestive conditions
    'stomach pain': 'Gastroenterologist',
    'acidity': 'Gastroenterologist',
    'ulcer': 'Gastroenterologist',
    'diarrhea': 'Gastroenterologist',
    'constipation': 'Gastroenterologist',

    // Respiratory conditions
    'cough': 'Pulmonologist',
    'breathing difficulty': 'Pulmonologist',
    'asthma': 'Pulmonologist',
    'pneumonia': 'Pulmonologist',
    'tb': 'Pulmonologist',

    // Skin conditions
    'rash': 'Dermatologist',
    'acne': 'Dermatologist',
    'eczema': 'Dermatologist',
    'psoriasis': 'Dermatologist',

    // Women's health
    'pregnancy': 'Gynecologist',
    'menstrual problems': 'Gynecologist',
    'pcod': 'Gynecologist',

    // Mental health
    'depression': 'Psychiatrist',
    'anxiety': 'Psychiatrist',
    'stress': 'Psychiatrist',

    // Children
    'fever': 'Pediatrician',
    'vomiting': 'Pediatrician',
    'growth issues': 'Pediatrician',

    // Bones/Joints
    'joint pain': 'Orthopedic',
    'fracture': 'Orthopedic',
    'arthritis': 'Orthopedic',
    'back pain': 'Orthopedic',

    // Hormones
    'diabetes': 'Endocrinologist',
    'thyroid': 'Endocrinologist',
    'obesity': 'Endocrinologist',

    // Kidney
    'kidney stones': 'Nephrologist',
    'urinary problems': 'Nephrologist',

    // Cancer
    'cancer': 'Oncologist',
    'tumor': 'Oncologist'
  }

  for (const [condition, specialty] of Object.entries(specialtyMap)) {
    if (conditionLower.includes(condition)) {
      return specialty
    }
  }

  return 'Internal Medicine' // Default specialty
}

function getCityCostInfo(city: string): { tier: string; cost_multiplier: number } {
  const cityLower = city.toLowerCase()

  // Metro cities - highest costs
  const metroCities = ['mumbai', 'delhi', 'bangalore', 'chennai', 'kolkata', 'hyderabad', 'pune']
  if (metroCities.some(metro => cityLower.includes(metro))) {
    return { tier: 'metro', cost_multiplier: 1.5 }
  }

  // Tier 1 cities - high costs
  const tier1Cities = ['ahmedabad', 'surat', 'jaipur', 'lucknow', 'nagpur', 'indore', 'bhopal']
  if (tier1Cities.some(tier1 => cityLower.includes(tier1))) {
    return { tier: 'tier1', cost_multiplier: 1.2 }
  }

  // Tier 2 cities - moderate costs
  return { tier: 'tier2', cost_multiplier: 1.0 }
}

function determineCostFactors(conditionName: string, city: string): CostEstimateDetails['factors'] {
  const cityInfo = getCityCostInfo(city)
  const conditionLower = conditionName.toLowerCase()

  // Determine complexity based on condition
  let complexity: 'simple' | 'moderate' | 'complex' = 'moderate'
  if (conditionLower.includes('fever') || conditionLower.includes('cold') || conditionLower.includes('cough')) {
    complexity = 'simple'
  } else if (conditionLower.includes('cancer') || conditionLower.includes('surgery') || conditionLower.includes('heart attack')) {
    complexity = 'complex'
  }

  return {
    hospital_type: 'private', // Default assumption
    location_tier: cityInfo.tier as 'metro' | 'tier1' | 'tier2' | 'tier3',
    complexity
  }
}

function getComplexityMultiplier(complexity: string): number {
  switch (complexity) {
    case 'simple': return 0.8
    case 'moderate': return 1.0
    case 'complex': return 1.5
    default: return 1.0
  }
}

function getDefaultCostsByCondition(conditionName: string): {
  consultation: { min: number; max: number }
  treatment: { min: number; max: number }
  diagnostics: { min: number; max: number }
} {
  const conditionLower = conditionName.toLowerCase()

  // Simple conditions
  if (conditionLower.includes('fever') || conditionLower.includes('cold') || conditionLower.includes('cough')) {
    return {
      consultation: { min: 300, max: 800 },
      treatment: { min: 500, max: 2000 },
      diagnostics: { min: 200, max: 1000 }
    }
  }

  // Moderate conditions
  if (conditionLower.includes('diabetes') || conditionLower.includes('hypertension') || conditionLower.includes('thyroid')) {
    return {
      consultation: { min: 500, max: 1500 },
      treatment: { min: 2000, max: 8000 },
      diagnostics: { min: 1000, max: 3000 }
    }
  }

  // Complex conditions
  if (conditionLower.includes('cancer') || conditionLower.includes('surgery') || conditionLower.includes('heart')) {
    return {
      consultation: { min: 1000, max: 3000 },
      treatment: { min: 50000, max: 500000 },
      diagnostics: { min: 5000, max: 20000 }
    }
  }

  // Default moderate case
  return {
    consultation: { min: 400, max: 1200 },
    treatment: { min: 2000, max: 15000 },
    diagnostics: { min: 800, max: 3000 }
  }
}

function generateCostBreakdown(
  baseEstimate: any,
  factors: CostEstimateDetails['factors'],
  multiplier: number
): CostEstimateDetails['breakdown'] {
  return {
    consultation: {
      min: Math.round(baseEstimate.consultation_min * multiplier),
      max: Math.round(baseEstimate.consultation_max * multiplier),
      description: 'Initial consultation with specialist doctor'
    },
    diagnostics: {
      min: Math.round(2000 * multiplier),
      max: Math.round(8000 * multiplier),
      description: 'Diagnostic tests and investigations',
      tests: getDiagnosticTests(baseEstimate.specialty)
    },
    treatment: {
      min: Math.round(baseEstimate.treatment_min * multiplier),
      max: Math.round(baseEstimate.treatment_max * multiplier),
      description: 'Treatment procedures and medications',
      procedures: getTreatmentProcedures(baseEstimate.specialty)
    },
    follow_up: {
      min: Math.round(500 * multiplier),
      max: Math.round(2000 * multiplier),
      description: 'Follow-up consultations and monitoring'
    }
  }
}

function generateDefaultCostBreakdown(
  defaultCosts: any,
  factors: CostEstimateDetails['factors'],
  multiplier: number
): CostEstimateDetails['breakdown'] {
  return {
    consultation: {
      min: Math.round(defaultCosts.consultation.min * multiplier),
      max: Math.round(defaultCosts.consultation.max * multiplier),
      description: 'Initial consultation with specialist doctor'
    },
    diagnostics: {
      min: Math.round(defaultCosts.diagnostics.min * multiplier),
      max: Math.round(defaultCosts.diagnostics.max * multiplier),
      description: 'Diagnostic tests and investigations',
      tests: ['Blood tests', 'Physical examination', 'Medical history review']
    },
    treatment: {
      min: Math.round(defaultCosts.treatment.min * multiplier),
      max: Math.round(defaultCosts.treatment.max * multiplier),
      description: 'Treatment procedures and medications',
      procedures: ['Medications', 'Therapy sessions', 'Lifestyle counseling']
    },
    follow_up: {
      min: Math.round(500 * multiplier),
      max: Math.round(2000 * multiplier),
      description: 'Follow-up consultations and monitoring'
    }
  }
}

function getDiagnosticTests(specialty: string): string[] {
  const testMap: Record<string, string[]> = {
    'Cardiologist': ['ECG', 'Echocardiogram', 'Blood tests', 'Stress test', 'Holter monitoring'],
    'Neurologist': ['MRI', 'CT Scan', 'EEG', 'Blood tests', 'Nerve conduction study'],
    'Gastroenterologist': ['Endoscopy', 'Ultrasound', 'Blood tests', 'Stool tests', 'Colonoscopy'],
    'Pulmonologist': ['Chest X-ray', 'Pulmonary function test', 'Blood tests', 'CT scan', 'Allergy tests'],
    'Dermatologist': ['Skin biopsy', 'Allergy testing', 'Blood tests', 'Patch testing'],
    'Endocrinologist': ['Blood tests', 'Hormone panel', 'Glucose tolerance test', 'Thyroid scan'],
    'Orthopedic': ['X-ray', 'MRI', 'CT scan', 'Blood tests', 'Bone density test']
  }

  return testMap[specialty] || ['Blood tests', 'Physical examination', 'Medical history review']
}

function getTreatmentProcedures(specialty: string): string[] {
  const procedureMap: Record<string, string[]> = {
    'Cardiologist': ['Medications', 'Lifestyle modifications', 'Cardiac rehabilitation', 'Angioplasty if needed'],
    'Neurologist': ['Medications', 'Physical therapy', 'Botox injections', 'Nerve blocks'],
    'Gastroenterologist': ['Medications', 'Dietary changes', 'Endoscopic procedures', 'Lifestyle modifications'],
    'Pulmonologist': ['Inhalers', 'Medications', 'Pulmonary rehabilitation', 'Oxygen therapy'],
    'Dermatologist': ['Topical medications', 'Oral medications', 'Light therapy', 'Minor procedures'],
    'Endocrinologist': ['Hormone therapy', 'Medications', 'Lifestyle changes', 'Regular monitoring'],
    'Orthopedic': ['Medications', 'Physical therapy', 'Injections', 'Surgical intervention if needed']
  }

  return procedureMap[specialty] || ['Medications', 'Lifestyle modifications', 'Regular follow-up']
}