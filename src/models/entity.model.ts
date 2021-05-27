import type { IEntity } from '@/interfaces'
import { IsUnixTimestamp } from '@flex-development/mango/decorators'
import type { JSONValue } from '@flex-development/tutils'
import { IsOptional, IsString } from 'class-validator'

/**
 * @file Model - Entity
 * @module models/Entity
 */

export default class Entity implements IEntity {
  // Firebase Realtime Database is a JSON database
  [x: string]: JSONValue | undefined

  @IsUnixTimestamp()
  created_at: IEntity['created_at']

  @IsString()
  id: IEntity['id']

  @IsUnixTimestamp()
  @IsOptional()
  updated_at: IEntity['updated_at']
}
