<!--
Tujuan: Dokumentasi API layer architecture dan usage.
Target: Frontend developer yang perlu integrate API untuk features baru.
Status: COMPLETE
Date: 28 April 2026
-->

# API Layer Architecture

**Status**: ✅ **IMPLEMENTED & READY TO USE**

---

## 📁 Folder Structure

```
src/
├── api/
│   ├── index.ts              # Central export (import from here!)
│   ├── types.ts              # All TypeScript interfaces & types
│   ├── locations.ts          # Location API functions
│   └── auth.ts               # Authentication API functions
│
└── app/
    └── (auth)/
        └── register-provider/
            └── page.tsx      # UI Component (import from @/api)
```

---

## 🎯 Separation of Concerns

### **Before (Coupled)**

```typescript
// page.tsx
const fetchProvinces = async () => {
  const response = await fetch(`${BACKEND_URL}/api/v1/locations/provinces`);
  const result = await response.json();
  // ... parsing, error handling, state management
};
```

❌ **Problem**: Business logic mixed with UI logic

### **After (Separated)**

```typescript
// api/locations.ts
export const getProvinces = async (): Promise<Province[]> => {
  // Pure API logic
  // Error handling, validation, all in one place
};

// app/register-provider/page.tsx
const [provinces, setProvinces] = useState<Province[]>([]);

useEffect(() => {
  getProvinces().then(setProvinces);
}, []);
```

✅ **Benefits**:

- UI component is cleaner and focused on rendering
- API layer handles all HTTP concerns
- Easy to test, mock, or replace
- Single source of truth for API logic

---

## 📦 Module Organization

### **api/types.ts** - Type Definitions

Contains all TypeScript interfaces used across the application:

- `Province`, `Regency` - Location data
- `ServiceType` - Service type data
- `ApiResponse<T>` - Generic API response format
- `RegisterProviderPayload` - Registration form data
- `RegisterSuccessResponse` - Success response structure

✅ **Usage**:

```typescript
import { Province, Regency, ServiceType } from "@/api";
```

### **api/locations.ts** - Location APIs

Functions to fetch location data:

#### `getProvinces(): Promise<Province[]>`

- Fetches all provinces
- Returns empty array on error
- Logs detailed error information
- Type-safe response handling

```typescript
import { getProvinces, getRegencies } from "@/api/locations";

// In component
const provinces = await getProvinces();
const regencies = await getRegencies(provinceId);
```

#### `getRegencies(provinceId: string): Promise<Regency[]>`

- Fetches regencies for specific province
- Validates input (empty string check)
- Returns empty array on error

### **api/auth.ts** - Authentication APIs

Functions for user/provider authentication:

#### `registerProvider(payload: RegisterProviderPayload): Promise<APIResponse>`

- Submits provider registration form
- Handles multipart/form-data automatically
- Returns success/error response with token
- Comprehensive error messages

```typescript
import { registerProvider } from "@/api/auth";

const result = await registerProvider({
  full_name: "John Doe",
  email: "john@example.com",
  // ... other fields
});

if (result.success) {
  localStorage.setItem("token", result.data.token);
} else {
  showError(result.message);
}
```

### **api/index.ts** - Central Export

Re-exports everything for convenience:

```typescript
// ✅ RECOMMENDED: Import from barrel export
import { Province, getProvinces, getRegencies, registerProvider } from "@/api";

// ❌ AVOID: Deep imports
import { getProvinces } from "@/api/locations";
```

---

## 🔄 Data Flow

### Provider Registration Flow

```
UI Component (page.tsx)
    ↓
State Management (useState, useEffect)
    ↓
API Layer (@/api/auth.ts)
    ↓
HTTP Request (multipart/form-data)
    ↓
Backend Server (API Endpoint)
    ↓
Database
    ↓ (response)
Backend Server
    ↓
API Layer (error handling, parsing)
    ↓
UI Component (success/error state)
    ↓
User Feedback (success screen or error message)
```

### Province Selection Flow

```
Dropdown Change Event
    ↓
handleProvinceChange() (UI logic)
    ↓
getRegencies(provinceId) (API call)
    ↓
API Layer (fetch & parse)
    ↓
setRegencies() (UI state)
    ↓
Regency dropdown re-renders
```

---

## 🛠️ Error Handling Strategy

### **API Layer** (lib/api files)

- Catches all fetch errors
- Logs with [API Error] prefix
- Returns safe defaults (empty array or error object)
- Never throws, always returns result

```typescript
try {
  const response = await fetch(url);
  if (!response.ok) {
    console.error(`[API Error] Status ${response.status}`);
    return []; // Safe default
  }
  return result.data;
} catch (error) {
  console.error("[API Error]", error);
  return []; // Safe default
}
```

### **Component Layer** (page.tsx)

- Displays user-friendly error messages
- Handles retry logic
- Manages loading states

```typescript
try {
  const result = await registerProvider(payload);
  if (!result.success) {
    setError(result.message);
    return; // User can retry
  }
  // Success handling
} catch (err) {
  setError("Network error occurred");
}
```

---

## 📝 Usage Examples

### Example 1: Fetch and Display Provinces

```typescript
"use client";
import { useState, useEffect } from "react";
import { Province, getProvinces } from "@/api";

export function ProvinceSelector() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProvinces().then((data) => {
      setProvinces(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <select>
      {provinces.map((prov) => (
        <option key={prov.id} value={prov.id}>
          {prov.name}
        </option>
      ))}
    </select>
  );
}
```

### Example 2: Provider Registration

```typescript
import { registerProvider } from "@/api";

const handleSubmit = async (formData) => {
  try {
    const result = await registerProvider(formData);

    if (result.success) {
      // Store token
      localStorage.setItem("accessToken", result.data.token);
      // Redirect to dashboard
      window.location.href = "/provider/dashboard";
    } else {
      // Show error
      showErrorAlert(result.message);
    }
  } catch (err) {
    showErrorAlert("Network error");
  }
};
```

### Example 3: Cascading Dropdowns (Province → Regency)

```typescript
import { getRegencies } from "@/api";

const handleProvinceChange = async (provinceId: string) => {
  setSelectedProvince(provinceId);

  // Fetch regencies
  const regencies = await getRegencies(provinceId);
  setRegencies(regencies);
};
```

---

## 🔐 Features

✅ **Type-Safe**: Full TypeScript support with interfaces  
✅ **Error Resilient**: Graceful error handling with fallbacks  
✅ **Logging**: Detailed [API ...] prefix logging for debugging  
✅ **Validation**: Response format validation before use  
✅ **Separation**: Pure business logic separate from UI  
✅ **Extensible**: Easy to add new API functions  
✅ **Documented**: Clear comments and JSDoc annotations  
✅ **Consistent**: Uniform error handling across all APIs

---

## 🚀 Adding New API Endpoints

### Step 1: Add Types (api/types.ts)

```typescript
export interface NewFeaturePayload {
  // ... fields
}

export interface NewFeatureResponse {
  // ... fields
}
```

### Step 2: Create API Function (new file or existing)

```typescript
// api/features.ts (NEW FILE)
export const getNewFeature = async (id: string): Promise<Feature[]> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/features/${id}`);

    if (!response.ok) {
      const text = await response.text();
      console.error(
        `[API Error] getNewFeature (${response.status}):`,
        text.substring(0, 200)
      );
      return [];
    }

    const result: ApiResponse<Feature[]> = await response.json();

    if (result.success && Array.isArray(result.data)) {
      return result.data;
    }

    console.error("[API Error] getNewFeature: Invalid format", result);
    return [];
  } catch (error) {
    console.error("[API Error] getNewFeature:", error);
    return [];
  }
};
```

### Step 3: Export from api/index.ts

```typescript
export * from "./features"; // NEW
```

### Step 4: Use in Component

```typescript
import { getNewFeature } from "@/api";

const data = await getNewFeature(id);
```

---

## 🧪 Testing the API Layer

### Manual Testing

```bash
# Test provinces endpoint
curl http://localhost:3000/api/v1/locations/provinces

# Test regencies endpoint
curl http://localhost:3000/api/v1/locations/provinces/1/regencies

# Test registration endpoint
curl -X POST http://localhost:3000/api/v1/auth/register \
  -F "full_name=John" \
  -F "email=john@example.com" \
  -F "password=Test1234!"
```

### Console Debugging

All API functions log with `[API ...]` prefix:

- `[API Error]` - Error occurred
- `[API Success]` - Success response
- `[API Warn]` - Warning
- `[API Debug]` - Debug info

Check browser DevTools Console for these messages.

---

## 📊 Current API Endpoints Utilized

| Endpoint                                    | Method | Function             | Status     |
| ------------------------------------------- | ------ | -------------------- | ---------- |
| `/api/v1/locations/provinces`               | GET    | `getProvinces()`     | ✅ Working |
| `/api/v1/locations/provinces/:id/regencies` | GET    | `getRegencies()`     | ✅ Working |
| `/api/v1/auth/register`                     | POST   | `registerProvider()` | ✅ Working |

---

## ⚠️ Common Issues & Solutions

### Issue: `provinces.map is not a function`

**Cause**: API failed, function returned `[]`, but component didn't handle it  
**Solution**: Already fixed! API layer always returns array (empty on error)

### Issue: CORS Error

**Cause**: Frontend URL doesn't match backend CORS config  
**Solution**: Update `NEXT_PUBLIC_BACKEND_URL` in `.env.local`

### Issue: `result.success is undefined`

**Cause**: Backend returned error HTML instead of JSON  
**Solution**: Check backend is running and responding with correct endpoint

### Issue: Files not uploading

**Cause**: FormData boundary issue  
**Solution**: API layer handles FormData correctly (don't set Content-Type)

---

## 📞 Support & Debugging

### Enable Debug Logging

All API calls log to browser console. To see all:

1. Open DevTools (F12)
2. Go to Console tab
3. Filter by `[API`
4. Look for error messages

### Check Network Tab

1. Open DevTools → Network tab
2. Make API call
3. Check request headers and response body
4. Verify response format matches expected structure

---

## 🎓 Best Practices

1. **Always use API layer** - Don't fetch directly in components
2. **Check success flag** - Always verify `result.success` before using data
3. **Handle empty arrays** - API returns `[]` on error, plan accordingly
4. **Log errors** - Check console logs with `[API` prefix for debugging
5. **Type-safe operations** - Use imported types for all data
6. **Consistent imports** - Import from `@/api` barrel export
7. **Error messages for users** - Show `result.message` in UI alerts
8. **Store tokens safely** - Use `localStorage` or better (httpOnly cookies)

---

## 📦 Dependencies

- **Built-in**: Uses standard `fetch()` API (no axios or fetch library needed)
- **Types**: TypeScript (included in Next.js)
- **Next.js**: Client-side only (`'use client'` not needed in api files)

---

**Last Updated**: 28 April 2026  
**Version**: 1.0.0  
**Status**: Production Ready ✅
