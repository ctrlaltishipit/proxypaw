# 🔐 Proxypaw PHI Security & Background Check System

## Overview

This document explains the comprehensive security system implemented for Proxypaw's community pet directory at Prestige High Fields (PHF), Hyderabad. The system protects **Protected Health Information (PHI)** and implements role-based access control with background check (BGC) verification.

---

## 🏗️ Architecture

### Three-Tier Security Architecture
```
Frontend (React) ←→ Server (Hono/Deno) ←→ Database (Supabase KV Store)
```

### Data Flow
1. **User Authentication** → User logs in with role (owner/walker/renter/admin)
2. **API Request** → Frontend requests pet data with userId + userRole
3. **PHI Masking** → Server applies masking based on role & BGC status
4. **Response** → Frontend displays masked/unmasked data accordingly

---

## 🔒 Protected Health Information (PHI)

### What is Protected:
- **Owner Name** - Full name of pet owner
- **Owner Phone** - Contact phone number
- **Owner Email** - Email address
- **Apartment Number** - Exact unit location
- **Medical Notes** - Pet health history
- **Emergency Contact** - Emergency contact information

### Masking Format:
```javascript
{
  ownerName: "****** ******",
  ownerPhone: "***-***-****",
  ownerEmail: "***@***.**",
  apartment: "****",
  medicalNotes: "[REDACTED - BGC Required]",
  emergencyContact: "[REDACTED - BGC Required]"
}
```

---

## 👥 User Roles & Access Levels

### 1. **Admin** 🔐
- **Access**: Full unmasked PHI data for all 109 pets
- **Permissions**: 
  - View all pet information
  - Verify background checks
  - Assign/unassign pets to volunteers
  - Initialize pet database
- **BGC Status**: Pre-verified

### 2. **Owner** 🐕
- **Access**: Masked PHI (own pets only when implemented)
- **Permissions**: 
  - View community pet directory (masked)
  - Manage own pets
- **BGC Status**: N/A

### 3. **Walker/Volunteer** 👟
- **Access**: Conditional based on BGC status
  - **BGC Pending**: All PHI masked
  - **BGC Verified + Assigned**: Unmasked PHI for assigned pets only
  - **BGC Failed**: All PHI masked
- **Permissions**: 
  - View community directory (masked until BGC verified)
  - Access assigned pet details (after BGC verification)

### 4. **Renter** 💙
- **Access**: Masked PHI
- **Permissions**: 
  - Browse community pets (masked)
  - Request temporary fostering
- **BGC Status**: Required for rental access

---

## 🔄 Background Check (BGC) Workflow

### Step-by-Step Process:

#### 1. **Volunteer Registration**
```javascript
POST /make-server-0cfbd72b/volunteers/register
{
  "userId": "user-abc123",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "walker"
}

Response: {
  "bgcStatus": "pending",
  "assignedPets": []
}
```

#### 2. **Admin BGC Verification**
```javascript
POST /make-server-0cfbd72b/admin/verify-bgc
{
  "adminUserId": "admin-xyz",
  "adminRole": "admin",
  "volunteerId": "user-abc123",
  "bgcStatus": "verified"  // or "failed"
}

Response: {
  "bgcStatus": "verified",
  "bgcVerifiedAt": "2025-12-07T10:30:00Z"
}
```

#### 3. **Admin Pet Assignment** (Only after BGC verified)
```javascript
POST /make-server-0cfbd72b/admin/assign-pet
{
  "adminUserId": "admin-xyz",
  "adminRole": "admin",
  "volunteerId": "user-abc123",
  "petId": 42
}

Response: {
  "assignment": {
    "petId": 42,
    "volunteerId": "user-abc123",
    "assignedAt": "2025-12-07T10:35:00Z",
    "assignedBy": "admin-xyz"
  }
}
```

#### 4. **Volunteer Access** (Now has unmasked PHI for pet #42)
```javascript
POST /make-server-0cfbd72b/pets
{
  "userId": "user-abc123",
  "userRole": "walker"
}

Response: {
  "pets": [
    {
      "id": 42,
      "name": "kyra",
      "ownerName": "Owner of kyra",  // UNMASKED for assigned pet
      "ownerPhone": "+91-9876543210",  // UNMASKED
      "apartment": "4236"  // UNMASKED
    },
    {
      "id": 1,
      "name": "Lily",
      "ownerName": "****** ******",  // MASKED (not assigned)
      "apartment": "****"  // MASKED
    }
  ],
  "phiMasking": true,
  "bgcStatus": "verified"
}
```

---

## 📡 API Endpoints

### Pet Management

#### **Initialize Pet Database** (Admin Only)
```
POST /make-server-0cfbd72b/admin/init-pets
Body: { "userRole": "admin" }
```
- Loads all 109 pets with PHI data
- One-time initialization
- Idempotent (safe to call multiple times)

#### **Get All Pets** (With PHI Masking)
```
POST /make-server-0cfbd72b/pets
Body: { "userId": "user-123", "userRole": "walker" }
```
- Returns all pets with appropriate masking
- Applies BGC verification logic

#### **Get Single Pet**
```
POST /make-server-0cfbd72b/pets/:id
Body: { "userId": "user-123", "userRole": "walker" }
```
- Returns specific pet with masking

### Volunteer Management

#### **Register Volunteer**
```
POST /make-server-0cfbd72b/volunteers/register
Body: {
  "userId": "user-123",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "role": "walker"
}
```

#### **Verify Background Check** (Admin Only)
```
POST /make-server-0cfbd72b/admin/verify-bgc
Body: {
  "adminUserId": "admin-xyz",
  "adminRole": "admin",
  "volunteerId": "user-123",
  "bgcStatus": "verified"
}
```

#### **Assign Pet to Volunteer** (Admin Only)
```
POST /make-server-0cfbd72b/admin/assign-pet
Body: {
  "adminUserId": "admin-xyz",
  "adminRole": "admin",
  "volunteerId": "user-123",
  "petId": 42
}
```

#### **Unassign Pet** (Admin Only)
```
POST /make-server-0cfbd72b/admin/unassign-pet
Body: {
  "adminUserId": "admin-xyz",
  "adminRole": "admin",
  "volunteerId": "user-123",
  "petId": 42
}
```

#### **Get Volunteer Profile**
```
POST /make-server-0cfbd72b/volunteers/profile
Body: { "userId": "user-123" }
```

---

## 🧪 Testing Guide

### Test Scenario 1: Admin Access
1. **Sign up** as Admin (🔐 Admin access option)
2. Navigate to **Community Pets**
3. **Expected**: Blue badge "Admin Access - Full PHI data visible"
4. **Expected**: See all apartment numbers and owner details

### Test Scenario 2: Volunteer Without BGC
1. **Sign up** as Walker (👟 Volunteer to walk pets)
2. Navigate to **Community Pets**
3. **Expected**: Yellow badge "PHI Protected - Owner information redacted"
4. **Expected**: All apartments show "****"

### Test Scenario 3: BGC Verification Flow
1. **Admin**: Initialize pets database
2. **Volunteer**: Register (BGC = pending)
3. **Admin**: Verify BGC for volunteer
4. **Admin**: Assign pet #42 to volunteer
5. **Volunteer**: View pets - see unmasked data for pet #42 only

### Test Scenario 4: Owner/Renter
1. **Sign up** as Owner or Renter
2. Navigate to **Community Pets**
3. **Expected**: All PHI masked with "****" apartments

---

## 🗄️ Database Schema

### Pet Records
```typescript
interface PetData {
  id: number;
  name: string;
  type: 'Dog' | 'Cat' | 'Guinea Pig' | 'Fish' | 'Bird';
  tower: string;
  apartment: string;
  image: string;
  status: 'online' | 'away' | 'offline';
  // PHI Fields
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  medicalNotes: string;
  emergencyContact: string;
}
```

### Volunteer Records
```typescript
interface VolunteerData {
  userId: string;
  name: string;
  email: string;
  role: 'admin' | 'walker' | 'renter' | 'owner';
  bgcStatus: 'pending' | 'verified' | 'failed';
  bgcVerifiedAt?: string;
  assignedPets: number[];
}
```

### Assignment Records
```typescript
interface PetAssignment {
  petId: number;
  volunteerId: string;
  assignedAt: string;
  assignedBy: string;
}
```

---

## 📊 Pet Database Stats

- **Total Pets**: 109
- **Dogs**: 81
- **Cats**: 20
- **Guinea Pigs**: 1 (JoJo in Tower 7)
- **Fish**: 1 (The Fish in Tower 10)
- **Birds**: 2 (Ronny & Rocky in Tower 10)
- **Towers**: 10
- **Location**: Prestige High Fields, Hyderabad, Telangana, India

---

## 🔐 Security Best Practices

### ✅ Implemented
- Role-based access control (RBAC)
- PHI masking at API layer
- BGC verification requirement
- Admin-only privileged operations
- Audit trail (assignedBy tracking)
- Idempotent initialization

### ⚠️ Production Considerations
**IMPORTANT**: This is a **prototype** environment. For production deployment:

1. **Authentication**: Implement proper JWT/OAuth authentication
2. **Encryption**: Encrypt PHI data at rest and in transit
3. **HIPAA Compliance**: Follow HIPAA guidelines for PHI
4. **Audit Logs**: Comprehensive logging of all PHI access
5. **Rate Limiting**: Prevent data scraping
6. **SSL/TLS**: Enforce HTTPS for all communications
7. **Data Retention**: Implement proper data lifecycle policies
8. **Incident Response**: Have breach notification procedures

---

## 🎯 Key Features

### PHI Protection
- ✅ Automatic masking based on role
- ✅ BGC-gated unmasking
- ✅ Conditional access per pet
- ✅ Visual security badges in UI

### Background Check System
- ✅ Three-state verification (pending/verified/failed)
- ✅ Admin-controlled verification
- ✅ Timestamp tracking
- ✅ Assignment restrictions

### Admin Controls
- ✅ Initialize database
- ✅ Verify volunteer BGC
- ✅ Assign/unassign pets
- ✅ Full PHI visibility

### User Experience
- ✅ Loading states
- ✅ Error handling
- ✅ Security status indicators
- ✅ Tower-wise filtering (10 towers)
- ✅ Real-time stats
- ✅ Smooth animations

---

## 📝 Notes

1. **Figma Make Environment**: This is a development/prototype environment
2. **Demo Data**: PHI data is randomly generated for demonstration
3. **No Real PII**: No actual personal information is stored
4. **Educational Purpose**: Demonstrates security patterns and best practices
5. **Not Production-Ready**: Requires additional security measures for production

---

## 🚀 Quick Start

1. **Initialize Database** (as Admin):
   ```bash
   # Sign up as Admin
   # Open browser console
   fetch('https://[PROJECT_ID].supabase.co/functions/v1/make-server-0cfbd72b/admin/init-pets', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': 'Bearer [PUBLIC_ANON_KEY]'
     },
     body: JSON.stringify({ userRole: 'admin' })
   })
   ```

2. **View as Admin**: Login as Admin → Navigate to Community Pets
3. **View as Volunteer**: Login as Walker → See masked data
4. **Test BGC Flow**: Use admin routes to verify & assign

---

## 📞 Support

For questions about the security implementation:
- Check server logs in Supabase Functions
- Review browser console for API responses
- Verify role assignment in App.tsx
- Check PHI masking logic in server/index.tsx

---

**Last Updated**: December 7, 2025  
**Version**: 1.0.0  
**Status**: Development/Prototype