import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, AlertTriangle, User, Zap, Calendar } from "lucide-react"
import { getEmployees, type Employee } from "@/lib/health-data"

interface RestSuggestion {
  employee: Employee
  restDays: number
  restType: 'power-nap' | 'rest' | 'vacation'
  reason: string
  priority: 'high' | 'medium' | 'low'
  efficiency: number
  restWindow: string
  healthMetrics: {
    fatigueLevel: string
    stressLevel: string
    sleepQuality: string
  }
}

function calculateRestSuggestions(employees: Employee[]): RestSuggestion[] {
  return employees
    .map(employee => {
      const fatigue = employee.fatigue.score
      const stress = employee.vitals.stressLevel
      const sleep = employee.vitals.sleepHours || 0
      const burnout = employee.burnout?.score || 0
      const sleepQuality = employee.vitals.sleepQuality || 0

      let restDays = 0
      let restType: 'power-nap' | 'rest' | 'vacation' = 'rest'
      let reason = ''
      let priority: 'high' | 'medium' | 'low' = 'low'
      let restWindow = ''

      // Determine health metric descriptors
      const getFatigueLevel = (score: number): string => {
        if (score > 75) return 'Critical'
        if (score > 60) return 'High'
        if (score > 45) return 'Moderate'
        return 'Low'
      }

      const getStressLevel = (score: number): string => {
        if (score > 70) return 'Critical'
        if (score > 55) return 'Elevated'
        if (score > 40) return 'Moderate'
        return 'Normal'
      }

      const getSleepQuality = (hours: number, quality: number): string => {
        if (hours < 5 || quality < 40) return 'Poor'
        if (hours < 6.5 || quality < 60) return 'Fair'
        if (hours < 7.5 || quality < 80) return 'Good'
        return 'Excellent'
      }

      // Critical cases - need immediate vacation
      if (fatigue > 78 || burnout > 78 || (fatigue > 70 && stress > 70 && sleep < 5)) {
        restDays = 7
        restType = 'vacation'
        reason = 'Critical burnout and fatigue require extended time off'
        priority = 'high'
        restWindow = `URGENT: Schedule a 1-week vacation immediately to prevent health crisis`
      }
      // High priority cases - need rest week
      else if (fatigue > 65 || (fatigue > 55 && stress > 65) || (burnout > 65 && sleep < 6)) {
        restDays = 4
        restType = 'rest'
        reason = 'High fatigue with elevated stress and poor sleep'
        priority = 'high'
        restWindow = `Take 4 days off within the next 1-2 weeks to recover`
      }
      // Medium priority cases - rest days
      else if (fatigue > 50 || (stress > 60 && sleep < 7) || (burnout > 50)) {
        restDays = 2
        restType = 'rest'
        reason = 'Elevated fatigue and stress requiring rest days'
        priority = 'medium'
        restWindow = `Plan 2 rest days within the next 3-5 days`
      }
      // Low priority cases - power nap
      else if (fatigue > 35 || stress > 50 || sleep < 7.5) {
        restDays = 1
        restType = 'power-nap'
        reason = 'Moderate fatigue suggesting a quick recovery needed'
        priority = 'low'
        restWindow = `Take a 20-30 minute power nap or light break today`
      }

      // Calculate a simple efficiency score (higher = better)
      const combinedLoad = (fatigue + burnout) / 2
      const efficiency = Math.max(0, Math.min(100, 100 - Math.round(combinedLoad)))

      return {
        employee,
        restDays,
        restType,
        reason,
        priority,
        efficiency,
        restWindow,
        healthMetrics: {
          fatigueLevel: getFatigueLevel(fatigue),
          stressLevel: getStressLevel(stress),
          sleepQuality: getSleepQuality(sleep, sleepQuality)
        }
      }
    })
    .filter(suggestion => suggestion.restDays > 0)
    .sort((a, b) => {
      // Sort by priority (high first) then by rest days
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      const restTypeOrder = { vacation: 3, rest: 2, 'power-nap': 1 }
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      if (priorityDiff !== 0) return priorityDiff
      const restTypeDiff = restTypeOrder[b.restType] - restTypeOrder[a.restType]
      if (restTypeDiff !== 0) return restTypeDiff
      return b.restDays - a.restDays
    })
}

export function RestSuggestions({ userEmail }: { userEmail?: string }) {
  const employees = getEmployees()
  const suggestions = calculateRestSuggestions(employees)
  
  // Filter suggestions based on context:
  // - If userEmail provided: show only that user's suggestions (employee view)
  // - If no userEmail: show all suggestions (admin/manager view)
  const filteredSuggestions = userEmail 
    ? suggestions.filter((suggestion) => suggestion.employee.email === userEmail)
    : suggestions  // Show all suggestions for admin view

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4" />
      case 'medium': return <Clock className="h-4 w-4" />
      case 'low': return <User className="h-4 w-4" />
      default: return <User className="h-4 w-4" />
    }
  }

  const getRestTypeIcon = (restType: string) => {
    switch (restType) {
      case 'vacation': return <Calendar className="h-5 w-5 text-red-500" />
      case 'rest': return <Clock className="h-5 w-5 text-yellow-500" />
      case 'power-nap': return <Zap className="h-5 w-5 text-blue-500" />
      default: return <Clock className="h-5 w-5" />
    }
  }

  const getRestTypeBadgeStyle = (restType: string) => {
    switch (restType) {
      case 'vacation': return 'bg-red-100 text-red-800 border-red-200'
      case 'rest': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'power-nap': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Rest Suggestions
        </CardTitle>
        <CardDescription>
          Personalized recommendations based on fatigue, stress, sleep quality and burnout levels
        </CardDescription>
      </CardHeader>
      <CardContent>
        {filteredSuggestions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No employees currently require additional rest.</p>
            <p className="text-sm">
              Keep monitoring fatigue, stress, and sleep metrics to proactively support your team.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSuggestions.map((suggestion, index) => (
              <div
                key={suggestion.employee.id}
                className="flex items-start gap-4 p-4 border border-border rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground flex-shrink-0">
                  {suggestion.employee.avatar}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h4 className="font-medium text-card-foreground">
                      {suggestion.employee.name}
                    </h4>
                    <Badge
                      variant="outline"
                      className={`text-xs ${getPriorityColor(suggestion.priority)}`}
                    >
                      {getPriorityIcon(suggestion.priority)}
                      <span className="ml-1 capitalize">{suggestion.priority} Priority</span>
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-xs ${getRestTypeBadgeStyle(suggestion.restType)}`}
                    >
                      {getRestTypeIcon(suggestion.restType)}
                      <span className="ml-1 capitalize font-semibold">
                        {suggestion.restType === 'power-nap' ? 'Power Nap' : suggestion.restType.charAt(0).toUpperCase() + suggestion.restType.slice(1)}
                      </span>
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-2">
                    {suggestion.employee.role} • {suggestion.employee.department}
                  </p>

                  <p className="text-sm font-medium text-card-foreground mb-3 p-2 bg-secondary/40 rounded">
                    {suggestion.reason}
                  </p>

                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="p-2 bg-secondary/20 rounded text-center">
                      <p className="text-xs text-muted-foreground">Fatigue</p>
                      <p className="font-semibold text-card-foreground">{suggestion.healthMetrics.fatigueLevel}</p>
                      <p className="text-xs text-muted-foreground">{suggestion.employee.fatigue.score}%</p>
                    </div>
                    <div className="p-2 bg-secondary/20 rounded text-center">
                      <p className="text-xs text-muted-foreground">Stress</p>
                      <p className="font-semibold text-card-foreground">{suggestion.healthMetrics.stressLevel}</p>
                      <p className="text-xs text-muted-foreground">{suggestion.employee.vitals.stressLevel}%</p>
                    </div>
                    <div className="p-2 bg-secondary/20 rounded text-center">
                      <p className="text-xs text-muted-foreground">Sleep</p>
                      <p className="font-semibold text-card-foreground">{suggestion.healthMetrics.sleepQuality}</p>
                      <p className="text-xs text-muted-foreground">{suggestion.employee.vitals.sleepHours}h</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2 font-medium">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{suggestion.restDays} day{suggestion.restDays > 1 ? 's' : ''}</span>
                      </div>

                      <div className="text-muted-foreground">
                        Efficiency: {suggestion.efficiency}%
                      </div>
                    </div>

                    {suggestion.restWindow && (
                      <p className="text-xs font-semibold text-card-foreground bg-secondary/30 p-2 rounded border-l-2 border-[hsl(var(--primary))]">
                        ⚠️ {suggestion.restWindow}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-secondary/30 rounded-lg">
          <h5 className="font-medium text-card-foreground mb-2">Rest Type Guidelines:</h5>
          <div className="text-sm text-muted-foreground space-y-1.5">
            <div className="flex gap-2">
              <Zap className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-medium">Power Nap (20-30 min):</span> Quick recovery for moderate fatigue
              </div>
            </div>
            <div className="flex gap-2">
              <Clock className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-medium">Rest Days (2-4 days):</span> Time off to recover from elevated stress
              </div>
            </div>
            <div className="flex gap-2">
              <Calendar className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-medium">Vacation (7+ days):</span> Extended break for critical burnout
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}