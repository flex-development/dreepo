import type {
  OneOrMany,
  ParsedOptions,
  RepoParsedUrlQuery,
  RepoSearchParams,
  RepoSearchParamsBuilderOptions
} from '@/types'
import { ExceptionStatusCode } from '@flex-development/exceptions/enums'
import Exception from '@flex-development/exceptions/exceptions/base.exception'
import type { PlainObject } from '@flex-development/exceptions/types'
import qsm from 'qs-to-mongo'
import type {
  CustomQSMongoQueryParser,
  IEntity,
  IRepoSearchParamsBuilder,
  QSMongoOptions,
  QSMongoParsedOptions
} from '../interfaces'

/**
 * @file Mixin - RepoSearchParamsBuilder
 * @module mixins/RepoSearchParamsBuilder
 */

/**
 * Converts Mongo URL queries into repository search parameters objects.
 *
 * @template E - Entity
 *
 * @class
 * @implements {IRepoSearchParamsBuilder<E>}
 */
export default class RepoSearchParamsBuilder<E extends IEntity = IEntity>
  implements IRepoSearchParamsBuilder<E> {
  /**
   * @readonly
   * @instance
   * @property {typeof qsm} builder - `qs-to-mongo` module
   * @see https://github.com/fox1t/qs-to-mongo
   */
  readonly builder: typeof qsm = qsm

  /**
   * @readonly
   * @instance
   * @property {QSMongoOptions} builder_options - `qs-to-mongo` module options
   */
  readonly builder_options: QSMongoOptions

  /**
   * Creates a new `RepoSearchParamsBuilder` client.
   *
   * Converts MongoDB query objects and strings into search parameters objects.
   *
   * - https://github.com/fox1t/qs-to-mongo
   * - https://github.com/kofrasa/mingo
   *
   * @param {RepoSearchParamsBuilderOptions} [options] - Builder options
   * @param {OneOrMany<string>} [options.dateFields] - Fields that will be
   * converted to `Date`; if no fields are passed, any valid date string will be
   * converted to an ISO-8601 string
   * @param {OneOrMany<string>} [options.fullTextFields] - Fields that will be
   * used as criteria when passing `text` query parameter
   * @param {OneOrMany<string>} [options.ignoredFields] - Array of query
   * parameters that are ignored, in addition to the defaults (`fields`,
   * `limit`, `offset`, `omit`, `sort`, `text`)
   * @param {number} [options.maxLimit] - Max that can be passed to limit option
   * @param {CustomQSMongoQueryParser} [options.parser] - Custom query parser
   * @param {any} [options.parserOptions] - Custom query parser options
   */
  constructor(options: RepoSearchParamsBuilderOptions = {}) {
    const builder_options = Object.assign({}, options)

    Reflect.deleteProperty(builder_options, 'objectIdFields')
    Reflect.deleteProperty(builder_options, 'parameters')

    this.builder_options = builder_options
  }

  /**
   * Converts a parsed Mongo URL query object object into `RepoSearchParams`
   * options object.
   *
   * @param {ParsedOptions} [base] - Parsed Mongo URL query object
   * @return {QSMongoParsedOptions<E>} Repository search parameters object
   */
  options(base: ParsedOptions = {}): QSMongoParsedOptions<E> {
    const { projection, sort, ...rest } = base

    return {
      ...rest,
      $project: projection as QSMongoParsedOptions<E>['$project'],
      sort: sort as QSMongoParsedOptions<E>['sort']
    }
  }

  /**
   * Converts a Mongo URL query object or string into a repository search
   * parameters object.
   *
   * @param {RepoParsedUrlQuery<E> | string} [query] - Query object or string
   * @return {RepoSearchParams<E>} Repository search parameters object
   * @throws {Exception}
   */
  params(query: RepoParsedUrlQuery<E> | string = ''): RepoSearchParams<E> {
    let build: PlainObject = {}

    try {
      build = this.builder(query, this.builder_options)
    } catch ({ message, stack }) {
      const code = ExceptionStatusCode.BAD_REQUEST
      const data = { builder_options: this.builder_options, query }

      throw new Exception(code, message, data, stack)
    }

    return {
      ...build.criteria,
      options: this.options(build.options)
    } as RepoSearchParams<E>
  }
}
