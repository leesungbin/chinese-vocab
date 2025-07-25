import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import jwt from 'jsonwebtoken'

// Google OAuth2 verification and profile fetching
async function verifyGoogleTokenAndGetProfile(credential: string, isOAuth: boolean = false) {
  if (isOAuth) {
    // For OAuth access token, get user info directly
    const userInfoResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo`, {
      headers: {
        'Authorization': `Bearer ${credential}`
      }
    })
    
    if (!userInfoResponse.ok) {
      const errorText = await userInfoResponse.text()
      console.error('OAuth userinfo error:', errorText)
      throw new Error('Invalid Google OAuth token')
    }

    const userInfo = await userInfoResponse.json()
    
    return {
      sub: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture
    }
  } else {
    // Original ID token verification flow
    const tokenResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`)
    
    if (!tokenResponse.ok) {
      throw new Error('Invalid Google credential')
    }
    
    const tokenPayload = await tokenResponse.json()
    
    // Verify the audience matches our client ID
    const expectedClientId = process.env.GOOGLE_CLIENT_ID
    if (tokenPayload.aud !== expectedClientId) {
      throw new Error('Invalid audience')
    }
    
    // Get profile information from userinfo endpoint using the access token
    // Note: For ID tokens, we need to decode the token to get basic info
    // and use Google's userinfo API for reliable profile picture access
    try {
      // Decode the ID token to get user info (this is safe since we've verified it)
      const base64Url = credential.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      const decodedToken = JSON.parse(jsonPayload)
      
      // Return the decoded token data which should include picture
      return decodedToken
    } catch (error) {
      console.error('Error decoding ID token:', error)
      // Fallback to tokeninfo payload
      return tokenPayload
    }
  }
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

    const { credential, isOAuth } = JSON.parse(event.body)
    
    if (!credential) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Missing Google credential' }),
      }
    }

    // Verify Google credential and get profile
    const googlePayload = await verifyGoogleTokenAndGetProfile(credential, isOAuth)
    
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