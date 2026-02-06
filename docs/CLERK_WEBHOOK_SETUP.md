# Clerk Webhook Setup Guide

This guide explains how to set up Clerk webhooks to sync user data to your local database.

---

## Overview

**Clerk handles authentication**, but we need user data in our local database for:
- Audit trails (who created stock entries, distributions, etc.)
- Activity logging
- Foreign key relationships

**Solution:** Webhook sync - Clerk sends user events to our API

---

## Architecture

```
┌─────────────┐     user.created      ┌──────────────────┐
│   Clerk     │ ────────────────────> │  /api/webhooks/  │
│  (Auth)     │     user.updated      │     clerk        │
│             │ ────────────────────> │                  │
│             │     user.deleted      │  Syncs to MySQL  │
│             │ ────────────────────> │                  │
└─────────────┘                       └──────────────────┘
```

---

## Setup Instructions

### Step 1: Get Your Webhook Secret

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to **Webhooks** → **Add Endpoint**
4. Enter URL: `https://yourdomain.com/api/webhooks/clerk`
5. Select events:
   - ☑️ `user.created`
   - ☑️ `user.updated`
   - ☑️ `user.deleted`
6. Click **Create**
7. Copy the **Signing Secret** (looks like: `whsec_xxxxxx`)

### Step 2: Configure Environment

Update `.env.local`:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk Webhook (NEW)
CLERK_WEBHOOK_SIGNING_SECRET=whsec_your_actual_secret_here
```

### Step 3: Test Webhook (Local Development)

For local testing, use **ngrok**:

```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 3000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
```

Update Clerk webhook URL to:
```
https://abc123.ngrok.io/api/webhooks/clerk
```

### Step 4: Verify Setup

1. Create a new user in your app (or Clerk Dashboard)
2. Check server logs for: `✅ User created/updated: ...`
3. Verify user appears in database:
   ```sql
   SELECT * FROM users WHERE email = 'test@example.com';
   ```

---

## How It Works

### Events Handled

| Event | Action |
|-------|--------|
| `user.created` | Create user in local DB |
| `user.updated` | Update user email/name |
| `user.deleted` | Soft delete (mark inactive) |

### Database Schema

```prisma
model User {
  id        String   @id @default(uuid())
  clerkId   String   @unique  // Links to Clerk
  email     String   @unique
  firstName String?
  lastName  String?
  role      String   @default("USER")
  isActive  Boolean  @default(true)
  // ...
}
```

### Fallback (Lazy Sync)

If webhook hasn't fired yet (race condition), the app falls back to lazy sync:

```typescript
// lib/auth.ts - getOrCreateUser()
// Creates user on first app access if not exists
```

---

## Security

### Signature Verification

All webhooks are signed with HMAC-SHA256. The endpoint:
1. Verifies `svix-signature` header
2. Rejects invalid signatures (400 error)
3. Processes only verified requests

### Public Route

Webhooks must be public (no auth):

```typescript
// middleware.ts
const isPublicRoute = createRouteMatcher([
  "/api/webhooks(.*)", // No auth required
  // ...
]);
```

---

## Troubleshooting

### Webhook Not Firing

1. Check URL is correct (HTTPS only in production)
2. Verify route is public in middleware
3. Check server logs for errors
4. Test with Clerk Dashboard "Send Example" button

### Signature Verification Failed

1. Ensure `CLERK_WEBHOOK_SIGNING_SECRET` is set correctly
2. Don't parse body before verification (needs raw body)
3. Check for whitespace in secret

### User Not Created

1. Check database connection
2. Verify `clerkId` is unique
3. Check for validation errors
4. Look for logs: `❌ Failed to create user`

---

## Production Checklist

- [ ] Webhook endpoint uses HTTPS
- [ ] `CLERK_WEBHOOK_SIGNING_SECRET` set in production
- [ ] Route `/api/webhooks/clerk` is public
- [ ] Database has `clerkId` index (for fast lookups)
- [ ] Logs are monitored for webhook failures
- [ ] User data is GDPR compliant (handle `user.deleted`)

---

## Files Modified

| File | Change |
|------|--------|
| `.env` | Added `CLERK_WEBHOOK_SIGNING_SECRET` |
| `middleware.ts` | Created - makes webhooks public |
| `app/api/webhooks/clerk/route.ts` | Created - webhook handler |
| `lib/auth.ts` | Fallback lazy sync pattern |

---

*Setup complete! Users will now sync automatically.*
