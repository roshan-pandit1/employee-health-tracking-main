"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import {
  LayoutDashboard,
  Users,
  Bell,
  Activity,
  Watch,
  Heart,
  Star,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getAllAlerts, getEmployees } from "@/lib/health-data"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/employees", label: "Employees", icon: Users },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/suggestions", label: "Suggestions", icon: Heart },
  { href: "/ratings", label: "Ratings", icon: Star, adminOnly: true },
  { href: "/month", label: "Month Cycle", icon: Heart, adminOnly: true },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [criticalCount, setCriticalCount] = useState(0)
  const [userEmail, setUserEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const alerts = getAllAlerts()
    const count = alerts.filter((a) => a.severity === "critical").length
    setCriticalCount(count)
    
    // Get user email from localStorage
    const email = localStorage.getItem('userEmail') || 'admin@xyz-corp.com'
    setUserEmail(email)

    // Set display name based on email
    const adminEmails = ['admin@gmail.com', 'admin@xyz-corp.com']
    const isAdminEmail = adminEmails.includes(email)
    setIsAdmin(isAdminEmail)

    if (isAdminEmail) {
      setDisplayName('Admin User')
    } else {
      // Find employee by email to get their actual name
      const employees = getEmployees()
      const employee = employees.find(emp => emp.email === email)
      
      if (employee) {
        setDisplayName(employee.name)
      } else {
        // Fallback for demo users not in static data
        const nameFromEmail = email.replace('@gmail.com', '').replace(/(\w)(\w*)/g, (g0, g1, g2) => g1.toUpperCase() + g2.toLowerCase())
        setDisplayName(nameFromEmail || 'Employee')
      }
    }
  }, [])

  const visibleNavItems = isAdmin
    ? navItems
    : navItems.filter((item) => item.label !== "Employees" && !item.adminOnly)

  return (
    <aside className="flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[hsl(var(--primary))]">
          <Heart className="h-5 w-5 text-[hsl(var(--primary-foreground))]" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-[hsl(var(--sidebar-accent-foreground))]">XYZ HealthPulse</h1>
          <p className="text-xs text-sidebar-foreground/60">Employee Wellness</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
          Overview
        </p>
        {visibleNavItems.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-[hsl(var(--sidebar-primary))]"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
              {item.label === "Alerts" && criticalCount > 0 && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[hsl(var(--destructive))] px-1.5 text-[10px] font-bold text-[hsl(var(--destructive-foreground))]">
                  {criticalCount}
                </span>
              )}
            </Link>
          )
        })}

        <div className="my-4 border-t border-sidebar-border" />

        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
          Integrations
        </p>
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/60">
          <Watch className="h-4 w-4" />
          <span>Smartwatch API</span>
          <span className="ml-auto h-2 w-2 rounded-full bg-[hsl(var(--success))]" />
        </div>
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/60">
          <Activity className="h-4 w-4" />
          <span>Health Analytics</span>
          <span className="ml-auto h-2 w-2 rounded-full bg-[hsl(var(--success))]" />
        </div>
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-accent-foreground truncate">{displayName}</p>
            <p className="text-xs text-sidebar-foreground/50 truncate">{userEmail}</p>
          </div>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userEmail');
            window.location.href = '/login';
          }}
          className="w-full rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          Logout
        </button>
      </div>
    </aside>
  )
}
