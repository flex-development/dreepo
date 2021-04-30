import { RTDRepository as TestSubject } from '@flex-development/rtd-repos'
import { EntityDTO } from '@flex-development/rtd-repos/lib/dto'
import type { QueryParams } from '@flex-development/rtd-repos/lib/types'
import {
  Car,
  CarEntity as ICar,
  CARS_MOCK_CACHE as mockCache,
  REPO_PATH_CARS as REPO_PATH,
  REPO_PATH_CARS
} from '@tests/fixtures/cars.fixture'
import { clearRepository } from '@tests/utils'

/**
 * @file E2E Tests - RTDRepository
 * @module tests/e2e/RTDRepository
 */

jest.unmock('axios')
jest.unmock('lodash.merge')
jest.unmock('lodash.omit')

describe('e2e:RTDRepository', () => {
  /**
   * Returns a test repository.
   *
   * @return {TestSubject<ICar, QueryParams<ICar>>} Test repo
   */
  const getSubject = (): TestSubject<ICar, QueryParams<ICar>> => {
    return new TestSubject<ICar, QueryParams<ICar>>(REPO_PATH, Car)
  }

  describe('#clear', () => {
    const Subject = getSubject()

    beforeAll(() => {
      // @ts-expect-error mocking
      Subject.cache = Object.assign({}, mockCache)
    })

    it('should clear database', async () => {
      const cleared = await Subject.clear()

      expect(cleared).toBeTruthy()

      expect(Subject.cache.collection).toBeArray({ length: 0 })
      expect(Subject.cache.root).toBePlainObject({ keys_length: 0 })
    })
  })

  describe('#create', () => {
    const Subject = getSubject()

    afterAll(async () => {
      await clearRepository(REPO_PATH_CARS)
    })

    it('should create new entity', async () => {
      const dto: EntityDTO<ICar> = {
        make: 'MAKE',
        model: 'MODEL',
        model_year: -1
      }

      const entity = await Subject.create(dto)

      expect(entity).toMatchObject(dto)

      expect(Subject.cache.collection).toBeArray({ length: 1 })
      expect(Subject.cache.root).toBePlainObject({ keys_length: 1 })
    })
  })

  describe('#delete', () => {
    it.todo('should remove one entity')

    it.todo('should remove a group of entities')
  })

  describe('#patch', () => {
    it.todo('should update an entity')
  })

  describe('#refreshCache', () => {
    it.todo('should update repository cache')
  })

  describe('#request', () => {
    it.todo('should request firebase database rest api')
  })

  describe('#save', () => {
    describe('should create', () => {
      it.todo('should create one entity')

      it.todo('should create a group of entities')
    })

    describe('should patch', () => {
      it.todo('should patch one entity')

      it.todo('should patch a group of entities')
    })
  })
})
