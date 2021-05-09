import { REPO_PATH_CARS } from '@tests/fixtures/cars.fixture'
import CLIENT_EMAIL from '@tests/fixtures/client-email.fixture'
import DATABASE_URL from '@tests/fixtures/database-url.fixture'
import PRIVATE_KEY from '@tests/fixtures/private-key.fixture'
import TestSubject from '../repo-db-connection.provider'

/**
 * @file Unit Tests - RepoDBConnection
 * @module providers/tests/RepoDBConnection
 */

describe('unit:providers/RepoDBConnection', () => {
  const mockConstructorParams: ConstructorParameters<typeof TestSubject> = [
    REPO_PATH_CARS,
    DATABASE_URL,
    CLIENT_EMAIL,
    PRIVATE_KEY
  ]

  const Subject = new TestSubject(...mockConstructorParams)

  describe('constructor', () => {
    it('should initialize instance properties', () => {
      const ThisSubject = new TestSubject(...mockConstructorParams)

      expect(typeof ThisSubject.path === 'string').toBeTruthy()
    })
  })

  describe('#send', () => {
    const spy_request = jest.spyOn(Subject, 'request')

    beforeEach(async () => {
      await Subject.send({})
    })

    it('should call #request', () => {
      expect(spy_request).toBeCalledTimes(1)
      expect(spy_request.mock.calls[0][0]).toBe(Subject.path)
    })
  })
})
