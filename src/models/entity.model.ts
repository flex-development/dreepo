import type { IEntity } from '@/interfaces'
import { IsOptional, IsString } from 'class-validator'
import IsUnixTimestamp from '../decorators/is-unix-timestamp.decorator'

/**
 * @file Model - Entity
 * @module models/Entity
 */

export default class Entity implements IEntity {
  @IsUnixTimestamp()
  created_at: IEntity['created_at']

  @IsString()
  id: IEntity['id']

  @IsUnixTimestamp()
  @IsOptional()
  updated_at: IEntity['updated_at']
}
