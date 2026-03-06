

## Scheduling Engine — Premium Dark Infrastructure UI

### Phase 1: Foundation & Core Screens

**Design System Setup**
- Dark theme with `#0F172A` background, `#1E293B` card surfaces, `#334155` borders
- Accent palette: Electric Blue `#3B82F6`, Success `#10B981`, Error `#F43F5E`, Warning `#F59E0B`
- Small border radius (6–8px), no gradients, no heavy shadows
- Clean monospace typography for data, Inter-style sans-serif for UI
- Status badge system (pending, running, completed, failed, cancelled)

**Layout Shell**
- Desktop: Fixed left sidebar with clean icons and minimal labels (Dashboard, Schedules, Organization, Members, API Keys)
- Mobile: Bottom navigation bar with the same 5 sections
- Floating action button on mobile for "New Schedule"

**Authentication Screen**
- Minimal dark login page with email/password fields
- Clean, centered card layout, no distractions

**Dashboard (Control Center)**
- Top-level stats cards: Active Schedules, Executed Today, Failed Today, Skipped Today
- Minimal execution rate chart (per-minute line/bar chart using recharts)
- Recent activity feed showing latest executions
- All data is mock/hardcoded

**Schedules List**
- Table view (desktop) / card list (mobile) with: status badge, truncated webhook URL, next run (UTC), retry count, created by, created at
- Filter by status, search by ID or URL
- Row actions: Resend, Duplicate, Delete
- Soft borders, color-coded status indicators

**Schedule Details**
- Metadata panel with all schedule fields
- Formatted JSON payload viewer (monospace, scrollable)
- Execution logs list with status, duration, execution type
- Action buttons: Resend, Duplicate, Delete

### Phase 2: Supporting Screens

**Trash (Recycle Bin)**
- List of last 50 deleted schedules
- Restore and permanent delete options
- Minimal table/card layout

**Organization Settings**
- Organization name, owner display
- Quota usage progress bar
- API Keys summary
- Plan summary card (visual only)

**Members Management**
- Members list with email, role badge, status
- Add member dialog with role selector
- Remove member action

**API Keys Page**
- Keys list with masked preview, created at, last used, status badge
- Create new key and revoke key actions
- Security-focused monospace styling

