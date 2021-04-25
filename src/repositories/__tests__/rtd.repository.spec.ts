import configuration from '@/config/configuration'
import { JWT } from 'google-auth-library'
import type { RuntypeBase } from 'runtypes/lib/runtype'
import { isType } from 'type-plus'
import TestSubject from '../rtd.repository'
import type { CarEntity } from './__fixtures__/cars.fixture'
import { Car, REPO_PATH_CARS } from './__fixtures__/cars.fixture'

/**
 * @file Unit Tests - RTDRepository
 * @module repositories/tests/RTDRepository
 */

describe('unit:repositories/RTDRepository', () => {
  const { FIREBASE_DATABASE_URL, FIREBASE_RTD_REPOS_VALIDATE } = configuration()

  describe('exports', () => {
    it('should export class by default', () => {
      expect(TestSubject).toBeDefined()
      expect(TestSubject.constructor.name).toBe('Function')
    })
  })

  describe('constructor', () => {
    it('should initialize instance properties', () => {
      const Subject = new TestSubject<CarEntity>(REPO_PATH_CARS, Car)

      expect(Subject.DATABASE_URL).toBe(FIREBASE_DATABASE_URL)
      expect(Subject.http).toBeDefined()
      expect(isType<JWT>(Subject.jwt as any)).toBeTruthy()
      expect(isType<RuntypeBase<CarEntity>>(Subject.model as any)).toBeTruthy()
      expect(Subject.path).toBe(REPO_PATH_CARS)
      expect(Subject.validate).toBe(FIREBASE_RTD_REPOS_VALIDATE)
    })
  })
})
