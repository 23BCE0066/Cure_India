export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export const quizQuestions: QuizQuestion[] = [
  // Beginner Questions
  {
    id: 'b1',
    question: "What is the recommended daily water intake for an average adult?",
    options: ["1-2 liters", "2-3 liters", "4-5 liters", "6-8 liters"],
    correctAnswer: 1,
    explanation: "Health experts recommend drinking 2-3 liters (about 8 glasses) of water daily for proper hydration and bodily functions.",
    category: "General Health Knowledge",
    difficulty: 'beginner'
  },
  {
    id: 'b2',
    question: "Which vitamin is primarily obtained from sunlight?",
    options: ["Vitamin A", "Vitamin B", "Vitamin C", "Vitamin D"],
    correctAnswer: 3,
    explanation: "Vitamin D is synthesized in the skin when exposed to sunlight. It's essential for calcium absorption and bone health.",
    category: "Nutrition and Diet",
    difficulty: 'beginner'
  },
  {
    id: 'b3',
    question: "What is the normal range for human body temperature?",
    options: ["35.5-36.5°C", "36.1-37.2°C", "37.5-38.5°C", "38.1-39.1°C"],
    correctAnswer: 1,
    explanation: "Normal body temperature ranges from 36.1-37.2°C (97-99°F). Temperature above this range may indicate fever.",
    category: "General Health Knowledge",
    difficulty: 'beginner'
  },
  {
    id: 'b4',
    question: "How many chambers does the human heart have?",
    options: ["2", "3", "4", "5"],
    correctAnswer: 2,
    explanation: "The human heart has four chambers: two atria (upper chambers) and two ventricles (lower chambers).",
    category: "Human Anatomy",
    difficulty: 'beginner'
  },
  {
    id: 'b5',
    question: "What is the first aid for minor burns?",
    options: ["Apply ice directly", "Run cool water over it", "Apply butter", "Pop blisters"],
    correctAnswer: 1,
    explanation: "For minor burns, run cool (not cold) water over the affected area for 10-15 minutes. Never apply ice or butter directly.",
    category: "First Aid and Emergency",
    difficulty: 'beginner'
  },
  {
    id: 'b6',
    question: "Which food group is primarily responsible for muscle building?",
    options: ["Carbohydrates", "Proteins", "Fats", "Vitamins"],
    correctAnswer: 1,
    explanation: "Proteins are essential for muscle building and repair. They contain amino acids that are the building blocks of muscle tissue.",
    category: "Nutrition and Diet",
    difficulty: 'beginner'
  },
  {
    id: 'b7',
    question: "What is the minimum recommended exercise duration per day?",
    options: ["10 minutes", "30 minutes", "60 minutes", "90 minutes"],
    correctAnswer: 1,
    explanation: "Health organizations recommend at least 30 minutes of moderate exercise daily for maintaining good health.",
    category: "Exercise and Fitness",
    difficulty: 'beginner'
  },
  {
    id: 'b8',
    question: "Which organ is responsible for filtering blood?",
    options: ["Liver", "Kidneys", "Lungs", "Stomach"],
    correctAnswer: 1,
    explanation: "Kidneys filter waste products from the blood and produce urine. Each kidney contains about a million filtering units.",
    category: "Human Anatomy",
    difficulty: 'beginner'
  },
  {
    id: 'b9',
    question: "What is the most common symptom of the common cold?",
    options: ["Fever", "Runny nose", "Headache", "Stomach pain"],
    correctAnswer: 1,
    explanation: "A runny or stuffy nose is the most common symptom of the common cold, caused by inflammation of nasal passages.",
    category: "Common Diseases and Conditions",
    difficulty: 'beginner'
  },
  {
    id: 'b10',
    question: "How many hours of sleep are recommended for adults?",
    options: ["4-5 hours", "6-7 hours", "7-9 hours", "10-12 hours"],
    correctAnswer: 2,
    explanation: "Adults need 7-9 hours of quality sleep per night for optimal physical and mental health.",
    category: "General Health Knowledge",
    difficulty: 'beginner'
  },

  // Intermediate Questions
  {
    id: 'i1',
    question: "What is the medical term for high blood pressure?",
    options: ["Hypotension", "Hypertension", "Hyperglycemia", "Hypoglycemia"],
    correctAnswer: 1,
    explanation: "Hypertension is the medical term for high blood pressure, a condition where blood pressure is consistently elevated.",
    category: "Medical Terminology",
    difficulty: 'intermediate'
  },
  {
    id: 'i2',
    question: "Which vaccine prevents tuberculosis?",
    options: ["MMR", "BCG", "DTP", "Hepatitis B"],
    correctAnswer: 1,
    explanation: "BCG (Bacillus Calmette-Guérin) vaccine provides protection against tuberculosis, especially severe forms in children.",
    category: "General Health Knowledge",
    difficulty: 'intermediate'
  },
  {
    id: 'i3',
    question: "What is the BMI range for a healthy weight?",
    options: ["10-18.5", "18.5-24.9", "25-29.9", "30-40"],
    correctAnswer: 1,
    explanation: "A healthy BMI (Body Mass Index) ranges from 18.5 to 24.9. Below 18.5 is underweight, 25-29.9 is overweight, and 30+ is obese.",
    category: "Nutrition and Diet",
    difficulty: 'intermediate'
  },
  {
    id: 'i4',
    question: "Which hormone regulates blood sugar levels?",
    options: ["Adrenaline", "Insulin", "Thyroxine", "Cortisol"],
    correctAnswer: 1,
    explanation: "Insulin, produced by the pancreas, regulates blood sugar levels by helping cells absorb glucose from the bloodstream.",
    category: "Human Anatomy",
    difficulty: 'intermediate'
  },
  {
    id: 'i5',
    question: "What is the recovery position used for?",
    options: ["Treating fractures", "Unconscious breathing patients", "Heart attacks", "Choking victims"],
    correctAnswer: 1,
    explanation: "The recovery position is used for unconscious but breathing patients to keep their airway open and prevent choking.",
    category: "First Aid and Emergency",
    difficulty: 'intermediate'
  },
  {
    id: 'i6',
    question: "Which type of exercise primarily improves cardiovascular endurance?",
    options: ["Weight lifting", "Stretching", "Aerobic exercise", "Yoga"],
    correctAnswer: 2,
    explanation: "Aerobic exercises like running, swimming, or cycling improve cardiovascular endurance by strengthening the heart and lungs.",
    category: "Exercise and Fitness",
    difficulty: 'intermediate'
  },
  {
    id: 'i7',
    question: "What is the medical term for inflammation of the liver?",
    options: ["Hepatitis", "Nephritis", "Dermatitis", "Gastritis"],
    correctAnswer: 0,
    explanation: "Hepatitis is the medical term for inflammation of the liver, often caused by viral infections or toxins.",
    category: "Medical Terminology",
    difficulty: 'intermediate'
  },
  {
    id: 'i8',
    question: "Which mineral is essential for thyroid function?",
    options: ["Iron", "Calcium", "Iodine", "Zinc"],
    correctAnswer: 2,
    explanation: "Iodine is essential for thyroid hormone production. Iodine deficiency can lead to goiter and hypothyroidism.",
    category: "Nutrition and Diet",
    difficulty: 'intermediate'
  },
  {
    id: 'i9',
    question: "What is the leading cause of preventable blindness in India?",
    options: ["Glaucoma", "Cataract", "Diabetic retinopathy", "Vitamin A deficiency"],
    correctAnswer: 1,
    explanation: "Cataracts are the leading cause of preventable blindness in India, though they are treatable with simple surgery.",
    category: "Common Diseases and Conditions",
    difficulty: 'intermediate'
  },
  {
    id: 'i10',
    question: "Which blood type is considered the universal donor?",
    options: ["A+", "B+", "AB+", "O-"],
    correctAnswer: 3,
    explanation: "O negative (O-) blood type is considered the universal donor as it can be given to patients of any blood type.",
    category: "Human Anatomy",
    difficulty: 'intermediate'
  },

  // Advanced Questions
  {
    id: 'a1',
    question: "What is the GCS score range for assessing consciousness?",
    options: ["0-5", "1-10", "3-15", "5-20"],
    correctAnswer: 2,
    explanation: "The Glasgow Coma Scale (GCS) ranges from 3 (deep unconsciousness) to 15 (fully alert), assessing eye, verbal, and motor responses.",
    category: "Medical Terminology",
    difficulty: 'advanced'
  },
  {
    id: 'a2',
    question: "Which antibody is typically first produced during primary immune response?",
    options: ["IgG", "IgM", "IgA", "IgE"],
    correctAnswer: 1,
    explanation: "IgM is the first antibody produced during primary immune response, appearing in the bloodstream within days of infection.",
    category: "Human Anatomy",
    difficulty: 'advanced'
  },
  {
    id: 'a3',
    question: "What is the gold standard for diagnosing COPD?",
    options: ["Chest X-ray", "Spirometry", "Blood test", "CT scan"],
    correctAnswer: 1,
    explanation: "Spirometry (pulmonary function testing) is the gold standard for diagnosing COPD, measuring airflow limitation.",
    category: "Medical Terminology",
    difficulty: 'advanced'
  },
  {
    id: 'a4',
    question: "Which arrhythmia is characterized by irregularly irregular rhythm?",
    options: ["Atrial flutter", "Atrial fibrillation", "Ventricular tachycardia", "SVT"],
    correctAnswer: 1,
    explanation: "Atrial fibrillation (AFib) is characterized by an 'irregularly irregular' rhythm due to chaotic atrial electrical activity.",
    category: "Common Diseases and Conditions",
    difficulty: 'advanced'
  },
  {
    id: 'a5',
    question: "What is the recommended compression-to-ventilation ratio in adult CPR?",
    options: ["15:2", "30:2", "5:1", "10:1"],
    correctAnswer: 1,
    explanation: "The current AHA guidelines recommend a compression-to-ventilation ratio of 30:2 for adult CPR.",
    category: "First Aid and Emergency",
    difficulty: 'advanced'
  },
  {
    id: 'a6',
    question: "Which lab test measures kidney function?",
    options: ["ALT", "eGFR", "TSH", "LDL"],
    correctAnswer: 1,
    explanation: "eGFR (estimated Glomerular Filtration Rate) is the key test for measuring kidney function, filtering waste from blood.",
    category: "Medical Terminology",
    difficulty: 'advanced'
  },
  {
    id: 'a7',
    question: "What is the most common cause of secondary hypertension in young adults?",
    options: ["Renal artery stenosis", "Primary hyperaldosteronism", "Pheochromocytoma", "Coarctation of aorta"],
    correctAnswer: 0,
    explanation: "Renal artery stenosis is the most common cause of secondary hypertension in young adults, reducing blood flow to kidneys.",
    category: "Common Diseases and Conditions",
    difficulty: 'advanced'
  },
  {
    id: 'a8',
    question: "Which medication class is first-line for Type 2 diabetes in most patients?",
    options: ["Sulfonylureas", "Metformin", "Insulin", "SGLT2 inhibitors"],
    correctAnswer: 1,
    explanation: "Metformin is the recommended first-line medication for Type 2 diabetes due to its efficacy, safety profile, and cost-effectiveness.",
    category: "Medical Terminology",
    difficulty: 'advanced'
  },
  {
    id: 'a9',
    question: "What is the normal range for PaO2 in arterial blood gas?",
    options: ["60-80 mmHg", "80-100 mmHg", "100-120 mmHg", "40-60 mmHg"],
    correctAnswer: 1,
    explanation: "Normal PaO2 (partial pressure of oxygen) in arterial blood gas is 80-100 mmHg. Values below this indicate hypoxemia.",
    category: "Medical Terminology",
    difficulty: 'advanced'
  },
  {
    id: 'a10',
    question: "Which vaccination schedule is recommended for hepatitis B birth dose?",
    options: ["At birth", "Within 24 hours", "At 1 week", "At 1 month"],
    correctAnswer: 1,
    explanation: "WHO recommends hepatitis B birth dose within 24 hours of birth to prevent perinatal transmission.",
    category: "General Health Knowledge",
    difficulty: 'advanced'
  }
];

export const getQuestionsByDifficulty = (difficulty: 'beginner' | 'intermediate' | 'advanced') => {
  return quizQuestions.filter(q => q.difficulty === difficulty);
};

export const getRandomQuestions = (difficulty: 'beginner' | 'intermediate' | 'advanced', count: number = 10) => {
  const questions = getQuestionsByDifficulty(difficulty);
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, questions.length));
};