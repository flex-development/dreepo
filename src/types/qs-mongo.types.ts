import type { ParsedOptions as OriginalParsedOptions } from 'qs-to-mongo/lib/query/options-to-mongo'

/**
 * @file Type Definitions - Querystring to Mongo
 * @module types.qs-mongo
 * @see https://github.com/fox1t/qs-to-mongo
 */

/**
 * Default [`parameters` parsing options][1].
 *
 * [1]: https://github.com/fox1t/qs-to-mongo#overriding-parameters
 */
export type QSMongoParameters = {
  fields: string
  limit: string
  offset: string
  omit: string
  q: string
  sort: string
}

/**
 * Parsed query options object with correct type definitions.
 */
export type ParsedOptions = Partial<OriginalParsedOptions>
