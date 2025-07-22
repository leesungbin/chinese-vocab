import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import jwt from 'jsonwebtoken'

// Google OAuth2 verification
async function verifyGoogleToken(credential: string) {
  const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`)
  
  if (!response.ok) {
    throw new Error('Invalid Google credential')
  }
  
  const payload = await response.json()
  
  // Verify the audience matches our client ID
  const expectedClientId = process.env.GOOGLE_CLIENT_ID
  if (payload.aud !== expectedClientId) {
    throw new Error('Invalid audience')
  }
  
  return payload
}

export async function auth(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    }
  }

  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Missing request body' }),
      }
    }

    const { credential } = JSON.parse(event.body)
    
    if (!credential) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Missing Google credential' }),
      }
    }

    // Verify Google credential
    const googlePayload = await verifyGoogleToken(credential)
    
    // Create user object
    const user = {
      id: googlePayload.sub,
      email: googlePayload.email,
      name: googlePayload.name,
      image: googlePayload.picture
    }

    // Create JWT token
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured')
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
      },
      jwtSecret,
      { 
        expiresIn: '24h',
        issuer: 'chinese-vocab-app',
        subject: user.id,
      }
    )

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        token,
        user
      }),
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return {
      statusCode: 401,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Authentication failed' 
      }),
    }
  }
}