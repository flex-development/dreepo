import { ExceptionStatusCode } from '@flex-development/exceptions/enums'
import Exception from '@flex-development/exceptions/exceptions/base.exception'
import type { ICar } from '@tests/fixtures/cars.fixture'
import { Car, CARS_MOCK_CACHE } from '@tests/fixtures/cars.fixture'
import TestSubject from '../repo-validator.mixin'

/**
 * @file Unit Tests - RepoValidator
 * @module mixins/tests/RepoValidator
 */

describe('unit:mixins/RepoValidator', () => {
  const ENTITY = CARS_MOCK_CACHE.collection[0]

  const Subject = new TestSubject<ICar>(Car)

  describe('#check', () => {
    it('should validate value if validation is enabled', async () => {
      const spy_validator = jest.spyOn(Subject, 'validator')

      await Subject.check(ENTITY)

      expect(spy_validator).toBeCalledTimes(1)
    })

    it('should not validate value if validation is disabled', async () => {
      const Subject = new TestSubject<ICar>(Car, { enabled: false })
      const spy_validator = jest.spyOn(Subject, 'validator')

      await Subject.check(ENTITY)

      expect(spy_validator).toBeCalledTimes(0)
    })

    it('should return value if validation passes', async () => {
      const value = await Subject.check(ENTITY)

      expect(value).toMatchObject(ENTITY)
    })

    it('should throw Exception if validation fails', async () => {
      let exception = {} as Exception

      try {
        await Subject.check({})
      } catch (error) {
        exception = error
      }

      expect(exception.code).toBe(ExceptionStatusCode.BAD_REQUEST)
      expect(exception.data).toMatchObject({ options: Subject.tvo })
      expect(exception.errors).toBeArray()
      expect(exception.message).toMatch(/entity validation failure/)
    })
  })
})
