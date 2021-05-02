import { Entity, Repository } from '@dreepo'
import type { QueryParams, RepoValidatorOptsDTO } from '@dreepo/lib/types'
import { Number, Static, String } from 'runtypes'
import { ValidationError } from 'runtypes/lib/errors'
import type { Failure } from 'runtypes/lib/result'
import { Failcode } from 'runtypes/lib/result'

/**
 * @file Examples - Cars
 * @module docs/examples/cars
 */

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

export const REPO_PATH = 'cars'
export const CarRepo = new Repository<CarEntity, CarQuery>(REPO_PATH, vopts)

/**
 * Every repository uses the `FIREBASE_DATABASE_URL` environment variable to set
 * used the `DATABASE_URL` instance property. While implemented as `readonly`
 * property, it can be overridden.
 */

// @ts-expect-error overriding database URL
CarRepo.DATABASE_URL = 'https://other-database.firebaseio.com'

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
