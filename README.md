# Cloudflare API

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]

> [Dear Cloudflare team](#a-note-for-cloudflare)

A library to interact with Cloudflare Stream as the official lib currently lack this functionality...

This library uses `ofetch` for sending requests.

- [Install](#install)
- [Usage](#usage)
- [Usage with missing APIs](#usage-with-missing-apis)
- [Low level requests](#low-level-requests)
- [Caveats](#caveats)
- [The official node library](#the-official-node-library)
- [A note for Cloudflare](#a-note-for-cloudflare)

## Install
```sh
pnpm i @fixers/cloudflare-stream
```

```sh
npm install @fixers/cloudflare-stream
```

## Usage

```ts
const stream = new CloudflareStream({
  accountId: '',
  apiToken: ''
})

// fetch all the videos in your library
await stream.all()

// Get a video by UID
const video = await stream.getVideo('<UID>')

// get the video duration
video.duration

// get the video dimensions
video.input.width
video.input.height
```

## Usage with missing APIs

This library provides a `CloudflareClient` class that do the lightweight job of gluing a request with credentials.

```ts
const cloudflareClient = new CloudflareClient({
  accountId: '',
  apiToken: ''
})

// send a get request to cloudflare on the path /stream/<UID>
await cloudflareClient._get<StreamVideo>('stream/<UID>')

// send a request with a custom method
await cloudflareClient._request<StreamVideo>('stream/<UID>', {
  method: 'DELETE'
})
```

The `CloudflareClient` expose a common set of functions with an underscore `_`.

- `_request`: send a request, with a custom arbitrary body
- `_get`: shorthand for a `GET` `_request`
- `_post`: shorthand for a `POST` `_request`
- `_put`: shorthand for a `PUT` `_request`
- `_patch`: shorthand for a `PATCH` `_request`
- `_delete`: shorthand for a `DELETE` `_request`

> When using `CloudflareClient`, do not put forward slash `/` at the beginning of the url you want to fetch, the library do a basic string concatenation, this will be fixed in the near future!

## Low level requests

The library provides you with a `cloudflareRequest` function, that is used throughout the library, is mainly there so you have absolute control over the request process.

You can go down a level with `_cloudflareRawRequest`, a thin wrapper around `ofetch`, slightly tweaked as you mainly use this function to interact with an API.

```ts
// the same as ofetch, with some differences
// url can be also be a new URL(...)
_cloudflareRawRequest(url, options)
```

## Caveats

This library is incomplete, but provides the building blocks to sends proper request to Cloudflare.

## The official node library

There is also the official [https://github.com/cloudflare/node-cloudflare](https://github.com/cloudflare/node-cloudflare) node library.

It does not support stream, which is the focus of this library.

## A note for Cloudflare

Dear Cloudflare team, your documentation is actually pretty good, back it up with some library.

How do you expect developers to use your products if you don't give us the tools to do so?

Do we really need to test our libs on a live service?

Do we really need to experiment to figure out how the heck to do a pagination? Put some example!

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@fixers/cloudflare-stream/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/@fixers/cloudflare-stream

[npm-downloads-src]: https://img.shields.io/npm/dm/@fixers/cloudflare-stream.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/@fixers/cloudflare-stream

[license-src]: https://img.shields.io/npm/l/@fixers/cloudflare-stream.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/@fixers/cloudflare-stream
