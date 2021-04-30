import type { IEntity } from '../models/entity.model'
import type { Expression } from '../types-mingo'
import type { CustomAccumulator } from './custom-accumulator.interface'

/**
 * @file Interface - AccumulatorOperators
 * @module lib/interfaces/AccumulatorOperators
 */

/**
 * [Accumulator operators][1] for the [`$group` Aggregation pipeline][2].
 *
 * @template E - Entity
 *
 * [1]: https://docs.mongodb.com/manual/reference/operator/aggregation/#accumulators---group-
 * [2]: https://docs.mongodb.com/manual/reference/operator/aggregation/group
 */
export interface AccumulatorOperators<E extends IEntity = IEntity> {
  /**
   * Returns the result of a user-defined accumulator function.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/accumulator
   */
  $accumulator?: CustomAccumulator

  /**
   * Returns an array of unique expression values for each group.
   * Order of the array elements is undefined.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/addToSet
   */
  $addToSet?: Expression<E>

  /**
   * Returns an average of numerical values. Ignores non-numeric values.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/avg
   */
  $avg?: Expression<E>

  /**
   * Returns a value from the first entity for each group.
   *
   * Only meaningful when entities are in a defined order.
   *
   * Order is only defined if the entities are in a defined order.
   *
   * Distinct from the `$first` array operator.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/first
   */
  $first?: Expression<E>

  /**
   * Returns a value from the last entity for each group.
   *
   * Only meaningful when entities are in a defined order.
   *
   * Order is only defined if the entities are in a defined order.
   *
   * Distinct from the `$last` array operator.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/last
   */
  $last?: Expression<E>

  /**
   * Returns the maximum value.
   *
   * Compares both value and type, using the [specified BSON comparison
   * order][1] for alues of different types.
   *
   * [1]: https://docs.mongodb.com/manual/reference/bson-type-comparison-order/#std-label-bson-types-comparison-order
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/max
   */
  $max?: Expression<E>

  /**
   * Returns a entity created by combining the input entities for each group.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/mergeObjects
   */
  $mergeObjects?: Expression<E>

  /**
   * Returns the minimum value.
   *
   * Compares both value and type, using the [specified BSON comparison
   * order][1] for alues of different types.
   *
   * [1]: https://docs.mongodb.com/manual/reference/bson-type-comparison-order/#std-label-bson-types-comparison-order
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/min
   */
  $min?: Expression<E>

  /**
   * Returns an array of all values that result from applying an expression to
   * each entity in a group of entities that share the same group by key.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/push
   */
  $push?: Expression<E>

  /**
   * Calculates the population standard deviation. Ignores non-numeric values.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/stdDevPop
   */
  $stdDevPop?: Expression<E>

  /**
   * Calculates the sample standard deviation. Ignores non-numeric values.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/stdDevSamp
   */
  $stdDevSamp?: Expression<E>

  /**
   * Returns a sum of numerical values. Ignores non-numeric values.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/sum
   */
  $sum?: Expression<E>
}
