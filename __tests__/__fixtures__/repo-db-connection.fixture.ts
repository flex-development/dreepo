import MockRepoDBConnection from '@/providers/repo-db-connection.provider'
import { REPO_PATH_CARS } from './cars.fixture'
import CLIENT_EMAIL from './client-email.fixture'
import URL from './database-url.fixture'
import PRIVATE_KEY from './private-key.fixture'

/**
 * @file Global Test Fixture - RepoDBConnection Provider
 * @module tests/fixtures/repo-db-connection.fixture
 */

export default new MockRepoDBConnection(
  REPO_PATH_CARS,
  URL,
  CLIENT_EMAIL,
  PRIVATE_KEY
)
