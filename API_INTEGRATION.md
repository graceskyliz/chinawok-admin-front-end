# API Integration Documentation

## Environment Configuration

Create a `.env.local` file in the root directory with your API base URL:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

For production, update this to your production API URL.

## Authentication Endpoints

### 1. User Registration
**Endpoint:** `POST /usuario/crear`

**Request Body:**
```json
{
  "nombre": "Fabricio Lanche",
  "correo": "fabricio.lanche@utec.edu.pe",
  "contrasena": "Cliente123!"
}
```

**Response:**
- Success: Returns user data with ID and email
- Error: Returns error message

### 2. User Login
**Endpoint:** `POST /usuario/login`

**Request Body:**
```json
{
  "correo": "gerente.local024@chinawok.pe",
  "contrasena": "Gerente024!Pass"
}
```

**Example Credentials:**

**Gerente (Manager):**
```json
{
  "correo": "gerente.local024@chinawok.pe",
  "contrasena": "Gerente024!Pass"
}
```

**Admin:**
```json
{
  "correo": "admin@chinawok.pe",
  "contrasena": "AdminChinaWok2024!"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "usuario": {
    "id": "user_id",
    "nombre": "User Name",
    "correo": "user@email.com",
    "rol": "admin" | "gerente"
  }
}
```

## Implementation Details

### Authentication Service (`lib/services/auth-service.ts`)
- Handles all API calls for authentication
- Manages JWT token storage in localStorage
- Provides methods for login, register, and token validation

### Auth Context (`lib/contexts/auth-context.tsx`)
- Global authentication state management
- User session persistence
- Automatic token and user data handling

### Login Page (`app/login/page.tsx`)
- Email and password fields
- Calls `/usuario/login` endpoint
- Automatically determines user role from API response
- Stores token and user data
- Redirects to dashboard on success

### Register Page (`app/register/page.tsx`)
- Name, email, password, and confirm password fields
- Calls `/usuario/crear` endpoint
- Automatically logs in user after successful registration
- Redirects to dashboard

## Role Detection

The system automatically detects user roles based on:
1. API response (`usuario.rol` field)
2. Email pattern matching:
   - Emails containing "admin@" → Admin role
   - Emails containing "gerente" → Gerente role
3. Default to "gerente" if no role specified

## Token Management

- JWT tokens are stored in `localStorage` under the key `auth_token`
- Tokens are automatically included in API requests (when implemented)
- Token is removed on logout

## Testing the Integration

1. **Start your backend API server** on the configured port (default: 8000)

2. **Update `.env.local`** with your API URL:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   ```

3. **Restart the Next.js dev server**:
   ```bash
   pnpm dev
   ```

4. **Test Registration**:
   - Go to http://localhost:3000/register
   - Fill in the form with valid data
   - Should create account and auto-login

5. **Test Login with existing credentials**:
   - Go to http://localhost:3000/login
   - Use the gerente or admin credentials provided above
   - Should redirect to dashboard with user info displayed

## Error Handling

The application handles the following errors:
- Network errors (API not reachable)
- Invalid credentials (401/403)
- Server errors (500)
- Validation errors (empty fields, password mismatch)

All errors are displayed to the user via alert messages in the UI.

## Security Considerations

⚠️ **Current Implementation:**
- Uses localStorage for token storage (acceptable for development)
- Client-side authentication state

🔒 **Production Recommendations:**
1. Implement HTTP-only cookies for token storage
2. Add CSRF protection
3. Implement refresh token mechanism
4. Add server-side session validation
5. Use HTTPS only in production
6. Implement rate limiting on auth endpoints
7. Add 2FA support
8. Implement proper password policies on backend

## CORS Configuration

Ensure your backend API allows requests from your frontend origin:

```python
# Example for FastAPI
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```
