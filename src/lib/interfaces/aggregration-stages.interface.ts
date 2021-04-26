import type { ObjectPath, QueryCriteria } from '../types'
import type { AggregationOperators } from './aggregation-operators.interface'
import type { IEntity } from './entity.interface'
import type { QueryOperators } from './query-operators.interface'

/**
 * @file Interface - AggregationStages
 * @module lib/interfaces/AggregationStages
 */

/**
 * [Aggregation Pipeline Stages][1].
 *
 * [1]: https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline
 */
export interface AggregationStages<E extends IEntity = IEntity> {
  /**
   * Limits the number of entities passed to the next stage in the pipeline.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/limit
   */
  $limit?: number

  /**
   * Filters the entities to pass only the entities that match the specified
   * condition(s) to the next pipeline stage.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/match
   */
  $match?:
    | QueryCriteria<E>
    | QueryOperators
    | { $expr: QueryOperators['$expr'] }

  /**
   * Randomly selects the specified number of entities from its input.
   */
  $sample?: { size: number }

  /**
   * Skips the first n entities where n is the specified skip number and passes
   * the remaining entities unmodified to the pipeline.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/skip
   */
  $skip?: number

  /**
   * Reorders the document stream by a specified sort key.
   * Only the order changes; the entities remain unmodified.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/sort
   */
  $sort?: Record<ObjectPath<E>, -1 | 1 | { $meta: 'textScore' }>

  /**
   * Passes along the entities with the requested fields to the next stage in
   * the pipeline. The specified fields can be existing fields from the input
   * entities or newly computed fields.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/project
   */
  $project?: Record<ObjectPath<E>, boolean | 0 | 1 | AggregationOperators>
}
