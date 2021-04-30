import { Number, Record, Static, String } from 'runtypes'

/**
 * @file Models - Entity
 * @module lib/models/Entity
 */

export const Entity = Record({
  /**
   * Date and time entity was created.
   *
   * - Format: [Unix Timestamp](https://en.wikipedia.org/wiki/Unix_time)
   */
  created_at: Number,

  /**
   * Unique identifier for the entity.
   */
  id: String,

  /**
   * Date and time entity was modified.
   *
   * - Format: [Unix Timestamp](https://en.wikipedia.org/wiki/Unix_time)
   */
  updated_at: Number.optional()
}).asReadonly()

export type IEntity = Static<typeof Entity>
