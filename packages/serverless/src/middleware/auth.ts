import { APIGatewayProxyEvent } from 'aws-lambda'
import jwt from 'jsonwebtoken'

interface JWTPayload {
  userId: string
  email: string
  name: string
  iat: number
  exp: number
}

export interface AuthenticatedUser {
  userId: string
  email: string
  name: string
}

export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 401
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

export function validateJWT(event: APIGatewayProxyEvent): AuthenticatedUser {
  const token = extractTokenFromEvent(event)

  if (!token) {
    throw new AuthError('Authentication token is required')
  }

  try {
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      throw new AuthError('JWT secret not configured', 500)
    }

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload

    return {
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name,
    }
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthError('Token has expired')
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthError('Invalid token')
    } else if (error instanceof AuthError) {
      throw error
    } else {
      throw new AuthError('Token validation failed')
    }
  }
}

export function validateAuthorizedUser(
  event: APIGatewayProxyEvent
): AuthenticatedUser {
  const user = validateJWT(event)

  // Only allow updates from the authorized email
  const authorizedEmail = 'lee@sungbin.dev'
  if (user.email !== authorizedEmail) {
    throw new AuthError('You are not authorized to perform this action', 403)
  }

  return user
}

function extractTokenFromEvent(event: APIGatewayProxyEvent): string | null {
  // Try Authorization header first
  const authHeader = event.headers.Authorization || event.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // Try cookies if no Bearer token (for backward compatibility)
  const cookies = event.headers.Cookie || event.headers.cookie
  if (cookies) {
    const cookieMatch = cookies.match(/auth-token=([^;]+)/)
    if (cookieMatch) {
      return cookieMatch[1]
    }
  }

  return null
}
