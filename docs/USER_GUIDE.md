# 📖 User Guide - Appointments Bot

**Version:** 1.0.0  
**Last Updated:** January 18, 2025  
**Status:** Production Ready

## 🎯 Overview

The Appointments Bot is a comprehensive multi-tenant appointment booking system with Telegram bot integration. This guide will help you understand and use all the features of the system.

## 🚀 Getting Started

### 1. System Access

#### Admin Panel (React)
- **URL:** `https://your-domain.com`
- **Port:** 4200 (development)
- **Features:** Modern React-based admin interface

#### API Endpoints
- **Base URL:** `https://your-domain.com/api`
- **Port:** 4000 (development)
- **Documentation:** Available at `/docs/api/README.md`

### 2. Authentication

#### Login Process
1. Navigate to the admin panel
2. Enter your credentials
3. Select your organization
4. Access the dashboard

#### User Roles
- **SUPER_ADMIN:** Full system access
- **OWNER:** Organization owner
- **MANAGER:** Organization manager
- **EMPLOYEE:** Basic access

## 🏢 Organization Management

### 1. Creating an Organization

#### Step 1: Basic Information
- **Name:** Organization name
- **Description:** Brief description
- **Address:** Physical address
- **Phone:** Contact number
- **Email:** Contact email

#### Step 2: Working Hours
- **Monday-Friday:** 9:00 AM - 6:00 PM
- **Saturday:** 10:00 AM - 4:00 PM
- **Sunday:** Closed

#### Step 3: Bot Configuration
- **Telegram Bot Token:** From @BotFather
- **Bot Username:** @your_bot_username
- **Web App URL:** Admin panel URL

### 2. Managing Users

#### Adding Users
1. Go to **Users** section
2. Click **Add User**
3. Fill in user details
4. Assign role
5. Send invitation

#### User Permissions
- **View:** Read-only access
- **Edit:** Modify data
- **Delete:** Remove data
- **Admin:** Full access

## 🤖 Telegram Bot Setup

### 1. Creating a Bot

#### Step 1: Contact @BotFather
```
/start
/newbot
```

#### Step 2: Configure Bot
```
/setdescription - Set bot description
/setabouttext - Set about text
/setuserpic - Set bot picture
/setcommands - Set bot commands
```

#### Step 3: Get Bot Token
- Copy the bot token
- Add to organization settings
- Configure webhook

### 2. Bot Commands

#### Available Commands
- `/start` - Start the bot
- `/help` - Get help
- `/book` - Book an appointment
- `/cancel` - Cancel appointment
- `/schedule` - View schedule
- `/admin` - Admin panel access

#### Custom Commands
- Set organization-specific commands
- Configure command responses
- Add inline keyboards

### 3. Web App Integration

#### Telegram Web App
- **URL:** `https://your-domain.com/webapp`
- **Features:** Full admin panel in Telegram
- **Access:** Via bot menu button

#### Web App Features
- **Dashboard:** Overview of appointments
- **Calendar:** Visual appointment calendar
- **Services:** Manage services
- **Slots:** Manage time slots
- **Settings:** Organization settings

## 📅 Appointment Management

### 1. Creating Appointments

#### Step 1: Select Service
- Choose from available services
- View service details
- Check availability

#### Step 2: Choose Time Slot
- View available slots
- Select preferred time
- Confirm selection

#### Step 3: Client Information
- **Name:** Client name
- **Phone:** Contact number
- **Email:** Email address
- **Notes:** Additional notes

### 2. Managing Appointments

#### Appointment Status
- **Pending:** Awaiting confirmation
- **Confirmed:** Confirmed by client
- **Completed:** Service completed
- **Cancelled:** Cancelled by client
- **No Show:** Client didn't arrive

#### Appointment Actions
- **Edit:** Modify appointment details
- **Cancel:** Cancel appointment
- **Reschedule:** Change time/date
- **Complete:** Mark as completed

### 3. Calendar View

#### Monthly View
- See all appointments for the month
- Color-coded by status
- Quick navigation

#### Weekly View
- Detailed weekly schedule
- Time slot availability
- Drag-and-drop rescheduling

#### Daily View
- Hour-by-hour schedule
- Detailed appointment info
- Quick actions

## 🛠️ Service Management

### 1. Creating Services

#### Service Information
- **Name:** Service name
- **Description:** Service description
- **Duration:** Service duration
- **Price:** Service price
- **Category:** Service category

#### Service Settings
- **Availability:** When service is available
- **Booking Rules:** Booking restrictions
- **Requirements:** Prerequisites
- **Cancellation Policy:** Cancellation rules

### 2. Service Categories

#### Default Categories
- **Consultation:** General consultation
- **Treatment:** Medical treatment
- **Follow-up:** Follow-up appointments
- **Emergency:** Emergency services

#### Custom Categories
- Create organization-specific categories
- Set category-specific rules
- Organize services by category

## ⏰ Time Slot Management

### 1. Generating Slots

#### Automatic Generation
- **Daily:** Generate daily slots
- **Weekly:** Generate weekly slots
- **Monthly:** Generate monthly slots
- **Custom:** Custom date range

#### Slot Configuration
- **Start Time:** Earliest appointment time
- **End Time:** Latest appointment time
- **Duration:** Slot duration
- **Break Time:** Break between slots
- **Capacity:** Maximum bookings per slot

### 2. Managing Slots

#### Slot Status
- **Available:** Open for booking
- **Booked:** Already booked
- **Blocked:** Temporarily unavailable
- **Closed:** Not available

#### Slot Actions
- **Block:** Block specific slots
- **Unblock:** Make slots available
- **Delete:** Remove slots
- **Duplicate:** Copy slot patterns

## 📊 Analytics and Reporting

### 1. Dashboard Overview

#### Key Metrics
- **Total Appointments:** All-time appointments
- **Today's Appointments:** Today's schedule
- **Revenue:** Total revenue
- **Client Satisfaction:** Average rating

#### Charts and Graphs
- **Appointment Trends:** Over time
- **Service Popularity:** Most booked services
- **Revenue Analysis:** Revenue trends
- **Client Demographics:** Client analysis

### 2. Reports

#### Available Reports
- **Appointment Report:** Detailed appointment data
- **Revenue Report:** Financial analysis
- **Client Report:** Client information
- **Service Report:** Service performance

#### Report Filters
- **Date Range:** Custom date selection
- **Service:** Filter by service
- **Status:** Filter by appointment status
- **Client:** Filter by client

## 🔔 Notifications

### 1. Email Notifications

#### Notification Types
- **Appointment Confirmation:** When appointment is booked
- **Reminder:** Before appointment
- **Cancellation:** When appointment is cancelled
- **Reschedule:** When appointment is rescheduled

#### Notification Settings
- **Email Templates:** Customize email content
- **Timing:** When to send notifications
- **Recipients:** Who receives notifications
- **Format:** HTML or text format

### 2. SMS Notifications

#### SMS Features
- **Appointment Reminders:** SMS reminders
- **Confirmation:** SMS confirmations
- **Updates:** Status updates
- **Marketing:** Promotional messages

### 3. Telegram Notifications

#### Bot Notifications
- **Real-time Updates:** Instant notifications
- **Interactive:** Respond to notifications
- **Rich Media:** Images and documents
- **Group Notifications:** Team notifications

## 🌐 Multi-language Support

### 1. Supported Languages

#### Available Languages
- **English:** Default language
- **Russian:** Русский
- **Hebrew:** עברית

#### Language Features
- **Interface:** Full UI translation
- **Bot Messages:** Translated bot responses
- **Email Templates:** Localized emails
- **Date/Time:** Localized formatting

### 2. Language Configuration

#### Setting Language
- **User Preference:** Individual language setting
- **Organization Default:** Organization-wide language
- **System Default:** System-wide language
- **Auto-detect:** Automatic language detection

## 🔒 Security Features

### 1. Authentication

#### Login Security
- **Password Requirements:** Strong password policy
- **Two-Factor Authentication:** 2FA support
- **Session Management:** Secure sessions
- **Login Attempts:** Brute force protection

#### Access Control
- **Role-based Access:** Granular permissions
- **Organization Isolation:** Data separation
- **API Security:** Secure API endpoints
- **Audit Logs:** Activity tracking

### 2. Data Protection

#### Data Encryption
- **In Transit:** HTTPS/TLS encryption
- **At Rest:** Database encryption
- **Backups:** Encrypted backups
- **API:** Secure API communication

#### Privacy Features
- **GDPR Compliance:** Privacy regulations
- **Data Retention:** Automatic data cleanup
- **Consent Management:** User consent tracking
- **Right to be Forgotten:** Data deletion

## 📱 Mobile Access

### 1. Responsive Design

#### Mobile Features
- **Touch-friendly:** Mobile-optimized interface
- **Fast Loading:** Optimized for mobile
- **Offline Support:** Limited offline functionality
- **Push Notifications:** Mobile notifications

#### Progressive Web App
- **Installable:** Add to home screen
- **Offline:** Limited offline access
- **Fast:** Quick loading
- **Native-like:** App-like experience

### 2. Telegram Web App

#### Web App Features
- **Full Access:** Complete admin panel
- **Native Integration:** Telegram integration
- **Quick Access:** Easy navigation
- **Real-time:** Live updates

## 🆘 Troubleshooting

### 1. Common Issues

#### Login Problems
- **Forgot Password:** Use password reset
- **Account Locked:** Contact administrator
- **Wrong Credentials:** Check username/password
- **Session Expired:** Login again

#### Appointment Issues
- **Booking Failed:** Check availability
- **Time Conflicts:** Resolve conflicts
- **Payment Issues:** Check payment status
- **Notification Problems:** Check settings

### 2. Getting Help

#### Support Channels
- **Documentation:** This user guide
- **Help Desk:** Support tickets
- **Community:** User forums
- **Training:** Video tutorials

#### Contact Information
- **Email:** support@your-domain.com
- **Phone:** +1-XXX-XXX-XXXX
- **Chat:** Live chat support
- **Hours:** 9 AM - 6 PM EST

## 📚 Additional Resources

### 1. Documentation
- **API Documentation:** `/docs/api/README.md`
- **Developer Guide:** `/docs/development/README.md`
- **Architecture Guide:** `/docs/architecture/README.md`
- **Deployment Guide:** `/docs/PRODUCTION_DEPLOYMENT_GUIDE.md`

### 2. Training Materials
- **Video Tutorials:** Available on YouTube
- **Webinars:** Regular training sessions
- **Documentation:** Comprehensive guides
- **Examples:** Sample configurations

### 3. Community
- **Forums:** User community forums
- **Discord:** Real-time chat
- **GitHub:** Open source community
- **Blog:** Latest updates and tips

---

**🎉 Welcome to the Appointments Bot system!**

This guide should help you get started with using the system effectively. For additional support or questions, please refer to the documentation or contact our support team.
