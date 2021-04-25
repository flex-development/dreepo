import { Null, Number, Record, Static, String } from 'runtypes'

/**
 * @file Test Fixture - Cars Repository
 * @module repositories/tests/fixtures/cars.fixture
 */

export const REPO_PATH_CARS = 'cars'

export const Car = Record({
  created_at: Number,
  id: String,
  make: String,
  model: String,
  model_year: Number,
  updated_at: Number.Or(Null)
})

export type CarEntity = Static<typeof Car>
