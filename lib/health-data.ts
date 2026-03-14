// Simulated smartwatch health data for XYZ Company employees

export type HealthStatus = "healthy" | "warning" | "critical"

export interface VitalReading {
  time: string
  value: number
}

export interface EmployeeRating {
  employeeId: string
  points: number
  reason: string
  awardedAt: string
  awardedBy: string
}

export interface Employee {
  id: string
  name: string
  email: string
  role: string
  department: string
  avatar: string
  age: number
  joinDate: string
  gender?: "male" | "female" | "other"
  watchConnected: boolean
  lastSync: string
  ratings?: EmployeeRating[]
  totalRatingPoints: number
  vitals: {
    heartRate: number
    heartRateHistory: VitalReading[]
    bloodOxygen: number
    bloodOxygenHistory: VitalReading[]
    steps: number
    stepsGoal: number
    stepsHistory: VitalReading[]
    sleepHours: number
    sleepQuality: number
    sleepHistory: VitalReading[]
    stressLevel: number
    stressHistory: VitalReading[]
    temperature: number
    caloriesBurned: number
  }
  fatigue: {
    score: number
    trend: "improving" | "stable" | "worsening"
    factors: string[]
  }
  burnout: {
    score: number
    risk: "low" | "moderate" | "high" | "critical"
    weeklyTrend: number[]
  }
  womensHealth?: {
    lastPeriodDate: string
    cycleLength: number
    periodDuration: number
    isTracking: boolean
    physiologicalSignals: {
      basalBodyTemperature: number
      cervicalMucus: string
      mood: string
    }
  }
  status: HealthStatus
  alerts: Alert[]
}

export interface Alert {
  id: string
  employeeId: string
  employeeName: string
  type: "heart_rate" | "blood_oxygen" | "sleep" | "stress" | "fatigue" | "burnout" | "temperature"
  severity: "info" | "warning" | "critical"
  message: string
  timestamp: string
  acknowledged: boolean
  suggestion: string
}

// Simple seeded random number generator for consistent SSR/client hydration
function seededRandom(seed: string): () => number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  return function() {
    hash = Math.sin(hash) * 10000
    return hash - Math.floor(hash)
  }
}

function generateHistory(base: number, variance: number, count: number, randomFn: () => number): VitalReading[] {
  const hours = []
  for (let i = count - 1; i >= 0; i--) {
    const h = new Date()
    h.setHours(h.getHours() - i)
    hours.push({
      time: h.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      value: Math.round(base + (randomFn() - 0.5) * variance * 2),
    })
  }
  return hours
}

function generateDailyHistory(base: number, variance: number, days: number, randomFn: () => number): VitalReading[] {
  const readings = []
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    readings.push({
      time: dayNames[d.getDay()],
      value: Math.round(base + (randomFn() - 0.5) * variance * 2),
    })
  }
  return readings
}

function generateSleepHistory(randomFn: () => number): VitalReading[] {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const readings = []
  for (let i = 20; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    readings.push({
      time: dayNames[d.getDay()],
      value: +(4 + randomFn() * 5).toFixed(1),
    })
  }
  return readings
}

function generateStepsHistory(randomFn: () => number): VitalReading[] {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const readings = []
  for (let i = 20; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    readings.push({
      time: dayNames[d.getDay()],
      value: Math.round(2000 + randomFn() * 10000),
    })
  }
  return readings
}

function generateRandomVitals(employeeId: string) {
  const randomFn = seededRandom(employeeId)
  
  // Generate more realistic health data - biased toward normal/healthy ranges
  // Most employees should be healthy, with only some warnings and few critical cases
  
  // Heart rate: Normal range 60-100, with some variation
  const heartRate = Math.floor(60 + randomFn() * 40 + (randomFn() > 0.8 ? randomFn() * 20 : 0))
  
  // Blood oxygen: Normal range 95-100, rarely below 93
  const bloodOxygen = Math.floor(95 + randomFn() * 5 + (randomFn() > 0.9 ? -randomFn() * 5 : 0))
  
  // Steps: Normal range 2000-12000, with some low activity days
  const steps = Math.floor(2000 + randomFn() * 10000)
  
  // Sleep hours: Normal range 6-9, with some variation
  const sleepHours = +(6 + randomFn() * 3 + (randomFn() > 0.85 ? -randomFn() * 2 : 0)).toFixed(1)
  
  // Sleep quality: Normal range 70-95, with some poor sleep nights
  const sleepQuality = Math.floor(70 + randomFn() * 25 + (randomFn() > 0.8 ? -randomFn() * 30 : 0))
  
  // Stress level: Normal range 20-60, with some high stress cases
  const stressLevel = Math.floor(20 + randomFn() * 40 + (randomFn() > 0.75 ? randomFn() * 30 : 0))
  
  // Temperature: Normal range 97.5-99.5
  const temperature = +(97.5 + randomFn() * 2).toFixed(1)
  
  // Calories burned: Based on steps and activity
  const caloriesBurned = Math.floor(800 + (steps / 1000) * 100 + randomFn() * 400)

  return {
    heartRate,
    heartRateHistory: generateDailyHistory(heartRate, 8, 21, randomFn),
    bloodOxygen,
    bloodOxygenHistory: generateDailyHistory(bloodOxygen, 1, 21, randomFn),
    steps,
    stepsGoal: 10000,
    stepsHistory: generateStepsHistory(randomFn),
    sleepHours,
    sleepQuality,
    sleepHistory: generateSleepHistory(randomFn),
    stressLevel,
    stressHistory: generateDailyHistory(stressLevel, 12, 21, randomFn),
    temperature,
    caloriesBurned,
  }
}

// Generate critical health vitals - poor sleep, high stress, elevated heart rate
function generateCriticalVitals(employeeId: string) {
  const randomFn = seededRandom(employeeId)
  
  // Critical metrics: all indicators pointing to poor health
  
  // Heart rate: Elevated range 95-110+ (high stress and fatigue)
  const heartRate = Math.floor(95 + randomFn() * 20)
  
  // Blood oxygen: Low range 91-94 (concerning but not emergency)
  const bloodOxygen = Math.floor(91 + randomFn() * 3)
  
  // Steps: Low activity 2000-5000
  const steps = Math.floor(2000 + randomFn() * 3000)
  
  // Sleep hours: Poor sleep 4-5.5 hours
  const sleepHours = +(4 + randomFn() * 1.5).toFixed(1)
  
  // Sleep quality: Very poor 30-50
  const sleepQuality = Math.floor(30 + randomFn() * 20)
  
  // Stress level: High 70-85
  const stressLevel = Math.floor(70 + randomFn() * 15)
  
  // Temperature: Slightly elevated 99-100
  const temperature = +(99 + randomFn() * 1).toFixed(1)
  
  // Calories burned: Lower due to low activity
  const caloriesBurned = Math.floor(600 + (steps / 1000) * 60 + randomFn() * 200)

  return {
    heartRate,
    heartRateHistory: generateDailyHistory(heartRate, 10, 21, randomFn),
    bloodOxygen,
    bloodOxygenHistory: generateDailyHistory(bloodOxygen, 2, 21, randomFn),
    steps,
    stepsGoal: 10000,
    stepsHistory: generateStepsHistory(randomFn),
    sleepHours,
    sleepQuality,
    sleepHistory: generateSleepHistory(randomFn),
    stressLevel,
    stressHistory: generateDailyHistory(stressLevel, 15, 21, randomFn),
    temperature,
    caloriesBurned,
  }
}

export function calculateFatigueScore(employee: {
  vitals: { sleepHours: number; sleepQuality: number; stressLevel: number; heartRate: number; steps: number }
}): number {
  const { sleepHours, sleepQuality, stressLevel, heartRate, steps } = employee.vitals
  let score = 0
  // Sleep factor (0-30)
  if (sleepHours < 5) score += 30
  else if (sleepHours < 6) score += 22
  else if (sleepHours < 7) score += 12
  else score += 5
  // Sleep quality factor (0-20)
  score += Math.round((100 - sleepQuality) * 0.2)
  // Stress factor (0-25)
  score += Math.round(stressLevel * 0.25)
  // Heart rate factor (0-15)
  if (heartRate > 100) score += 15
  else if (heartRate > 90) score += 10
  else if (heartRate > 80) score += 5
  // Activity factor (0-10)
  if (steps < 2000) score += 10
  else if (steps < 4000) score += 6
  else if (steps < 6000) score += 3
  return Math.min(100, Math.max(0, score))
}

export function calculateBurnoutRisk(fatigue: number, stressHistory: VitalReading[]): "low" | "moderate" | "high" | "critical" {
  const avgStress = stressHistory.reduce((s, v) => s + v.value, 0) / stressHistory.length
  const combined = fatigue * 0.6 + avgStress * 0.4
  if (combined > 75) return "critical"
  if (combined > 55) return "high"
  if (combined > 35) return "moderate"
  return "low"
}

// Women's Health Cycle Calculations
export interface CyclePhase {
  phase: "menstrual" | "follicular" | "ovulation" | "luteal"
  dayInCycle: number
  daysRemaining: number
  isPeriod: boolean
  isOvulation: boolean
  isFertile: boolean
  description: string
}

export function calculateCyclePhase(lastPeriodDate: string, cycleLength: number = 28, periodDuration: number = 5): CyclePhase {
  const today = new Date()
  const lastPeriod = new Date(lastPeriodDate)
  
  // Calculate days since last period
  const timeDiff = today.getTime() - lastPeriod.getTime()
  const daysSincePeriod = Math.floor(timeDiff / (1000 * 3600 * 24))
  const dayInCycle = (daysSincePeriod % cycleLength) + 1
  const daysRemaining = cycleLength - dayInCycle + 1
  
  // Standard 28-day cycle phases
  let phase: "menstrual" | "follicular" | "ovulation" | "luteal" = "menstrual"
  let description = ""
  
  if (dayInCycle <= periodDuration) {
    phase = "menstrual"
    description = "Menstrual phase - period active"
  } else if (dayInCycle <= 13) {
    phase = "follicular"
    description = "Follicular phase - energy rising"
  } else if (dayInCycle <= 15) {
    phase = "ovulation"
    description = "Ovulation window - most fertile"
  } else {
    phase = "luteal"
    description = "Luteal phase - energy may decline"
  }
  
  // Fertility calculations
  const isPeriod = dayInCycle <= periodDuration
  const isOvulation = dayInCycle >= 13 && dayInCycle <= 15
  const isFertile = dayInCycle >= 12 && dayInCycle <= 16 // 5-day fertile window (2 days before + day of + 2 days after ovulation)
  
  return {
    phase,
    dayInCycle,
    daysRemaining,
    isPeriod,
    isOvulation,
    isFertile,
    description
  }
}

export function getSuggestions(employee: Employee): string[] {
  const suggestions: string[] = []
  const { vitals, fatigue, burnout } = employee
  if (vitals.sleepHours < 6) {
    suggestions.push("Aim for at least 7-8 hours of sleep. Consider setting a consistent bedtime routine.")
  }
  if (vitals.stressLevel > 70) {
    suggestions.push("High stress detected. Try 10 minutes of deep breathing or a short walk.")
  }
  if (vitals.heartRate > 95) {
    suggestions.push("Elevated resting heart rate. Consider reducing caffeine and taking regular breaks.")
  }
  if (vitals.steps < 4000) {
    suggestions.push("Low physical activity today. A 15-minute walk can significantly improve energy levels.")
  }
  if (vitals.bloodOxygen < 95) {
    suggestions.push("Blood oxygen is slightly low. Ensure good ventilation and practice deep breathing exercises.")
  }
  if (fatigue.score > 60) {
    suggestions.push("Fatigue level is high. Take a 20-minute power nap if possible, or switch to lighter tasks.")
  }
  if (burnout.risk === "high" || burnout.risk === "critical") {
    suggestions.push("Burnout risk is elevated. Consider scheduling time off or speaking with a wellness counselor.")
  }
  if (vitals.sleepQuality < 50) {
    suggestions.push("Sleep quality is poor. Avoid screens 1 hour before bed and keep your bedroom cool and dark.")
  }
  if (suggestions.length === 0) {
    suggestions.push("Great health metrics! Keep maintaining your current healthy habits.")
    suggestions.push("Stay hydrated throughout the day and continue your regular exercise routine.")
  }
  return suggestions
}

const employeesRaw: Omit<Employee, "fatigue" | "burnout" | "status" | "alerts">[] = [
  {
    id: "emp-001",
    name: "Sarah Chen",
    email: "sarah.chen@company.com",
    role: "Senior Developer",
    department: "Engineering",
    avatar: "SC",
    age: 32,
    joinDate: "2022-03-15",
    gender: "female",
    watchConnected: true,
    lastSync: "2 min ago",
    vitals: generateRandomVitals("emp-001"),
    womensHealth: {
      lastPeriodDate: "2026-03-02",
      cycleLength: 28,
      periodDuration: 5,
      isTracking: true,
      physiologicalSignals: {
        basalBodyTemperature: 98.2,
        cervicalMucus: "creamy",
        mood: "balanced"
      }
    }
  },
  {
    id: "emp-002",
    name: "Marcus Johnson",
    email: "marcus.johnson@company.com",
    role: "Product Manager",
    department: "Product",
    avatar: "MJ",
    age: 28,
    joinDate: "2023-01-10",
    gender: "male",
    watchConnected: true,
    lastSync: "5 min ago",
    vitals: generateRandomVitals("emp-002"),
  },
  {
    id: "emp-003",
    name: "Emily Rodriguez",
    email: "emily.rodriguez@company.com",
    role: "UX Designer",
    department: "Design",
    avatar: "ER",
    age: 35,
    joinDate: "2021-07-20",
    gender: "female",
    watchConnected: true,
    lastSync: "1 min ago",
    vitals: generateCriticalVitals("emp-003"),
    womensHealth: {
      lastPeriodDate: "2026-02-28",
      cycleLength: 30,
      periodDuration: 6,
      isTracking: true,
      physiologicalSignals: {
        basalBodyTemperature: 97.8,
        cervicalMucus: "watery",
        mood: "energetic"
      }
    }
  },
  {
    id: "emp-004",
    name: "David Kim",
    email: "david.kim@company.com",
    role: "Data Analyst",
    department: "Analytics",
    avatar: "DK",
    age: 30,
    joinDate: "2023-05-01",
    gender: "male",
    watchConnected: true,
    lastSync: "8 min ago",
    vitals: generateRandomVitals("emp-004"),
  },
  {
    id: "emp-005",
    name: "Lisa Thompson",
    email: "lisa.thompson@company.com",
    role: "Marketing Lead",
    department: "Marketing",
    avatar: "LT",
    age: 41,
    joinDate: "2020-11-30",
    gender: "female",
    watchConnected: true,
    lastSync: "3 min ago",
    vitals: generateRandomVitals("emp-005"),
    womensHealth: {
      lastPeriodDate: "2026-03-05",
      cycleLength: 26,
      periodDuration: 5,
      isTracking: true,
      physiologicalSignals: {
        basalBodyTemperature: 98.4,
        cervicalMucus: "dry",
        mood: "calm"
      }
    }
  },
  {
    id: "emp-006",
    name: "James Wright",
    email: "james.wright@company.com",
    role: "DevOps Engineer",
    department: "Engineering",
    avatar: "JW",
    age: 37,
    joinDate: "2022-09-12",
    gender: "male",
    watchConnected: true,
    lastSync: "1 min ago",
    vitals: generateRandomVitals("emp-006"),
  },
  {
    id: "emp-007",
    name: "Priya Patel",
    email: "priya.patel@company.com",
    role: "HR Specialist",
    department: "Human Resources",
    avatar: "PP",
    age: 29,
    joinDate: "2023-08-05",
    gender: "female",
    watchConnected: false,
    lastSync: "2 hours ago",
    vitals: generateRandomVitals("emp-007"),
    womensHealth: {
      lastPeriodDate: "2026-03-08",
      cycleLength: 28,
      periodDuration: 4,
      isTracking: true,
      physiologicalSignals: {
        basalBodyTemperature: 97.9,
        cervicalMucus: "sticky",
        mood: "focused"
      }
    }
  },
  {
    id: "emp-008",
    name: "Alex Martinez",
    email: "alex.martinez@company.com",
    role: "QA Engineer",
    department: "Engineering",
    avatar: "AM",
    age: 33,
    joinDate: "2022-02-18",
    gender: "male",
    watchConnected: true,
    lastSync: "4 min ago",
    vitals: generateRandomVitals("emp-008"),
  },
]

function generateAlerts(emp: Employee): Alert[] {
  const alerts: Alert[] = []
  if (emp.vitals.heartRate > 95) {
    alerts.push({
      id: `alert-${emp.id}-hr`,
      employeeId: emp.id,
      employeeName: emp.name,
      type: "heart_rate",
      severity: emp.vitals.heartRate > 100 ? "critical" : "warning",
      message: `Resting heart rate is ${emp.vitals.heartRate} BPM, above normal range.`,
      timestamp: "5 min ago",
      acknowledged: false,
      suggestion: "Encourage a break and monitor. If persistent, recommend a medical check-up.",
    })
  }
  if (emp.vitals.bloodOxygen < 95) {
    alerts.push({
      id: `alert-${emp.id}-bo`,
      employeeId: emp.id,
      employeeName: emp.name,
      type: "blood_oxygen",
      severity: emp.vitals.bloodOxygen < 92 ? "critical" : "warning",
      message: `Blood oxygen at ${emp.vitals.bloodOxygen}%, below healthy threshold.`,
      timestamp: "10 min ago",
      acknowledged: false,
      suggestion: "Ensure proper ventilation. If below 90%, seek immediate medical attention.",
    })
  }
  if (emp.vitals.sleepHours < 5) {
    alerts.push({
      id: `alert-${emp.id}-sl`,
      employeeId: emp.id,
      employeeName: emp.name,
      type: "sleep",
      severity: "warning",
      message: `Only ${emp.vitals.sleepHours} hours of sleep recorded last night.`,
      timestamp: "1 hour ago",
      acknowledged: false,
      suggestion: "Suggest lighter workload today and recommend earlier bedtime tonight.",
    })
  }
  if (emp.burnout.risk === "critical") {
    alerts.push({
      id: `alert-${emp.id}-bo-risk`,
      employeeId: emp.id,
      employeeName: emp.name,
      type: "burnout",
      severity: "critical",
      message: `Critical burnout risk detected. Multiple health indicators are concerning.`,
      timestamp: "15 min ago",
      acknowledged: false,
      suggestion: "Immediate intervention recommended. Consider mandatory time off and wellness counseling.",
    })
  } else if (emp.burnout.risk === "high") {
    alerts.push({
      id: `alert-${emp.id}-bo-high`,
      employeeId: emp.id,
      employeeName: emp.name,
      type: "burnout",
      severity: "warning",
      message: `High burnout risk detected. Fatigue and stress levels are elevated.`,
      timestamp: "30 min ago",
      acknowledged: false,
      suggestion: "Schedule a wellness check-in and consider workload adjustments.",
    })
  }
  if (emp.vitals.temperature > 99.0) {
    alerts.push({
      id: `alert-${emp.id}-temp`,
      employeeId: emp.id,
      employeeName: emp.name,
      type: "temperature",
      severity: emp.vitals.temperature > 100 ? "critical" : "warning",
      message: `Body temperature at ${emp.vitals.temperature}°F, slightly elevated.`,
      timestamp: "20 min ago",
      acknowledged: false,
      suggestion: "Monitor temperature. If it continues to rise, recommend staying home.",
    })
  }
  return alerts
}

export function getEmployees(): Employee[] {
  // First derive fatigue, burnout, and a preliminary status for each employee
  const derived = employeesRaw.map((raw) => {
    const fatigueScore = calculateFatigueScore(raw)
    const burnoutRisk = calculateBurnoutRisk(fatigueScore, raw.vitals.stressHistory)
    const fatigue = {
      score: fatigueScore,
      trend: fatigueScore > 60 ? "worsening" as const : fatigueScore > 30 ? "stable" as const : "improving" as const,
      factors: [] as string[],
    }
    if (raw.vitals.sleepHours < 6) fatigue.factors.push("Poor sleep")
    if (raw.vitals.stressLevel > 60) fatigue.factors.push("High stress")
    if (raw.vitals.steps < 4000) fatigue.factors.push("Low activity")
    if (raw.vitals.heartRate > 90) fatigue.factors.push("Elevated heart rate")

    const burnout = {
      score: fatigueScore * 0.5 + raw.vitals.stressLevel * 0.5,
      risk: burnoutRisk,
      weeklyTrend: Array.from({ length: 7 }, () => Math.round(20 + Math.random() * 60)),
    }

    // Determine health status based on actual health metrics
    let status: HealthStatus = "healthy"
    
    // CRITICAL STATUS: Multiple severe health indicators
    // Poor sleep + high stress + elevated heart rate
    const poorSleep = raw.vitals.sleepHours < 5.5
    const highStress = raw.vitals.stressLevel > 65
    const elevatedHeartRate = raw.vitals.heartRate > 95
    const highFatigue = fatigueScore > 70
    const criticalBurnout = burnoutRisk === "critical"
    const lowBloodOxygen = raw.vitals.bloodOxygen < 93
    const veryHighHeartRate = raw.vitals.heartRate > 105
    
    // Women's health mood consideration
    const isFemaleDuringMenstrual = 
      raw.gender === "female" && 
      raw.womensHealth?.isTracking &&
      calculateCyclePhase(
        raw.womensHealth.lastPeriodDate,
        raw.womensHealth.cycleLength,
        raw.womensHealth.periodDuration
      ).isPeriod
    const negativeMood = 
      raw.womensHealth?.physiologicalSignals?.mood &&
      ["stressed", "tired", "anxious"].includes(raw.womensHealth.physiologicalSignals.mood.toLowerCase())
    
    if (
      criticalBurnout ||
      lowBloodOxygen ||
      veryHighHeartRate ||
      (poorSleep && highStress && elevatedHeartRate) ||
      (highFatigue && highStress && poorSleep) ||
      (fatigueScore > 75 && highStress) ||
      // For women during menstrual phase with poor sleep and high stress
      (isFemaleDuringMenstrual && poorSleep && highStress && negativeMood)
    ) {
      status = "critical"
    }
    // WARNING STATUS: Moderate health concerns
    else if (
      burnoutRisk === "high" ||
      raw.vitals.sleepHours < 6.5 ||
      (raw.vitals.stressLevel > 55 && raw.vitals.sleepHours < 7) ||
      (fatigueScore > 60 && raw.vitals.stressLevel > 50) ||
      (fatigueScore > 55 && raw.vitals.sleepQuality < 60) ||
      (raw.vitals.heartRate > 90 && raw.vitals.stressLevel > 55) ||
      (raw.vitals.bloodOxygen < 95) ||
      // For women during menstrual phase with mood concerns
      (isFemaleDuringMenstrual && negativeMood && (poorSleep || highStress))
    ) {
      status = "warning"
    }
    // HEALTHY: Good overall health metrics
    else {
      status = "healthy"
    }

    return { raw, fatigue, burnout, status }
  })

  // Map derived data to final employees - NO FORCED DISTRIBUTION
  // Status is based purely on health metrics
  const mappedEmployees = derived.map(({ raw, fatigue, burnout, status }) => {
    // Align fatigue & burnout details with determined status
    if (status === "critical") {
      // Critical: ensure metrics reflect the severity
      if (fatigue.score < 75) {
        fatigue.score = Math.max(fatigue.score, 75)
      }
      if (burnout.score < 75) {
        burnout.score = Math.max(burnout.score, 75)
      }
      if (burnout.risk !== "critical") {
        burnout.risk = "high"
      }
      fatigue.trend = "worsening"
    } else if (status === "warning") {
      // Warning: moderate strain
      if (fatigue.score < 45) {
        fatigue.score = 45 + Math.round(Math.random() * 20)
      }
      if (burnout.score < 50) {
        burnout.score = 50 + Math.round(Math.random() * 25)
      }
      if (burnout.risk === "critical") {
        burnout.risk = "high"
      } else if (burnout.risk === "low") {
        burnout.risk = "moderate"
      }
      fatigue.trend = fatigue.score > 60 ? "stable" : "improving"
    } else {
      // Healthy: good metrics
      if (fatigue.score > 40) {
        fatigue.score = 20 + Math.round(Math.random() * 20)
      }
      if (burnout.score > 45) {
        burnout.score = 20 + Math.round(Math.random() * 25)
      }
      if (burnout.risk !== "low") {
        burnout.risk = "low"
      }
      fatigue.trend = "improving"
    }

    return { raw, fatigue, burnout, status }
  })

  // Build final Employee objects with alerts
  return mappedEmployees.map(({ raw, fatigue, burnout, status }) => {
    const emp: Employee = { 
      ...raw, 
      fatigue, 
      burnout, 
      status, 
      alerts: [],
      ratings: [],
      totalRatingPoints: 0
    }
    emp.alerts = generateAlerts(emp)
    
    // Load ratings from localStorage
    if (typeof window !== 'undefined') {
      const savedRatings = localStorage.getItem(`ratings_${emp.id}`)
      if (savedRatings) {
        try {
          emp.ratings = JSON.parse(savedRatings)
          emp.totalRatingPoints = emp.ratings.reduce((sum, r) => sum + r.points, 0)
        } catch (e) {
          emp.ratings = []
          emp.totalRatingPoints = 0
        }
      }
    }
    
    return emp
  })
}

// Save employee ratings to localStorage
export function saveEmployeeRatings(employeeId: string, ratings: EmployeeRating[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`ratings_${employeeId}`, JSON.stringify(ratings))
  }
}

// Get employee ratings from localStorage
export function getEmployeeRatings(employeeId: string): EmployeeRating[] {
  if (typeof window !== 'undefined') {
    const savedRatings = localStorage.getItem(`ratings_${employeeId}`)
    if (savedRatings) {
      try {
        return JSON.parse(savedRatings)
      } catch (e) {
        return []
      }
    }
  }
  return []
}

// Add rating points to employee
export function addEmployeeRating(employeeId: string, points: number, reason: string, awardedBy: string = "Admin") {
  const ratings = getEmployeeRatings(employeeId)
  const newRating: EmployeeRating = {
    employeeId,
    points,
    reason,
    awardedAt: new Date().toISOString(),
    awardedBy
  }
  ratings.push(newRating)
  saveEmployeeRatings(employeeId, ratings)
  return ratings
}

// Get total rating points for an employee
export function getTotalRatingPoints(employeeId: string): number {
  const ratings = getEmployeeRatings(employeeId)
  return ratings.reduce((sum, r) => sum + r.points, 0)
}

export function getEmployee(id: string): Employee | undefined {
  return getEmployees().find((e) => e.id === id)
}

export function getAllAlerts(): Alert[] {
  return getEmployees().flatMap((e) => e.alerts).sort((a, b) => {
    const sev = { critical: 0, warning: 1, info: 2 }
    return sev[a.severity] - sev[b.severity]
  })
}

export function getOverviewStats() {
  const employees = getEmployees()
  const total = employees.length
  const healthy = employees.filter((e) => e.status === "healthy").length
  const warning = employees.filter((e) => e.status === "warning").length
  const critical = employees.filter((e) => e.status === "critical").length
  const avgFatigue = Math.round(employees.reduce((s, e) => s + e.fatigue.score, 0) / total)
  const avgStress = Math.round(employees.reduce((s, e) => s + e.vitals.stressLevel, 0) / total)
  const avgSleep = +(employees.reduce((s, e) => s + e.vitals.sleepHours, 0) / total).toFixed(1)
  const connected = employees.filter((e) => e.watchConnected).length
  const totalAlerts = getAllAlerts().length
  const criticalAlerts = getAllAlerts().filter((a) => a.severity === "critical").length
  return { total, healthy, warning, critical, avgFatigue, avgStress, avgSleep, connected, totalAlerts, criticalAlerts }
}
