import type { QueryParams, RepoValidatorOptsDTO } from '@dreepo'
import { DBConnection, Entity, Repository } from '@dreepo'
import { Number, Static, String } from 'runtypes'
import { ValidationError } from 'runtypes/lib/errors'
import type { Failure } from 'runtypes/lib/result'
import { Failcode } from 'runtypes/lib/result'

/**
 * @file Examples - Cars
 * @module docs/examples/cars
 */

const url = process.env.FIREBASE_DATABASE_URL || ''
const client_email = process.env.FIREBASE_CLIENT_EMAIL || ''
const private_key = process.env.FIREBASE_PRIVATE_KEY || ''

export const dbconn = new DBConnection(url, client_email, private_key)

export const Car = Entity.extend({
  make: String,
  model: String,
  model_year: Number
})

export type CarEntity = Static<typeof Car>
export type CarQuery = QueryParams<CarEntity>

export const vopts: RepoValidatorOptsDTO<CarEntity> = {
  enabled: true,
  model: Car,
  refinement: async (value: CarEntity) => {
    if (!value.model.length) {
      const failure: Failure = {
        code: Failcode.CONTENT_INCORRECT,
        details: { model: value.model },
        message: 'Invalid model',
        success: false
      }

      throw new ValidationError(failure)
    }
  }
}

export const rpath = 'cars'
export const CarRepo = new Repository<CarEntity, CarQuery>(rpath, dbconn, vopts)

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
await CarRepo.refreshCache()
