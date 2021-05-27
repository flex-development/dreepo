import { config } from 'dotenv'
import 'jest-extended'
import path from 'path'

/**
 * @file Jest Global Setup Configuration
 * @module tests/setup
 * @see https://jestjs.io/docs/en/configuration#setupfilesafterenv-array
 */

// Set test environment variables
config({ path: path.join(__dirname, '..', '.env.test.local') })

// Async callbacks must be invoked within 25 seconds
jest.setTimeout(25000)
