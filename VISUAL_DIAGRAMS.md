# Visual Architecture & Flow Diagrams

## Feature Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                 Employee Detail Page                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           Tab Navigation                                 │   │
│  │  ┌─────────────────────┬──────────────────────────────┐  │   │
│  │  │ 💡 Suggestions      │ 🔔 Notifications            │  │   │
│  │  └─────────────────────┴──────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │   Suggestions Tab Content                                │   │
│  │   ├─ Wellness Suggestions                                │   │
│  │   └─ Active Alerts                                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │   Notifications Tab Content                              │   │
│  │   (NotificationRatingsPanel Component)                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## NotificationRatingsPanel Component Structure

```
┌─────────────────────────────────────────────────────────────────┐
│             NotificationRatingsPanel                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. MILESTONE ALERT (shown when points >= 250)                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 🎉 Congratulations! You've reached maximum points        │   │
│  │    You've earned a 5% wellness incentive!                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  2. MAIN RATING CARD                                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 🏆 Your Rating Points                                    │   │
│  │                                                           │   │
│  │  ┌──────────┬──────────┬──────────┐                      │   │
│  │  │  Total   │  Needed  │ Incentive│                      │   │
│  │  │  Points  │  Points  │  Earned  │                      │   │
│  │  │   250    │    0     │  +5%     │                      │   │
│  │  └──────────┴──────────┴──────────┘                      │   │
│  │                                                           │   │
│  │  Progress Bar: [████████████████████] 100%               │   │
│  │                                                           │   │
│  │  Rating Levels:                                          │   │
│  │  ⭐ Beginner (0-24)                                      │   │
│  │  ⭐⭐ Fair (25-74)                                        │   │
│  │  ⭐⭐⭐ Good (75-149)                                     │   │
│  │  ⭐⭐⭐⭐ Very Good (150-199)                             │   │
│  │  ⭐⭐⭐⭐⭐ Excellent (250+) → 5% Incentive               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  3. INCENTIVE CARD (Green)                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 🎁 5% Wellness Incentive                                 │   │
│  │                                                           │   │
│  │ When you reach 250 points, you unlock:                   │   │
│  │ ✓ 5% increased wellness allowance                        │   │
│  │ ✓ Priority access to health programs                     │   │
│  │ ✓ Recognition in company wellness rankings               │   │
│  │ ✓ Automatic intensity level increase                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  4. RECENT RATINGS                                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Recent Rating Notifications                              │   │
│  │                                                           │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │ +50  "Great wellness initiative"                    │  │   │
│  │  │      Awarded by Admin · 12/25/2025                  │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │                                                           │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │ +40  "Consistent exercise routine"                  │  │   │
│  │  │      Awarded by HR · 12/20/2025                    │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │                                                           │   │
│  │  ... (Last 10 awards shown) ...                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                     Start: Employee Views Detail Page             │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│              User Clicks "Notifications" Tab                       │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│      NotificationRatingsPanel Component Mounts                     │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│           useEffect Hook Triggered (on mount)                     │
└────────────────────────┬─────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
┌───────────────┐  ┌──────────────┐  ┌──────────────────────┐
│ getEmployee   │  │ getEmployee  │  │ Load Saved Milestone │
│ Ratings()     │  │ RatingPoints │  │ Status From Storage  │
└───────────────┘  └──────────────┘  └──────────────────────┘
        │                ▼
        └────────────────┬────────────────────────┐
                         ▼                        │
            ┌─────────────────────────┐           │
            │ calculateRatingMetrics()│           │
            │ ┌────────────────────┐  │           │
            │ │ - totalPoints      │  │           │
            │ │ - percentage       │  │           │
            │ │ - level (rating)   │  │           │
            │ │ - status           │  │           │
            │ │ - hasReachedMax    │  │           │
            │ │ - earnedIncentive  │  │           │
            │ └────────────────────┘  │           │
            └─────────────────────────┘           │
                         │                        │
                         ▼                        │
        ┌────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────────────┐
│            Set State with Metrics & Ratings                       │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│        Check if hasReachedMax (>= 250 points)                     │
└────────────────────────┬─────────────────────────────────────────┘
                         │
           ┌─────────────┴──────────────┐
           │                            │
         YES                           NO
           │                            │
           ▼                            ▼
    ┌─────────────────┐         ┌────────────────┐
    │ Set showAlert=  │         │ No alert shown │
    │ true            │         │                │
    │                 │         └────────────────┘
    │ Start 5sec      │
    │ timer to hide   │                │
    │                 │                │
    └────────┬────────┘                │
             │                         │
             └─────────────┬───────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │      Render Component with Data       │
        │                                      │
        │  - Milestone Alert (if applicable)   │
        │  - Rating metrics display            │
        │  - Progress bar (0-100%)             │
        │  - Rating levels explanation         │
        │  - Incentive information             │
        │  - Recent ratings (last 10)          │
        └──────────────────────────────────────┘
```

---

## Rating Progression Example

```
BEGINNER JOURNEY (0 → 250 points)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Day 1: 0 Points
┌─────────────────┐
│ Status: No Rating│  Progress: [                    ] 0%
│ 0 / 250         │  Incentive: Not Earned
└─────────────────┘

Day 10: 50 Points
┌─────────────────┐
│ Status: ⭐ Beg  │  Progress: [████                ] 20%
│ 50 / 250        │  Incentive: Not Earned
│ Keep going!     │
└─────────────────┘

Month 1: 150 Points
┌─────────────────┐
│ Status: ⭐⭐⭐ │  Progress: [████████████        ] 60%
│ 150 / 250       │  Incentive: Not Earned
│ Doing great!    │
└─────────────────┘

Month 3: 200 Points
┌─────────────────┐
│ Status: ⭐⭐⭐⭐│  Progress: [█████████████████   ] 80%
│ 200 / 250       │  Incentive: Almost there!
│ Almost there!   │
└─────────────────┘

Month 4: 250 Points 🎉
┌─────────────────┐
│ Status:         │  Progress: [██████████████████] 100%
│ ⭐⭐⭐⭐⭐     │  Incentive: ✓ 5% Earned!
│ 250 / 250       │
│ EXCELLENT!      │  [CELEBRATION ALERT SHOWN]
└─────────────────┘
```

---

## Component Integration Flowchart

```
    ┌─────────────────────────────────────────────────┐
    │     Employee Detail Page                         │
    │     (components/employee-detail.tsx)             │
    └────────────────────┬────────────────────────────┘
                         │
          ┌──────────────┴──────────────┐
          │                             │
          ▼                             ▼
    ┌──────────────┐           ┌────────────────────┐
    │Vital Cards   │           │Tabs Container      │
    │- Heart Rate │           │                    │
    │- Steps      │           │┌──────────────────┐│
    │- Sleep      │           ││Tab Navigation    ││
    │- Stress     │           │├──────────────────┤│
    └──────────────┘           ││Suggestions | ⚠   ││
                               │└──────────────────┘│
    ┌──────────────┐           │                    │
    │Fatigue &     │           │ Suggestions Tab:   │
    │Burnout Panel │           │ - Wellness Tips    │
    │              │           │ - Active Alerts    │
    └──────────────┘           │                    │
                               │ Notifications Tab: │
    ┌──────────────┐           │ - Rating Points    │
    │Charts &      │           │ - Progress        │
    │Analytics     │           │ - Incentive Info  │
    │              │           │ - Recent Awards   │
    └──────────────┘           │                    │
                               │ (Uses: Component  │
    ┌──────────────┐           │ notification-    │
    │HabitTracker  │           │ ratings-panel.tsx)│
    │              │           └────────────────────┘
    └──────────────┘
```

---

## Algorithm: calculateRatingMetrics()

```
Input: totalPoints (integer)

┌─ Check Points Range ─────────────────────────────┐
│                                                   │
│  if (totalPoints >= 250)  ──→  ⭐⭐⭐⭐⭐ Excellent
│  else if (totalPoints >= 200) ──→  ⭐⭐⭐⭐ Very Good
│  else if (totalPoints >= 150) ──→  ⭐⭐⭐ Good
│  else if (totalPoints >= 75)  ──→  ⭐⭐ Fair
│  else if (totalPoints > 0)    ──→  ⭐ Beginner
│  else                         ──→  No Rating Yet
│                                                   │
└─────────────────────────────────────────────────┘
         │
         ▼
┌─ Assign Color ───────────────────────────────────┐
│                                                   │
│  Orange  (Beginner)  ──→  bg-orange-100             │
│  Yellow  (Fair)      ──→  bg-yellow-100             │
│  Blue    (Good)      ──→  bg-blue-100               │
│  Green   (Very Good) ──→  bg-green-100              │
│  Purple  (Excellent) ──→  bg-purple-100             │
│                                                   │
└─────────────────────────────────────────────────┘
         │
         ▼
┌─ Calculate Percentage ────────────────────────────┐
│                                                   │
│  percentage = Math.min(100, (totalPoints / 250) * 100)
│  // Caps at 100% for 250+ points                │
│                                                   │
└─────────────────────────────────────────────────┘
         │
         ▼
┌─ Determine Incentive Status ──────────────────────┐
│                                                   │
│  if (totalPoints >= 250)                         │
│    earnedIncentive = true                        │
│    hasReachedMax = true                          │
│  else                                            │
│    earnedIncentive = false                       │
│    hasReachedMax = false                         │
│                                                   │
└─────────────────────────────────────────────────┘
         │
         ▼
    Output: RatingMetrics {
      totalPoints,
      percentage,
      level,
      status,
      color,
      hasReachedMax,
      earnedIncentive
    }
```

---

## Storage & State Management

```
localStorage
├── ratings_{employeeId}
│   └── EmployeeRating[]
│       ├── employeeId
│       ├── points
│       ├── reason
│       ├── awardedAt
│       └── awardedBy
│
└── intensity_{employeeId}
    └── number (current intensity level)

Component State
├── [ratings] → EmployeeRating[]
├── [metrics] → RatingMetrics
└── [showMilestoneAlert] → boolean
```

---

## User Interaction Flow

```
Employee Workflow
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Navigate
   Employees → Click Profile Card

2. View Details
   See health metrics, suggestions, alerts

3. Explore Notifications
   Click "Notifications" Tab (🔔)

4. Understand Progress
   ├─ See total points earned
   ├─ See points needed
   ├─ View rating level
   ├─ Check incentive status
   └─ Read award history

5. Get Motivated
   ├─ Understand rating levels
   ├─ See incentive benefits
   ├─ Review recent achievements
   └─ Plan next steps

6. Receive Recognition
   When reaching 250 points:
   └─ See celebration alert 🎉
   └─ Unlock 5% incentive
   └─ Get notification


Admin Workflow
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Awards Points
   Ratings → Select Employee → Award Points + Reason

2. System Validates
   ML Analysis checks for anomalies

3. Points Saved
   localStorage updated

4. Notifications Trigger
   If 250+: Milestone alert sent

5. Employee Notified
   Notifications tab shows update
   Milestone celebration appears
   Intensity auto-increases 5%
```

---

## Performance & Data Size

```
Component Overhead
╔════════════════════════════════════╗
║ File Size: ~310 lines (~12KB)      ║
║ JS Bundle Impact: Minimal          ║
║ Re-render Triggers: 2              ║
║  - Component mount                 ║
║  - Employee ID change              ║
║ State Objects: 3 (small)           ║
║ localStorage Reads: O(1)           ║
║ Point Calculation: O(n) where n=   ║
║  number of ratings (usually < 100)║
╚════════════════════════════════════╝
```

---

## Responsive Layout Breakdown

```
MOBILE (< 640px)
┌─────────────────────────────┐
│ Total Points: 250           │
├─────────────────────────────┤
│ Points Needed: 0            │
├─────────────────────────────┤
│ Incentive: +5% ✓            │
└─────────────────────────────┘
│ Progress: [...] 100%        │
└─────────────────────────────┘

TABLET (640px - 1024px)
┌──────────────────┬───────────────────┐
│ Total: 250       │ Needed: 0         │
├──────────────────┼───────────────────┤
│                  │                   │
│ Incentive: +5% ✓ │ [Progress Bar...] │
│                  │ 100%              │
└──────────────────┴───────────────────┘

DESKTOP (> 1024px)
┌──────────────────┬─────────────────┬──────────────────┐
│ Total Points     │ Points Needed   │ Incentive        │
│ 250              │ 0               │ +5% ✓            │
├──────────────────┴─────────────────┴──────────────────┤
│ Progress: [████████████████████████] 100%             │
└──────────────────────────────────────────────────────┘
```

