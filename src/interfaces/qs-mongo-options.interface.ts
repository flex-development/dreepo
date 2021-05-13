import type { OneOrMany } from '@/types'
import type { QSMongoParameters } from '@/types/qs-mongo.types'
import { CustomQSMongoQueryParser } from './custom-qs-mongo-query-parser.interface'

/**
 * @file Interface - QSMongoOptions
 * @module interfaces/QSMongoOptions
 * @see https://github.com/fox1t/qs-to-mongo
 */

/**
 * Parsing options for [`qs-to-mongo`][1].
 *
 * [1]: https://github.com/fox1t/qs-to-mongo#options
 */
export interface QSMongoOptions {
  /**
   * Fields that will be converted to `Date`. If no fields are passed, any valid
   * date string will be converted to [ISOString][1].
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
   */
  dateFields?: OneOrMany<string>

  /**
   * Fields that will be used as criteria when passing `text` query parameter.
   */
  fullTextFields?: OneOrMany<string>

  /**
   * Array of query parameters that are ignored, in addition to the defaults:
   *
   * - `fields`
   * - `limit`
   * - `offset`
   * - `omit`
   * - `sort`
   * - `text`
   */
  ignoredFields?: OneOrMany<string>

  /**
   * Maximum limit that could be passed to limit option.
   */
  maxLimit?: number

  /**
   * Fields that will be converted to [ObjectId][1].
   *
   * [1]: https://docs.mongodb.com/manual/reference/method/ObjectId/
   */
  objectIdFields?: OneOrMany<string>

  /**
   * Override default parameters used as query options.
   */
  parameters?: Partial<QSMongoParameters>

  /**
   * Custom query parser.
   */
  parser?: CustomQSMongoQueryParser

  /**
   * Options to pass to the query parser.
   */
  parserOptions?: any
}
