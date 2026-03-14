"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Bell, 
  Trash2, 
  Check, 
  X,
  AlertCircle,
  CheckCircle2,
  Info,
  AlertTriangle,
  Zap
} from "lucide-react"
import { 
  loadNotifications, 
  markAsRead, 
  deleteNotification, 
  markAllAsRead,
  type Notification 
} from "@/lib/notifications"

const notificationIcons: Record<string, React.ElementType> = {
  milestone: CheckCircle2,
  intensity_increase: Zap,
  rating: Bell,
  alert: AlertTriangle,
  achievement: CheckCircle2,
}

const notificationColors: Record<string, string> = {
  info: "bg-blue-50 border-blue-200",
  success: "bg-green-50 border-green-200",
  warning: "bg-yellow-50 border-yellow-200",
  critical: "bg-red-50 border-red-200",
}

const severityBadgeColors: Record<string, string> = {
  info: "bg-blue-100 text-blue-800",
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  critical: "bg-red-100 text-red-800",
}

export function NotificationPanel({ employeeId }: { employeeId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const loadAndDisplay = () => {
      const loaded = loadNotifications(employeeId)
      const sorted = [...loaded].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      setNotifications(sorted)
      setUnreadCount(sorted.filter(n => !n.read).length)
    }

    loadAndDisplay()
    // Refresh every 5 seconds to catch new notifications
    const interval = setInterval(loadAndDisplay, 5000)
    return () => clearInterval(interval)
  }, [employeeId])

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead(employeeId, notificationId)
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const handleDelete = (notificationId: string) => {
    deleteNotification(employeeId, notificationId)
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead(employeeId)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  if (notifications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">No notifications yet</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="rounded-full">
                {unreadCount}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs"
            >
              Mark all as read
            </Button>
          )}
        </div>
        <CardDescription>
          {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-3">
            {notifications.map((notification) => {
              const Icon = notificationIcons[notification.type] || Bell
              return (
                <div
                  key={notification.id}
                  className={`border rounded-lg p-4 transition-all ${
                    notificationColors[notification.severity]
                  } ${!notification.read ? "ring-2 ring-offset-2 ring-blue-400" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{notification.title}</h4>
                        <Badge className={severityBadgeColors[notification.severity]} variant="outline">
                          {notification.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-card-foreground leading-relaxed mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                      {notification.blockchainHash && (
                        <p className="text-[10px] text-muted-foreground font-mono mt-2 opacity-60">
                          Hash: {notification.blockchainHash}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(notification.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
