# Auto Track — Smart Automatic Expense Tracker

## 📌 Project Overview
**Auto Track** is a smart, automated real-time expense tracking ecosystem. It instantly detects UPI/Bank transactions made on an Android mobile device, pops up a 0-delay confirmation card over active apps (GPay, PhonePe, Paytm, CRED), and syncs data to a central cloud database and visual web dashboard.

---

## 🎯 Core Requirements & User Preferences

1. **Platforms**: 
   - **Android Mobile Application**: Background transaction detection + instant floating overlay window.
   - **Web Application Dashboard**: Visual analytics, spending graphs, monthly trends, EMI management, and CSV export.
2. **Instant Transaction Capture**:
   - Detect payments made across **all UPI apps** (GPay, PhonePe, Paytm, CRED, BHIM, etc.) and bank SMS/notifications.
   - **0-delay, 100% reliability**: Must not miss transactions or introduce delayed popups.
3. **Floating Overlay Modal**:
   - Displays a floating dialog card (`SYSTEM_ALERT_WINDOW`) directly over the screen upon payment completion.
   - User quickly inputs/confirms: **Amount**, **Category** (Food, Fuel, Shopping, Bills, etc.), **Paid From** (Account/Card), **Notes / Recipient**, and taps **Save**.
4. **Cost Constraint**:
   - **100% Free ($0 Cost)**: Utilizes open-source tools and free tier cloud services forever.
5. **Privacy & Battery Guarantee**:
   - Service filters specifically for UPI app package names (`com.google.android.apps.nfc.phone`, `com.phonepe.app`, `net.one97.paytm`).
   - Completely idle when using non-financial apps (WhatsApp, YouTube, Instagram, etc.).
   - Balance checks (e.g. "Account Balance: ₹X") are ignored; only confirmed debit transactions trigger popups.
6. **Zero Authentication Overhead & Strict Vault Privacy**:
   - **Onboarding Name & SMS Vault Code**: During mobile onboarding, the user enters their **Full Name** (e.g. *"Anas"*). The unique Vault Code is delivered strictly via SMS to their mobile number and **is never displayed inside mobile or web UI screens**.
   - **Default Unpaired/Logged Out Web State**: Opening the web app defaults to the **Sync Code Lock Screen** (`SyncPromptScreen`).
   - **Vault Unlock & Privacy Badge**: Entering the SMS Vault Code unlocks the dashboard. On Desktop Header, it renders a privacy-first **`🔒 Private Vault`** badge instead of printing the raw code.
   - **Explicit Logout Controls**:
     - **Laptop/Desktop Header**: Features a **`Log Out`** button next to `Log Transaction`.
     - **Mobile Web Menu**: Features a **`Log Out & Lock Vault`** action in the floating navigation drawer.
     - Tapping **Log Out** immediately clears the session and returns to the Lock Screen.

---

## 📱 Mobile & Desktop UX Architecture & Recent Innovations

### 1. Unified Navigation & Header Architecture
* **Header**: Simplified header displaying brand identity only (`SpendPulse - Automated Personal Financial Dashboard`).
* **Fixed Navigation Header Bar (Laptop/Desktop)**: Top navigation header is fixed (`fixed top-0 left-0 right-0 z-40 bg-[#090d16]/95 backdrop-blur-xl`) with integrated navigation tabs (`Financial Overview`, `Ledger`, `Budgets`, `EMIs & Loans`, `Settings`, `Log Transaction`).
* **Mobile Bottom Navigation (Active-Only Color Highlight)**: Floating navigation bar (`MobileBottomNav.jsx`) with active-only emerald color scheme highlighting, keeping inactive tabs subtle.

### 2. Spending Intelligence (Interactive Category Donut Chart)
* **Timeframe Modes**: 4 quick-switch modes: **Daily** (default), **Monthly**, **Yearly**, and **Custom** (Date Range Picker).
* **Category Breakdown Sector Control**: Sized container to display exactly 5 categories cleanly before enabling smooth internal vertical scroll (`max-h-[285px] overflow-y-auto`).
* **Center Donut Hole Overlay**: Native SVG center hole displaying Category Name, Income (`+₹...`), and Expense (`-₹...`) when hovering or tapping slices.

### 3. Ledger Tab Architecture (`TransactionLedger.jsx`)
* **Zero-Scroll Viewport Locking (Laptop & Mobile)**: Root window is locked to screen height (`h-screen h-[100dvh] overflow-hidden`) on Ledger view.
* **Internal Independent Table/List Scroll**: Transaction records scroll internally inside the container box with sticky table headers (`sticky top-0 backdrop-blur-md`). Page footer is hidden on Ledger view.
* **Action Row Mobile Grid**: Buttons (`Filter`, `Sort`, `Export CSV`) use an equal 3-column mobile grid (`grid grid-cols-3 gap-1.5`) with `min-w-0` and text truncation to prevent overflow on small screens.
* **Dynamic Filtered & Sorted CSV Export**: Exporting downloads filtered and sorted data when filters or search are active (`SpendPulse_Filtered_Ledger_YYYY-MM-DD.csv`), or full history when unfiltered (`SpendPulse_Full_Ledger_YYYY-MM-DD.csv`).
* **Auto-Closing Reset Filters**: Clicking **Reset Filters** clears all search/filters AND closes the filter dropdown panel automatically.

### 4. Categories & Budgets Module (`BudgetManager.jsx`)
* **Screen Height Locking (`h-[100dvh] overflow-hidden`)**: Root viewport locked when active tab is `budgets`, eliminating page scroll and hiding footer.
* **Exact Visible Category Count (9 on Laptop / 3 on Mobile)**:
  - **Laptop**: Exactly 9 categories visible in one frame (`sm:max-h-[530px]` for List View, `lg:max-h-[475px]` for Grid View). Scrolling down smoothly reveals the next categories.
  - **Mobile**: Exactly 3 categories visible in one frame (`max-h-[240px]` for List View, `max-h-[465px]` for Grid View). Scrolling down smoothly reveals the next categories.
* **List View & Grid View Switcher**: Default file-explorer style List View featuring folder icons, utilization percentage bars, remaining limits, health badges (`Healthy`, `80%+ Used`, `Over Budget`), alongside a toggle switcher for Grid Cards view.
* **Custom Glassmorphic Modals**: Zero native browser `alert()`/`prompt()` dialogs; uses custom responsive modals for adding, editing, and deleting categories.

### 5. EMIs & Loans Tracker (`EMILoanTracker.jsx`)
* **Debt Management Suite**: Metrics for total unpaid principal, monthly EMI outflow, active account counts, and overall payoff progress %.
* **Amortization Schedule & Payment Logging**: Interactive loan breakdown with one-click "Log EMI Paid" action and detailed monthly principal vs. interest breakdown tables.

### 6. Currency Formatting Standard
* **Single Symbol Standard (`₹`)**: Unified `formatCurrency` calls across all components to ensure single, formatted currency outputs without duplicate symbols (`+₹₹0`).

---

## 🏗️ Technical Architecture

### 1. Android Mobile App (Native Kotlin)
* **Framework**: Native Android (Kotlin) for low-level OS integration, high priority foreground service execution, and battery optimization exemption.
* **Transaction Capture Engines**:
  - `NotificationListenerService`: Intercepts system push notifications posted by UPI & Banking apps instantly (< 10ms).
  - `AccessibilityService` (Backup/Monitor): Monitors payment success confirmation screens (`TYPE_WINDOW_STATE_CHANGED`) inside UPI apps to catch transactions without push notifications (e.g. UPI Lite).
* **Overlay System**:
  - `OverlayService` utilizing `WindowManager` (`SYSTEM_ALERT_WINDOW` permission) to render a 2-step floating card over active apps.
  - **No Terminate (`X`) Button**: Ensures unlogged expenses are not lost.
  - **`Snooze (2 min)` Action**: Hides overlay, posts an ongoing notification shade item with an **`[ OPEN NOW ]`** action button, and sets a 120-second background timer/Handler to re-popup automatically until recorded.
  - **Dynamic Category Sync**: Adding a new category inside the popup updates cloud DB and web dashboard in real time.

### 2. Database & Cloud Backend (Supabase - $0 Free Tier)
* **Database**: PostgreSQL on Supabase (Free tier: 500MB DB, 50k requests/day).
* **Real-time Sync**: Instant payload push from Android app to cloud database.

### 3. Web Dashboard (React + Vite + Tailwind CSS)
* **Framework**: React with Vite & Tailwind CSS.
* **Charts & Analytics**: Recharts for Spending Intelligence Donut chart (Category breakdown with center overlay) and timeframe modes (Daily, Monthly, Yearly, Custom Range).
* **Features**: Viewport-locked Ledger tab with internal table scroll, dynamic CSV export, Budget Manager with List/Grid toggle and custom glassmorphic modals, EMI & Loan Amortization tracker, and Sync Code pairing.

---

## 📱 Mobile APK First-Time Onboarding Flow (5-Step Walkthrough)

When installing and opening the **SpendPulse Mobile App** for the very first time, the user completes a clean 5-step setup before reaching the main dashboard:

```
[ Step 1: Welcome ] ➔ [ Step 2: SMS Verification & Vault Code ] ➔ [ Step 3: Account Aggregator Bank Link ] ➔ [ Step 4: System Permissions ] ➔ [ Step 5: Dashboard ]
```

1. **Step 1: Welcome & Value Proposition Screen**:
   - Modern splash screen introducing SpendPulse: *"Zero-Manual Financial Intelligence for India."*
   - Highlights key capabilities: 100% Automatic Payment Detection, Zero-Login Privacy, and Real-Time Laptop Sync.
2. **Step 2: Mobile Verification & Vault Code SMS Generation**:
   - User enters their mobile number.
   - An SMS OTP is sent to verify ownership.
   - Upon verification, the app generates a unique **Device Vault Code** (e.g. `SP-894201`) and sends it via SMS so the user can easily type or scan it on their laptop!
3. **Step 3: Account Aggregator (AA) Bank Linking**:
   - User selects their primary bank (HDFC, SBI, ICICI, Axis, Paytm Bank, etc.).
   - Grants 1-time RBI Account Aggregator digital consent via OTP.
   - Enables zero-failure real-time tracking for every transaction (from ₹0.01 to ₹10L+).
4. **Step 4: Required Mobile System Permissions**:
   - **Notification Listener Access**: Enables reading GPay / PhonePe push notifications for instant popups.
   - **Display Over Other Apps (`SYSTEM_ALERT_WINDOW`)**: Allows the **"Payment Intercepted! Confirm & Save"** overlay modal to pop up smoothly over GPay/PhonePe right after a payment.
5. **Step 5: Main Dashboard Activated!**:
   - Onboarding completes! User lands directly on their personalized mobile financial dashboard.

---

## 📝 Session Summary & State Saved Date
- **Timestamp**: September 5, 2026
- **Status**: All features, UI bug fixes, layout viewports, mobile onboarding architecture, and code cleanups documented and saved.
