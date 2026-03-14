"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Award, TrendingUp, Gift, BellRing, Star } from "lucide-react"
import { type Employee, getEmployeeRatings, getTotalRatingPoints } from "@/lib/health-data"

const MAX_RATING_POINTS = 250
const INCENTIVE_PERCENTAGE = 5

interface RatingMetrics {
  totalPoints: number
  percentage: number
  level: string
  status: "beginner" | "fair" | "good" | "very-good" | "excellent"
  color: string
  hasReachedMax: boolean
  earnedIncentive: boolean
}

function calculateRatingMetrics(totalPoints: number): RatingMetrics {
  const percentage = Math.min(100, (totalPoints / MAX_RATING_POINTS) * 100)
  let status: "beginner" | "fair" | "good" | "very-good" | "excellent" = "beginner"
  let level = "⭐ Beginner"
  let color = "bg-orange-100 text-orange-800"

  if (totalPoints >= MAX_RATING_POINTS) {
    status = "excellent"
    level = "⭐⭐⭐⭐⭐ Excellent"
    color = "bg-purple-100 text-purple-800"
  } else if (totalPoints >= 200) {
    status = "very-good"
    level = "⭐⭐⭐⭐ Very Good"
    color = "bg-green-100 text-green-800"
  } else if (totalPoints >= 150) {
    status = "good"
    level = "⭐⭐⭐ Good"
    color = "bg-blue-100 text-blue-800"
  } else if (totalPoints >= 75) {
    status = "fair"
    level = "⭐⭐ Fair"
    color = "bg-yellow-100 text-yellow-800"
  }

  return {
    totalPoints,
    percentage,
    level,
    status,
    color,
    hasReachedMax: totalPoints >= MAX_RATING_POINTS,
    earnedIncentive: totalPoints >= MAX_RATING_POINTS,
  }
}

export function NotificationRatingsPanel({ employee }: { employee: Employee }) {
  const [ratings, setRatings] = useState(getEmployeeRatings(employee.id))
  const [metrics, setMetrics] = useState<RatingMetrics>(() =>
    calculateRatingMetrics(getTotalRatingPoints(employee.id))
  )
  const [showMilestoneAlert, setShowMilestoneAlert] = useState(false)

  useEffect(() => {
    const currentRatings = getEmployeeRatings(employee.id)
    const totalPoints = getTotalRatingPoints(employee.id)
    setRatings(currentRatings)

    const newMetrics = calculateRatingMetrics(totalPoints)
    setMetrics(newMetrics)

    // Show alert if max points was reached
    if (newMetrics.hasReachedMax && !showMilestoneAlert) {
      setShowMilestoneAlert(true)
      // Auto-hide alert after 5 seconds
      const timer = setTimeout(() => setShowMilestoneAlert(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [employee.id, showMilestoneAlert])

  const pointsRemaining = Math.max(0, MAX_RATING_POINTS - metrics.totalPoints)
  const lastRating = ratings.length > 0 ? ratings[ratings.length - 1] : null

  return (
    <div className="space-y-6">
      {/* Milestone Achievement Alert */}
      {metrics.hasReachedMax && (
        <Alert className="border-green-200 bg-green-50">
          <BellRing className="h-5 w-5 text-green-600" />
          <AlertDescription className="text-green-800 font-medium">
            🎉 Congratulations! You've reached the maximum rating points ({MAX_RATING_POINTS}). You've earned a {INCENTIVE_PERCENTAGE}% wellness incentive!
          </AlertDescription>
        </Alert>
      )}

      {/* Main Rating Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              <div>
                <CardTitle>Your Rating Points</CardTitle>
                <CardDescription>Track your wellness achievement and incentive progress</CardDescription>
              </div>
            </div>
            <Badge className={metrics.color}>{metrics.level}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Points Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border border-border bg-secondary/50 p-4">
              <p className="text-sm text-muted-foreground mb-1">Total Points Earned</p>
              <p className="text-3xl font-bold text-card-foreground">{metrics.totalPoints}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {metrics.percentage.toFixed(1)}% of maximum
              </p>
            </div>

            <div className="rounded-lg border border-border bg-secondary/50 p-4">
              <p className="text-sm text-muted-foreground mb-1">Points Needed</p>
              <p className="text-3xl font-bold text-card-foreground">{pointsRemaining}</p>
              <p className="text-xs text-muted-foreground mt-2">
                to reach maximum
              </p>
            </div>

            <div className="rounded-lg border border-border bg-secondary/50 p-4">
              <p className="text-sm text-muted-foreground mb-1">Incentive Earned</p>
              <p className="text-3xl font-bold text-green-600">
                {metrics.earnedIncentive ? `+${INCENTIVE_PERCENTAGE}%` : "0%"}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                wellness boost
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-card-foreground">Progress to Maximum</span>
              <span className="text-sm text-muted-foreground">{metrics.percentage.toFixed(0)}%</span>
            </div>
            <Progress value={metrics.percentage} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span>{MAX_RATING_POINTS}</span>
            </div>
          </div>

          {/* Rating Information */}
          <div className="border-t border-border pt-4">
            <p className="text-sm font-semibold text-card-foreground mb-3">Rating Levels</p>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <span className="text-orange-800">⭐</span>
                <span className="text-muted-foreground">0-24 points: Beginner</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-yellow-800">⭐⭐</span>
                <span className="text-muted-foreground">25-74 points: Fair</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-blue-800">⭐⭐⭐</span>
                <span className="text-muted-foreground">75-149 points: Good</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-green-800">⭐⭐⭐⭐</span>
                <span className="text-muted-foreground">150-199 points: Very Good</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-purple-800">⭐⭐⭐⭐⭐</span>
                <span className="text-muted-foreground">250+ points: Excellent (5% Incentive)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Incentive Explanation Card */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-green-600" />
            <CardTitle className="text-green-900">5% Wellness Incentive</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-green-800">
          <p className="text-sm leading-relaxed">
            When you accumulate <strong>{MAX_RATING_POINTS} points</strong>, you unlock an exclusive <strong>{INCENTIVE_PERCENTAGE}% wellness incentive</strong>. This bonus recognizes your outstanding commitment to health and wellness goals, resulting in:
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>{INCENTIVE_PERCENTAGE}% increased wellness allowance</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>Priority access to health programs</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>Recognition in company wellness rankings</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>Automatic intensity level increase for enhanced tracking</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Recent Ratings */}
      {ratings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Rating Notifications</CardTitle>
            <CardDescription>Your latest awarded points and recognition</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {[...ratings].reverse().slice(0, 10).map((rating, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-secondary/30">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100 text-sm font-bold text-yellow-800">
                    +{rating.points}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-card-foreground">{rating.reason}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Awarded by {rating.awardedBy} · {new Date(rating.awardedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Ratings Message */}
      {ratings.length === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Star className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm font-medium text-card-foreground">No ratings yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Complete wellness activities to earn rating points
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
