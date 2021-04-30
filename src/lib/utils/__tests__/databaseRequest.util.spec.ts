import configuration from '@/config/configuration'
import databaseToken from '@/lib/utils/databaseToken.util'
import { REPO_PATH_CARS } from '@tests/fixtures/cars.fixture'
import testSubject from '../databaseRequest.util'

/**
 * @file Unit Tests - databaseRequest
 * @module lib/utils/tests/databaseRequest
 */

jest.mock('@/lib/utils/databaseToken.util')

const mockDBToken = databaseToken as jest.MockedFunction<typeof databaseToken>

describe('unit:lib/utils/databaseRequest', () => {
  const { FIREBASE_DATABASE_URL } = configuration()

  const mockHttp = jest.fn().mockReturnValue(Promise.resolve({ data: [] }))

  beforeEach(async () => {
    await testSubject(REPO_PATH_CARS, {}, mockHttp)
  })

  it('should call http client', () => {
    expect(mockHttp).toBeCalledTimes(1)
  })

  it('should set config.url to FIREBASE_DATABASE_URL/path', () => {
    const expected = `${FIREBASE_DATABASE_URL}/${REPO_PATH_CARS}`

    expect(mockHttp.mock.calls[0][0].baseURL).toBe(expected)
  })

  it('should make authenticated request', () => {
    expect(mockDBToken).toBeCalledTimes(1)
  })

  it('should append `.json` to the end of config.url', () => {
    expect(mockHttp).toBeCalledTimes(1)
    expect(mockHttp.mock.calls[0][0].url).toBe(`/.json`)
  })
})
