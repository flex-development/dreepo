import { ExceptionStatusCode } from '@flex-development/exceptions/enums'
import type { AxiosError } from '@flex-development/exceptions/interfaces'
import createAxiosError from 'axios/lib/core/createError'

/**
 * @file Test Fixture - AxiosError
 * @module utils/tests/fixtures/axios-error.fixture
 */

const RESPONSE = {
  config: {
    method: 'patch',
    url: 'http://localhost:8080/users/123'
  },
  data: {},
  headers: {},
  status: ExceptionStatusCode.UNAUTHORIZED,
  statusText: 'NOT AUTHORIZED'
}

export default createAxiosError(
  'User authentication required',
  RESPONSE.config,
  undefined,
  undefined,
  RESPONSE
) as AxiosError
