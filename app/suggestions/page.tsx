 "use client"

import { useEffect, useState } from "react"
import { Lightbulb } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { RestSuggestions } from "@/components/rest-suggestions"
import { LoginCheck } from "@/components/login-check"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const ADMIN_EMAILS = ["admin@gmail.com", "admin@xyz-corp.com"]

const ADMIN_SUGGESTIONS_POOL: string[] = [
  "Review employees with consistently high fatigue and schedule 1:1 check-ins this week.",
  "Encourage teams to block focus time and avoid late-evening meetings to reduce burnout.",
  "Promote a company-wide step challenge to motivate more daily movement.",
  "Share a short guide on sleep hygiene in the next internal newsletter.",
  "Identify employees with low activity and suggest optional stretch or walk breaks during long meetings.",
  "Review workload distribution for teams with elevated stress scores and consider rebalancing tasks.",
  "Offer flexible working hours for teams showing poor sleep and high fatigue trends.",
  "Recognize and appreciate teams maintaining healthy metrics to reinforce positive habits.",
]

export default function SuggestionsPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminSuggestions, setAdminSuggestions] = useState<string[]>([])

  useEffect(() => {
    const email = localStorage.getItem("userEmail")
    setUserEmail(email)

    if (email && ADMIN_EMAILS.includes(email)) {
      setIsAdmin(true)

      // Pick a random subset of admin suggestions (e.g., 3)
      const shuffled = [...ADMIN_SUGGESTIONS_POOL].sort(() => Math.random() - 0.5)
      setAdminSuggestions(shuffled.slice(0, 3))
    } else {
      setIsAdmin(false)
      setAdminSuggestions([])
    }
  }, [])

  return (
    <LoginCheck>
      <AppShell>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold text-foreground text-balance">
                Rest Suggestions Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                Personalized recommendations on when to take rest and how it impacts your efficiency, based on your latest health metrics.
              </p>
            </div>
          </div>

          {/* Admin-only random suggestions */}
          {isAdmin && adminSuggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Admin Wellness Actions
                </CardTitle>
                <CardDescription>
                  Randomized suggestions to help you support employee health across the organization.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {adminSuggestions.map((suggestion, index) => (
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

          {/* Rest Suggestions */}
          {isAdmin ? (
            // Admins see all employee rest suggestions
            <RestSuggestions />
          ) : userEmail ? (
            // Employees see only their own suggestions
            <RestSuggestions userEmail={userEmail} />
          ) : null}
        </div>
      </AppShell>
    </LoginCheck>
  )
}