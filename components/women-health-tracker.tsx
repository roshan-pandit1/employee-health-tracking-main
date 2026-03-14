"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { calculateCyclePhase, type CyclePhase } from "@/lib/health-data"
import { Calendar, Heart, TrendingUp, Droplet } from "lucide-react"

interface WomensHealthTrackerProps {
  lastPeriodDate: string
  cycleLength: number
  periodDuration: number
  physiologicalSignals: {
    basalBodyTemperature: number
    cervicalMucus: string
    mood: string
  }
}

export function WomensHealthTracker({
  lastPeriodDate,
  cycleLength,
  periodDuration,
  physiologicalSignals,
}: WomensHealthTrackerProps) {
  const cycle = calculateCyclePhase(lastPeriodDate, cycleLength, periodDuration)

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

  const getNextPhaseInfo = () => {
    const phases = ["menstrual", "follicular", "ovulation", "luteal"]
    const currentIndex = phases.indexOf(cycle.phase)
    const nextPhase = phases[(currentIndex + 1) % phases.length]
    return nextPhase.charAt(0).toUpperCase() + nextPhase.slice(1)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-500" />
            Menstrual Cycle Tracking 👩
          </CardTitle>
          <CardDescription>Monitor your monthly cycle and fertility window</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Phase Display */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Current Phase</h4>
              <Badge className={`${getPhaseColor(cycle.phase)}`}>
                <span className="mr-1">{getPhaseIcon(cycle.phase)}</span>
                {cycle.phase.charAt(0).toUpperCase() + cycle.phase.slice(1)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{cycle.description}</p>

            {/* Cycle Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span>Day {cycle.dayInCycle} of {cycleLength}</span>
                <span className="text-muted-foreground">{cycle.daysRemaining} days remaining</span>
              </div>
              <Progress value={(cycle.dayInCycle / cycleLength) * 100} className="h-3" />
            </div>
          </div>

          {/* Cycle Timeline */}
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center p-2 rounded-lg bg-red-50">
              <p className="text-xs font-medium text-red-700">Menstrual</p>
              <p className="text-xs text-red-600">Days 1-{periodDuration}</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-blue-50">
              <p className="text-xs font-medium text-blue-700">Follicular</p>
              <p className="text-xs text-blue-600">Days {periodDuration + 1}-12</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-purple-50">
              <p className="text-xs font-medium text-purple-700">Ovulation</p>
              <p className="text-xs text-purple-600">Days 13-15</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-yellow-50">
              <p className="text-xs font-medium text-yellow-700">Luteal</p>
              <p className="text-xs text-yellow-600">Days 16-{cycleLength}</p>
            </div>
          </div>

          {/* Fertility Status */}
          <div className="border-t pt-4 space-y-3">
            <h4 className="text-sm font-medium">Fertility Status</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-secondary/40 rounded-lg">
                <span className="text-sm">Ovulation Window</span>
                <Badge variant={cycle.isOvulation ? "default" : "secondary"}>
                  {cycle.isOvulation ? "🌟 Active" : "⏳ Not Active"}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-secondary/40 rounded-lg">
                <span className="text-sm">Fertile Window</span>
                <Badge variant={cycle.isFertile ? "default" : "secondary"}>
                  {cycle.isFertile ? "✨ High Fertility" : "💚 Low Fertility"}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-secondary/40 rounded-lg">
                <span className="text-sm">Menstruation</span>
                <Badge variant={cycle.isPeriod ? "destructive" : "secondary"}>
                  {cycle.isPeriod ? "🩸 Active" : "⏸️ Not Active"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Physiological Signals */}
          <div className="border-t pt-4 space-y-3">
            <h4 className="text-sm font-medium">Physiological Signals</h4>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3 p-3 bg-secondary/20 rounded-lg">
                <TrendingUp className="h-4 w-4 text-orange-500" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Basal Body Temperature</p>
                  <p className="text-sm font-medium">{physiologicalSignals.basalBodyTemperature}°F</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {physiologicalSignals.basalBodyTemperature > 98.5 ? "📈 Elevated" : "📊 Normal"}
                </span>
              </div>

              <div className="flex items-center gap-3 p-3 bg-secondary/20 rounded-lg">
                <Droplet className="h-4 w-4 text-cyan-500" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Cervical Mucus</p>
                  <p className="text-sm font-medium capitalize">{physiologicalSignals.cervicalMucus}</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {["watery", "creamy", "stretchy"].includes(
                    physiologicalSignals.cervicalMucus
                  )
                    ? "🩺 Fertile"
                    : "🔒 Low fertility"}
                </span>
              </div>

              <div className="flex items-center gap-3 p-3 bg-secondary/20 rounded-lg">
                <Heart className="h-4 w-4 text-pink-500" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Mood</p>
                  <p className="text-sm font-medium capitalize">{physiologicalSignals.mood}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Wellness Tips */}
          <div className="border-t pt-4 space-y-3">
            <h4 className="text-sm font-medium">Phase-Based Wellness Tips</h4>
            <div className="text-sm text-muted-foreground space-y-2 p-3 bg-secondary/20 rounded-lg">
              {cycle.phase === "menstrual" && (
                <>
                  <p>• Rest and prioritize recovery during your period</p>
                  <p>• Stay hydrated and maintain iron intake</p>
                  <p>• Light exercise like yoga is beneficial</p>
                </>
              )}
              {cycle.phase === "follicular" && (
                <>
                  <p>• Energy levels are rising - great time for intense workouts</p>
                  <p>• Consider scheduling important meetings this week</p>
                  <p>• Mood typically improves during this phase</p>
                </>
              )}
              {cycle.phase === "ovulation" && (
                <>
                  <p>• Peak energy and confidence - ideal for challenges</p>
                  <p>• Your fertility is at its peak window</p>
                  <p>• Social and collaborative energy is highest</p>
                </>
              )}
              {cycle.phase === "luteal" && (
                <>
                  <p>• Energy may decline - allow more rest days</p>
                  <p>• Focus on self-care and stress management</p>
                  <p>• Plan lower-intensity activities this week</p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
