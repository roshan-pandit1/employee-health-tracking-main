// Notification System - Immutable notification records with timestamps
// Implements blockchain-style transparency for all events

export interface Notification {
  id: string
  employeeId: string
  type: "milestone" | "intensity_increase" | "rating" | "alert" | "achievement"
  title: string
  message: string
  severity: "info" | "success" | "warning" | "critical"
  timestamp: string
  read: boolean
  data?: Record<string, any>
  blockchainHash?: string // For verification/transparency
}

// Generate deterministic hash for notification (blockchain-style)
function generateNotificationHash(notification: Omit<Notification, 'blockchainHash'>): string {
  const hashInput = `${notification.id}${notification.employeeId}${notification.timestamp}${notification.type}`
  let hash = 0
  for (let i = 0; i < hashInput.length; i++) {
    const char = hashInput.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0')
}

// Create a new notification
export function createNotification(
  employeeId: string,
  type: Notification["type"],
  title: string,
  message: string,
  severity: Notification["severity"],
  data?: Record<string, any>
): Notification {
  const notificationBase: Omit<Notification, 'blockchainHash'> = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    employeeId,
    type,
    title,
    message,
    severity,
    timestamp: new Date().toISOString(),
    read: false,
    data
  }

  return {
    ...notificationBase,
    blockchainHash: generateNotificationHash(notificationBase)
  }
}

// Save notifications to localStorage
export function saveNotifications(employeeId: string, notifications: Notification[]): void {
  const key = `notifications_${employeeId}`
  try {
    localStorage.setItem(key, JSON.stringify(notifications))
  } catch (error) {
    console.error("Failed to save notifications:", error)
  }
}

// Load notifications from localStorage
export function loadNotifications(employeeId: string): Notification[] {
  const key = `notifications_${employeeId}`
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error("Failed to load notifications:", error)
    return []
  }
}

// Add a new notification
export function addNotification(
  employeeId: string,
  type: Notification["type"],
  title: string,
  message: string,
  severity: Notification["severity"],
  data?: Record<string, any>
): Notification {
  const notifications = loadNotifications(employeeId)
  const newNotification = createNotification(employeeId, type, title, message, severity, data)
  notifications.push(newNotification)
  saveNotifications(employeeId, notifications)
  return newNotification
}

// Get unread notification count
export function getUnreadCount(employeeId: string): number {
  const notifications = loadNotifications(employeeId)
  return notifications.filter(n => !n.read).length
}

// Mark notification as read
export function markAsRead(employeeId: string, notificationId: string): void {
  const notifications = loadNotifications(employeeId)
  const updated = notifications.map(n =>
    n.id === notificationId ? { ...n, read: true } : n
  )
  saveNotifications(employeeId, updated)
}

// Mark all as read
export function markAllAsRead(employeeId: string): void {
  const notifications = loadNotifications(employeeId)
  const updated = notifications.map(n => ({ ...n, read: true }))
  saveNotifications(employeeId, updated)
}

// Delete notification
export function deleteNotification(employeeId: string, notificationId: string): void {
  const notifications = loadNotifications(employeeId)
  const updated = notifications.filter(n => n.id !== notificationId)
  saveNotifications(employeeId, updated)
}

// Get notifications by type
export function getNotificationsByType(employeeId: string, type: Notification["type"]): Notification[] {
  const notifications = loadNotifications(employeeId)
  return notifications.filter(n => n.type === type)
}

// Get recent notifications (last 7 days)
export function getRecentNotifications(employeeId: string, days: number = 7): Notification[] {
  const notifications = loadNotifications(employeeId)
  const cutoffTime = new Date()
  cutoffTime.setDate(cutoffTime.getDate() - days)
  
  return notifications.filter(n => new Date(n.timestamp) > cutoffTime)
}

// Milestone reached notification
export function notifyMilestoneReached(
  employeeId: string,
  points: number,
  maxPoints: number
): Notification {
  return addNotification(
    employeeId,
    "milestone",
    "🏆 Milestone Reached!",
    `Congratulations! You've earned ${points} points out of ${maxPoints} maximum. Outstanding performance!`,
    "success",
    { points, maxPoints, percentage: (points / maxPoints) * 100 }
  )
}

// Intensity increase notification
export function notifyIntensityIncrease(
  employeeId: string,
  previousIntensity: number,
  newIntensity: number
): Notification {
  const increasePercentage = ((newIntensity - previousIntensity) / previousIntensity) * 100
  return addNotification(
    employeeId,
    "intensity_increase",
    "📈 Wellness Intensity Increased",
    `Your wellness program intensity has been increased by ${increasePercentage.toFixed(1)}% from ${previousIntensity}% to ${newIntensity}%. You're crushing your health goals!`,
    "success",
    { previousIntensity, newIntensity, increasePercentage }
  )
}

// Rating received notification
export function notifyRatingReceived(
  employeeId: string,
  points: number,
  reason: string
): Notification {
  return addNotification(
    employeeId,
    "rating",
    "⭐ Rating Awarded",
    `You received ${points} points for: "${reason}"`,
    "info",
    { points, reason }
  )
}

// Performance alert notification
export function notifyPerformanceAlert(
  employeeId: string,
  message: string,
  severity: "warning" | "critical" = "warning"
): Notification {
  return addNotification(
    employeeId,
    "alert",
    severity === "critical" ? "🚨 Critical Alert" : "⚠️ Performance Alert",
    message,
    severity === "critical" ? "critical" : "warning",
    { severity }
  )
}

// Achievement notification
export function notifyAchievement(
  employeeId: string,
  title: string,
  description: string
): Notification {
  return addNotification(
    employeeId,
    "achievement",
    `🎉 ${title}`,
    description,
    "success"
  )
}
