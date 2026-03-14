# Employee Notification Ratings Tab - Feature Documentation

## Overview
Added a new **Notifications** tab on the Employee Detail page that displays employee rating points, tracks progress toward the maximum rating threshold, and notifies employees when they earn the 5% wellness incentive.

## Features

### 1. **Notification Ratings Panel** (`notification-ratings-panel.tsx`)
A comprehensive component that displays:

#### Key Metrics
- **Total Points Earned**: Shows the cumulative rating points accumulated by the employee
- **Points Needed**: Displays remaining points to reach the maximum (250 points)
- **Incentive Earned**: Shows the wellness incentive percentage (0% or 5%)

#### Progress Visualization
- Visual progress bar showing percentage toward maximum points (0-100%)
- Color-coded rating levels with star ratings

#### Rating Levels Breakdown
- ⭐ **Beginner**: 0-24 points
- ⭐⭐ **Fair**: 25-74 points
- ⭐⭐⭐ **Good**: 75-149 points
- ⭐⭐⭐⭐ **Very Good**: 150-199 points
- ⭐⭐⭐⭐⭐ **Excellent**: 250+ points → **Unlocks 5% Wellness Incentive**

#### Incentive Explanation Card
Detailed breakdown of what the 5% wellness incentive includes:
- 5% increased wellness allowance
- Priority access to health programs
- Recognition in company wellness rankings
- Automatic intensity level increase for enhanced tracking

#### Recent Ratings
- Shows the 10 most recent awarded points in reverse chronological order
- Displays:
  - Points awarded
  - Reason for award
  - Who awarded the points
  - Date of award

#### Milestone Alert
- 🎉 Green notification banner appears when employee reaches 250 points
- Auto-dismisses after 5 seconds
- Celebrates achievement of maximum rating

### 2. **Integration with Employee Detail Page**
Updated `employee-detail.tsx` with tabbed navigation:

#### Tab Structure
- **Suggestions Tab**: Contains wellness suggestions and active health alerts
- **Notifications Tab**: New section showing the `NotificationRatingsPanel` component

#### Navigation
- Clean tab interface with icons (Lightbulb for Suggestions, Bell for Notifications)
- Smooth switching between tabs to organize employee information

## Implementation Details

### Constants
- `MAX_RATING_POINTS`: 250 (threshold for maximum rating)
- `INCENTIVE_PERCENTAGE`: 5% (bonus earned at maximum)

### Functions
- `calculateRatingMetrics()`: Determines rating level, progress percentage, and incentive status
- `getEmployeeRatings()`: Retrieves all ratings for an employee
- `getTotalRatingPoints()`: Calculates total points earned

### State Management
- Uses React hooks (`useState`, `useEffect`) to manage ratings and metrics
- Real-time synchronization with rating data

## User Experience

### For Employees
1. Employees can visit their detail page and click the **Notifications** tab
2. See their current rating progress with a visual progress bar
3. Understand what rating levels they've achieved
4. View recent points awarded
5. Get clarity on how to reach 250 points for the 5% incentive
6. Receive automatic celebration when hitting the milestone

### For Administrators (in Ratings Panel)
- Existing ratings system in the Ratings panel automatically triggers notifications
- When awarding 250+ cumulative points:
  - Milestone alert displays on employee detail page
  - Notifications are sent
  - Intensity level automatically increases by 5%

## Data Flow

```
Rating Awarded → getTotalRatingPoints() → calculateRatingMetrics() 
→ NotificationRatingsPanel updates → Visual feedback to employee
→ Milestone alert (if 250+ points) → incentive unlocked
```

## Integration Points

### Files Modified
1. `components/employee-detail.tsx`
   - Added import for `NotificationRatingsPanel` and `Tabs` components
   - Added state for active tab
   - Added tab navigation with 2 tabs
   - Reorganized suggestions content into Suggestions tab

### Files Created
1. `components/notification-ratings-panel.tsx`
   - Complete standalone component for rating notifications

### Existing Integration
- Uses existing `getEmployeeRatings()` from `lib/health-data.ts`
- Uses existing `getTotalRatingPoints()` from `lib/health-data.ts`
- Works seamlessly with existing ratings system

## Styling
- Consistent with application design system
- Color-coded progress and status badges
- Responsive grid layout for metrics (1 column mobile, 3 columns desktop)
- Green accent for incentive information
- Purple for Excellent rating level

## Future Enhancements
Potential improvements:
- Email notifications when reaching 250 points
- Historical milestone tracking
- Annual reset of rating points
- Comparative rankings with other employees
- Custom incentive tiers
- Downloadable incentive certificate
