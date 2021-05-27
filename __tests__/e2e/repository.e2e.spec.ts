import { Repository as TestSubject } from '@dreepo'
import type { EntityDTO } from '@flex-development/mango/dtos'
import type { ICar } from '@tests/fixtures/cars.fixture'
import {
  Car,
  CARS,
  CARS_MOCK_CACHE,
  CARS_OPTIONS as OPTIONS,
  REPO_PATH_CARS
} from '@tests/fixtures/cars.fixture'
import DBCONN from '@tests/fixtures/repo-db-connection.fixture'
import { clearRepository, loadRepository } from '@tests/utils'
import merge from 'lodash.merge'

/**
 * @file E2E Tests - Repository
 * @module tests/e2e/Repository
 */

jest.unmock('axios')

describe('e2e:Repository', () => {
  /**
   * Returns a test repository.
   *
   * @param {boolean} [cache] - If `true`, return with mock cache initialized
   * @return {TestSubject<ICar>} Test repo
   */
  const getSubject = (cache: boolean = true): TestSubject<ICar> => {
    const options = Object.assign({}, OPTIONS)
    if (!cache) options.cache = { collection: [] }

    return new TestSubject<ICar>(DBCONN, Car, options)
  }

  const ENTITY = CARS[0]
  const ENTITY_1 = CARS[1]
  const ENTITY_2 = CARS[2]

  const DTO: Readonly<EntityDTO<ICar>> = Object.freeze({
    make: 'MAKE',
    model: 'MODEL',
    model_year: -1
  })

  const DTO2: Readonly<EntityDTO<ICar>> = Object.freeze({
    ...DTO,
    model: 'BEST MODEL'
  })

  describe('#cacheInit', () => {
    const cache = false
    const Subject = getSubject(cache)

    beforeAll(async () => {
      await loadRepository(REPO_PATH_CARS, CARS_MOCK_CACHE.root)
    })

    afterAll(async () => {
      await clearRepository(REPO_PATH_CARS)
    })

    it('should fetch repository root data and initialize cache', async () => {
      // Act
      await Subject.cacheInit()

      // Expect
      expect(Subject.cache).toMatchObject(CARS_MOCK_CACHE)
    })
  })

  describe('#cacheSync', () => {
    const Subject = getSubject()

    afterAll(async () => {
      await clearRepository(REPO_PATH_CARS)
    })

    it('should copy #cache.root to database', async () => {
      // Act
      const result = await Subject.cacheSync()

      // Expect
      expect(result).toMatchObject(Subject.cache.root)
    })
  })

  describe('#clear', () => {
    const Subject = getSubject()
    it('should clear database', async () => {
      // Act
      const result = await Subject.clear()

      // Expect
      expect(result).toBeTruthy()
      expect(Subject.cache.collection).toBeArrayOfSize(0)
      expect(Subject.cache.root).toContainAllKeys([])
    })
  })

  describe('#create', () => {
    const Subject = getSubject()
    afterAll(async () => {
      await clearRepository(REPO_PATH_CARS)
    })

    it('should create new entity', async () => {
      // Act
      const result = await Subject.create(Object.assign({}, DTO))

      // Expect
      expect(Subject.cache.root[result.id]).toMatchObject(result)
    })
  })

  describe('#delete', () => {
    const Subject = getSubject()
    beforeAll(async () => {
      await loadRepository(REPO_PATH_CARS, CARS_MOCK_CACHE.root)
    })

    afterAll(async () => {
      await clearRepository(REPO_PATH_CARS)
    })

    it('should remove one entity', async () => {
      // Act
      const result = await Subject.delete(ENTITY.id)

      // Expected
      expect(result).toIncludeSameMembers([ENTITY.id])
    })

    it('should remove a group of entities', async () => {
      // Arrange
      const uids = [ENTITY_1.id, ENTITY_2.id]

      // Act
      const result = await Subject.delete(uids)

      // Expect
      expect(result).toEqual(expect.arrayContaining(uids))
    })
  })

  describe('#patch', () => {
    const Subject = getSubject()
    beforeAll(async () => {
      await loadRepository(REPO_PATH_CARS, CARS_MOCK_CACHE.root)
    })

    afterAll(async () => {
      await clearRepository(REPO_PATH_CARS)
    })

    it('should update an entity', async () => {
      // Act
      const result = await Subject.patch(ENTITY.id, Object.assign({}, DTO))

      // Expect
      expect(result).toMatchObject(DTO)
    })
  })

  describe('#save', () => {
    describe('should create', () => {
      const cache = false
      const Subject = getSubject(cache)
      afterAll(async () => {
        await clearRepository(REPO_PATH_CARS)
      })

      it('should create one entity', async () => {
        // Act
        const result = await Subject.save(Object.assign({}, DTO))

        // Expect
        expect(result[0]).toMatchObject(DTO)
      })

      it('should create a group of entities', async () => {
        // Arrange
        const dtos = [Object.assign({}, DTO), Object.assign({}, DTO2)]

        // Act
        const result = await Subject.save(dtos)

        // Expect
        expect(result[0]).toMatchObject(dtos[0])
        expect(result[1]).toMatchObject(dtos[1])
      })
    })

    describe('should patch', () => {
      const Subject = getSubject()
      beforeAll(async () => {
        await loadRepository(REPO_PATH_CARS, CARS_MOCK_CACHE.root)
      })

      afterAll(async () => {
        await clearRepository(REPO_PATH_CARS)
      })

      it('should patch one entity', async () => {
        // Arrange
        const dto: EntityDTO<ICar> = merge({}, DTO, { id: ENTITY_2.id })

        // Act
        const result = await Subject.save(dto)

        // Expect
        expect(result).toBeArrayOfSize(1)
        expect(result[0]).toMatchObject(dto)
      })

      it('should patch a group of entities', async () => {
        // Arrange
        const dto = [
          merge({}, DTO, { id: ENTITY_1.id }),
          merge({}, DTO2, { id: ENTITY_2.id })
        ]

        // Act
        const result = await Subject.save(dto)

        // Expect
        expect(result[0]).toMatchObject(dto[0])
        expect(result[1]).toMatchObject(dto[1])
      })
    })
  })
})
