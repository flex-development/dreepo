import type { RawObject } from 'mingo/util'
import { SortOrder } from '../enums/sort-order.enum'
import type { OneOrMany } from '../types-global'
import type {
  Expression,
  FieldPath,
  ProjectStage,
  QueryCriteria
} from '../types-mingo'
import type { EntityPath } from '../types-repository'
import type { AccumulatorOperators } from './accumulator-operators.interface'
import type { BucketStageAuto } from './bucket-stage-auto.interface'
import type { BucketStage } from './bucket-stage.interface'
import type { IEntity } from './entity.interface'
import type { QueryOperators } from './query-operators.interface'

/**
 * @file Interface - AggregationStages
 * @module lib/interfaces/AggregationStages
 */

/**
 * [Aggregation Pipeline Stages][1].
 *
 * @template E - Entity
 *
 * [1]: https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline
 */
export interface AggregationStages<E extends IEntity = IEntity> {
  /**
   * Adds new fields to entities.
   *
   * Outputs entities that contain all existing fields from the input entities
   * and newly added fields.
   *
   * If the name of the new field is the same as an existing field name, the
   * existing field value will be overwritten with the value of the specified
   * expression.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/addFields
   */
  $addFields?: Partial<Record<string, Expression<E>>>

  /**
   * Categorizes incoming entities into groups, called buckets, based on a
   * specified expression and boundaries and outputs a entity per bucket.
   *
   * Each output entity contains an `id` field whose value specifies the
   * inclusive lower bound of the bucket.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/bucket
   */
  $bucket?: BucketStage<E>

  /**
   * Categorizes incoming entities into a specific number of groups, called
   * buckets, based on a specified expression.
   *
   * Bucket boundaries are automatically determined in an attempt to evenly
   * distribute the entities into the specified number of buckets.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/bucketAuto
   */
  $bucketAuto?: BucketStageAuto<E>

  /**
   * Name of the field that contains a count of the number of entities at this
   * stage of the aggregation pipeline.
   */
  $count?: string

  /**
   * Processes multiple aggregation pipelines within a single stage on the same
   * set of input entities.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/facet
   */
  $facet?: Partial<Record<string, AggregationStages<E>>>

  /**
   * Groups input entities by a specified identifier expression and applies the
   * accumulator expression(s), if specified, to each group.
   *
   * The output entities only contain the identifier field and, if specified,
   * accumulated fields.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/group
   */
  $group?: Record<string, AccumulatorOperators<E>> & {
    id: Expression<E> | null
  }

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
  $match?: QueryCriteria<E> | QueryOperators | { $expr: Expression<E> }

  /**
   * Passes along the entities with the requested fields to the next stage in
   * the pipeline. The specified fields can be existing fields from the input
   * entities or newly computed fields.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/project
   */
  $project?: ProjectStage<E>

  /**
   * Restricts the contents of the entities based on information stored in the
   * entities themselves.
   *
   * The expression must resolve to **$$DESCEND**, **$$PRUNE**, or **$$KEEP**
   * system variables.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/redact
   */
  $redact?: Expression<E>

  /**
   * Replaces the input entity with the specified object.
   *
   * The operation replaces all existing fields in the input entity, including
   * the `id` field.
   *
   * `$replaceWith` is an alias for `$replaceRoot` stage.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/replaceRoot
   */
  $replaceRoot?: { newRoot: Expression<E> | RawObject }

  /**
   * Replaces the input entity with the specified object.
   *
   * The operation replaces all existing fields in the input entity, including
   * the `id` field.
   *
   * `$replaceWith` is an alias for `$replaceRoot` stage.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/replaceWith
   */
  $replaceWith?: Expression<E> | RawObject

  /**
   * Randomly selects the specified number of entities from its input.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/sample
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
   * Reorders the entity stream by a specified sort key.
   * Only the order changes; the entities remain unmodified.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/sort
   */
  $sort?: Partial<Record<EntityPath<E>, SortOrder | { $meta: 'textScore' }>>

  /**
   * Groups incoming entities based on the value of a specified expression,
   * then computes the count of entities in each distinct group.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/sortByCount
   */
  $sortByCount?: Expression<E>

  /**
   * Removes/excludes fields from entities.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/unset
   */
  $unset?: OneOrMany<EntityPath<E>>

  /**
   * Deconstructs an array field from the input entities to output a entity
   * for each element.
   *
   * Each output entity is the input entity with the value of the array field
   * replaced by the element.
   *
   * - https://docs.mongodb.com/manual/reference/operator/aggregation/unwind
   */
  $unwind?: FieldPath<E>
}
