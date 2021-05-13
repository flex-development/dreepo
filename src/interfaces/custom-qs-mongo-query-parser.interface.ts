import type { ParsedUrlQuery } from 'node:querystring'
import type { QSMongoOptions } from './qs-mongo-options.interface'

/**
 * @file Interface - CustomQueryParser
 * @module interfaces/ICustomQueryParser
 * @see https://github.com/fox1t/qs-to-mongo#options
 */

/**
 * Custom MongoDB query object or string parser.
 */
export interface CustomQSMongoQueryParser {
  parse(query: string, options?: QSMongoOptions['parserOptions']): any
  stringify(
    obj: ParsedUrlQuery,
    options?: QSMongoOptions['parserOptions']
  ): string
}
