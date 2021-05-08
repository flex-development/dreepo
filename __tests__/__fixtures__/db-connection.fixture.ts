import MockDBConnection from '@/lib/providers/db-connection.provider'
import CLIENT_EMAIL from './client-email.fixture'
import URL from './database-url.fixture'
import PRIVATE_KEY from './private-key.fixture'

/**
 * @file Global Test Fixture - DBConnection Provider
 * @module tests/fixtures/db-connection.fixture
 */

export default new MockDBConnection(URL, CLIENT_EMAIL, PRIVATE_KEY)
