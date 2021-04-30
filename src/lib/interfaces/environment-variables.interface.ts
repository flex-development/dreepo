/**
 * @file Interface - EnvironmentVariables
 * @module lib/interfaces/EnvironmentVariables
 */

/**
 * Shape of object containing environment variables used in this package.
 */
export interface EnvironmentVariables {
  readonly FIREBASE_CLIENT_EMAIL: string
  readonly FIREBASE_DATABASE_URL: string
  readonly FIREBASE_PRIVATE_KEY: string
}
