import {
  ExceptionClassName as ClassName,
  ExceptionStatus as Status
} from '@rtd-repos/lib/enums'
import TestSubject from '../base.exception'
import { DEM } from '../constants.exceptions'

/**
 * @file Unit Tests - Exception
 * @module lib/exceptions/tests/Exception
 */

describe('lib/exceptions/Exception', () => {
  describe('exports', () => {
    it('should export class by default', () => {
      expect(TestSubject).toBeDefined()
      expect(TestSubject.constructor.name).toBe('Function')
    })
  })

  describe('constructor', () => {
    describe('#errors', () => {
      it('should === data.errors if array', () => {
        const data = { errors: [] }
        const Subject = new TestSubject(Status.BAD_REQUEST, undefined, data)

        expect(Subject.data).toMatchObject({})
        expect({ errors: Subject.errors }).toMatchObject(data)
      })

      it('should === data.errors if plain object', () => {
        const data = { errors: { test: true } }
        const Subject = new TestSubject(Status.LENGTH_REQUIRED, undefined, data)

        expect(Subject.data).toMatchObject({})
        expect({ errors: Subject.errors }).toMatchObject(data)
      })

      it('should === null if data.errors schema is invalid', () => {
        const data = { errors: 5 }
        const Subject = new TestSubject(Status.NOT_ACCEPTABLE, undefined, data)

        expect(Subject.data).toMatchObject({})
        expect(Subject.errors).toBe(null)
      })
    })

    describe('#data', () => {
      const properties = ['errors', 'message']

      it(`should omit properties: ${properties}`, () => {
        const data = { errors: { test: true }, foo: true, message: 'Test' }
        const Subject = new TestSubject(Status.NOT_FOUND, undefined, data)

        expect(Subject.data.errors).not.toBeDefined()
        expect(Subject.data.message).not.toBeDefined()
        expect(Subject.data).toMatchObject({ foo: data.foo })
      })
    })

    describe('#message', () => {
      it('should === default exception message', () => {
        const Subject = new TestSubject()

        expect(Subject.message).toBe(DEM)
      })

      it('should === data.message', () => {
        const data = { message: 'Test override message' }
        const Subject = new TestSubject(Status.MISDIRECTED, undefined, data)

        expect(Subject.message).toBe(data.message)
        expect(Subject.data.message).not.toBeDefined()
      })
    })
  })

  describe('.findNameByCode', () => {
    it('should return name of exception', () => {
      expect(TestSubject.findNameByCode(Status.GONE)).toBe('GONE')
    })

    it('should return empty string', () => {
      expect(TestSubject.findNameByCode(-1)).toBe('')
    })
  })

  describe('.formatCode', () => {
    const code = Status.UNAUTHORIZED

    it('should return 500 if exception status code is invalid', () => {
      expect(TestSubject.formatCode(-1 * code)).toBe(500)
    })

    it('should return exception status code if valid', () => {
      expect(TestSubject.formatCode(code)).toBe(code)
    })
  })

  describe('#toJSON', () => {
    it('should return json representation of exception', () => {
      const code = Status.I_AM_A_TEAPOT
      const data = { errors: { test: true }, foo: '' }
      const message = 'Test error message'

      const Subject = new TestSubject(code, message, data)

      expect(Subject.toJSON()).toMatchObject({
        className: ClassName.I_AM_A_TEAPOT,
        code,
        data: { foo: data.foo },
        errors: data.errors,
        message,
        name: 'I_AM_A_TEAPOT'
      })
    })
  })
})
