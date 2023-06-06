import type { CloudflareClientOptions } from '../client'
import { CloudflareClient } from '../client'

import type { AccessRule } from './signature'
import { streamSignedUrl } from './signature'

export interface Status {
  state: string
  pctComplete: string
  errorReasonCode: string
  errorReasonText: string
}

export interface Meta {
  filename: string
  filetype: string
  name: string
  relativePath?: string
  type?: string
}

export interface Input {
  width: number
  height: number
}

export interface Playback {
  hls: string
  dash: string
}

export interface PublicDetails {
  title?: string
  share_link?: string
  channel_link?: string
  logo?: string
}

export interface StreamVideo {
  uid: string
  creator?: string
  thumbnail: string
  thumbnailTimestampPct: number
  readyToStream: boolean
  status: Status
  meta: Meta
  created: string
  modified: string
  size: number
  preview: string
  allowedOrigins: string[]
  requireSignedURLs: boolean
  uploaded: string
  uploadExpiry: string
  maxSizeBytes: any
  maxDurationSeconds?: number
  duration: number
  input: Input
  playback: Playback
  watermark: any
  clippedFrom: any
  publicDetails: PublicDetails
}

export interface StreamVideoList {
  videos: StreamVideo[]
  /**
   * The total number of videos that match the provided filters.
   * Example: 35586
   */
  total: number

  /**
   * The total number of remaining videos based on cursor position.
   * Example: 1000
   */
  range: number

  result_info: {
    /**
     * Total number of results for the requested service. Required.
     * Example: 1
     */
    count: number

    /**
     * Current page within the paginated list of results. Required.
     * Example: 1
     */
    page: number

    /**
     * Number of results per page of results. Required.
     * Example: 20
     */
    per_page: number

    /**
     * Total results available without any search parameters. Required.
     * Example: 2000
     */
    total_count: number
  }
}

/**
 * @see https://developers.cloudflare.com/api/operations/stream-videos-update-video-details
 */
export interface VideoDetails {
  /**
   * Lists the origins allowed to display the video. Enter allowed origin domains in an array and use * for wildcard subdomains. Empty arrays allow the video to be viewed on any origin.
   * Example: ["example.com"]
   */
  allowedOrigins?: string[]

  /**
   * A user-defined identifier for the media creator.
   * <= 64 characters
   * Example: creator-id_abcde12345
   */
  creator?: string

  /**
   * The maximum duration in seconds for a video upload. Can be set for a video that is not yet uploaded to limit its duration. Uploads that exceed the specified duration will fail during processing. A value of -1 means the value is unknown.
   * >= 1, <= 21600
   */
  maxDurationSeconds?: number

  /**
   * A user modifiable key-value store used to reference other systems of record for managing videos.
   * Example: {"name":"video12345.mp4"}
   */
  meta?: Record<string, string>

  /**
   * Indicates whether the video can be accessed using the UID. When set to true, a signed token must be generated with a signing key to view the video.
   * Default: false
   * Example: true
   */
  requireSignedURLs?: boolean

  /**
   * The timestamp for a thumbnail image calculated as a percentage value of the video's duration. To convert from a second-wise timestamp to a percentage, divide the desired timestamp by the total duration of the video. If this value is not set, the default thumbnail image is taken from 0s of the video.
   * >= 0, <= 1
   * Default: 0
   * Example: 0.529241
   */
  thumbnailTimestampPct?: number

  /**
   * The date and time when the video upload URL is no longer valid for direct user uploads.
   * Example: 2014-01-02T02:20:00Z
   */
  uploadExpiry?: string // Date-time format
}

export interface VideoListParams {
  /**
   * Lists videos in ascending order of creation.
   * Default: false
   * Example: true
   */
  asc?: boolean

  /**
   * A user-defined identifier for the media creator.
   * <= 64 characters
   * Example: creator-id_abcde12345
   */
  creator?: string

  /**
   * Lists videos created before the specified date.
   * Example: 2014-01-02T02:20:00Z
   */
  end?: string // Date-time format

  /**
   * Searches over the name key in the meta field. This field can be set with or after the upload request.
   * Example: puppy.mp4
   */
  search?: string

  /**
   * Lists videos created after the specified date.
   * Example: 2014-01-02T02:20:00Z
   */
  start?: string // Date-time format

  /**
   * Specifies the processing status for all quality levels for a video.
   * Allowed values: pending, upload, downloading, queued, inprogress, ready, error
   * Example: inprogress
   */
  status?: string

  /**
   * Specifies whether the video is VOD or live.
   * Example: live
   */
  type?: string
}

export interface CloudflareStreamClientOptions extends CloudflareClientOptions {
  stream?: {
    /**
     * The key id.
     *
     * @see https://developers.cloudflare.com/stream/viewing-videos/securing-your-stream/#option-2-generating-signed-tokens-without-calling-the-token-endpoint
     *
     * @default process.env.CLOUDFLARE_STREAM_KEY_ID
     */
    keyId: string

    /**
     * The jwt key in base64 format.
     *
     * @see https://developers.cloudflare.com/stream/viewing-videos/securing-your-stream/#option-2-generating-signed-tokens-without-calling-the-token-endpoint
     *
     * @default process.env.CLOUDFLARE_STREAM_JWK_ID
     */
    jwkKey: string
  }
}

export interface TemporarySingedUrlOptions {
  accessRules?: AccessRule[]

  [key: string]: any
}

export class CloudflareStream extends CloudflareClient {
  #streamKeyId: string | undefined
  #streamJwkKey: string | undefined

  constructor(options?: CloudflareStreamClientOptions) {
    super(options)

    this.#streamKeyId = options?.stream?.keyId || process.env.CLOUDFLARE_STREAM_KEY_ID as string
    this.#streamJwkKey = options?.stream?.jwkKey || process.env.CLOUDFLARE_STREAM_JWK_ID as string
  }

  /**
   * @see https://developers.cloudflare.com/api/operations/stream-videos-retrieve-video-details
   */
  getVideo = async (streamUid: string): Promise<StreamVideo> => {
    return await this._get<StreamVideo>(`stream/${streamUid}`)
  }

  /**
   * @see https://developers.cloudflare.com/api/operations/stream-videos-update-video-details
   */
  updateVideo = async (streamUid: string, details: VideoDetails): Promise<StreamVideo> => {
    return await this._post<StreamVideo>(`stream/${streamUid}`, details)
  }

  /**
   * Utility for renaming a video.
   * This is particularly useful as cloudflare do not allows partial meta to be updated.
   */
  renameVideo = async (streamUid: string, name: string): Promise<StreamVideo> => {
    const { meta } = await this.getVideo(streamUid)

    return await this.updateVideo(streamUid, {
      // here is the tick, fetch the video meta, then update the meta again replacing the name!
      meta: {
        ...meta,
        name,
      },
    })
  }

  /**
   * @see https://developers.cloudflare.com/api/operations/stream-videos-delete-video
   */
  deleteVideo = async (streamUid: string) => {
    return await this._delete(`stream/${streamUid}`)
  }

  /**
   * @see https://developers.cloudflare.com/api/operations/stream-videos-list-videos
   */
  list = async (query?: VideoListParams): Promise<StreamVideoList> => {
    return await this._get<StreamVideoList>('stream?include_counts=true', query)
  }

  /**
   * Utility for retrieving all the videos.
   */
  all = async (): Promise<StreamVideo[]> => {
    // get the videos
    let data = await this.list()

    const videos = data.videos

    // keep iterating until we ran out of videos
    if (data.total > 1000) {
      while (data.videos.length > 0) {
        const end = data.videos[data.videos.length - 1].created
        data = await this.list({ end })
        videos.push(...data.videos)
      }
    }

    return videos
  }

  /**
   * Create e temporary signed url to watch a stream.
   *
   * @param relativeExpirationTimeInSeconds The **relative** expiration time in seconds. `3600` is `1 hour`.
   *
   * ### Example
   * ```ts
   * await relativeExpirationTimeInSeconds('<UID>', 3600)
   * ```
   *
   * @see https://developers.cloudflare.com/stream/viewing-videos/securing-your-stream/
   */
  temporarySingedUrl = async (streamUid: string, relativeExpirationTimeInSeconds?: number, options?: TemporarySingedUrlOptions): Promise<string> => {
    const absoluteExpirationTimeInSeconds = Math.floor(Date.now() / 1000) + (relativeExpirationTimeInSeconds || 3600) // 1H by default

    return await streamSignedUrl({
      keyId: this.#streamKeyId!,
      jwkKey: this.#streamJwkKey!,
      absoluteExpirationTimeInSeconds,
      videoUID: streamUid,
      data: options,
    })
  }
}
