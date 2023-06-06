import { expect, it } from 'vitest'

import { CloudflareStream } from '../src'

/**
 * The cloudflare stream client.
 */
const stream = new CloudflareStream({
  // @ts-expect-error, i am too lazy to fix this
  accountId: import.meta.env.VITE_CLOUDFLARE_CLIENT_ID,
  // @ts-expect-error, i am too lazy to fix this
  apiToken: import.meta.env.VITE_CLOUDFLARE_CLIENT_SECRET,
  stream: {
    // @ts-expect-error, i am too lazy to fix this
    keyId: import.meta.env.VITE_CLOUDFLARE_STREAM_KEY_ID,
    // @ts-expect-error, i am too lazy to fix this
    jwkKey: import.meta.env.VITE_CLOUDFLARE_STREAM_JWK_ID,
  },
})

// behold the magic of testing on live services!
it('should list all videos', async () => {
  await expect(stream.all()).resolves.toBeTypeOf('object')
})

it('should throw 404 on a non existing video', async () => {
  await expect(stream.getVideo('<non existing>')).rejects.toThrow('Not Found')
})
