import { Number, Record, Static, String } from 'runtypes'
import ROOT from './cars-root.fixture.json'

/**
 * @file Test Fixture - Cars Repository
 * @module tests/fixtures/cars.fixture
 */

export const REPO_PATH_CARS = 'cars'

export const Car = Record({
  created_at: Number,
  id: String,
  make: String,
  model: String,
  model_year: Number,
  updated_at: Number.optional()
})

export type CarEntity = Static<typeof Car>

export const CARS_ROOT = Object.freeze(ROOT)
export const CARS = Object.values(CARS_ROOT)

export const CARS_MOCK_CACHE_EMPTY = Object.freeze({ collection: [], root: {} })
export const CARS_MOCK_CACHE = Object.freeze({
  collection: CARS,
  root: CARS_ROOT
})
