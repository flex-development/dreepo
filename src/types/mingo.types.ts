import type {
  AggregationOperators,
  IEntity,
  ProjectionOperators,
  QueryOperators
} from '../interfaces'
import type { JSONValue, OneOrMany } from './global.types'
import type { EntityPath } from './repository.types'

/**
 * @file Type Definitions - Mingo
 * @module types.mingo
 * @see https://github.com/kofrasa/mingo
 */

/**
 * Entity attributes mapped to [JSON Values][1] and [Query Operators][2].
 *
 * @template E - Entity
 *
 * [1]: https://restfulapi.net/json-data-types
 * [2]: https://docs.mongodb.com/manual/reference/operator/query/#query-selectors
 */
export type Criteria<E extends IEntity = IEntity> = Partial<
  Record<EntityPath<E>, JSONValue | QueryOperators>
>

/**
 * Type representing an [Aggregation expression][1].
 *
 * ! Does not include `ExpressionObject` definition due to circular referencing.
 *
 * @template E - Entity
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
 * @template E - Entity
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
 * @template E - Entity
 *
 * [1]: https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#expression-objects
 */
export type ExpressionObject2<E extends IEntity = IEntity> =
  | ExpressionObject<E>
  | Record<EntityPath<E>, ExpressionObject<E>>

/**
 * Type representing ALL [Aggregation expressions][1].
 *
 * @template E - Entity
 *
 * [1]: https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#expressions
 */
export type Expression<E extends IEntity = IEntity> =
  | ExpressionBase<E>
  | ExpressionObject2<E>

/**
 * Type representing a nested or top level entity key used as MongoDB operator.
 *
 * @template E - Entity
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
 * Entity attributes mapped to [Projection Operators][1].
 *
 * @template E - Entity
 *
 * [1]: https://docs.mongodb.com/manual/reference/operator/query/#projection-operators
 */
export type Projection<E extends IEntity = IEntity> = Partial<
  Record<EntityPath<E>, ProjectionOperators>
>

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
