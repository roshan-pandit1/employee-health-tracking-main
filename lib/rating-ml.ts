// Machine Learning-based Rating System with Transparency
// Detects patterns, validates ratings, and triggers milestones

export interface RatingAnalysis {
  isAnomaly: boolean
  confidenceScore: number
  message: string
  riskLevel: "low" | "medium" | "high"
}

export interface RatingMilestone {
  employeeId: string
  currentPoints: number
  maxPoints: number
  percentageToMax: number
  hasReachedMax: boolean
  timestamp: string
}

// ML Algorithm: Detect anomalous ratings based on patterns
export function analyzeRatingPattern(
  employeeId: string,
  points: number,
  reason: string,
  recentRatings: Array<{ points: number; reason: string; awardedAt: string }>
): RatingAnalysis {
  // Pattern 1: Check for suspicious point amounts
  const avgPoints = recentRatings.length > 0 
    ? recentRatings.reduce((sum, r) => sum + r.points, 0) / recentRatings.length 
    : 0

  const pointsDeviation = avgPoints > 0 ? Math.abs(points - avgPoints) / avgPoints : 0
  
  // Pattern 2: Frequency analysis - too many ratings in short time
  const now = new Date()
  const recentCount = recentRatings.filter(r => {
    const ratingDate = new Date(r.awardedAt)
    const hoursDiff = (now.getTime() - ratingDate.getTime()) / (1000 * 60 * 60)
    return hoursDiff < 24
  }).length

  // Pattern 3: Text similarity - avoid duplicate reasons
  const sameReasonCount = recentRatings.filter(r => 
    r.reason.toLowerCase() === reason.toLowerCase()
  ).length

  // Calculate anomaly score (0-1)
  const frequencyAnomalyScore = Math.min(recentCount / 5, 1) // Suspicious if 5+ in 24h
  const deviationAnomalyScore = Math.min(pointsDeviation / 2, 1) // Suspicious if >200% deviation
  const duplicateAnomalyScore = sameReasonCount > 2 ? 0.5 : 0

  const anomalyScore = (frequencyAnomalyScore * 0.4 + deviationAnomalyScore * 0.4 + duplicateAnomalyScore * 0.2)
  
  let message = ""
  let riskLevel: "low" | "medium" | "high" = "low"
  
  if (anomalyScore > 0.6) {
    riskLevel = "high"
    message = "⚠️ Unusual rating pattern detected. Review recommended."
  } else if (anomalyScore > 0.4) {
    riskLevel = "medium"
    message = "ℹ️ Notable pattern difference from recent ratings"
  } else {
    riskLevel = "low"
    message = "✅ Rating follows normal pattern"
  }

  return {
    isAnomaly: anomalyScore > 0.5,
    confidenceScore: 1 - anomalyScore,
    message,
    riskLevel
  }
}

// Check if employee has reached maximum points milestone
export function checkMilestone(
  employeeId: string,
  currentPoints: number,
  maxPoints: number = 250
): RatingMilestone {
  const percentageToMax = Math.min((currentPoints / maxPoints) * 100, 100)
  const hasReachedMax = currentPoints >= maxPoints

  return {
    employeeId,
    currentPoints,
    maxPoints,
    percentageToMax,
    hasReachedMax,
    timestamp: new Date().toISOString()
  }
}

// ML-based recommendation for intensity increase
export function recommendIntensityIncrease(
  employeeId: string,
  currentPoints: number,
  ratings: Array<{ points: number; awardedAt: string }>,
  intensityHistory: Array<{ date: string; intensity: number }>
): {
  shouldIncrease: boolean
  recommendedIncrease: number
  reasoning: string
} {
  const milestone = checkMilestone(employeeId, currentPoints)
  
  if (!milestone.hasReachedMax) {
    return {
      shouldIncrease: false,
      recommendedIncrease: 0,
      reasoning: "Employee has not reached maximum points yet"
    }
  }

  // Check if last intensity increase was recent (avoid multiple increases)
  const now = new Date()
  const lastIncrease = intensityHistory.length > 0 
    ? new Date(intensityHistory[intensityHistory.length - 1].date)
    : new Date(0)
  
  const daysSinceLastIncrease = (now.getTime() - lastIncrease.getTime()) / (1000 * 60 * 60 * 24)
  
  if (daysSinceLastIncrease < 30) {
    return {
      shouldIncrease: false,
      recommendedIncrease: 0,
      reasoning: `Last intensity increase was ${Math.ceil(daysSinceLastIncrease)} days ago. Minimum 30-day interval required.`
    }
  }

  // Check consistency - awards should be consistent
  const recentRatings = ratings.filter(r => {
    const daysDiff = (now.getTime() - new Date(r.awardedAt).getTime()) / (1000 * 60 * 60 * 24)
    return daysDiff < 30
  })

  const avgRecentPoints = recentRatings.length > 0
    ? recentRatings.reduce((sum, r) => sum + r.points, 0) / recentRatings.length
    : 0

  const isConsistent = avgRecentPoints > currentPoints * 0.3 // Should be getting consistent ratings

  return {
    shouldIncrease: isConsistent && milestone.hasReachedMax,
    recommendedIncrease: 5, // 5% increase
    reasoning: isConsistent 
      ? `Employee has reached max points with consistent high performance. Recommending 5% intensity increase.`
      : `While at max points, ratings have been inconsistent. Consider further evaluation before intensity increase.`
  }
}

// Calculate risk score for employee (ML-based health assessment)
export function calculateEmployeeRiskScore(
  pointsPercentage: number,
  fatigueLevel: number,
  burnoutRisk: string
): number {
  // If points are high, risk is lower (good performance)
  const pointsRiskFactor = Math.max(0, (100 - pointsPercentage) / 100) * 0.4
  
  const fatigueRiskFactor = Math.min(fatigueLevel / 100, 1) * 0.4
  
  const burnoutRiskFactor = 
    burnoutRisk === "critical" ? 0.5 :
    burnoutRisk === "high" ? 0.3 :
    burnoutRisk === "moderate" ? 0.1 :
    0

  const overallRisk = (pointsRiskFactor + fatigueRiskFactor + burnoutRiskFactor)
  return Math.round(overallRisk * 100)
}
