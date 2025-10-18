# 🔌 API Documentation - Appointments Bot

This directory contains comprehensive API documentation for the Appointments Bot backend services.

## 📋 API Overview

### Base URL
```
Development: http://localhost:4000/api
Production: https://your-domain.com/api
```

### Authentication
All protected endpoints require JWT authentication via Authorization header:
```
Authorization: Bearer <jwt_token>
```

## 🔐 Authentication Endpoints

### POST /auth/login
Authenticate user and receive JWT tokens.

**Request:**
```json
{
  "email": "admin@system.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "admin@system.com",
    "name": "Admin User",
    "role": "SUPER_ADMIN",
    "organizationId": 1,
    "organization": {
      "id": 1,
      "name": "Main Organization"
    }
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST /auth/register
Register new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "organizationId": 1
}
```

### POST /auth/refresh
Refresh expired access token.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST /auth/logout
Logout user and invalidate tokens.

## 📅 Appointments Endpoints

### GET /appointments
Get paginated list of appointments with filtering.

**Query Parameters:**
- `status` - Filter by status (pending, confirmed, cancelled)
- `serviceId` - Filter by service ID
- `date` - Filter by date (YYYY-MM-DD)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 25)

**Example:**
```
GET /appointments?status=confirmed&page=1&limit=10
```

**Response:**
```json
{
  "appointments": [
    {
      "id": 1,
      "chatId": "123456789",
      "status": "confirmed",
      "createdAt": "2025-01-18T10:00:00Z",
      "service": {
        "id": 1,
        "name": "Консультация",
        "durationMin": 60
      },
      "slot": {
        "id": 1,
        "startAt": "2025-01-20T14:00:00Z",
        "endAt": "2025-01-20T15:00:00Z"
      }
    }
  ],
  "totalCount": 25,
  "currentPage": 1,
  "totalPages": 3,
  "hasNextPage": true,
  "hasPreviousPage": false
}
```

### POST /appointments
Create new appointment.

**Request:**
```json
{
  "chatId": "123456789",
  "serviceId": 1,
  "slotId": 1
}
```

### PUT /appointments/:id
Update appointment status.

**Request:**
```json
{
  "status": "confirmed"
}
```

### DELETE /appointments/:id
Cancel appointment.

## 🏢 Organizations Endpoints

### GET /organizations
Get list of organizations (role-based access).

**Response:**
```json
{
  "organizations": [
    {
      "id": 1,
      "name": "Main Organization",
      "type": "clinic",
      "avatar": "avatar-url",
      "ownerId": 1,
      "createdAt": "2025-01-18T10:00:00Z"
    }
  ],
  "isSuperAdmin": true
}
```

### POST /organizations
Create new organization.

**Request:**
```json
{
  "name": "New Organization",
  "type": "salon",
  "ownerId": 1
}
```

### PUT /organizations/:id
Update organization details.

### DELETE /organizations/:id
Delete organization.

## 🛠️ Services Endpoints

### GET /services
Get list of services with filtering.

**Query Parameters:**
- `organizationId` - Filter by organization (for SUPER_ADMIN)

**Response:**
```json
{
  "services": [
    {
      "id": 1,
      "name": "Консультация",
      "nameEn": "Consultation",
      "nameHe": "ייעוץ",
      "description": "Первичная консультация",
      "durationMin": 60,
      "price": 100.00,
      "organizationId": 1,
      "organization": {
        "id": 1,
        "name": "Main Organization"
      },
      "_count": {
        "slots": 50,
        "appointments": 10
      }
    }
  ],
  "isSuperAdmin": true
}
```

### GET /services/:id
Get specific service with slots.

**Response:**
```json
{
  "id": 1,
  "name": "Консультация",
  "slots": [
    {
      "id": 1,
      "startAt": "2025-01-20T09:00:00Z",
      "endAt": "2025-01-20T10:00:00Z",
      "capacity": 1,
      "_count": {
        "bookings": 0
      }
    }
  ]
}
```

### POST /services
Create new service.

**Request:**
```json
{
  "name": "New Service",
  "nameEn": "New Service",
  "nameHe": "שירות חדש",
  "description": "Service description",
  "durationMin": 30,
  "price": 50.00,
  "organizationId": 1
}
```

### PUT /services/:id
Update service details.

### DELETE /services/:id
Delete service.

## 📊 Slots Endpoints

### GET /slots
Get available time slots.

**Query Parameters:**
- `serviceId` - Filter by service
- `date` - Filter by date
- `available` - Show only available slots

**Response:**
```json
{
  "slots": [
    {
      "id": 1,
      "startAt": "2025-01-20T09:00:00Z",
      "endAt": "2025-01-20T10:00:00Z",
      "capacity": 1,
      "available": true,
      "service": {
        "id": 1,
        "name": "Консультация"
      }
    }
  ]
}
```

### POST /slots
Create new time slots.

**Request:**
```json
{
  "serviceId": 1,
  "startAt": "2025-01-20T09:00:00Z",
  "endAt": "2025-01-20T10:00:00Z",
  "capacity": 1
}
```

## 🌐 Web App Endpoints

### GET /webapp/calendar
Get calendar Web App interface.

**Query Parameters:**
- `serviceId` - Service ID for booking
- `lang` - Language (ru, en, he)

### GET /webapp/calendar/availability
Get availability data for calendar.

**Query Parameters:**
- `serviceId` - Service ID
- `month` - Month (1-12)
- `year` - Year

**Response:**
```json
{
  "1": { "total": 10, "available": 8 },
  "2": { "total": 10, "available": 5 },
  "3": { "total": 10, "available": 0 }
}
```

## 🔒 Authorization & Roles

### User Roles
- **SUPER_ADMIN:** Full access to all organizations and data
- **OWNER:** Full access to own organization
- **MANAGER:** Limited access to own organization

### Permission Matrix
| Endpoint | SUPER_ADMIN | OWNER | MANAGER |
|----------|-------------|-------|---------|
| GET /organizations | All | Own | Own |
| POST /organizations | ✅ | ❌ | ❌ |
| GET /services | All | Own | Own |
| POST /services | ✅ | ✅ | ❌ |
| GET /appointments | All | Own | Own |
| POST /appointments | ✅ | ✅ | ✅ |

## 📝 Error Handling

### Standard Error Response
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional error details"
}
```

### Common Error Codes
- `UNAUTHORIZED` - Invalid or missing authentication
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Invalid request data
- `INTERNAL_ERROR` - Server error

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## 🧪 Testing

### Health Check
```
GET /api/health
```

**Response:**
```json
{
  "ok": true,
  "timestamp": "2025-01-18T10:00:00Z"
}
```

### Example API Calls

#### Using curl
```bash
# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@system.com","password":"admin123"}'

# Get appointments
curl -X GET http://localhost:4000/api/appointments \
  -H "Authorization: Bearer <token>"
```

#### Using JavaScript
```javascript
// Login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@system.com',
    password: 'admin123'
  })
});

const { accessToken } = await response.json();

// Get appointments
const appointments = await fetch('/api/appointments', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});
```

## 📚 Related Documentation

- [Architecture](../architecture/) - System design
- [Development Guides](../development/) - Implementation details
- [Deployment Guide](../deployment/) - Deployment instructions

---

*API Documentation - Complete endpoint reference* 🔌
