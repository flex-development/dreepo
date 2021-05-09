import type { AxiosRequestConfig } from 'axios'
import type { ClassType } from 'class-transformer-validator'
import { SortOrder } from '../enums/sort-order.enum'
import type { AggregationStages, IEntity } from '../interfaces'
import type { EmptyObject, ObjectPath } from './global.types'
import type { ProjectionCriteria, QueryCriteria } from './mingo.types'

/**
 * @file Type Definitions - Repositories
 * @module types.repository
 */

/**
 * NOTICE: These type defintions are separate from the global type definitions
 * file to prevent circular imports.
 */

/**
 * Entity constructor function.
 *
 * @template E - Entity
 */
export type EntityClass<E extends IEntity = IEntity> = ClassType<E>

/**
 * Entity that can have additional properties after being evaluated during an
 * aggregation pipeline.
 *
 * @template E - Entity
 */
export type EntityEnhanced<E extends IEntity = IEntity> = E & {
  [x: string]: unknown
}

/**
 * Type representing a nested or top level entity key.
 *
 * @template E - Entity
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
 * Query parameters.
 *
 * @template E - Entity
 */
export type QueryParams<E extends IEntity = IEntity> = QueryCriteria<E> &
  Pick<AggregationStages<E>, '$limit' | '$project' | '$skip'> & {
    $sort?: Partial<Record<EntityPath<E>, SortOrder>>
    projection?: ProjectionCriteria<E>
  }

/**
 * Type representing a repository data cache.
 *
 * @template E - Entity
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
  (config: AxiosRequestConfig): Promise<T>
}

/**
 * Type representing the root of a repository.
 *
 * @template E - Entity
 */
export type RepoRoot<E extends IEntity = IEntity> =
  | Record<E['id'], E>
  | EmptyObject
