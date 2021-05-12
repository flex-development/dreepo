import type { EntityParsedUrlQuery, RepoSearchParams } from '@/types'
import qsm from 'qs-to-mongo'
import type { ParsedOptions } from 'qs-to-mongo/lib/query/options-to-mongo'
import type { IEntity } from './entity.interface'
import type { QSMongoParsedOptions } from './qs-mongo-options-parsed.interface'
import type { QSMongoOptions } from './qs-mongo-options.interface'

/**
 * @file Interface - IRepoSearchParamsBuilder
 * @module interfaces/RepoSearchParamsBuilder
 */

/**
 * `RepoSearchParamsBuilder` interface.
 *
 * @template E - Entity
 */
export interface IRepoSearchParamsBuilder<E extends IEntity = IEntity> {
  readonly builder: typeof qsm
  readonly builder_options: QSMongoOptions

  options(base: ParsedOptions): QSMongoParsedOptions
  params(query?: EntityParsedUrlQuery<E> | string): RepoSearchParams<E>
}
