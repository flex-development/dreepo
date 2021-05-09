import testSubject from '../onFulfilled.util'
import AXIOS_RESPONSE from './__fixtures__/axios-response.fixture'

/**
 * @file Unit Tests - onFulfilled
 * @module utils/tests/onFulfilled
 */

describe('unit:utils/onFulfilled', () => {
  it('should return response data', () => {
    expect(testSubject(AXIOS_RESPONSE)).toMatchObject(AXIOS_RESPONSE.data)
  })
})
