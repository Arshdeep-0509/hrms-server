# Auth Module

## Overview
The Auth module handles user authentication and authorization for the HRMS system. It manages user registration, login, logout, and token-based security.

## Purpose
This module provides secure authentication mechanisms to ensure only authorized users can access the system and its resources.

## File Structure
```
auth/
├── auth.service.js    # Business logic for authentication
├── auth.controller.js # HTTP request handlers
├── auth.routes.js     # API endpoint definitions
└── README.md          # This file
```

## Key Features
- User registration with password hashing
- Secure login with JWT token generation
- Token-based authentication
- Logout functionality
- Password validation and security

## Schema Details
The Auth module uses the **User schema** from the user module for authentication:
- Uses `user_id` (numeric ID) for user identification
- Email validation with regex pattern
- Password hashing with bcrypt (8 salt rounds)
- Role-based access control

## Service Methods

### `register(data, role)`
Creates a new user account.
- **Parameters**: `data` (user info), `role` (default: Employee)
- **Returns**: User object with JWT token
- **Throws**: Email already exists, validation errors

### `login(email, password)`
Authenticates user and generates token.
- **Parameters**: `email`, `password`
- **Returns**: User object with JWT token
- **Throws**: Invalid credentials, user not found

### `logout(userId)`
Invalidates user session (if session management is implemented).
- **Parameters**: `userId`
- **Returns**: Success message

## Usage Examples

### Register a New User
```javascript
// In controller
const result = await authService.register({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123'
}, 'Employee');
```

### Login User
```javascript
// In controller
const result = await authService.login(
  'john@example.com',
  'password123'
);
```

## API Endpoints

### Public Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Protected Endpoints
- `POST /api/auth/logout` - Logout user (requires authentication)

## Security Features
1. **Password Hashing**: Uses bcrypt with 8 salt rounds
2. **JWT Tokens**: Secure token-based authentication
3. **Email Validation**: Regex pattern validation
4. **Role-Based Access**: Multiple roles supported

## Dependencies
- `../../modules/user/user.schema` - User model
- `jsonwebtoken` - JWT token generation
- `bcryptjs` - Password hashing

## Related Modules
- **User Module**: User schema and profile management
- **Role Module**: Role-based permissions

## Error Handling
All errors include status codes:
- `400` - Bad request (validation errors)
- `401` - Unauthorized (invalid credentials)
- `500` - Server error

## Best Practices
1. Always hash passwords before storing
2. Validate email format before processing
3. Return generic error messages for security
4. Set appropriate token expiration times
5. Use HTTPS in production
