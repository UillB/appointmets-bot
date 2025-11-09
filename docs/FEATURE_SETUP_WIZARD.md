# 🎯 Setup Wizard Feature - Onboarding Flow

**Feature Branch:** `feature/setup-wizard`  
**Status:** In Development  
**Priority:** High

## 📋 Overview

Setup Wizard is an onboarding system that guides new users through the initial setup process. It provides visual indicators, step-by-step guidance, and congratulatory modals to ensure users complete essential setup steps smoothly.

## 🎯 Goals

1. **Improve User Onboarding** - Make it clear what needs to be done first
2. **Reduce Friction** - Guide users through setup with visual cues
3. **Increase Completion Rate** - Help users complete all essential steps
4. **Better UX** - Smooth, beautiful, and intuitive interface

## 🔍 Core Requirements

### Initial State Detection

The system checks for three critical setup items:

1. **Services** - User has no services (what they sell)
2. **Bot Connection** - Telegram bot is not connected/activated
3. **Admin Linking** - Telegram admin account is not linked

### Dashboard Banners

On the Dashboard page, display three separate banner blocks that indicate required actions:

#### Banner 1: Services Missing
- **Condition:** `services.length === 0`
- **Message:** "You currently have no services (what you sell). Create them now - this is necessary to start working and takes just one minute."
- **Action Button:** "Create Service" → Opens ServiceDialog
- **Visual:** Light blinking/pulsing animation to draw attention

#### Banner 2: Bot Not Connected
- **Condition:** `botActive === false`
- **Message:** "Your bot is not connected. Please connect your bot to share it with people and start receiving appointments today."
- **Action Button:** "Connect Bot" → Navigates to Bot Management page (Instructions tab)
- **Visual:** Light blinking/pulsing animation

#### Banner 3: Admin Not Linked
- **Condition:** `adminLinked === false`
- **Message:** "Your Telegram admin is not linked. Link it now to give your account admin rights and capabilities such as accessing the management system (admin panel) from Telegram, etc."
- **Action Button:** "Link Admin" → Navigates to Bot Management page (Link Admin tab)
- **Visual:** Light blinking/pulsing animation

### Success Modals

After completing each step, show a congratulatory modal with next steps:

#### Modal 1: Service Created
- **Trigger:** After successful service creation
- **Message:** "Congratulations! Services are ready. You're one step away from starting work. Now please activate your bot."
- **Action Button:** "Activate Bot" → Navigates to Bot Management (Instructions tab, auto-selected)
- **Visual:** Success icon, green theme

#### Modal 2: Bot Activated
- **Trigger:** After successful bot activation
- **Message:** "Great job! Everything is almost done. Now link your admin account (this can be done later, but this step is optional yet important)."
- **Action Button:** "Link Admin" → Navigates to Bot Management (Link Admin tab, auto-selected)
- **Secondary Action:** "Maybe Later" → Closes modal
- **Visual:** Success icon, green theme

#### Modal 3: Admin Linked
- **Trigger:** After successful admin linking
- **Message:** "Perfect! Your setup is complete. You're all set to start receiving appointments."
- **Action Button:** "Get Started" → Closes modal, shows dashboard
- **Visual:** Success icon, celebration theme

## 🎨 UI/UX Requirements

### Banner Design
- **Position:** Top of Dashboard page, below header
- **Style:** Card-based design with subtle shadow
- **Animation:** Gentle pulsing/blinking effect (opacity 0.9 → 1.0, 2s cycle)
- **Colors:**
  - Background: `bg-amber-50 dark:bg-amber-900/20`
  - Border: `border-amber-200 dark:border-amber-800`
  - Text: `text-amber-900 dark:text-amber-100`
- **Icons:** Use Lucide icons (AlertCircle, Bot, UserCheck)
- **Responsive:** Stack vertically on mobile, horizontal on desktop

### Modal Design
- **Component:** Use shadcn/ui Dialog component
- **Style:** Centered, medium size
- **Animation:** Smooth fade-in and scale
- **Colors:**
  - Success: Green theme (`bg-emerald-50`, `text-emerald-900`)
  - Icons: Large success checkmark
- **Actions:** Primary button (emphasized), secondary button (outline)

### State Management
- Use React state to track:
  - Services count
  - Bot active status
  - Admin linked status
- Listen to WebSocket events for real-time updates
- Check state on Dashboard mount and after actions

## 🔧 Technical Implementation

### Files to Create/Modify

#### New Files:
1. `admin-panel-react/src/components/SetupWizard.tsx` - Main wizard component
2. `admin-panel-react/src/components/SetupBanner.tsx` - Individual banner component
3. `admin-panel-react/src/components/SetupSuccessModal.tsx` - Success modal component
4. `admin-panel-react/src/hooks/useSetupWizard.ts` - Setup state hook

#### Files to Modify:
1. `admin-panel-react/src/components/pages/Dashboard.tsx` - Add banners
2. `admin-panel-react/src/components/dialogs/ServiceDialog.tsx` - Trigger success modal
3. `admin-panel-react/src/components/pages/BotManagementPage.tsx` - Trigger success modals
4. `admin-panel-react/src/services/api.ts` - Add setup status check methods

### Implementation Steps

1. **Create Setup State Hook**
   - Check services count
   - Check bot status
   - Check admin linked status
   - Listen to WebSocket for updates

2. **Create Banner Components**
   - SetupBanner component with props (type, message, action)
   - Add pulsing animation
   - Handle click actions

3. **Create Success Modal Component**
   - SetupSuccessModal with props (step, message, actions)
   - Handle navigation
   - Auto-close after action

4. **Integrate into Dashboard**
   - Add banners section at top
   - Show only if setup incomplete
   - Hide when all steps done

5. **Add Modal Triggers**
   - ServiceDialog: Show modal after creation
   - BotManagementPage: Show modal after activation
   - BotManagementPage: Show modal after admin linking

6. **Add Navigation Logic**
   - Navigate to Bot Management with tab selection
   - Auto-select correct tab
   - Scroll to relevant section

## 📊 Success Criteria

- [ ] Banners appear on Dashboard when setup incomplete
- [ ] Banners have smooth pulsing animation
- [ ] Clicking banner actions navigates correctly
- [ ] Success modals appear after each step
- [ ] Modals have correct messages and actions
- [ ] Navigation works correctly (tabs auto-selected)
- [ ] All text in English
- [ ] Responsive design (mobile + desktop)
- [ ] Dark theme support
- [ ] WebSocket updates work in real-time

## 🌐 Localization

**Important:** All text must be in English initially. Can be extended to support i18n later.

## 🎯 User Flow

1. **New User Login** → Dashboard shows 3 banners
2. **Click "Create Service"** → ServiceDialog opens
3. **Create Service** → Success modal appears: "Activate bot"
4. **Click "Activate Bot"** → Navigate to Bot Management (Instructions tab)
5. **Activate Bot** → Success modal appears: "Link admin"
6. **Click "Link Admin"** → Navigate to Bot Management (Link Admin tab)
7. **Link Admin** → Success modal appears: "Setup complete"
8. **Click "Get Started"** → Dashboard shows normal view (no banners)

## 🔄 Edge Cases

- User creates service but deletes it → Banner reappears
- Bot activated but then stopped → Banner reappears
- Admin linked but then unlinked → Banner reappears
- Multiple services created → Service banner disappears
- All steps complete → Banners hidden, normal dashboard

## 📝 Notes

- Banners should be dismissible (optional "Dismiss" button for each)
- Modals should not be intrusive (can be closed with X)
- Animation should be subtle (not annoying)
- All actions should be smooth and fast
- Consider adding progress indicator (Step 1/3, Step 2/3, etc.)

---

**Created:** January 18, 2025  
**Last Updated:** January 18, 2025

