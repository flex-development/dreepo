import { Repository as TestSubject } from '@dreepo'
import { EntityDTO } from '@dreepo/dto'
import type { CarParams, CarQuery, ICar } from '@tests/fixtures/cars.fixture'
import {
  Car,
  CARS_MOCK_CACHE as mockCache,
  REPO_PATH_CARS
} from '@tests/fixtures/cars.fixture'
import DBCONN from '@tests/fixtures/repo-db-connection.fixture'
import { clearRepository, loadRepository } from '@tests/utils'

/**
 * @file E2E Tests - Repository
 * @module tests/e2e/Repository
 */

jest.unmock('axios')
jest.unmock('lodash.merge')
jest.unmock('lodash.omit')

describe('e2e:Repository', () => {
  /**
   * Returns a test repository.
   *
   * @param {boolean} [cache] - If `true`, return with mock cache intialized
   * @return {TestSubject<ICar, CarParams, CarQuery>} Test repo
   */
  const getSubject = (
    cache: boolean = true
  ): TestSubject<ICar, CarParams, CarQuery> => {
    const Subject = new TestSubject<ICar, CarParams, CarQuery>(DBCONN, Car)

    // @ts-expect-error mocking
    if (cache) Subject.cache = Object.assign({}, mockCache)

    return Subject
  }

  const DTO: Readonly<EntityDTO<ICar>> = Object.freeze({
    make: 'MAKE',
    model: 'MODEL',
    model_year: -1
  })

  const DTO2: Readonly<EntityDTO<ICar>> = Object.freeze({
    ...DTO,
    model: 'BEST MODEL'
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
      const cache = false
      const Subject = getSubject(cache)

      const dto: EntityDTO<ICar> = Object.assign({}, DTO)
      const dto2: EntityDTO<ICar> = Object.assign({}, DTO2)

      afterAll(async () => {
        await clearRepository(REPO_PATH_CARS)
      })

      it('should create one entity', async () => {
        const entities = await Subject.save(dto)

        expect(entities[0]).toMatchObject(dto)
      })

      it('should create a group of entities', async () => {
        const dtos = [dto, dto2]

        const entities = await Subject.save(dtos)

        expect(entities[0]).toMatchObject(dtos[0])
        expect(entities[1]).toMatchObject(dtos[1])
      })
    })

    describe('should patch', () => {
      const Subject = getSubject()

      beforeAll(async () => {
        await loadRepository(REPO_PATH_CARS, Subject.cache.root)
      })

      afterAll(async () => {
        await clearRepository(REPO_PATH_CARS)
      })

      it('should patch one entity', async () => {
        const id = Subject.cache.collection[2].id
        const dto: EntityDTO<ICar> = Object.assign({}, { ...DTO, id })

        const entities = await Subject.save(dto)

        expect(entities[0]).toMatchObject(dto)
      })

      it('should patch a group of entities', async () => {
        const id = Subject.cache.collection[0].id
        const id1 = Subject.cache.collection[1].id

        const dto: EntityDTO<ICar> = Object.assign({}, { ...DTO, id: id })
        const dto1: EntityDTO<ICar> = Object.assign({}, { ...DTO, id: id1 })

        const entities = await Subject.save([dto, dto1])

        expect(entities[0]).toMatchObject(dto)
        expect(entities[1]).toMatchObject(dto1)
      })
    })
  })
})
