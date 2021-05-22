import { Entity, RepoDBConnection, Repository } from '@dreepo'
import type { RepoOptionsDTO } from '@dreepo/dto'
import type { IEntity } from '@dreepo/interfaces'
import type { RepoParsedUrlQuery, RepoSearchParams } from '@dreepo/types'
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString
} from 'class-validator'

/**
 * @file Examples - Users Repository
 * @module docs/examples/users
 */

const path = 'users'
const url = process.env.FIREBASE_DATABASE_URL || ''
const client_email = process.env.FIREBASE_CLIENT_EMAIL || ''
const private_key = process.env.FIREBASE_PRIVATE_KEY || ''

export const dbconn = new RepoDBConnection(path, url, client_email, private_key)

export interface IUser extends IEntity {
  email: string
  first_name: string
  last_name: string
  phone?: string
}

export type UserParams = RepoSearchParams<IUser>
export type UserQuery = RepoParsedUrlQuery<IUser>

export class User extends Entity implements IUser {
  @IsEmail()
  email: IUser['email']

  @IsString()
  @IsNotEmpty()
  first_name: IUser['first_name']

  @IsString()
  @IsNotEmpty()
  last_name: IUser['last_name']

  @IsOptional()
  @IsPhoneNumber()
  phone?: IUser['phone']
}

const options: RepoOptionsDTO<IUser> = {
  cache: { collection: [] },
  mingo: {},
  parser: {},
  validation: {
    enabled: true,
    transformer: {},
    validator: {}
  }
}

export const Users = new Repository<IUser, UserParams, UserQuery>(
  dbconn,
  User,
  options
)

/**
 * After instantiation, before calling any repository methods, the cache must be
 * refreshed to keep the database and repository cache in sync.
 *
 * If the cache is empty before running an aggregation pipeline or executing a
 * search, a warning will be logged to the console.
 *
 * Not refreshing the cache before a write operation (`create`, `patch`, or
 * `save`) could lead to accidental overwrites or other database
 * inconsistencies.
 */
await Users.refreshCache()
