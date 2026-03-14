"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { calculateCyclePhase, getEmployees, type Employee } from "@/lib/health-data"
import { Heart, Mail, MapPin } from "lucide-react"

export function MonthCycleContent() {
  const [employees, setEmployees] = useState<Employee[]>([])

  useEffect(() => {
    const allEmployees = getEmployees()
    const femaleEmployees = allEmployees.filter(
      (emp) => emp.gender === "female" && emp.womensHealth?.isTracking
    )
    setEmployees(femaleEmployees)
  }, [])

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case "menstrual":
        return "bg-red-100 text-red-800"
      case "follicular":
        return "bg-blue-100 text-blue-800"
      case "ovulation":
        return "bg-purple-100 text-purple-800"
      case "luteal":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case "menstrual":
        return "🩸"
      case "follicular":
        return "🌱"
      case "ovulation":
        return "🌸"
      case "luteal":
        return "🌙"
      default:
        return "📅"
    }
  }

  const getMoodEmoji = (mood: string) => {
    const moodMap: Record<string, string> = {
      calm: "😌",
      energetic: "💪",
      focused: "🎯",
      balanced: "⚖️",
      stressed: "😰",
      tired: "😴",
      happy: "😊",
      neutral: "😐",
    }
    return moodMap[mood.toLowerCase()] || "😐"
  }

  if (employees.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Month Cycle Tracking 👩</h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center py-8">
              No female employees have enabled cycle tracking.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-foreground">Month Cycle Tracking 👩</h2>
          <p className="text-sm text-muted-foreground">
            Monitor menstrual cycle information and wellness insights for female team members
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {employees.map((employee) => {
          const womensHealth = employee.womensHealth!
          const cycle = calculateCyclePhase(
            womensHealth.lastPeriodDate,
            womensHealth.cycleLength,
            womensHealth.periodDuration
          )

          return (
            <Card key={employee.id} className="overflow-hidden">
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
                  <Badge className={`${getPhaseColor(cycle.phase)} text-sm`}>
                    <span className="mr-1.5 text-lg">{getPhaseIcon(cycle.phase)}</span>
                    {cycle.phase.charAt(0).toUpperCase() + cycle.phase.slice(1)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Cycle Progress */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold">Cycle Progress</h4>
                    <span className="text-sm font-medium">
                      Day {cycle.dayInCycle} of {womensHealth.cycleLength}
                    </span>
                  </div>
                  <Progress
                    value={(cycle.dayInCycle / womensHealth.cycleLength) * 100}
                    className="h-3"
                  />
                  <p className="text-xs text-muted-foreground">{cycle.description}</p>
                </div>

                {/* Cycle Phases Overview */}
                <div className="grid grid-cols-4 gap-2">
                  <div className="text-center p-3 rounded-lg bg-red-50">
                    <p className="text-xs font-semibold text-red-700">Menstrual</p>
                    <p className="text-xs text-red-600 mt-1">Days 1-{womensHealth.periodDuration}</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-blue-50">
                    <p className="text-xs font-semibold text-blue-700">Follicular</p>
                    <p className="text-xs text-blue-600 mt-1">Days {womensHealth.periodDuration + 1}-12</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-purple-50">
                    <p className="text-xs font-semibold text-purple-700">Ovulation</p>
                    <p className="text-xs text-purple-600 mt-1">Days 13-15</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-yellow-50">
                    <p className="text-xs font-semibold text-yellow-700">Luteal</p>
                    <p className="text-xs text-yellow-600 mt-1">Days 16-{womensHealth.cycleLength}</p>
                  </div>
                </div>

                {/* Fertility & Period Status */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-secondary/40 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground mb-2">Fertile Window</p>
                    <Badge variant={cycle.isFertile ? "default" : "secondary"}>
                      {cycle.isFertile ? "✨ Yes" : "💚 No"}
                    </Badge>
                  </div>
                  <div className="p-3 bg-secondary/40 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground mb-2">Ovulation</p>
                    <Badge variant={cycle.isOvulation ? "default" : "secondary"}>
                      {cycle.isOvulation ? "🌟 Now" : "⏳ Later"}
                    </Badge>
                  </div>
                  <div className="p-3 bg-secondary/40 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground mb-2">Period</p>
                    <Badge variant={cycle.isPeriod ? "destructive" : "secondary"}>
                      {cycle.isPeriod ? "🩸 Active" : "⏸️ Off"}
                    </Badge>
                  </div>
                </div>

                {/* Physiological Signals & Mood Status */}
                <div className="border-t pt-4 space-y-3">
                  <h4 className="text-sm font-semibold">Health & Mood Status</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-secondary/20 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Basal Body Temp</p>
                      <p className="text-lg font-semibold">{womensHealth.physiologicalSignals.basalBodyTemperature}°F</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {womensHealth.physiologicalSignals.basalBodyTemperature > 98.5
                          ? "📈 Elevated (Likely Luteal)"
                          : "📊 Normal (Likely Follicular)"}
                      </p>
                    </div>

                    <div className="p-3 bg-secondary/20 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Cervical Mucus</p>
                      <p className="text-lg font-semibold capitalize">
                        {womensHealth.physiologicalSignals.cervicalMucus}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {["watery", "creamy", "stretchy"].includes(
                          womensHealth.physiologicalSignals.cervicalMucus
                        )
                          ? "🩺 High fertility"
                          : "🔒 Low fertility"}
                      </p>
                    </div>

                    <div className="p-3 bg-secondary/20 rounded-lg col-span-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Mood Status</p>
                          <p className="text-lg font-semibold capitalize">
                            {getMoodEmoji(womensHealth.physiologicalSignals.mood)}{" "}
                            {womensHealth.physiologicalSignals.mood}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground mb-1">Health Impact</p>
                          <Badge
                            className={
                              ["calm", "balanced", "energetic"].includes(
                                womensHealth.physiologicalSignals.mood
                              )
                                ? "bg-green-100 text-green-800"
                                : "bg-orange-100 text-orange-800"
                            }
                          >
                            {["calm", "balanced", "energetic"].includes(
                              womensHealth.physiologicalSignals.mood
                            )
                              ? "✅ Positive"
                              : "⚠️ Monitor"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Employee Health Context */}
                <div className="border-t pt-4 space-y-3">
                  <h4 className="text-sm font-semibold">Employee Status & Contact</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center justify-between p-2 bg-secondary/20 rounded-lg">
                      <span className="text-sm">Health Status</span>
                      <Badge
                        className={
                          employee.status === "critical"
                            ? "bg-destructive text-destructive-foreground"
                            : employee.status === "warning"
                              ? "bg-warning text-warning-foreground"
                              : "bg-success text-success-foreground"
                        }
                      >
                        {employee.status === "critical"
                          ? "🔴 Critical"
                          : employee.status === "warning"
                            ? "🟡 Warning"
                            : "🟢 Healthy"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-secondary/20 rounded-lg text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${employee.email}`} className="text-blue-600 hover:underline">
                        {employee.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-secondary/20 rounded-lg text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{employee.department}</span>
                    </div>
                  </div>
                </div>

                {/* Phase-Based Wellness Tips */}
                <div className="border-t pt-4 space-y-3">
                  <h4 className="text-sm font-semibold">Phase-Based Wellness Tips</h4>
                  <div className="text-sm text-muted-foreground space-y-2 p-3 bg-secondary/20 rounded-lg">
                    {cycle.phase === "menstrual" && (
                      <>
                        <p>• Rest and prioritize recovery during period</p>
                        <p>• Stay hydrated and maintain iron intake</p>
                        <p>• Light exercise like yoga is beneficial</p>
                        <p>• Consider lighter workload this week</p>
                      </>
                    )}
                    {cycle.phase === "follicular" && (
                      <>
                        <p>• Energy levels are rising - great for intense work</p>
                        <p>• Optimal time for meetings and presentations</p>
                        <p>• Mood and confidence typically improve</p>
                        <p>• Schedule challenging projects this week</p>
                      </>
                    )}
                    {cycle.phase === "ovulation" && (
                      <>
                        <p>• Peak energy, confidence and social skills</p>
                        <p>• Fertility window is at its highest</p>
                        <p>• Best time for teamwork and collaboration</p>
                        <p>• Excellent for high-stakes presentations</p>
                      </>
                    )}
                    {cycle.phase === "luteal" && (
                      <>
                        <p>• Energy may decline - allow more rest</p>
                        <p>• Focus on self-care and stress management</p>
                        <p>• Plan lower-intensity activities this week</p>
                        <p>• Prioritize recovery and reflection time</p>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
