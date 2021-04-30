import type { AxiosResponse } from 'axios'

/**
 * @file Test Fixture - AxiosResponse
 * @module lib/utils/tests/fixtures/axios-response.fixture
 */

export default {
  config: {},
  data: { test: true },
  headers: {},
  status: 200,
  statusText: 'OK'
} as AxiosResponse<Record<never, never>>
