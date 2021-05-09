import axios from '@/config/axios'
import type { DBRequestConfig, IRepoDBConnection } from '@/interfaces'
import type { RepoHttpClient } from '@/types'
import DBConnection from './db-connection.provider'

/**
 * @file Provider - Repository Database Connection
 * @module providers/RepoDBConnection
 */

/**
 * Handles connecting repositories to Firebase Realtime Database instances.
 *
 * @class
 * @implements {IRepoDBConnection}
 */
export default class RepoDBConnection
  extends DBConnection
  implements IRepoDBConnection {
  /**
   * @readonly
   * @instance
   * @property {string} path - Repository database path
   */
  readonly path: string

  /**
   * Creates a new Firebase Realtime Database connection from a repository.
   *
   * @param {string} path - Repository database path
   * @param {string} url - Firebase Realtime Database URL
   * @param {string} client_email - Firebase service account client email
   * @param {string} private_key - Firebase service account private key
   * @param {RepoHttpClient} [http] - HTTP client. Defaults to `axios`
   * @throws {Exception}
   */
  constructor(
    path: string,
    url: string,
    client_email: string,
    private_key: string,
    http: RepoHttpClient = axios
  ) {
    super(url, client_email, private_key, http)
    this.path = path
  }

  /**
   * Sends requests to a Firebase Database repository.
   *
   * @template T - Payload type
   *
   * @async
   * @param {DBRequestConfig} config - Database request config
   * @return {Promise<T>} Promise containing response payload
   * @throws {Exception}
   */
  async send<T = any>(config: DBRequestConfig = {}): Promise<T> {
    return await this.request<T>(this.path, config)
  }
}
