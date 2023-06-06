import { ofetch } from 'ofetch'
import type { FetchOptions, SearchParameters } from 'ofetch'

export interface ErrorResponse {
  success: false
  errors: Array<{ code: number; message: string }>
  messages?: any[] | null
  result: null
}

export interface CloudflareResponse<T> {
  result: T
  success: true
}

export interface _CloudflareRawRequestOptions extends Omit<FetchOptions<'json'>, 'body' | 'query'> {
  data?: SearchParameters | FetchOptions['body']
}

/**
 * Sends a raw request to the cloudflare API.
 *
 * You probably want to use a wrapper instead of this function.
 *
 * ### Note
 * This function is provided so you have the exact implementation used by this library.
 * The underscore prefix is mainly there for so that you don't get bother by the intellisense.
 */
export async function _cloudflareRawRequest<T>(url: RequestInfo | URL, options?: _CloudflareRawRequestOptions): Promise<CloudflareResponse<T>> {
  const _options: _CloudflareRawRequestOptions & FetchOptions<'json'> = { ...options } || { }

  const method = _options.method?.toUpperCase() || 'GET'
  const isPayloadMethod = new Set(['PATCH', 'POST', 'PUT', 'DELETE']).has(method)

  delete _options.body
  delete _options.query

  _options.method = method

  if (isPayloadMethod) {
    _options.body = _options.data ? _options.data as any : {}
  }
  else if (_options.data) {
    _options.query = _options.data as any
  }

  const response = await ofetch(url instanceof URL ? url.href : url, _options)

  return response
}

export interface CloudflareRequestOptions {
  accountId: string
  apiToken: string

  method?: string

  data?: Record<string, any>

  /**
   * @default "https://api.cloudflare.com/client/v4/accounts/"
   */
  endpoint?: string
}

/**
 * Sends a request to the cloudflare API.
 *
 * You probably want to use a wrapper instead of this function.
 *
 * ### Note
 * This function is provided so you have the exact implementation used by this library.
 */
export async function cloudflareRequest<T>(resource: string, options: CloudflareRequestOptions): Promise<T> {
  const { result } = await _cloudflareRawRequest<T>(resource, {
    ...options,
    baseURL: `${options?.endpoint || 'https://api.cloudflare.com/client/v4/accounts/'}${options.accountId}/`,
    headers: {
      Authorization: `Bearer ${options.apiToken}`,
    },
  })

  return result
}
