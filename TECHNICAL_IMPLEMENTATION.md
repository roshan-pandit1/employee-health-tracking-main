# Technical Implementation Guide - Notification Ratings Tab

## Architecture Overview

```
Employee Detail Page (employee-detail.tsx)
├── Tabs Navigation
│   ├── Suggestions Tab
│   │   ├── Wellness Suggestions
│   │   └── Active Alerts
│   └── Notifications Tab
│       └── NotificationRatingsPanel Component
│
└── NotificationRatingsPanel (notification-ratings-panel.tsx)
    ├── Rating Metrics Calculation
    ├── Progress Display
    ├── Milestone Alert
    ├── Incentive Information
    └── Recent Ratings List
```

## Component Structure

### NotificationRatingsPanel Component

#### Props
```typescript
interface Props {
  employee: Employee
}
```

#### Internal State
```typescript
const [ratings, setRatings] = useState<EmployeeRating[]>([])
const [metrics, setMetrics] = useState<RatingMetrics>()
const [showMilestoneAlert, setShowMilestoneAlert] = useState(false)
```

#### RatingMetrics Interface
```typescript
interface RatingMetrics {
  totalPoints: number                    // Total points accumulated
  percentage: number                     // 0-100% toward max
  level: string                          // Rating level description
  status: "beginner" | "fair" | "good" | "very-good" | "excellent"
  color: string                          // Tailwind color classes
  hasReachedMax: boolean                // True if >= 250 points
  earnedIncentive: boolean               // True if >= 250 points
}
```

## Key Functions

### calculateRatingMetrics()
Converts total points into meaningful metrics.

```typescript
function calculateRatingMetrics(totalPoints: number): RatingMetrics
```

**Logic:**
- Points 0-24: "Beginner" (orange)
- Points 25-74: "Fair" (yellow)
- Points 75-149: "Good" (blue)
- Points 150-199: "Very Good" (green)
- Points 250+: "Excellent" (purple) + incentive earned

**Returns:**
- Complete metrics object with progress percentage
- Incentive status for 250+ points

### useEffect Hook
Manages data synchronization and alert display.

**Dependencies:** `employee.id`, `showMilestoneAlert`

**Behavior:**
1. Fetches fresh ratings from localStorage
2. Calculates new metrics
3. Shows milestone alert if max reached
4. Auto-hides alert after 5 seconds

## Data Flow

### On Component Mount
```
getEmployeeRatings(employeeId) 
→ getTotalRatingPoints(employeeId)
→ calculateRatingMetrics(totalPoints)
→ Set state with metrics
```

### Real-time Updates
```
Rating awarded (via Ratings panel)
→ notifyMilestoneReached() triggered
→ User navigates to Employee Detail
→ NotificationRatingsPanel mounts
→ Fetches fresh data
→ calculateRatingMetrics() updates
→ Milestone alert displays if 250+
```

## UI Components Used

| Component | Source | Purpose |
|-----------|--------|---------|
| Card | @/components/ui/card | Main container |
| Badge | @/components/ui/badge | Rating level display |
| Progress | @/components/ui/progress | Progress bar |
| Alert | @/components/ui/alert | Milestone notification |
| Icons | lucide-react | Visual indicators |

## Styling & Layout

### Color Scheme
- **Orange**: Beginner level, base state
- **Yellow**: Fair level, warning
- **Blue**: Good level, info
- **Green**: Excellent level, success & incentive
- **Purple**: Excellent rating level

### Responsive Grid
```
Mobile:  1 column (100%)
Tablet:  2 columns (50% each)
Desktop: 3 columns (33% each)

Metrics Display Grid:
- Total Points (Earned)
- Points Needed (Remaining)
- Incentive Earned (Status)
```

### Tailwind Classes
- Consistent with application design system
- `rounded-xl` for border radius
- `border-border` for consistent borders
- `bg-secondary/50` for subtle backgrounds
- `text-card-foreground` for text contrast

## Integration Points

### Data Sources
```typescript
// From lib/health-data.ts
import { 
  getEmployeeRatings,        // Get all ratings for employee
  getTotalRatingPoints,      // Sum of all points
  type Employee,
  type EmployeeRating
} from "@/lib/health-data"
```

### Employee Detail Integration
```typescript
import { NotificationRatingsPanel } from "./notification-ratings-panel"

// In EmployeeDetail component:
<Tabs value={activeTab} onValueChange={...}>
  <TabsTrigger value="notifications">
    <BellRing className="h-4 w-4" />
    Notifications
  </TabsTrigger>
</Tabs>

<TabsContent value="notifications">
  <NotificationRatingsPanel employee={employee} />
</TabsContent>
```

## Constants

```typescript
const MAX_RATING_POINTS = 250      // Threshold for max/incentive
const INCENTIVE_PERCENTAGE = 5     // Bonus percentage granted
```

## State Management Strategy

### Why Use Local State?
- Component-scoped data
- Real-time updates from existing rating system
- No need for global state management
- localStorage already handles persistence

### Data Refresh Mechanism
```typescript
useEffect(() => {
  // Re-fetch on employee ID change
  const currentRatings = getEmployeeRatings(employee.id)
  const totalPoints = getTotalRatingPoints(employee.id)
  setRatings(currentRatings)
  setMetrics(calculateRatingMetrics(totalPoints))
}, [employee.id])
```

## Performance Considerations

1. **Efficient Data Fetching**
   - Uses existing localStorage-based system
   - No network requests required
   - O(n) complexity for summing points

2. **Memoization Opportunities**
   - Could use `useMemo` for metrics calculation
   - Could use `useCallback` for alert handlers

3. **Rendering Optimization**
   - Uses `reverse()` on ratings array (creates new array)
   - Slices to 10 items: `slice(0, 10)`
   - Could be optimized with pagination

## Testing Considerations

### Unit Tests
```typescript
describe('calculateRatingMetrics', () => {
  test('Returns "Beginner" for points < 25', () => {
    const metrics = calculateRatingMetrics(20)
    expect(metrics.status).toBe('beginner')
  })
  
  test('Returns hasReachedMax=true for 250+', () => {
    const metrics = calculateRatingMetrics(250)
    expect(metrics.hasReachedMax).toBe(true)
    expect(metrics.earnedIncentive).toBe(true)
  })
})
```

### Integration Tests
```typescript
describe('NotificationRatingsPanel', () => {
  test('Displays alert when employee has 250+ points', () => {
    // Mock getEmployeeRatings to return 250+ points
    render(<NotificationRatingsPanel employee={mockEmployee} />)
    expect(screen.getByText(/Congratulations!/)).toBeInTheDocument()
  })
})
```

## Accessibility

### ARIA Labels
- Progress bar has accessible semantics
- Alert has proper role attributes
- Button labels are clear and descriptive

### Keyboard Navigation
- Tab order follows visual hierarchy
- No keyboard traps
- Clear focus indicators

### Color Contrast
- All text meets WCAG AA standards
- Not relying solely on color for status indication
- Using icons + text + color for redundancy

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Uses standard React hooks
- Tailwind CSS for styling
- No experimental Web APIs

## Error Handling

### Current Approach
- Graceful degradation if ratings fetch fails
- Empty state for "No ratings yet"
- Safe defaults for undefined data

### Potential Improvements
```typescript
try {
  const ratings = getEmployeeRatings(employee.id)
  setRatings(ratings || [])
} catch (error) {
  console.error('Failed to fetch ratings:', error)
  setRatings([])
}
```

## Future Enhancement Opportunities

1. **Caching**
   - Implement React Query for better data management
   - Cache ratings with stale-while-revalidate

2. **Real-time Updates**
   - WebSocket integration for live award notifications
   - Automatic refresh when ratings change

3. **Analytics**
   - Track milestone achievements
   - Analyze rating distribution patterns
   - Identify high-performing employees

4. **Personalization**
   - Custom incentive tiers
   - Multiple reward options
   - Gamification elements

5. **Export Features**
   - PDF milestone certificates
   - Rating history export
   - Annual summaries

## Troubleshooting

### Issue: Notifications don't appear
**Solution:** Check that employee has ratings in localStorage

### Issue: Progress bar doesn't update
**Solution:** Clear localStorage and refresh, ensure ratings are saved

### Issue: Alert doesn't auto-dismiss
**Solution:** Check setTimeout is not cleared prematurely

## Dependencies

```json
{
  "react": "^19.0.0",
  "next": "^16.1.0",
  "lucide-react": "^0.x.x",
  "tailwindcss": "^3.x.x"
}
```

