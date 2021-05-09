import type { Expression, NumberString } from '@/types'
import type { AccumulatorOperators } from './accumulator-operators.interface'
import type { IEntity } from './entity.interface'

/**
 * @file Interface - BucketStage
 * @module interfaces/BucketStage
 */

/**
 * [Aggregation Pipeline Stage - `$bucket`][1].
 *
 * @template E - Entity
 *
 * [1]: https://docs.mongodb.com/manual/reference/operator/aggregation/bucket
 */
export interface BucketStage<E extends IEntity = IEntity> {
  /**
   * An array of values based on the `groupBy` expression that specify the
   * boundaries for each bucket.
   *
   * Each adjacent pair of values acts as the inclusive lower boundary and the
   * exclusive upper boundary for the bucket.
   *
   * You must specify at least two boundaries.
   *
   * The specified values must be in ascending order and all of the same
   * [type][1].
   *
   * The exception is if the values are of mixed numeric types, such as:
   *
   * - `[ 10, NumberLong(20), NumberInt(30) ]`
   *
   * [1]: https://docs.mongodb.com/manual/reference/bson-types/
   */
  boundaries: any[]

  /**
   * A literal that specifies the `id` of an additional bucket that contains all
   * entities whose `groupBy` expression result does not fall into a bucket
   * specified by `boundaries`.
   *
   * If unspecified, each input entity must resolve the `groupBy` expression to
   * a value within one of the bucket ranges specified by boundaries or the
   * operation throws an error.
   *
   * The `default` value must be less than the lowest `boundaries` value, or
   * greater than or equal to the highest `boundaries` value.
   *
   * The default value can be of a different [type][1] than the entries in
   * `boundaries`.
   *
   * [1]: https://docs.mongodb.com/manual/reference/bson-types/
   */
  default?: NumberString

  /**
   * Aggregation expression to group entities by.
   *
   * Unless `$bucket` includes a default specification, each input entity must
   * resolve the `groupBy` field path or expression to a value that falls within
   * one of the ranges specified by the boundaries.
   */
  groupBy: Expression<E>

  /**
   * Object that specifies the fields to include in the output documents in
   * addition to the `id` field.
   *
   * To specify the field to include, you must use [accumulator expressions][1].
   *
   * [1]: https://docs.mongodb.com/manual/meta/aggregation-quick-reference/#std-label-agg-quick-reference-accumulators
   */
  output?: Record<string, AccumulatorOperators<E>>
}
