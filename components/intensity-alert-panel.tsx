"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, Check, Trash2, CheckCircle2 } from "lucide-react"

export interface IntensityAlert {
  id: string
  employeeId: string
  previousIntensity: number
  newIntensity: number
  increaseAmount: number
  percentage: number
  reason: string
  timestamp: string
  read: boolean
  adminMessage?: string
}

export function IntensityAlertPanel({ employeeId }: { employeeId: string }) {
  const [alerts, setAlerts] = useState<IntensityAlert[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Load alerts from localStorage
  useEffect(() => {
    loadAlerts()
  }, [employeeId])

  // Update unread count
  useEffect(() => {
    const unread = alerts.filter((a) => !a.read).length
    setUnreadCount(unread)
  }, [alerts])

  const loadAlerts = () => {
    try {
      const saved = localStorage.getItem(`intensity_alerts_${employeeId}`)
      if (saved) {
        setAlerts(JSON.parse(saved))
      }
    } catch (error) {
      console.error("Error loading alerts:", error)
    }
  }

  const saveAlerts = (newAlerts: IntensityAlert[]) => {
    try {
      localStorage.setItem(`intensity_alerts_${employeeId}`, JSON.stringify(newAlerts))
      setAlerts(newAlerts)
    } catch (error) {
      console.error("Error saving alerts:", error)
    }
  }

  const markAsRead = (alertId: string) => {
    const updated = alerts.map((a) => (a.id === alertId ? { ...a, read: true } : a))
    saveAlerts(updated)
  }

  const markAllAsRead = () => {
    const updated = alerts.map((a) => ({ ...a, read: true }))
    saveAlerts(updated)
  }

  const deleteAlert = (alertId: string) => {
    const updated = alerts.filter((a) => a.id !== alertId)
    saveAlerts(updated)
  }

  const deleteAll = () => {
    saveAlerts([])
  }

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Intensity Increase Notifications
          </CardTitle>
          <CardDescription>You receive alerts when your wellness intensity is increased</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No notifications yet. Keep up the great work!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Intensity Increase Notifications
              {unreadCount > 0 && <Badge variant="destructive">{unreadCount} new</Badge>}
            </CardTitle>
            <CardDescription>Your wellness intensity has been increased by admin</CardDescription>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-3 pr-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border transition ${
                  alert.read
                    ? "bg-secondary/20 border-border"
                    : "bg-primary/5 border-primary/30 shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <h4 className="font-semibold text-foreground">Wellness Intensity Increased! 🎉</h4>
                      {!alert.read && <Badge variant="default" className="ml-auto">New</Badge>}
                    </div>

                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Previous</p>
                          <p className="font-semibold text-foreground">{alert.previousIntensity}%</p>
                        </div>
                        <div className="flex items-center justify-center">
                          <span className="text-lg">→</span>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">New</p>
                          <p className="font-semibold text-green-600">{alert.newIntensity}%</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t">
                        <Badge variant="outline" className="bg-green-50">
                          +{alert.increaseAmount}% ({alert.percentage}%)
                        </Badge>
                        <p className="text-xs text-muted-foreground">increase</p>
                      </div>

                      {alert.adminMessage && (
                        <div className="mt-2 p-2 bg-card rounded text-sm text-foreground border border-border">
                          "<em>{alert.adminMessage}</em>"
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground pt-2">
                        Reason: <span className="font-medium">{alert.reason}</span>
                      </p>

                      <p className="text-[10px] text-muted-foreground/60">
                        {new Date(alert.timestamp).toLocaleDateString()} at{" "}
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    {!alert.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(alert.id)}
                        title="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAlert(alert.id)}
                      className="text-muted-foreground hover:text-destructive"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {alerts.length > 0 && (
          <Button variant="ghost" size="sm" onClick={deleteAll} className="w-full mt-3 text-muted-foreground">
            Clear all notifications
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

// Function to create and save intensity increase alert
export function createIntensityAlert(
  employeeId: string,
  previousIntensity: number,
  newIntensity: number,
  reason: string = "Consistent high performance",
  adminMessage?: string
) {
  try {
    const increasedBy = newIntensity - previousIntensity
    const percentage = Math.round((increasedBy / previousIntensity) * 100)

    const alert: IntensityAlert = {
      id: `${Date.now()}_${Math.random()}`,
      employeeId,
      previousIntensity,
      newIntensity,
      increaseAmount: increasedBy,
      percentage,
      reason,
      timestamp: new Date().toISOString(),
      read: false,
      adminMessage,
    }

    // Load existing alerts
    const existing = localStorage.getItem(`intensity_alerts_${employeeId}`)
    const alerts = existing ? JSON.parse(existing) : []

    // Add new alert
    alerts.push(alert)

    // Save back
    localStorage.setItem(`intensity_alerts_${employeeId}`, JSON.stringify(alerts))

    return alert
  } catch (error) {
    console.error("Error creating intensity alert:", error)
    return null
  }
}
