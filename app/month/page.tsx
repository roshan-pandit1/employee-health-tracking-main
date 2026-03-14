"use client"

import { AppShell } from "@/components/app-shell"
import { MonthCycleContent } from "@/components/month-cycle-content"
import { LoginCheck } from "@/components/login-check"

export default function MonthPage() {
  return (
    <LoginCheck>
      <AppShell>
        <MonthCycleContent />
      </AppShell>
    </LoginCheck>
  )
}
