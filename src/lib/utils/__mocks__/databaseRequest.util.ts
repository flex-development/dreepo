/**
 * @file Mock - databaseRequest
 * @module lib/utils/mocks/databaseRequest
 * @see https://jestjs.io/docs/next/manual-mocks#mocking-user-modules
 */

const moduleName = '@/lib/utils/databaseRequest.util'

export default jest.fn((...args) => {
  return jest.requireActual(moduleName).default(...args)
})
