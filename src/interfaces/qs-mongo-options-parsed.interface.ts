import type { ProjectStage, RepoSort } from '@/types'
import type { ParsedOptions } from 'qs-to-mongo/lib/query/options-to-mongo'
import type { IEntity } from './entity.interface'

/**
 * @file Interface - QSMongoParsedOptions
 * @module interfaces/QSMongoParsedOptions
 */

export interface QSMongoParsedOptions<E extends IEntity = IEntity>
  extends Omit<ParsedOptions, 'projection' | 'sort'> {
  $project: ProjectStage<E>
  sort: RepoSort<E>
}
