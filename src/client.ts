import type { CloudflareRequestOptions } from './request'
import { cloudflareRequest } from './request'

export interface CloudflareClientRequestOptions extends Omit<CloudflareRequestOptions, 'accountId' | 'apiToken'> {

}

export interface CloudflareClientOptions {
  /**
   * The cloudflare account id.
   *
   * @default process.env.CLOUDFLARE_CLIENT_ID
   */
  accountId?: string

  /**
   * The cloudflare apiToken.
   *
   * @default process.env.CLOUDFLARE_CLIENT_SECRET
   */
  apiToken?: string
}

/**
 * Represents the base class for accessing the cloudflare API.
 */
export class CloudflareClient {
  #accountId: string
  #apiToken: string

  constructor(options?: CloudflareClientOptions) {
    this.#accountId = options?.accountId || process.env.CLOUDFLARE_CLIENT_ID as string
    this.#apiToken = options?.apiToken || process.env.CLOUDFLARE_CLIENT_SECRET as string

    if (!this.#accountId) {
      throw new TypeError('CloudflareClient constructor: accountId is empty')
    }
    if (!this.#apiToken) {
      throw new TypeError('CloudflareClient constructor: apiToken is empty')
    }
  }

  /**
   * Send a request.
   *
   * ### Note
   * The underscore prefix is mainly there for so that you don't get bother by the intellisense.
   */
  _request = async <T>(resource: string, options?: CloudflareClientRequestOptions) => {
    return await cloudflareRequest<T>(resource, {
      accountId: this.#accountId,
      apiToken: this.#apiToken,
      ...options,
    })
  }

  /**
   * Shorthand for `GET` requests with no options.
   */
  _get = async <T>(resource: string, query?: any) => {
    return await cloudflareRequest<T>(resource, {
      accountId: this.#accountId,
      apiToken: this.#apiToken,
      method: 'GET',
      data: query,
    })
  }

  /**
   * Shorthand for `POST` requests with no options.
   */
  _post = async <T>(resource: string, body?: any) => {
    return await cloudflareRequest<T>(resource, {
      accountId: this.#accountId,
      apiToken: this.#apiToken,
      method: 'POST',
      data: body,
    })
  }

  /**
   * Shorthand for `PUT` requests with no options.
   */
  _put = async <T>(resource: string, body?: any) => {
    return await cloudflareRequest<T>(resource, {
      accountId: this.#accountId,
      apiToken: this.#apiToken,
      method: 'PUT',
      data: body,
    })
  }

  /**
   * Shorthand for `PATCH` requests with no options.
   */
  _patch = async <T>(resource: string, body?: any) => {
    return await cloudflareRequest<T>(resource, {
      accountId: this.#accountId,
      apiToken: this.#apiToken,
      method: 'PATCH',
      data: body,
    })
  }

  /**
   * Shorthand for `DELETE` requests with no options.
   */
  _delete = async <T>(resource: string, body?: any) => {
    return await cloudflareRequest<T>(resource, {
      accountId: this.#accountId,
      apiToken: this.#apiToken,
      method: 'DELETE',
      data: body,
    })
  }
}
