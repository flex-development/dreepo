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
import { clearRepository, loadRepository } from '@tests/utils'

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
   * @param {boolean} [cache] - If `true`, return with mock cache intialized
   * @return {TestSubject<ICar, QueryParams<ICar>>} Test repo
   */
  const getSubject = (
    cache: boolean = true
  ): TestSubject<ICar, QueryParams<ICar>> => {
    const Subject = new TestSubject<ICar, QueryParams<ICar>>(REPO_PATH, Car)

    // @ts-expect-error mocking
    if (cache) Subject.cache = Object.assign({}, mockCache)

    return Subject
  }

  const DTO: Readonly<EntityDTO<ICar>> = Object.freeze({
    make: 'MAKE',
    model: 'MODEL',
    model_year: -1
  })

  describe('#clear', () => {
    const Subject = getSubject()

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
      const dto: EntityDTO<ICar> = Object.assign({}, DTO)

      const entity = await Subject.create(dto)

      expect(entity).toMatchObject(dto)

      expect(Subject.cache.collection).toBeArray({ length: 1 })
      expect(Subject.cache.root).toBePlainObject({ keys_length: 1 })
    })
  })

  describe('#delete', () => {
    const Subject = getSubject()

    beforeAll(async () => {
      await loadRepository(REPO_PATH_CARS, Subject.cache.root)
    })

    afterAll(async () => {
      await clearRepository(REPO_PATH_CARS)
    })

    it('should remove one entity', async () => {
      const id = Subject.cache.collection[0].id

      const deleted = await Subject.delete(id)

      expect(deleted[0]).toBe(id)
    })

    it('should remove a group of entities', async () => {
      const ids = [
        Subject.cache.collection[1].id,
        Subject.cache.collection[2].id
      ]

      const deleted = await Subject.delete(ids)

      expect(deleted).toEqual(expect.arrayContaining(ids))
    })
  })

  describe('#patch', () => {
    const Subject = getSubject()

    beforeAll(async () => {
      await loadRepository(REPO_PATH_CARS, Subject.cache.root)
    })

    afterAll(async () => {
      await clearRepository(REPO_PATH_CARS)
    })

    it('should update an entity', async () => {
      const id = Subject.cache.collection[0].id

      const dto: EntityDTO<ICar> = Object.assign({}, DTO)

      const entity = await Subject.patch(id, dto)

      expect(entity).toMatchObject(dto)
    })
  })

  describe('#refreshCache', () => {
    const cache = false
    const Subject = getSubject(cache)

    beforeAll(async () => {
      await loadRepository(REPO_PATH_CARS, mockCache.root)
    })

    afterAll(async () => {
      await clearRepository(REPO_PATH_CARS)
    })

    it('should update repository cache', async () => {
      await Subject.refreshCache()

      expect(Subject.cache).toMatchObject(mockCache)
    })
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
