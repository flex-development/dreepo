import type { AxiosRequestConfig } from 'axios'
import type { IEntity } from './interfaces'
import type { EmptyObject, ObjectPath } from './types-global'

/**
 * @file Type Definitions - Repository Globals
 * @module lib/types.repo
 */

/**
 * NOTICE: These type defintions are separate from the global type definitions
 * file to prevent circular imports.
 */

/**
 * Type representing a nested or top level entity key.
 */
export type EntityPath<
  E extends IEntity = IEntity
> = ObjectPath<E> extends string ? ObjectPath<E> : never

/**
 * Readonly properties of all entities.
 *
 * The `created_at` and `id` fields cannot be overwritten; whereas `updated_at`
 * can only be updated internally by the `EntityRepository` class.
 */
export type EntityReadonlyProps = 'created_at' | 'id' | 'updated_at'

/**
 * Type representing a repository data cache.
 */
export type RepoCache<E extends IEntity = IEntity> = {
  collection: E[]
  root: RepoRoot<E>
}

/**
 * HTTP client used to make requests to the Firebase Database REST API.
 *
 * @template T - Payload
 */
export type RepoHttpClient<T = any> = {
  (config: AxiosRequestConfig): Promise<{ data: T }>
}

/**
 * Type representing the root of a repository.
 */
export type RepoRoot<E extends IEntity = IEntity> =
  | Record<E['id'], E>
  | EmptyObject
