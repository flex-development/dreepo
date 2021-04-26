import type { AxiosRequestConfig } from 'axios'
import type { IEntity, ProjectionOperators, QueryOperators } from './interfaces'
import type { JSONValue, ObjectPath } from './types-global'

/**
 * @file Type Definitions - Repository Globals
 * @module lib/types.repo
 */

/**
 * NOTICE: These type defintions are separate from the global type definitions
 * file to prevent circular imports.
 */

/**
 * Readonly properties of all entities.
 *
 * The `created_at` and `id` fields cannot be overwritten; whereas `updated_at`
 * can only be updated internally by the `EntityRepository` class.
 */
export type EntityReadonlyProps = 'created_at' | 'id' | 'updated_at'

/**
 * Projection query parameters mapped to entity field names.
 *
 * @template E - Entity
 */
export type ProjectionCriteria<E extends IEntity = IEntity> = Record<
  ObjectPath<E>,
  ProjectionOperators
>

/**
 * Query parameters mapped to entity field names.
 *
 * @template E - Entity
 */
export type QueryCriteria<E extends IEntity = IEntity> = Record<
  ObjectPath<E>,
  JSONValue | QueryOperators
>

/**
 * HTTP client used to make requests to the Firebase Database REST API.
 *
 * @template T - Payload
 */
export type RepoHttpClient<T = any> = {
  (config: AxiosRequestConfig): Promise<{ data: T }>
}
