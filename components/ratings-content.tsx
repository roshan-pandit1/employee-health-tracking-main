"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getEmployees, getEmployeeRatings, saveEmployeeRatings, type Employee, type EmployeeRating } from "@/lib/health-data"
import { Trash2, Plus, Award, TrendingUp, Brain, AlertCircle } from "lucide-react"
import { analyzeRatingPattern, checkMilestone, recommendIntensityIncrease } from "@/lib/rating-ml"
import { 
  notifyMilestoneReached, 
  notifyIntensityIncrease,
  notifyRatingReceived
} from "@/lib/notifications"
import { createIntensityAlert } from "./intensity-alert-panel"

const MAX_POINTS = 250
const INTENSITY_INCREASE_PERCENTAGE = 5

export function RatingsContent() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [ratings, setRatings] = useState<{ [key: string]: EmployeeRating[] }>({})
  const [newRating, setNewRating] = useState<{ employeeId: string; points: string; reason: string }>({
    employeeId: "",
    points: "",
    reason: "",
  })
  const [selectedEmployeeForRating, setSelectedEmployeeForRating] = useState<string>("")
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [intensityLevels, setIntensityLevels] = useState<{ [key: string]: number }>({})

  useEffect(() => {
    const allEmployees = getEmployees()
    setEmployees(allEmployees)

    // Load all ratings
    const allRatings: { [key: string]: EmployeeRating[] } = {}
    allEmployees.forEach((emp) => {
      allRatings[emp.id] = getEmployeeRatings(emp.id)
    })
    setRatings(allRatings)

    // Load intensity levels
    const intensities: { [key: string]: number } = {}
    allEmployees.forEach((emp) => {
      const stored = localStorage.getItem(`intensity_${emp.id}`)
      intensities[emp.id] = stored ? parseFloat(stored) : 100
    })
    setIntensityLevels(intensities)
  }, [])

  const handleAddRating = (employeeId: string) => {
    if (!newRating.points || !newRating.reason || parseInt(newRating.points) === 0) {
      alert("Please enter valid points and reason")
      return
    }

    const points = parseInt(newRating.points)
    const currentRatings = ratings[employeeId] || []
    
    // ML Analysis
    const analysis = analyzeRatingPattern(employeeId, points, newRating.reason, currentRatings)
    setAnalysisResult({ ...analysis, employeeId })
    setShowAnalysis(true)

    // High risk - ask confirmation
    if (analysis.riskLevel === "high") {
      if (!confirm(`⚠️ ${analysis.message}\n\nContinue anyway?`)) {
        return
      }
    }

    const updatedRatings: EmployeeRating[] = [
      ...currentRatings,
      {
        employeeId,
        points,
        reason: newRating.reason,
        awardedAt: new Date().toISOString(),
        awardedBy: "Admin",
      },
    ]

    // Save to localStorage
    saveEmployeeRatings(employeeId, updatedRatings)

    // Update state
    setRatings({
      ...ratings,
      [employeeId]: updatedRatings,
    })

    // Notify employee about rating
    notifyRatingReceived(employeeId, points, newRating.reason)

    // Check if reached maximum points
    const totalPoints = getTotalPoints(employeeId) + points
    const milestone = checkMilestone(employeeId, totalPoints, MAX_POINTS)

    if (milestone.hasReachedMax) {
      // Notify milestone
      notifyMilestoneReached(employeeId, totalPoints, MAX_POINTS)

      // Check if should increase intensity
      const intensityHistory = loadIntensityHistory(employeeId)
      const recommendation = recommendIntensityIncrease(employeeId, totalPoints, updatedRatings, intensityHistory)

      if (recommendation.shouldIncrease) {
        const currentIntensity = intensityLevels[employeeId] || 100
        const newIntensity = currentIntensity * (1 + INTENSITY_INCREASE_PERCENTAGE / 100)
        
        // Save new intensity
        localStorage.setItem(`intensity_${employeeId}`, newIntensity.toString())
        localStorage.setItem(`intensity_history_${employeeId}`, JSON.stringify([
          ...intensityHistory,
          { date: new Date().toISOString(), intensity: newIntensity }
        ]))

        setIntensityLevels({
          ...intensityLevels,
          [employeeId]: newIntensity
        })

        // Notify intensity increase
        notifyIntensityIncrease(employeeId, currentIntensity, newIntensity)
        
        // Create employee alert for intensity increase
        createIntensityAlert(
          employeeId,
          Math.round(currentIntensity),
          Math.round(newIntensity),
          "Reached wellness milestone - excellent performance!",
          "Your consistent effort has earned you a higher wellness intensity level. Keep it up! 🎉"
        )
      }
    }

    // Reset form
    setNewRating({ employeeId: "", points: "", reason: "" })
    setSelectedEmployeeForRating("")
  }

  const handleDeleteRating = (employeeId: string, ratingIndex: number) => {
    const currentRatings = ratings[employeeId] || []
    const updatedRatings = currentRatings.filter((_, idx) => idx !== ratingIndex)

    // Save to localStorage
    saveEmployeeRatings(employeeId, updatedRatings)

    // Update state
    setRatings({
      ...ratings,
      [employeeId]: updatedRatings,
    })
  }

  const getTotalPoints = (employeeId: string): number => {
    return (ratings[employeeId] || []).reduce((sum, r) => sum + r.points, 0)
  }

  const getRatingLevel = (points: number): string => {
    if (points >= 100) return "⭐⭐⭐⭐⭐ Excellent"
    if (points >= 75) return "⭐⭐⭐⭐ Very Good"
    if (points >= 50) return "⭐⭐⭐ Good"
    if (points >= 25) return "⭐⭐ Fair"
    if (points > 0) return "⭐ Beginner"
    return "No Rating Yet"
  }

  const getRatingColor = (points: number) => {
    if (points >= 100) return "bg-purple-100 text-purple-800"
    if (points >= 75) return "bg-green-100 text-green-800"
    if (points >= 50) return "bg-blue-100 text-blue-800"
    if (points >= 25) return "bg-yellow-100 text-yellow-800"
    if (points > 0) return "bg-orange-100 text-orange-800"
    return "bg-gray-100 text-gray-800"
  }

  const loadIntensityHistory = (employeeId: string) => {
    const stored = localStorage.getItem(`intensity_history_${employeeId}`)
    return stored ? JSON.parse(stored) : []
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-foreground">Employee Rating System 🏆</h2>
          <p className="text-sm text-muted-foreground">
            Award points (ML-validated) • Auto intensity increases at {MAX_POINTS} points
          </p>
        </div>
        <Award className="h-8 w-8 text-yellow-500" />
      </div>

      {/* ML Analysis Alert */}
      {showAnalysis && analysisResult && (
        <Card className={analysisResult.riskLevel === "high" ? "border-red-200 bg-red-50" : "border-blue-200 bg-blue-50"}>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Brain className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                analysisResult.riskLevel === "high" ? "text-red-600" : "text-blue-600"
              }`} />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold">ML Pattern Analysis</p>
                  <Badge className={analysisResult.riskLevel === "high" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}>
                    {analysisResult.riskLevel.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm mb-2">{analysisResult.message}</p>
                <p className="text-xs text-muted-foreground">
                  Confidence Score: {(analysisResult.confidenceScore * 100).toFixed(1)}%
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAnalysis(false)}
              >
                ✕
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <TrendingUp className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-900">Blockchain-Style Transparency + ML Validation</p>
              <p className="text-sm text-blue-800 mt-1">
                All ratings are analyzed for anomalies and pattern consistency. When employees reach {MAX_POINTS} points, their wellness intensity automatically increases by {INTENSITY_INCREASE_PERCENTAGE}% with notifications.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employees Rating Cards */}
      <div className="grid gap-6">
        {employees.map((employee) => {
          const totalPoints = getTotalPoints(employee.id)
          const milestone = checkMilestone(employee.id, totalPoints, MAX_POINTS)
          const employeeRatings = ratings[employee.id] || []
          const currentIntensity = intensityLevels[employee.id] || 100

          return (
            <Card key={employee.id} className={milestone.hasReachedMax ? "border-green-200 bg-green-50" : "overflow-hidden"}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center font-semibold text-lg">
                        {employee.avatar}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{employee.name}</CardTitle>
                        <CardDescription>{employee.role}</CardDescription>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={`${getRatingColor(totalPoints)} text-lg px-3 py-2`}>
                      {totalPoints} pts
                    </Badge>
                    <p className="text-sm font-semibold mt-2">{getRatingLevel(totalPoints)}</p>
                    {milestone.hasReachedMax && (
                      <Badge className="mt-2 bg-green-100 text-green-800">✨ Max Reached</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Progress and Intensity */}
                <div className="space-y-3 p-3 bg-secondary/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Points Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {totalPoints}/{MAX_POINTS} ({milestone.percentageToMax.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(milestone.percentageToMax, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-muted-foreground">Wellness Intensity</span>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      {currentIntensity.toFixed(1)}%
                    </Badge>
                  </div>
                </div>

                {/* Health Status */}
                <div className="flex items-center gap-3 p-3 bg-secondary/20 rounded-lg">
                  <Badge
                    className={
                      employee.status === "critical"
                        ? "bg-destructive text-destructive-foreground"
                        : employee.status === "warning"
                          ? "bg-warning text-warning-foreground"
                          : "bg-success text-success-foreground"
                    }
                  >
                    {employee.status === "critical" ? "🔴 Critical" : employee.status === "warning" ? "🟡 Warning" : "🟢 Healthy"}
                  </Badge>
                  <span className="text-sm">
                    Fatigue: {employee.fatigue.score}% | Burnout: {employee.burnout.risk}
                  </span>
                </div>

                {/* Add Rating Form */}
                <div className="border-t pt-4 space-y-4">
                  <h4 className="font-semibold text-sm">Add Rating Points</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor={`points-${employee.id}`} className="text-xs">
                        Points (1-50)
                      </Label>
                      <Input
                        id={`points-${employee.id}`}
                        type="number"
                        min="1"
                        max="50"
                        placeholder="Enter points"
                        value={selectedEmployeeForRating === employee.id ? newRating.points : ""}
                        onChange={(e) => {
                          setSelectedEmployeeForRating(employee.id)
                          setNewRating({ ...newRating, employeeId: employee.id, points: e.target.value })
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`reason-${employee.id}`} className="text-xs">
                        Reason
                      </Label>
                      <Input
                        id={`reason-${employee.id}`}
                        type="text"
                        placeholder="e.g., Excellent sleep, High activity"
                        value={selectedEmployeeForRating === employee.id ? newRating.reason : ""}
                        onChange={(e) => {
                          setSelectedEmployeeForRating(employee.id)
                          setNewRating({ ...newRating, employeeId: employee.id, reason: e.target.value })
                        }}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        onClick={() => handleAddRating(employee.id)}
                        className="w-full gap-2"
                        variant="default"
                      >
                        <Plus className="h-4 w-4" />
                        Award Points
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Rating History */}
                {employeeRatings.length > 0 && (
                  <div className="border-t pt-4 space-y-3">
                    <h4 className="font-semibold text-sm">Rating History ({employeeRatings.length})</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {employeeRatings.map((rating, idx) => (
                        <div
                          key={idx}
                          className="flex items-start justify-between p-3 bg-secondary/10 rounded-lg group hover:bg-secondary/20 transition"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                                +{rating.points} pts
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(rating.awardedAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-card-foreground">{rating.reason}</p>
                            <p className="text-xs text-muted-foreground">by {rating.awardedBy}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRating(employee.id, idx)}
                            className="opacity-0 group-hover:opacity-100 transition"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {employeeRatings.length === 0 && (
                  <div className="border-t pt-4">
                    <p className="text-xs text-muted-foreground text-center py-4">No ratings yet. Award points to get started!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
