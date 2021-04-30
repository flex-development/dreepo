import type {
  AggregationOperators,
  ProjectionOperators,
  QueryOperators
} from './interfaces'
import type { IEntity } from './models/entity.model'
import type { JSONValue, OneOrMany } from './types-global'
import type { EntityPath } from './types-repository'

/**
 * @file Type Definitions - Mingo
 * @module lib/types.mingo
 */

/**
 * Type representing an [Aggregation expression][1].
 *
 * ! Does not include `ExpressionObject` definition due to circular referencing.
 *
 * [1]: https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#expressions
 */
export type ExpressionBase<E extends IEntity = IEntity> =
  | AggregationOperators
  | JSONValue
  | LiteralExpression
  | OneOrMany<FieldPath<E>>
  | OneOrMany<typeof Date>
  | OneOrMany<typeof Number.NaN>
  | unknown[]

/**
 * Type representing an [Expression object][1].
 *
 * ! Does not include `ExpressionObject` definition due to circular referencing.
 *
 * [1]: https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#expression-objects
 */
export type ExpressionObject<E extends IEntity = IEntity> = Record<
  EntityPath<E>,
  ExpressionBase<E>
>

/**
 * Type representing ALL [Expression objects][1].
 *
 * [1]: https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#expression-objects
 */
export type ExpressionObject2<E extends IEntity = IEntity> =
  | ExpressionObject<E>
  | Record<EntityPath<E>, ExpressionObject<E>>

/**
 * Type representing ALL [Aggregation expressions][1].
 *
 * [1]: https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#expressions
 */
export type Expression<E extends IEntity = IEntity> =
  | ExpressionBase<E>
  | ExpressionObject2<E>

/**
 * Type representing a nested or top level entity key used as MongoDB operator.
 */
export type FieldPath<E extends IEntity = IEntity> = `$${EntityPath<E>}`

/**
 * Type representing a MongoDB [Literal expression][1].
 *
 * @template T - Type of literal
 *
 * [1]: https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#literals
 */
export type LiteralExpression<T = any> = { $literal: T }

/**
 * [Aggregation Pipeline Stage - `$project`][1].
 *
 * @template E - Entity
 *
 * [1]: https://docs.mongodb.com/manual/reference/operator/aggregation/project
 */
export type ProjectStage<E extends IEntity = IEntity> = Partial<
  Record<EntityPath<E>, boolean | 0 | 1>
>

/**
 * Projection query parameters mapped to entity field names.
 *
 * @template E - Entity
 */
export type ProjectionCriteria<E extends IEntity = IEntity> = Partial<
  Record<EntityPath<E>, ProjectionOperators>
>

/**
 * Query parameters mapped to entity field names.
 *
 * @template E - Entity
 */
export type QueryCriteria<E extends IEntity = IEntity> = Partial<
  Record<EntityPath<E>, JSONValue | QueryOperators>
>
