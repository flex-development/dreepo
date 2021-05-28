import {
  CreateEntityDTO,
  MangoRepositoryAsync as Super,
  PatchEntityDTO
} from '@flex-development/mango'
import type { ICar } from '@tests/fixtures/cars.fixture'
import {
  Car,
  CARS_MOCK_CACHE,
  CARS_OPTIONS as OPTIONS,
  CARS_ROOT
} from '@tests/fixtures/cars.fixture'
import DBCONN from '@tests/fixtures/repo-db-connection.fixture'
import TestSubject from '../repository'

/**
 * @file Unit Tests - Repository
 * @module repositories/tests/Repository
 */

jest.mock('@/providers/db-connection.provider')

describe('unit:repositories/Repository', () => {
  const Subject = new TestSubject<ICar>(DBCONN, Car, OPTIONS)

  const UID_FIELD = Subject.options.mingo.idKey
  const ENTITY = OPTIONS.cache?.collection[0] as ICar
  const ENTITY_UID = ENTITY[UID_FIELD]

  describe('constructor', () => {
    it('should initialize instance properties', () => {
      expect(Subject.dbconn).toBe(DBCONN)
    })
  })

  describe('#cacheInit', () => {
    it('should fetch repository root data and initialize cache', async () => {
      // Arrange
      const spy_dbconn_send = jest.spyOn(Subject.dbconn, 'send')
      const spy_setCache = jest.spyOn(Subject, 'setCache')

      // Act
      spy_dbconn_send.mockReturnValueOnce(Promise.resolve(CARS_ROOT))

      await Subject.cacheInit()

      // Expect
      expect(spy_dbconn_send).toBeCalledTimes(1)
      expect(spy_setCache).toBeCalledTimes(1)
      expect(spy_setCache).toBeCalledWith(Object.values(CARS_ROOT))
    })
  })

  describe('#cacheSync', () => {
    it('should copy #cache.root to database', async () => {
      // Arrange
      const spy_dbconn_send = jest.spyOn(Subject.dbconn, 'send')

      // Act
      spy_dbconn_send.mockReturnValueOnce(Promise.resolve(CARS_ROOT))

      await Subject.cacheSync()

      // Expect
      expect(spy_dbconn_send).toBeCalledTimes(1)
      expect(spy_dbconn_send).toBeCalledWith({
        data: Subject.cache.root,
        method: 'put'
      })
    })
  })

  describe('#clear', () => {
    const spy_super_clear = jest.spyOn(Super.prototype, 'clear')
    const spy_cacheSync = jest.spyOn(Subject, 'cacheSync')

    beforeEach(async () => {
      await Subject.clear()
    })

    afterEach(() => {
      // @ts-expect-error manually resetting cache
      Subject.cache = CARS_MOCK_CACHE
    })

    it('should clear in-memory repository', async () => {
      expect(spy_super_clear).toBeCalledTimes(1)
    })

    it('should clear database repository', async () => {
      expect(spy_cacheSync).toBeCalledTimes(1)
    })
  })

  describe('#create', () => {
    // @ts-expect-error testing
    const spy_super_create = jest.spyOn(Super.prototype, 'create')
    const spy_cacheSync = jest.spyOn(Subject, 'cacheSync')

    const dto: CreateEntityDTO<ICar> = {
      [UID_FIELD]: 'DTO_UID',
      make: 'MAKE',
      model: 'MODEL',
      model_year: -1
    }

    beforeEach(async () => {
      // @ts-expect-error manually resetting cache
      Subject.cache = CARS_MOCK_CACHE
      await Subject.create(dto)
    })

    it('should call super.create', () => {
      expect(spy_super_create).toBeCalledTimes(1)
      expect(spy_super_create.mock.calls[0][0]).toMatchObject(dto)
    })

    it('should create new entity in database repository', () => {
      expect(spy_cacheSync).toBeCalledTimes(1)
    })
  })

  describe('#delete', () => {
    const spy_super_delete = jest.spyOn(Super.prototype, 'delete')
    const spy_cacheSync = jest.spyOn(Subject, 'cacheSync')

    beforeEach(async () => {
      await Subject.delete()
    })

    it('should call super.delete', () => {
      expect(spy_super_delete).toBeCalledTimes(1)
    })

    it('should delete entity in database repository', () => {
      expect(spy_cacheSync).toBeCalledTimes(1)
    })
  })

  describe('#patch', () => {
    const spy_super_patch = jest.spyOn(Super.prototype, 'patch')
    const spy_cacheSync = jest.spyOn(Subject, 'cacheSync')

    const dto: PatchEntityDTO<ICar> = {}

    beforeEach(async () => {
      await Subject.patch(ENTITY_UID, dto)
    })

    it('should add "created_at" and "updated_at" to readonly fields', () => {
      // Arrange
      const efields = ['created_at', 'updated_at']

      // Expect
      expect(spy_super_patch.mock.calls[0][2]).toIncludeAllMembers(efields)
    })

    it('should call super.patch', () => {
      expect(spy_super_patch).toBeCalledTimes(1)
    })

    it('should patch entity in database repository', () => {
      expect(spy_cacheSync).toBeCalledTimes(1)
    })
  })

  describe('#save', () => {
    const spy_super_save = jest.spyOn(Super.prototype, 'save')
    const spy_cacheSync = jest.spyOn(Subject, 'cacheSync')

    beforeEach(async () => {
      await Subject.save([])
    })

    it('should call super.save', () => {
      expect(spy_super_save).toBeCalledTimes(1)
    })

    it('should upsert entities into database repository', () => {
      expect(spy_cacheSync).toBeCalledTimes(1)
    })
  })
})
