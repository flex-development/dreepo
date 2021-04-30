import { config } from 'dotenv'
import path from 'path'
import * as matchers from './matchers'

/**
 * @file Jest Global Setup Configuration
 * @module tests/setup
 * @see https://jestjs.io/docs/en/configuration#setupfilesafterenv-array
 */

// Set test environment variables
config({ path: path.join(__dirname, '..', '.env.test.local') })

// Add custom matchers
expect.extend(matchers)

// Async callbacks must be invoked within 25 seconds
jest.setTimeout(25000)
