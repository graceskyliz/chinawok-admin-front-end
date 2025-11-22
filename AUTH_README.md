# Chinawok Admin - Authentication System

## Overview
The application now includes a complete authentication system with login and register pages.

## Features

### Authentication Pages
- **Login Page** (`/login`) - Users can sign in with:
  - Email address
  - Password
  - Role selection (Gerente or Administrador)

- **Register Page** (`/register`) - New users can create accounts with:
  - Full name
  - Email address
  - Password confirmation
  - Role selection (Gerente or Administrador)

### User Roles
- **Gerente (Manager)** - Standard management access
- **Administrador (Admin)** - Full administrative access

### Security Features
- Protected routes - Dashboard requires authentication
- Client-side authentication state management
- Automatic redirect to login for unauthenticated users
- Session persistence using localStorage
- Logout functionality

## Usage

### Accessing the Application
1. Start the development server: `pnpm dev`
2. Navigate to http://localhost:3000
3. You will be redirected to `/login` if not authenticated

### Creating an Account
1. Go to http://localhost:3000/register
2. Fill in your details:
   - Full name
   - Email address
   - Password (minimum 6 characters)
   - Confirm password
   - Select role (Gerente or Admin)
3. Click "Crear cuenta"
4. You'll be automatically logged in and redirected to the dashboard

### Logging In
1. Go to http://localhost:3000/login
2. Enter your credentials:
   - Email
   - Password
   - Select your role
3. Click "Iniciar sesión"
4. Access the admin dashboard

### Logging Out
- Click the "Cerrar sesión" button in the sidebar
- You'll be redirected to the login page

## Technical Implementation

### File Structure
```
app/
  ├── login/
  │   └── page.tsx          # Login page
  ├── register/
  │   └── page.tsx          # Register page
  ├── layout.tsx            # Root layout with AuthProvider
  └── page.tsx              # Protected dashboard

lib/
  ├── types/
  │   └── auth.ts           # TypeScript types for auth
  └── contexts/
      └── auth-context.tsx  # Authentication context provider

components/
  └── protected-route.tsx   # Route protection wrapper

middleware.ts              # Next.js middleware for route handling
```

### Authentication Context
The `AuthProvider` manages authentication state throughout the application:
- User information
- Authentication status
- Login/logout functions
- Registration function

### Protected Routes
The main dashboard automatically redirects unauthenticated users to the login page.

## Next Steps (Production Considerations)

For production deployment, consider implementing:
1. **Backend API Integration** - Replace localStorage with secure API calls
2. **JWT Tokens** - Implement secure token-based authentication
3. **Server-Side Sessions** - Use Next.js server components for session management
4. **Password Security** - Hash passwords before storage
5. **Email Verification** - Verify user emails during registration
6. **Password Reset** - Add forgot password functionality
7. **Role-Based Access Control** - Implement granular permissions based on roles
8. **Rate Limiting** - Prevent brute force attacks
9. **OAuth Integration** - Add social login options
10. **Audit Logging** - Track authentication events

## Development Notes

Current implementation uses client-side storage for demonstration purposes. This is suitable for development but should be replaced with a secure backend authentication system for production use.
