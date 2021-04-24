import testSubject from '../onFulfilled.util'
import AXIOS_RESPONSE from './__fixtures__/axios-response.fixture'

/**
 * @file Unit Tests - onFulfilled
 * @module lib/utils/tests/onFulfilled
 */

describe('unit:lib/utils/onFulfilled', () => {
  it('exports default function', () => {
    expect(typeof testSubject === 'function').toBeTruthy()
  })

  it('should return the response data', () => {
    expect(testSubject(AXIOS_RESPONSE)).toMatchObject(AXIOS_RESPONSE.data)
  })
})
