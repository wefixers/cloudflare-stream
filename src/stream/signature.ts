import { Buffer } from 'node:buffer'
import { webcrypto } from 'node:crypto'

export interface AccessRule {
  type: string
  action: string
  [key: string]: any
}

export interface StreamSignOptions {
  /**
   * The key id.
   *
   * @see https://developers.cloudflare.com/stream/viewing-videos/securing-your-stream/#option-2-generating-signed-tokens-without-calling-the-token-endpoint
   */
  keyId: string

  /**
   * The jwt key in base64 format.
   *
   * @see https://developers.cloudflare.com/stream/viewing-videos/securing-your-stream/#option-2-generating-signed-tokens-without-calling-the-token-endpoint
   */
  jwkKey: string

  /**
   * The video UID.
   */
  videoUID: string

  /**
   * The absolute expiration time, in UNIX epoch seconds.
   *
   * @example
   * ```ts
   * absoluteExpirationTimeInSeconds: Math.floor(Date.now() / 1000) + 3600 // 60 minutes
   * ```
   *
   * ### Note
   * This name is very long to make it clear as much as possible what it is.
   *
   * - To get the current epoch time in js, use `Math.floor(Date.now() / 1000)`
   * - The value of {@link Date.now()} is in milliseconds, divide by 1000 to get seconds, use {@link Math.floor} to get the nearest whole second.
   *
   */
  absoluteExpirationTimeInSeconds: number

  /**
   * Sets the jwt data.
   *
   * ## Advanced Option
   *
   * This option allows you to customize the jwt, as such, if you set sub or exp, you are essentially overwriting the `videoUID` and `expiresInSeconds`.
   */
  data?: {
    accessRules?: AccessRule[]

    /**
     * The subject, usually the video id.
     *
     * ### This option is set to `videoUID` by default.
     */
    sub?: string

    /**
     * The absolute expiration time, in UNIX epoch seconds.
     *
     * ### This option is set to `expiresInSeconds` by default.
     */
    exp?: number | string

    /**
     * The they id.
     *
     * ### This option is set to `keyId` by default.
     */
    kid?: string

    [key: string]: any
  }
}

/**
 * Sign the data in a JWT format.
 *
 * @see https://developers.cloudflare.com/stream/viewing-videos/securing-your-stream/
 */
export async function streamSignedUrl({ keyId, jwkKey, videoUID, absoluteExpirationTimeInSeconds, data }: StreamSignOptions): Promise<string> {
  const _data = {
    sub: videoUID,
    kid: keyId,
    exp: absoluteExpirationTimeInSeconds,
    // allows the user to customize the JWT in its entirety
    ...data,
  }

  const token = `${objectToBase64Url({ alg: 'RS256', kid: keyId })}.${objectToBase64Url(_data)}`

  const jwk = JSON.parse(Buffer.from(jwkKey, 'base64').toString('binary'))
  const key = await webcrypto.subtle.importKey(
    'jwk',
    jwk,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['sign'],
  )

  const encoder = new TextEncoder()
  const signature = await webcrypto.subtle.sign({ name: 'RSASSA-PKCS1-v1_5' }, key, encoder.encode(token))

  return `${token}.${arrayBufferToBase64Url(signature)}`
}

function arrayBufferToBase64Url(buffer: ArrayBufferLike): string {
  // note: base64url is critical cloudflare use the result token as an url
  return Buffer.from(String.fromCharCode(...new Uint8Array(buffer)), 'binary').toString('base64url')
}

function objectToBase64Url(payload: any): string {
  return arrayBufferToBase64Url(new TextEncoder().encode(JSON.stringify(payload)))
}
