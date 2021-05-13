import type { ParsedOptions, ProjectStage, RepoSort } from '@/types'
import type { IEntity } from './entity.interface'

/**
 * @file Interface - QSMongoParsedOptions
 * @module interfaces/QSMongoParsedOptions
 */

export interface QSMongoParsedOptions<E extends IEntity = IEntity>
  extends Omit<ParsedOptions, 'projection' | 'sort'> {
  $project?: ProjectStage<E>
  sort?: RepoSort<E>
}
