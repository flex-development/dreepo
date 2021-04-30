import { Entity } from '@/lib/models/entity.model'
import { Number, Static, String } from 'runtypes'
import ROOT from './cars-root.fixture.json'

/**
 * @file Test Fixture - Cars Repository
 * @module tests/fixtures/cars.fixture
 */

export const REPO_PATH_CARS = 'cars'

export const Car = Entity.extend({
  make: String,
  model: String,
  model_year: Number
})

export type CarEntity = Static<typeof Car>

export const CARS_ROOT = Object.freeze(ROOT)
export const CARS = Object.values(CARS_ROOT)

export const CARS_MOCK_CACHE_EMPTY = Object.freeze({ collection: [], root: {} })
export const CARS_MOCK_CACHE = Object.freeze({
  collection: CARS,
  root: CARS_ROOT
})
