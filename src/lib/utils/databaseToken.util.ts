import jwt from '@/config/jwt'
import { NullishString } from '@/lib/types-global'
import { ExceptionStatusCode } from '@flex-development/exceptions/enums'
import Exception from '@flex-development/exceptions/exceptions/base.exception'
import pick from 'lodash.pick'

/**
 * @file Implementation - databaseToken
 * @module lib/utils/databaseToken
 */

/**
 * Generates a Google OAuth2 access token with the following scopes:
 *
 * - `https://www.googleapis.com/auth/firebase.database`
 * - `https://www.googleapis.com/auth/userinfo.email`
 *
 * The token can be used to send authenticated, admin-level requests to the
 * Firebase Database REST API.
 *
 * References:
 *
 * - https://firebase.google.com/docs/database/rest/auth
 *
 * @async
 * @return {Promise<NullishString>} Promise with access token or null
 * @throws {Exception}
 */
const databaseToken = async (): Promise<NullishString> => {
  try {
    // @ts-expect-error prefer to use async method
    return (await jwt.authorizeAsync()).access_token || null
  } catch ({ message, stack }) {
    throw new Exception(
      ExceptionStatusCode.UNAUTHORIZED,
      message,
      pick(jwt, ['email', 'key', 'scopes']),
      stack
    )
  }
}

export default databaseToken
