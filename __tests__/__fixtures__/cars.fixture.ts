import { IEntity } from '@/interfaces'
import { Entity } from '@/models'
import type { RepoParsedUrlQuery, RepoSearchParams } from '@/types'
import { IsNotEmpty, IsNumber, IsString } from 'class-validator'
import ROOT from './cars-root.fixture.json'

/**
 * @file Test Fixture - Cars Repository
 * @module tests/fixtures/cars.fixture
 */

export interface ICar extends IEntity {
  make: string
  model: string
  model_year: number
}

export type CarParams = RepoSearchParams<ICar>

export type CarQuery = RepoParsedUrlQuery<ICar>

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

export const REPO_PATH_CARS = 'cars'

export const CARS_ROOT = Object.freeze(ROOT)
export const CARS = Object.values(CARS_ROOT)

export const CARS_MOCK_CACHE_EMPTY = Object.freeze({ collection: [], root: {} })
export const CARS_MOCK_CACHE = Object.freeze({
  collection: CARS,
  root: CARS_ROOT
})
