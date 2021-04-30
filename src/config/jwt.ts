import { JWT } from 'google-auth-library'
import configuration from './configuration'

/**
 * @file Config - Google OAuth2 JWT Client
 * @module config/jwt
 */

const {
  FIREBASE_CLIENT_EMAIL: client_email,
  FIREBASE_PRIVATE_KEY: private_key
} = configuration()

/**
 * @property {string[]} scopes - Scopes to generate Google OAuth2 access token
 */
const scopes = [
  'https://www.googleapis.com/auth/firebase.database',
  'https://www.googleapis.com/auth/userinfo.email'
]

/**
 * @property {JWT} jwt - Google OAuth2 JWT client
 */
const jwt = new JWT(client_email, undefined, private_key, scopes)

export default jwt
