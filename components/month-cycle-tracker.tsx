"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { calculateCyclePhase } from "@/lib/health-data"
import { getEmployees } from "@/lib/health-data"
import { Heart } from "lucide-react"

export function MonthCycleTracker() {
  const employees = getEmployees()
  const femaleEmployees = employees.filter((emp) => emp.gender === "female" && emp.womensHealth?.isTracking)

  if (femaleEmployees.length === 0) {
    return null
  }

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-pink-500" />
          Month Cycle Tracking 👩
        </CardTitle>
        <CardDescription>
          Monitor menstrual cycle information for female team members
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {femaleEmployees.map((employee) => {
            const womensHealth = employee.womensHealth!
            const cycle = calculateCyclePhase(
              womensHealth.lastPeriodDate,
              womensHealth.cycleLength,
              womensHealth.periodDuration,
            )

            return (
              <div key={employee.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-sm font-medium">
                      {employee.avatar}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{employee.name}</p>
                      <p className="text-xs text-muted-foreground">{employee.role}</p>
                    </div>
                  </div>
                  <Badge className={`${getPhaseColor(cycle.phase)}`}>
                    <span className="mr-1">{getPhaseIcon(cycle.phase)}</span>
                    {cycle.phase.charAt(0).toUpperCase() + cycle.phase.slice(1)}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Cycle Progress</span>
                    <span className="font-medium">
                      Day {cycle.dayInCycle} of {womensHealth.cycleLength}
                    </span>
                  </div>
                  <Progress value={(cycle.dayInCycle / womensHealth.cycleLength) * 100} className="h-2" />
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2 bg-secondary/40 rounded text-center">
                    <p className="text-muted-foreground">Fertile Window</p>
                    <p className="font-medium text-sm mt-1">
                      {cycle.isFertile ? "✨ Yes" : "💚 No"}
                    </p>
                  </div>
                  <div className="p-2 bg-secondary/40 rounded text-center">
                    <p className="text-muted-foreground">Ovulation</p>
                    <p className="font-medium text-sm mt-1">
                      {cycle.isOvulation ? "🌟 Now" : "⏳ Later"}
                    </p>
                  </div>
                  <div className="p-2 bg-secondary/40 rounded text-center">
                    <p className="text-muted-foreground">Period</p>
                    <p className="font-medium text-sm mt-1">
                      {cycle.isPeriod ? "🩸 Active" : "⏸️ Off"}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground bg-secondary/20 p-2 rounded">
                  {cycle.description}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
