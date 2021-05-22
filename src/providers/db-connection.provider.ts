import axios from '@/config/axios'
import type { DBRequestConfig, IDBConnection } from '@/interfaces'
import type { RepoHttpClient } from '@/types'
import { ExceptionStatusCode } from '@flex-development/exceptions/enums'
import Exception from '@flex-development/exceptions/exceptions/base.exception'
import type { NullishString } from '@flex-development/tutils'
import type { AxiosRequestConfig } from 'axios'
import { JWT } from 'google-auth-library'
import isPlainObject from 'lodash.isplainobject'
import pick from 'lodash.pick'
import isEmail from 'validator/lib/isEmail'
import type { IsURLOptions } from 'validator/lib/isURL'
import isURL from 'validator/lib/isURL'

/**
 * @file Provider - Database Connection
 * @module providers/DBConnection
 */

/**
 * Handles connections to specific Firebase Realtime Database instances.
 *
 * @class
 * @implements {IDBConnection}
 */
export default class DBConnection implements IDBConnection {
  /**
   * @readonly
   * @instance
   * @property {string} client_email - Firebase service account client email
   */
  readonly client_email: string

  /**
   * @readonly
   * @instance
   * @property {RepoHttpClient} http - HTTP client used to request REST API
   */
  readonly http: RepoHttpClient

  /**
   * @readonly
   * @instance
   * @property {JWT} jwt - Google OAuth2 JWT client
   */
  readonly jwt: JWT

  /**
   * @readonly
   * @instance
   * @property {string} private_key - Firebase service account private key
   */
  readonly private_key: string

  /**
   * @readonly
   * @instance
   * @property {string[]} scopes - Scopes to generate Google OAuth2 access token
   */
  readonly scopes: string[] = [
    'https://www.googleapis.com/auth/firebase.database',
    'https://www.googleapis.com/auth/userinfo.email'
  ]

  /**
   * @readonly
   * @instance
   * @property {string} url - Firebase Realtime Database URL
   */
  readonly url: string

  /**
   * @readonly
   * @instance
   * @property {IsURLOptions} url_options - Database URL validation options
   */
  readonly url_options: IsURLOptions = {
    /**
     * @property {RegExp[]} host_whitelist - Valid Firebase RTD hosts suffixes
     * @see https://firebase.google.com/docs/projects/locations#rtdb-locations
     */
    host_whitelist: [
      new RegExp('[.]firebaseio[.]com', 'g'),
      new RegExp('[.]europe-west1[.]firebasedatabase.app', 'g')
    ],

    /**
     * @property {string[]} protocols - Valid database URL protocols
     */
    protocols: ['https']
  }

  /**
   * Creates a new Firebase Realtime Database connection.
   *
   * @param {string} url - Firebase Realtime Database URL
   * @param {string} client_email - Firebase service account client email
   * @param {string} private_key - Firebase service account private key
   * @param {RepoHttpClient} [http] - HTTP client. Defaults to `axios`
   * @throws {Exception}
   */
  constructor(
    url: string,
    client_email: string,
    private_key: string,
    http: RepoHttpClient = axios
  ) {
    if (!isURL(url, this.url_options)) {
      const message = 'Invalid database URL'
      const data = {
        errors: { url: url || null },
        url_options: this.url_options
      }

      throw new Exception(ExceptionStatusCode.BAD_REQUEST, message, data)
    }

    if (!isEmail(client_email)) {
      const message = 'Invalid service account client_email'
      const data = { errors: { client_email } }

      throw new Exception(ExceptionStatusCode.UNAUTHORIZED, message, data)
    }

    if (typeof private_key !== 'string' || !private_key.trim().length) {
      const message = 'Service account private_key must be a non-empty string'
      const data = { errors: { private_key } }

      throw new Exception(ExceptionStatusCode.UNAUTHORIZED, message, data)
    }

    this.client_email = client_email
    this.private_key = private_key.replace(/\\n/g, '\n')
    this.url = url
    this.http = http
    this.jwt = new JWT(
      this.client_email,
      undefined,
      this.private_key,
      this.scopes
    )
  }

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
   * @return {Promise<NullishString>} Promise containing access token or null
   * @throws {Exception}
   */
  async token(): Promise<NullishString> {
    try {
      // @ts-expect-error prefer to use async method
      return (await this.jwt.authorizeAsync()).access_token || null
    } catch ({ message, stack }) {
      throw new Exception(
        ExceptionStatusCode.UNAUTHORIZED,
        message,
        pick(this.jwt, ['email', 'key', 'scopes']),
        stack
      )
    }
  }

  /**
   * Sends requests to the Firebase Database REST API.
   *
   * To bypass Realtime Database Rules, requests will be authenticated with a
   * Google OAuth2 token, thus granting the server admin database privileges.
   *
   * To use {@see DBConnection#url} as a REST endpoint, {@param config.url} will
   * have the string `.json` appended.
   *
   * @template T - Payload type
   *
   * @async
   * @param {string} path - Database repository path
   * @param {DBRequestConfig} [config] - Database request config
   * @return {Promise<T>} Promise containing response payload
   * @throws {Exception}
   */
  async request<T = any>(
    path: string,
    config: DBRequestConfig = {}
  ): Promise<T> {
    const $config: AxiosRequestConfig = {
      ...config,
      baseURL: `${this.url}/${path}`,
      params: {
        ...(isPlainObject(config.params) ? config.params : {}),
        access_token: await this.token(),
        print: 'pretty'
      },
      url: `/${(config.url || '').trim()}.json`
    }

    // Make request
    const response = await this.http($config)

    // ! If repository root is empty, null will be returned
    if ($config?.url === '/.json') return (response || {}) as T

    // Return response
    return response as T
  }
}
