"use client"

import { AppShell } from "@/components/app-shell"
import { RatingsContent } from "@/components/ratings-content"
import { LoginCheck } from "@/components/login-check"

export default function RatingsPage() {
  return (
    <LoginCheck>
      <AppShell>
        <RatingsContent />
      </AppShell>
    </LoginCheck>
  )
}
