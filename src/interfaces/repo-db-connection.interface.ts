import type { IDBConnection } from './db-connection.interface'
import type { DBRequestConfig } from './db-request-config.interface'

/**
 * @file Interface - IRepoDBConnection
 * @module interfaces/RepoDBConnection
 */

export interface IRepoDBConnection extends IDBConnection {
  readonly path: string

  send<T = any>(config?: DBRequestConfig): Promise<T>
}
