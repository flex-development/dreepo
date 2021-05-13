import { SortOrder } from '@/enums/sort-order.enum'
import type { QSMongoOptions } from '@/interfaces/qs-mongo-options.interface'
import type { AxiosRequestConfig } from 'axios'
import type { ClassType } from 'class-transformer-validator'
import type { IEntity, QSMongoParsedOptions } from '../interfaces'
import type {
  EmptyObject,
  ObjectPath,
  OneOrMany,
  PartialOr
} from './global.types'
import type { Criteria } from './mingo.types'

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
export type EntityEnhanced<E extends IEntity = IEntity> = PartialEntity<E> & {
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
 * Response include all attributes of an entity or a subset.
 *
 * Even when a subset of attributes are requested, a partial `IEntity` response
 * will always include the `id` field.
 *
 * @template E - Entity
 */
export type PartialEntity<E extends IEntity = IEntity> = Omit<
  PartialOr<E>,
  'id'
> & { id: E['id'] }

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
 * Repository URL query parameters.
 *
 * @template E - Entity
 */
export type RepoParsedUrlQuery<E extends IEntity = IEntity> = Partial<
  Record<EntityPath<E>, OneOrMany<string>>
> & {
  fields?: string
  limit?: string
  q?: string
  skip?: string
  sort?: string
}

/**
 * Type representing the root of a repository.
 *
 * @template E - Entity
 */
export type RepoRoot<E extends IEntity = IEntity> =
  | Record<E['id'], E>
  | EmptyObject

/**
 * `RepoSearchParamsBuilder` options.
 */
export type RepoSearchParamsBuilderOptions = Omit<
  QSMongoOptions,
  'objectIdFields' | 'parameters'
>

/**
 * Repository search parameters.
 *
 * @template E - Entity
 */
export type RepoSearchParams<E extends IEntity = IEntity> = Criteria<E> & {
  options?: Partial<QSMongoParsedOptions<E>>
}

/**
 * Repository sorting rules.
 *
 * @template E - Entity
 */
export type RepoSort<E extends IEntity = IEntity> = Partial<
  Record<EntityPath<E>, SortOrder>
>
