"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, Circle, Plus, Trash2, Edit2, Calendar, TrendingUp, Award } from "lucide-react"

export interface Habit {
  id: string
  name: string
  category: "add" | "leave"
  description: string
  color: string
  createdDate: string
  completionDates: string[] // ISO dates
}

const PREDEFINED_HABITS = {
  add: [
    { name: "Morning Walk", category: "add" as const, description: "30 mins of morning walk", color: "bg-green-100 text-green-800" },
    { name: "Drink Water", category: "add" as const, description: "Drink 8 glasses of water daily", color: "bg-blue-100 text-blue-800" },
    { name: "Meditation", category: "add" as const, description: "10 mins daily meditation", color: "bg-purple-100 text-purple-800" },
    { name: "Exercise", category: "add" as const, description: "30 mins of physical activity", color: "bg-orange-100 text-orange-800" },
    { name: "Reading", category: "add" as const, description: "Read for 20 mins", color: "bg-indigo-100 text-indigo-800" },
  ],
  leave: [
    { name: "Smoking", category: "leave" as const, description: "Quit smoking completely", color: "bg-red-100 text-red-800" },
    { name: "Junk Food", category: "leave" as const, description: "Avoid processed & fast food", color: "bg-pink-100 text-pink-800" },
    { name: "Late Night Scrolling", category: "leave" as const, description: "No screen 1 hour before bed", color: "bg-yellow-100 text-yellow-800" },
    { name: "Alcohol", category: "leave" as const, description: "Reduce/eliminate alcohol", color: "bg-amber-100 text-amber-800" },
    { name: "Sugary Drinks", category: "leave" as const, description: "Cut out sugary beverages", color: "bg-rose-100 text-rose-800" },
  ],
}

export function HabitTracker({ employeeId }: { employeeId: string }) {
  const [habits, setHabits] = useState<Habit[]>([])
  const [newHabitName, setNewHabitName] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"overview" | "add" | "leave">("overview")

  // Load habits from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`habits_${employeeId}`)
    if (saved) {
      setHabits(JSON.parse(saved))
    }
  }, [employeeId])

  // Save habits to localStorage
  useEffect(() => {
    localStorage.setItem(`habits_${employeeId}`, JSON.stringify(habits))
  }, [habits, employeeId])

  const addHabitFromPredefined = (predefined: (typeof PREDEFINED_HABITS.add[0] | typeof PREDEFINED_HABITS.leave[0])) => {
    const newHabit: Habit = {
      id: `${Date.now()}_${Math.random()}`,
      name: predefined.name,
      category: predefined.category,
      description: predefined.description,
      color: predefined.color,
      createdDate: new Date().toISOString().split("T")[0],
      completionDates: [],
    }
    setHabits([...habits, newHabit])
  }

  const addCustomHabit = (category: "add" | "leave") => {
    if (!newHabitName.trim()) return
    const newHabit: Habit = {
      id: `${Date.now()}_${Math.random()}`,
      name: newHabitName,
      category,
      description: `Custom ${category} habit`,
      color: category === "add" ? "bg-cyan-100 text-cyan-800" : "bg-gray-100 text-gray-800",
      createdDate: new Date().toISOString().split("T")[0],
      completionDates: [],
    }
    setHabits([...habits, newHabit])
    setNewHabitName("")
  }

  const toggleHabitCompletion = (habitId: string, date: string) => {
    setHabits(
      habits.map((h) => {
        if (h.id === habitId) {
          const completionDates = h.completionDates.includes(date)
            ? h.completionDates.filter((d) => d !== date)
            : [...h.completionDates, date]
          return { ...h, completionDates }
        }
        return h
      })
    )
  }

  const deleteHabit = (habitId: string) => {
    setHabits(habits.filter((h) => h.id !== habitId))
  }

  const getHabitStats = (habit: Habit) => {
    const today = new Date()
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
    const completionRate = Math.round((habit.completionDates.length / daysInMonth) * 100)
    const currentStreak = calculateStreak(habit.completionDates)
    return { completionRate, currentStreak }
  }

  const calculateStreak = (dates: string[]): number => {
    if (dates.length === 0) return 0
    const sortedDates = [...dates].sort().reverse()
    let streak = 0
    const today = new Date().toISOString().split("T")[0]

    for (let i = 0; i < sortedDates.length; i++) {
      const expectedDate = new Date()
      expectedDate.setDate(expectedDate.getDate() - i)
      const expectedDateStr = expectedDate.toISOString().split("T")[0]

      if (sortedDates[i] === expectedDateStr) {
        streak++
      } else {
        break
      }
    }
    return streak
  }

  const renderCalendar = (habit: Habit) => {
    const today = new Date()
    const monthDays = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay()

    const days = []
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }
    for (let i = 1; i <= monthDays; i++) {
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`
      days.push(dateStr)
    }

    return (
      <div className="grid grid-cols-7 gap-1 mt-3">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-xs font-semibold text-center text-muted-foreground p-1">
            {d}
          </div>
        ))}
        {days.map((date, idx) => (
          <button
            key={idx}
            onClick={() => date && toggleHabitCompletion(habit.id, date)}
            className={`aspect-square text-xs font-medium rounded flex items-center justify-center transition ${
              date === null
                ? "bg-transparent"
                : habit.completionDates.includes(date)
                  ? `${habit.color} cursor-pointer`
                  : "bg-secondary hover:bg-secondary/80 cursor-pointer"
            }`}
            disabled={!date}
          >
            {date ? (new Date(date).getDate() % 10) : ""}
          </button>
        ))}
      </div>
    )
  }

  const addHabits = habits.filter((h) => h.category === "add")
  const leaveHabits = habits.filter((h) => h.category === "leave")

  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "overview" | "add" | "leave")} className="space-y-4">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="add">Habits to Add ({addHabits.length})</TabsTrigger>
        <TabsTrigger value="leave">Habits to Leave ({leaveHabits.length})</TabsTrigger>
      </TabsList>

      {/* Overview Tab */}
      <TabsContent value="overview" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Your Habits Progress
            </CardTitle>
            <CardDescription>Track your daily habit completion and build streaks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {habits.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No habits yet. Add habits to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {habits.map((habit) => {
                  const { completionRate, currentStreak } = getHabitStats(habit)
                  return (
                    <div key={habit.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-foreground">{habit.name}</h4>
                          <p className="text-sm text-muted-foreground">{habit.description}</p>
                        </div>
                        <Badge className={habit.color}>{habit.category === "add" ? "✨ Add" : "❌ Leave"}</Badge>
                      </div>

                      <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="font-medium">{completionRate}% Completed</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-orange-500" />
                          <span className="font-medium">{currentStreak} day streak</span>
                        </div>
                      </div>

                      {renderCalendar(habit)}

                      <div className="flex gap-2 pt-2 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteHabit(habit.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Add Habits Tab */}
      <TabsContent value="add" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Add Good Habits</CardTitle>
            <CardDescription>Build positive habits for better health and wellness</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {addHabits.length > 0 && (
              <div className="space-y-3 mb-6 pb-6 border-b">
                <h4 className="font-semibold text-sm">Your Active Habits</h4>
                {addHabits.map((habit) => {
                  const { completionRate } = getHabitStats(habit)
                  return (
                    <div key={habit.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{habit.name}</p>
                        <p className="text-xs text-muted-foreground">{completionRate}% completed this month</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => deleteHabit(habit.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Suggested Habits</h4>
              {PREDEFINED_HABITS.add.map((pred) => (
                <div
                  key={pred.name}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-secondary/50"
                >
                  <div>
                    <p className="font-medium">{pred.name}</p>
                    <p className="text-xs text-muted-foreground">{pred.description}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => addHabitFromPredefined(pred)}
                    disabled={addHabits.some((h) => h.name === pred.name)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t space-y-3">
              <h4 className="font-semibold text-sm">Add Custom Habit</h4>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter habit name..."
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addCustomHabit("add")}
                />
                <Button onClick={() => addCustomHabit("add")}>Add</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Leave Habits Tab */}
      <TabsContent value="leave" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Break Bad Habits</CardTitle>
            <CardDescription>Habits to reduce or eliminate for better health</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {leaveHabits.length > 0 && (
              <div className="space-y-3 mb-6 pb-6 border-b">
                <h4 className="font-semibold text-sm">Your Habits to Leave</h4>
                {leaveHabits.map((habit) => {
                  const { completionRate } = getHabitStats(habit)
                  return (
                    <div key={habit.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{habit.name}</p>
                        <p className="text-xs text-muted-foreground">{completionRate}% days abstained</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => deleteHabit(habit.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Common Bad Habits</h4>
              {PREDEFINED_HABITS.leave.map((pred) => (
                <div
                  key={pred.name}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-secondary/50"
                >
                  <div>
                    <p className="font-medium">{pred.name}</p>
                    <p className="text-xs text-muted-foreground">{pred.description}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => addHabitFromPredefined(pred)}
                    disabled={leaveHabits.some((h) => h.name === pred.name)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t space-y-3">
              <h4 className="font-semibold text-sm">Add Custom Habit to Leave</h4>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter habit to leave..."
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addCustomHabit("leave")}
                />
                <Button onClick={() => addCustomHabit("leave")}>Add</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
