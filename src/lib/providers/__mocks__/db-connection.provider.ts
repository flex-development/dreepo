/**
 * @file Mock - DBConnection
 * @module lib/providers/mocks/DBConnection
 * @see https://jestjs.io/docs/next/manual-mocks#mocking-user-modules
 */

const moduleName = '@/lib/providers/db-connection.provider'
const ActualDBConnection = jest.requireActual(moduleName).default

export default class MockDBConnection extends ActualDBConnection {
  token = jest.fn().mockReturnValue(Promise.resolve('DATABASE_ACCESS_TOKEN'))
}
