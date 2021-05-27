import type { IEntity } from '@/interfaces'
import type {
  MangoParsedUrlQuery,
  MangoSearchParams
} from '@flex-development/mango/types'
import type { ObjectPlain } from '@flex-development/tutils'
import type { AxiosRequestConfig } from 'axios'

/**
 * @file Type Definitions - Repositories
 * @module types/repository
 */

/**
 * HTTP client used to make requests to the Firebase Database REST API.
 *
 * @template T - Payload
 */
export type RepoHttpClient<T = any> = {
  (config: AxiosRequestConfig): Promise<T>
}

/**
 * Parsed URL query parameters for repository collections.
 *
 * @template E - Entity
 */
export type RepoParsedUrlQuery<
  E extends IEntity = IEntity
> = MangoParsedUrlQuery<E>

/**
 * Type representing the root of a repository.
 *
 * @template E - Entity
 */
export type RepoRoot<E extends IEntity = IEntity> =
  | Record<E['id'], E>
  | ObjectPlain

/**
 * Search parameters (query criteria and options) for repository collections.
 *
 * @template E - Entity
 */
export type RepoSearchParams<E extends IEntity = IEntity> = MangoSearchParams<E>
