"use client"

import { useState, useEffect } from "react"
import { AppShell } from "@/components/app-shell"
import { DashboardOverview } from "@/components/dashboard-overview"
import { EmployeeDashboard } from "@/components/employee-dashboard"
import { LoginCheck } from "@/components/login-check"

export default function Page() {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail') || ''
    // Admin emails
    const adminEmails = ['admin@gmail.com', 'admin@xyz-corp.com']
    setIsAdmin(adminEmails.includes(userEmail))
  }, [])

  return (
    <LoginCheck>
      <AppShell>
        {isAdmin ? <DashboardOverview /> : <EmployeeDashboard />}
      </AppShell>
    </LoginCheck>
  )
}
