"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Heart, Activity, Thermometer, Moon, Zap, Target, Calendar as CalendarIcon, Lightbulb, AlertTriangle, Bell } from "lucide-react"
import { getEmployees, getSuggestions, type Employee, type Alert } from "@/lib/health-data"
import { Calendar } from "@/components/ui/calendar"
import { WomensHealthTracker } from "@/components/women-health-tracker"
import * as React from "react"

export function EmployeeDashboard() {
  const [userEmail, setUserEmail] = useState('')
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [userName, setUserName] = useState('')
  const [personalSuggestions, setPersonalSuggestions] = useState<string[]>([])
  const [employeeAlerts, setEmployeeAlerts] = useState<Alert[]>([])

  useEffect(() => {
    const email = localStorage.getItem('userEmail') || ''
    setUserEmail(email)

    // Find employee by email to get their actual data
    const employees = getEmployees()
    const emp = employees.find(e => e.email === email)
    
    if (emp) {
      setEmployee(emp)
      setUserName(emp.name)
      // Generate wellness suggestions only for the logged-in employee
      setPersonalSuggestions(getSuggestions(emp))
      // Get employee's health alerts
      setEmployeeAlerts(emp.alerts)
    } else {
      // Fallback for demo users not in static data
      const nameFromEmail = email.replace('@gmail.com', '').replace(/(\w)(\w*)/g, (g0, g1, g2) => g1.toUpperCase() + g2.toLowerCase())
      setUserName(nameFromEmail || 'Employee')
    }
  }, [])

  if (!employee) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading your health data...</p>
      </div>
    )
  }

  // Build health metrics from actual employee data
  const healthMetrics = [
    {
      title: "Heart Rate",
      value: `${employee.vitals.heartRate} BPM`,
      icon: Heart,
      color: "text-red-500",
      progress: Math.min(100, (employee.vitals.heartRate / 120) * 100),
      status: employee.vitals.heartRate > 100 ? "Elevated" : employee.vitals.heartRate > 90 ? "Moderate" : "Normal"
    },
    {
      title: "Activity",
      value: `${employee.vitals.steps.toLocaleString()} steps`,
      icon: Activity,
      color: "text-blue-500",
      progress: Math.min(100, (employee.vitals.steps / employee.vitals.stepsGoal) * 100),
      status: employee.vitals.steps >= employee.vitals.stepsGoal ? "Goal Met" : "In Progress"
    },
    {
      title: "Sleep",
      value: `${employee.vitals.sleepHours} hrs`,
      icon: Moon,
      color: "text-purple-500",
      progress: Math.min(100, (employee.vitals.sleepHours / 8) * 100),
      status: employee.vitals.sleepHours >= 7 ? "Adequate" : "Insufficient"
    },
    {
      title: "Stress Level",
      value: `${employee.vitals.stressLevel}%`,
      icon: Zap,
      color: "text-yellow-500",
      progress: employee.vitals.stressLevel,
      status: employee.vitals.stressLevel > 60 ? "High" : employee.vitals.stressLevel > 40 ? "Moderate" : "Low"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back, {userName}!</h1>
          <p className="text-muted-foreground">Here's your personal health overview • {employee.department} • {employee.role}</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {employee.status === "critical" ? "🔴 Critical" : employee.status === "warning" ? "🟡 Warning" : "🟢 Healthy"}
        </Badge>
      </div>

      {/* Health Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {healthMetrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="mt-2">
                <Progress value={metric.progress} className="h-2" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{metric.status}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Health Alerts Section */}
      {employeeAlerts.length > 0 && (
        <Card className={employee.status === "critical" ? "border-destructive" : "border-warning"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className={`h-5 w-5 ${employee.status === "critical" ? "text-destructive" : "text-warning"}`} />
              Your Health Alerts
            </CardTitle>
            <CardDescription>
              {employeeAlerts.length} alert{employeeAlerts.length > 1 ? "s" : ""} requiring your attention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {employeeAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  alert.severity === "critical"
                    ? "bg-destructive/10 border-destructive/30"
                    : "bg-warning/10 border-warning/30"
                }`}
              >
                <div
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                    alert.severity === "critical"
                      ? "bg-destructive/20 text-destructive"
                      : "bg-warning/20 text-warning"
                  }`}
                >
                  {alert.severity === "critical" ? (
                    <AlertTriangle className="h-4 w-4" />
                  ) : (
                    <Bell className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-card-foreground">{alert.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{alert.suggestion}</p>
                  <p className="text-xs text-muted-foreground mt-1">Reported {alert.timestamp}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Key Health Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Health Summary
          </CardTitle>
          <CardDescription>Your current health status and metrics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-secondary/40 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Fatigue Level</p>
              <p className="text-2xl font-bold">{employee.fatigue.score}%</p>
              <p className="text-xs text-muted-foreground mt-1 capitalize">{employee.fatigue.trend}</p>
            </div>
            <div className="p-3 bg-secondary/40 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Burnout Risk</p>
              <p className="text-2xl font-bold">{Math.round(employee.burnout.score)}%</p>
              <p className="text-xs text-muted-foreground mt-1 capitalize">{employee.burnout.risk}</p>
            </div>
            <div className="p-3 bg-secondary/40 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Blood Oxygen</p>
              <p className="text-2xl font-bold">{employee.vitals.bloodOxygen}%</p>
              <p className="text-xs text-muted-foreground mt-1">{employee.vitals.bloodOxygen >= 95 ? "Healthy" : "Low"}</p>
            </div>
            <div className="p-3 bg-secondary/40 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Temperature</p>
              <p className="text-2xl font-bold">{employee.vitals.temperature}°F</p>
              <p className="text-xs text-muted-foreground mt-1">{employee.vitals.temperature <= 99 ? "Normal" : "Elevated"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Today's Goals
          </CardTitle>
          <CardDescription>Track your daily health objectives & compare with previous 2 days</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Steps Goal */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Steps Goal</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{employee.vitals.steps.toLocaleString()} / {employee.vitals.stepsGoal.toLocaleString()}</span>
                {(() => {
                  const prev2Days = employee.vitals.stepsHistory.slice(-3, -1);
                  const avgPrev2Days = prev2Days.length > 0 ? prev2Days.reduce((sum, r) => sum + r.value, 0) / prev2Days.length : 0;
                  if (employee.vitals.steps > avgPrev2Days * 1.1) return <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-semibold">📈 Excellent</span>;
                  if (employee.vitals.steps > avgPrev2Days * 0.95) return <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold">👍 Better</span>;
                  if (employee.vitals.steps >= employee.vitals.stepsGoal * 0.8) return <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-semibold">😊 Good</span>;
                  return <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded font-semibold">⚠️ Fair</span>;
                })()}
              </div>
            </div>
            <Progress value={Math.min(100, (employee.vitals.steps / employee.vitals.stepsGoal) * 100)} className="h-2" />
            {(() => {
              const prev2Days = employee.vitals.stepsHistory.slice(-3, -1);
              const avgPrev2Days = prev2Days.length > 0 ? prev2Days.reduce((sum, r) => sum + r.value, 0) / prev2Days.length : 0;
              return (
                <p className="text-xs text-muted-foreground">
                  Prev 2-day avg: {Math.round(avgPrev2Days).toLocaleString()} steps
                  {avgPrev2Days > 0 && (
                    <span className={employee.vitals.steps > avgPrev2Days ? " text-green-600" : " text-red-600"}>
                      {" "}(
                      {employee.vitals.steps > avgPrev2Days 
                        ? `+${Math.round(((employee.vitals.steps / avgPrev2Days - 1) * 100))}%` 
                        : `-${Math.round(((1 - employee.vitals.steps / avgPrev2Days) * 100))}%`}
                      )
                    </span>
                  )}
                </p>
              );
            })()}
          </div>

          {/* Sleep Hours Goal */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Sleep Goal</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{employee.vitals.sleepHours} / 8 hours</span>
                {(() => {
                  const prev2Days = employee.vitals.sleepHistory.slice(-3, -1);
                  const avgPrev2Days = prev2Days.length > 0 ? prev2Days.reduce((sum, r) => sum + r.value, 0) / prev2Days.length : 0;
                  if (employee.vitals.sleepHours > avgPrev2Days * 1.05) return <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-semibold">📈 Excellent</span>;
                  if (employee.vitals.sleepHours > avgPrev2Days * 0.95) return <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold">👍 Better</span>;
                  if (employee.vitals.sleepHours >= 7) return <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-semibold">😊 Good</span>;
                  return <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded font-semibold">⚠️ Fair</span>;
                })()}
              </div>
            </div>
            <Progress value={Math.min(100, (employee.vitals.sleepHours / 8) * 100)} className="h-2" />
            {(() => {
              const prev2Days = employee.vitals.sleepHistory.slice(-3, -1);
              const avgPrev2Days = prev2Days.length > 0 ? prev2Days.reduce((sum, r) => sum + r.value, 0) / prev2Days.length : 0;
              return (
                <p className="text-xs text-muted-foreground">
                  Prev 2-day avg: {avgPrev2Days.toFixed(1)}h
                  {avgPrev2Days > 0 && (
                    <span className={employee.vitals.sleepHours > avgPrev2Days ? " text-green-600" : " text-red-600"}>
                      {" "}(
                      {employee.vitals.sleepHours > avgPrev2Days 
                        ? `+${((employee.vitals.sleepHours - avgPrev2Days).toFixed(1))}`
                        : `-${((avgPrev2Days - employee.vitals.sleepHours).toFixed(1))}`}
                      h)
                    </span>
                  )}
                </p>
              );
            })()}
          </div>

          {/* Sleep Quality Goal */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Sleep Quality</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{employee.vitals.sleepQuality}%</span>
                {(() => {
                  const prev2Days = employee.vitals.sleepHistory.slice(-3, -1);
                  const avgQuality = prev2Days.length > 0 ? (prev2Days.reduce((sum, r) => sum + (r.value / 8) * 100, 0) / prev2Days.length) : 0;
                  if (employee.vitals.sleepQuality > avgQuality * 1.1) return <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-semibold">📈 Excellent</span>;
                  if (employee.vitals.sleepQuality > avgQuality * 0.95) return <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold">👍 Better</span>;
                  if (employee.vitals.sleepQuality >= 70) return <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-semibold">😊 Good</span>;
                  return <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded font-semibold">⚠️ Fair</span>;
                })()}
              </div>
            </div>
            <Progress value={employee.vitals.sleepQuality} className="h-2" />
            {(() => {
              const prev2Days = employee.vitals.sleepHistory.slice(-3, -1);
              const avgQuality = prev2Days.length > 0 ? (prev2Days.reduce((sum, r) => sum + (r.value / 8) * 100, 0) / prev2Days.length) : 0;
              return (
                <p className="text-xs text-muted-foreground">
                  Prev 2-day avg: {Math.round(avgQuality)}%
                  {avgQuality > 0 && (
                    <span className={employee.vitals.sleepQuality > avgQuality ? " text-green-600" : " text-red-600"}>
                      {" "}(
                      {employee.vitals.sleepQuality > avgQuality 
                        ? `+${Math.round(employee.vitals.sleepQuality - avgQuality)}%` 
                        : `-${Math.round(avgQuality - employee.vitals.sleepQuality)}%`}
                      )
                    </span>
                  )}
                </p>
              );
            })()}
          </div>

          {/* Stress Management Goal */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Stress Management</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{100 - employee.vitals.stressLevel}% (Lower Stress is Better)</span>
                {(() => {
                  const prev2Days = employee.vitals.stressHistory.slice(-3, -1);
                  const avgPrev2Days = prev2Days.length > 0 ? prev2Days.reduce((sum, r) => sum + r.value, 0) / prev2Days.length : 0;
                  if (employee.vitals.stressLevel < avgPrev2Days * 0.9) return <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-semibold">📈 Excellent</span>;
                  if (employee.vitals.stressLevel < avgPrev2Days * 1.05) return <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold">👍 Better</span>;
                  if (employee.vitals.stressLevel <= 50) return <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-semibold">😊 Good</span>;
                  return <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded font-semibold">⚠️ Fair</span>;
                })()}
              </div>
            </div>
            <Progress value={100 - employee.vitals.stressLevel} className="h-2" />
            {(() => {
              const prev2Days = employee.vitals.stressHistory.slice(-3, -1);
              const avgPrev2Days = prev2Days.length > 0 ? prev2Days.reduce((sum, r) => sum + r.value, 0) / prev2Days.length : 0;
              return (
                <p className="text-xs text-muted-foreground">
                  Prev 2-day avg: {Math.round(avgPrev2Days)}%
                  {avgPrev2Days > 0 && (
                    <span className={employee.vitals.stressLevel < avgPrev2Days ? " text-green-600" : " text-red-600"}>
                      {" "}(
                      {employee.vitals.stressLevel < avgPrev2Days 
                        ? `-${Math.round(avgPrev2Days - employee.vitals.stressLevel)}%` 
                        : `+${Math.round(employee.vitals.stressLevel - avgPrev2Days)}%`}
                      )
                    </span>
                  )}
                </p>
              );
            })()}
          </div>
        </CardContent>
      </Card>

      {/* Personal Wellness Suggestions */}
      {personalSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Personalized Wellness Suggestions
            </CardTitle>
            <CardDescription>
              Actions you can take today to better maintain your health.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {personalSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-lg bg-secondary/40 p-3"
              >
                <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))]/10 text-[10px] font-semibold text-[hsl(var(--primary))]">
                  {index + 1}
                </span>
                <p className="text-sm text-card-foreground leading-relaxed">
                  {suggestion}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Women's Health Tracking */}
      {employee.gender === "female" && employee.womensHealth?.isTracking && (
        <WomensHealthTracker
          lastPeriodDate={employee.womensHealth.lastPeriodDate}
          cycleLength={employee.womensHealth.cycleLength}
          periodDuration={employee.womensHealth.periodDuration}
          physiologicalSignals={employee.womensHealth.physiologicalSignals}
        />
      )}

      {/* Activity Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Activity Calendar
          </CardTitle>
          <CardDescription>Track your daily activity levels</CardDescription>
        </CardHeader>
        <CardContent>
          <WatchActivityCalendar userEmail={userEmail} userName={userName} />
        </CardContent>
      </Card>

      {/* Recent Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Health History</CardTitle>
          <CardDescription>Your 3-week vital trends with detailed insights</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Heart Rate Trend */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Heart Rate Trend</p>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Current: {employee.vitals.heartRate} BPM</p>
                <p className="text-xs text-muted-foreground">
                  Avg: {Math.round(employee.vitals.heartRateHistory.reduce((sum, r) => sum + r.value, 0) / employee.vitals.heartRateHistory.length)} BPM
                </p>
              </div>
            </div>
            <div className="flex gap-0.5">
              {employee.vitals.heartRateHistory.map((reading, idx) => {
                let color = "bg-green-400"
                if (reading.value > 95) color = "bg-red-400"
                else if (reading.value > 85) color = "bg-yellow-400"
                return (
                  <div
                    key={idx}
                    className={`flex-1 h-14 ${color} rounded transition-all hover:h-16 group relative cursor-pointer`}
                    title={`${reading.time}: ${reading.value} BPM`}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 whitespace-nowrap bg-slate-900 text-white text-xs py-1 px-2 rounded pointer-events-none z-10">
                      <p className="font-semibold">{reading.value} BPM</p>
                      <p className="text-xs">{reading.time}</p>
                      <p className="text-xs">
                        {reading.value > 95 ? "🔴 Elevated" : reading.value > 85 ? "🟡 Moderate" : "🟢 Normal"}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Sleep Hours Trend */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Sleep Hours Trend</p>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Current: {employee.vitals.sleepHours}h</p>
                <p className="text-xs text-muted-foreground">
                  Avg: {(employee.vitals.sleepHistory.reduce((sum, r) => sum + r.value, 0) / employee.vitals.sleepHistory.length).toFixed(1)}h
                </p>
              </div>
            </div>
            <div className="flex gap-0.5">
              {employee.vitals.sleepHistory.map((reading, idx) => {
                let color = "bg-green-300"
                if (reading.value < 5) color = "bg-red-400"
                else if (reading.value < 6) color = "bg-red-300"
                else if (reading.value < 7) color = "bg-yellow-400"
                else color = "bg-green-400"
                return (
                  <div
                    key={idx}
                    className={`flex-1 h-14 ${color} rounded transition-all hover:h-16 group relative cursor-pointer`}
                    title={`${reading.time}: ${reading.value}h`}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 whitespace-nowrap bg-slate-900 text-white text-xs py-1 px-2 rounded pointer-events-none z-10">
                      <p className="font-semibold">{reading.value}h Sleep</p>
                      <p className="text-xs">{reading.time}</p>
                      <p className="text-xs">
                        {reading.value < 5 ? "🔴 Critical" : reading.value < 6 ? "🟠 Poor" : reading.value < 7 ? "🟡 Fair" : "🟢 Good"}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Sleep Quality Trend */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Sleep Quality Trend</p>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Current: {employee.vitals.sleepQuality}%</p>
                <p className="text-xs text-muted-foreground">
                  {employee.vitals.sleepQuality >= 75 ? "🟢 Excellent" : employee.vitals.sleepQuality >= 60 ? "🟡 Good" : "🔴 Poor"}
                </p>
              </div>
            </div>
            <div className="flex gap-0.5">
              {employee.vitals.sleepHistory.map((reading, idx) => {
                const quality = (reading.value / 8) * 100
                let color = "bg-green-400"
                if (quality < 50) color = "bg-red-400"
                else if (quality < 75) color = "bg-yellow-400"
                else color = "bg-green-400"
                return (
                  <div
                    key={idx}
                    className={`flex-1 h-14 ${color} rounded transition-all hover:h-16 group relative cursor-pointer`}
                    title={`${reading.time}: ${Math.round(quality)}%`}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 whitespace-nowrap bg-slate-900 text-white text-xs py-1 px-2 rounded pointer-events-none z-10">
                      <p className="font-semibold">{Math.round(quality)}% Quality</p>
                      <p className="text-xs">{reading.time}</p>
                      <p className="text-xs">
                        {quality >= 75 ? "⭐ Excellent" : quality >= 60 ? "👍 Good" : "⚠️ Poor"}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Stress Level Trend */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Stress Level Trend</p>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Current: {employee.vitals.stressLevel}%</p>
                <p className="text-xs text-muted-foreground">
                  Avg: {Math.round(employee.vitals.stressHistory.reduce((sum, r) => sum + r.value, 0) / employee.vitals.stressHistory.length)}%
                </p>
              </div>
            </div>
            <div className="flex gap-0.5">
              {employee.vitals.stressHistory.map((reading, idx) => {
                let color = "bg-green-400"
                if (reading.value > 70) color = "bg-red-400"
                else if (reading.value > 50) color = "bg-yellow-400"
                else color = "bg-green-400"
                return (
                  <div
                    key={idx}
                    className={`flex-1 h-14 ${color} rounded transition-all hover:h-16 group relative cursor-pointer`}
                    title={`${reading.time}: ${reading.value}%`}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 whitespace-nowrap bg-slate-900 text-white text-xs py-1 px-2 rounded pointer-events-none z-10">
                      <p className="font-semibold">{reading.value}% Stress</p>
                      <p className="text-xs">{reading.time}</p>
                      <p className="text-xs">
                        {reading.value > 70 ? "🔴 High" : reading.value > 50 ? "🟡 Moderate" : "🟢 Low"}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="border-t pt-4">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Color Guide:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded" />
                <span>Healthy/Normal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-400 rounded" />
                <span>Moderate/Fair</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-400 rounded" />
                <span>Critical/Poor</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Hover for details</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function WatchActivityCalendar({ userEmail, userName }: { userEmail: string; userName: string }) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date())
  const [isExpanded, setIsExpanded] = React.useState(false)
  const activityDataRef = React.useRef<Map<string, any>>(new Map())

  // Generate consistent activity data for a date
  const generateActivityForDate = (date: Date) => {
    const dateKey = date.toDateString()
    
    if (activityDataRef.current.has(dateKey)) {
      return activityDataRef.current.get(dateKey)
    }

    // Simulate activity duration and times for the current user
    const isActive = Math.random() > 0.2 // 80% chance of being active on a given day
    const activity = isActive ? {
      userName,
      userEmail,
      startTime: `${(8 + Math.floor(Math.random() * 8)).toString().padStart(2, '0')}:00`, // 8 AM to 4 PM start
      endTime: `${Math.min(18, 8 + Math.floor(Math.random() * 8) + 4 + Math.floor(Math.random() * 6)).toString().padStart(2, '0')}:00`, // End by 6 PM max
      duration: Math.round((4 + Math.random() * 6) * 10) / 10, // 4-10 hours
      steps: Math.floor(5000 + Math.random() * 10000), // 5k-15k steps
      heartRate: Math.floor(60 + Math.random() * 40), // 60-100 BPM average
      active: true
    } : null

    activityDataRef.current.set(dateKey, activity)
    return activity
  }

  // Get activity for a date (uses cached data)
  const getDetailedActivityForDate = (date: Date) => {
    return generateActivityForDate(date)
  }

  const modifiers = {
    high: (date: Date) => {
      const activity = generateActivityForDate(date)
      return activity && activity.steps >= 12000 // High activity: 12k+ steps
    },
    medium: (date: Date) => {
      const activity = generateActivityForDate(date)
      return activity && activity.steps >= 8000 && activity.steps < 12000 // Medium: 8k-12k steps
    },
    low: (date: Date) => {
      const activity = generateActivityForDate(date)
      return activity && activity.steps < 8000 // Low: <8k steps
    },
  }

  const modifiersStyles = {
    high: {
      backgroundColor: 'hsl(var(--success))',
      color: 'white',
      fontWeight: 'bold',
    },
    medium: {
      backgroundColor: 'hsl(var(--warning))',
      color: 'white',
    },
    low: {
      backgroundColor: 'hsl(var(--destructive))',
      color: 'white',
    },
  }

  const selectedDateActivity = selectedDate ? getDetailedActivityForDate(selectedDate) : null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-card-foreground">Personal Activity Calendar</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-medium text-[hsl(var(--primary))] hover:underline"
        >
          {isExpanded ? 'Collapse' : 'Expand Details'}
        </button>
      </div>

      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={setSelectedDate}
        modifiers={modifiers}
        modifiersStyles={modifiersStyles}
        className="rounded-md border-0"
      />

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(var(--success))' }}></div>
          <span>High Activity (12k+ steps)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(var(--warning))' }}></div>
          <span>Medium Activity (8k-12k steps)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(var(--destructive))' }}></div>
          <span>Low Activity (&lt;8k steps)</span>
        </div>
      </div>

      {selectedDate && (
        <div className="text-center p-3 bg-secondary/50 rounded-lg">
          <p className="text-sm font-medium">
            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          {selectedDateActivity ? (
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Active: {selectedDateActivity.startTime} - {selectedDateActivity.endTime} ({selectedDateActivity.duration}h)</p>
              <p>{selectedDateActivity.steps.toLocaleString()} steps • {selectedDateActivity.heartRate} BPM avg</p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No activity recorded</p>
          )}
        </div>
      )}

      {isExpanded && selectedDate && selectedDateActivity && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold text-card-foreground mb-3">Activity Details</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
                  {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-card-foreground">{userName}</p>
                  <p className="text-xs text-muted-foreground">{userEmail}</p>
                </div>
              </div>
              <div className="text-right text-xs">
                <p className="font-medium">{selectedDateActivity.startTime} - {selectedDateActivity.endTime}</p>
                <p className="text-muted-foreground">{selectedDateActivity.duration} hours active</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-secondary/30 rounded-lg">
                <p className="text-lg font-bold text-card-foreground">{selectedDateActivity.steps.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Steps</p>
              </div>
              <div className="p-3 bg-secondary/30 rounded-lg">
                <p className="text-lg font-bold text-card-foreground">{selectedDateActivity.heartRate}</p>
                <p className="text-xs text-muted-foreground">Avg Heart Rate</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}