import { JWT } from 'google-auth-library'
import type { IsURLOptions } from 'validator/lib/isURL'
import type { NullishString } from '../types-global'
import type { RepoHttpClient } from '../types-repository'
import type { DBRequestConfig } from './db-request-config.interface'

/**
 * @file Interface - IDBConnection
 * @module lib/interfaces/DBConnection
 */

export interface IDBConnection {
  readonly client_email: string
  readonly http: RepoHttpClient
  readonly jwt: JWT
  readonly private_key: string
  readonly scopes: string[]
  readonly url: string
  readonly url_options: IsURLOptions

  token(): Promise<NullishString>
  request<T = any>(path: string, config?: DBRequestConfig): Promise<T>
}
