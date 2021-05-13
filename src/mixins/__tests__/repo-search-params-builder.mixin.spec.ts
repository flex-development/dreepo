import { ProjectRule } from '@/enums'
import type { RepoSearchParamsBuilderOptions } from '@/types'
import { ExceptionStatusCode } from '@flex-development/exceptions/enums'
import Exception from '@flex-development/exceptions/exceptions/base.exception'
import TestSubject from '../repo-search-params-builder.mixin'

/**
 * @file Unit Tests - RepoSearchParamsBuilder
 * @module mixins/tests/RepoSearchParamsBuilder
 */

describe('unit:mixins/RepoSearchParamsBuilder', () => {
  describe('constructor', () => {
    it('should remove options.objectIdFields', () => {
      const options = { objectIdFields: [] } as unknown

      const builder = new TestSubject(options as RepoSearchParamsBuilderOptions)

      expect(builder.builder_options.objectIdFields).not.toBeDefined()
    })

    it('should remove options.parameters', () => {
      const options = { parameters: '' } as unknown

      const builder = new TestSubject(options as RepoSearchParamsBuilderOptions)

      expect(builder.builder_options.parameters).not.toBeDefined()
    })
  })

  describe('#options', () => {
    const Subject = new TestSubject()

    it('should convert base options into QSMongoParsedOptions object', () => {
      const projection = { created_at: ProjectRule.PICK }

      const options = Subject.options({ projection })

      expect(options.$project).toMatchObject(projection)
    })
  })

  describe('#params', () => {
    const Subject = new TestSubject({ fullTextFields: ['created_at', 'id'] })

    const spy_builder = jest.spyOn(Subject, 'builder')

    it('should parse url query string', () => {
      const querystring = 'fields=created_at&sort=created_at,-id&limit=10'

      Subject.params(querystring)

      expect(spy_builder).toBeCalledTimes(1)
      expect(spy_builder.mock.calls[0][0]).toBe(querystring)
    })

    it('should parse url query object', () => {
      const query = {
        fields: 'created_at,-updated_at',
        limit: '10',
        q: 'foo',
        sort: 'created_at,-id'
      }

      Subject.params(query)

      expect(spy_builder).toBeCalledTimes(1)
      expect(spy_builder.mock.calls[0][0]).toBe(query)
    })

    it('should throw Exception if #builder throws', () => {
      const query = { q: 'will cause error' }

      let exception = {} as Exception

      try {
        new TestSubject().params(query)
      } catch (error) {
        exception = error
      }

      expect(exception.code).toBe(ExceptionStatusCode.BAD_REQUEST)
      expect(exception.data).toMatchObject({ builder_options: {}, query })
    })
  })
})
