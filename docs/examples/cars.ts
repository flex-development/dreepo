import type { IEntity, QueryParams, RepoOptionsDTO } from '@dreepo'
import { Entity, RepoDBConnection, Repository } from '@dreepo'
import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

/**
 * @file Examples - Cars
 * @module docs/examples/cars
 */

const path = 'cars'
const url = process.env.FIREBASE_DATABASE_URL || ''
const client_email = process.env.FIREBASE_CLIENT_EMAIL || ''
const private_key = process.env.FIREBASE_PRIVATE_KEY || ''

export const dbconn = new RepoDBConnection(path, url, client_email, private_key)

export interface ICar extends IEntity {
  make: string
  model: string
  model_year: number
}

export type CarQuery = QueryParams<ICar>
export class Car extends Entity implements ICar {
  @IsString()
  @IsNotEmpty()
  make: ICar['make']

  @IsString()
  @IsNotEmpty()
  model: ICar['model']

  @IsNumber()
  model_year: ICar['model_year']
}

export const options: RepoOptionsDTO = {
  mingo: {},
  validation: {
    enabled: true,
    transformer: {},
    validator: {}
  }
}

export const Cars = new Repository<ICar, CarQuery>(dbconn, Car, options)

/**
 * After instantiation, before calling any repository methods, the cache must be
 * refreshed to keep the database and repository cache in sync.
 *
 * If the cache is empty before running an aggregation pipeline or executing a
 * search, a warning will be logged to the console.
 *
 * Not refreshing the cache before a write operation (`create` or `patch`) could
 * lead to accidental overwrites or other database inconsistencies.
 */
await Cars.refreshCache()
