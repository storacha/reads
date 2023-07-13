import fetch, { Headers } from '@web-std/fetch'
import path from 'path'
import toml from 'toml'
import { CID } from 'multiformats'
import { base32 } from 'multiformats/bases/base32'
import { sha256 } from 'multiformats/hashes/sha2'
import fs from 'fs'
import * as uint8arrays from 'uint8arrays'

/**
 * @typedef {{ id: string, title: string }} Namespace
 * @typedef {{ name: string, metadata: any }} Key
 * @typedef {{ key: string, value: any, metadata?: any }} BulkWritePair
 */

const rootDir = path.dirname(path.dirname(import.meta.url))
const wranglerConfigPath = `${rootDir}/wrangler.toml`
const denyListPath = `${rootDir}/denylist.json`

const DENY_LIST_SOURCES = [
  'https://badbits.dwebops.pub/denylist.json',
  denyListPath
]

export async function denylistAddCmd (cid, options) {
  console.log(`🦴 fetching ${denyListPath}`)
  const denyList = await getDenyList(denyListPath)
  const entry = await cidToAnchor(cid, options)

  if (denyList.some((e) => e.anchor === entry.anchor)) {
    throw new Error('already exists')
  }
  denyList.push(entry)
  console.log('📝 writing update')
  fs.writeFileSync(
    denyListPath.replace('file://', ''),
    JSON.stringify(denyList, null, 2)
  )
  console.log('✅ Done')
}

export async function denylistSyncCmd ({ env }) {
  const {
    cfApiToken, cfAccountId, denyListKv
  } = await getDenylistProperties({ env })

  for (const url of DENY_LIST_SOURCES) {
    console.log(`🦴 fetching ${url}`)
    const denyList = await getDenyList(url)
    const kvs = denyList.map(({ anchor: key, status, reason }) => ({
      key,
      value: { status, reason }
    }))
    console.log(`📝 writing ${kvs.length} entries`)
    await writeKVMulti(cfApiToken, cfAccountId, denyListKv.id, kvs)
  }
  console.log('✅ Done')
}

export async function denylistUpdateRemoteCmd (url, { env, reason, operation }) {
  if (operation !== 'add' && operation !== 'delete') {
    throw new Error(`operation must be one of {add, delete}. Received: ${operation}`)
  }
  const {
    cfApiToken, cfAccountId, denyListKv
  } = await getDenylistProperties({ env })

  const entries = await getListFromUrl(url)
  const bulk = await Promise.all(entries.map(async entry => {
    return {
      key: (await cidToAnchor(entry)).anchor,
      value: { reason }
    }
  }))
  console.log(`update ${bulk.length} remote denylist: ${operation}`)
  await writeKVMulti(cfApiToken, cfAccountId, denyListKv.id, bulk, {
    delete: operation === 'delete'
  })
  console.log('✅ Done')
}

/**
 * @param {string} apiToken Cloudflare API token
 * @param {string} accountId Cloudflare account ID
 * @param {string} nsId KV namespace ID
 * @param {Array<BulkWritePair>} kvs
 * @param {object} [options]
 * @param {boolean} [options.delete]
 */
async function writeKVMulti (apiToken, accountId, nsId, kvs, options = {}) {
  const isDelete = options.delete
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${nsId}/bulk`

  // Delete
  if (isDelete) {
    kvs = kvs.map((kv) => kv.key)
  // Add
  } else {
    kvs = kvs.map((kv) => ({
      ...kv,
      value: JSON.stringify(kv.value)
    }))
  }

  const chunkSize = 10000
  for (let i = 0; i < kvs.length; i += chunkSize) {
    const kvsChunk = kvs.slice(i, i + chunkSize)
    const res = await fetch(url, {
      method: isDelete ? 'DELETE' : 'PUT',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(kvsChunk)
    })
    const { success, errors } = await res.json()
    if (!success) {
      const error = Array.isArray(errors) && errors[0]
      throw new Error(
        error ? `${error.code}: ${error.message}` : 'failed to write to KV'
      )
    }

    // Delay to avoid going into
    await new Promise(resolve => setTimeout(() => resolve(true), 10000))
  }
}

async function getListFromUrl (url) {
  console.log(`🦴 fetching ${url}`)
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`unexpected status fetching given url: ${response.status}`)
  }

  let entries
  const contentType = response.headers.get('content-type')
  if (contentType === 'application/json') {
    entries = await response.json()
  } else if (contentType === 'text/plain') {
    const textBody = await response.text()
    // Separate entries by new line and trim them
    entries = textBody.split(/\r?\n/)
  } else {
    console.log(`content type must be "application/json" or "text/plain". Received ${contentType}`)
    process.exit(1)
  }

  return entries
}

async function cidToAnchor (cid, options = {}) {
  const parts = cid.split('/')
  const cidv1 = CID.parse(parts[0]).toV1().toString(base32.encoder)
  const cidv1Path = `${cidv1}/${parts.slice(1).join('/')}`
  console.log(`🆔 normalized CID + path: ${cidv1Path}`)

  const multihash = await sha256.digest(uint8arrays.fromString(cidv1Path))
  const digest = multihash.bytes.subarray(2)
  const anchor = uint8arrays.toString(digest, 'hex')
  const entry = { anchor, status: options.status, reason: options.reason }
  console.log(`🎫 entry: ${JSON.stringify(entry)}`)

  return entry
}

async function getDenylistProperties ({ env }) {
  const cfApiToken = mustGetEnv('CF_API_TOKEN')

  const wranglerConfig = await getWranglerToml(wranglerConfigPath)
  const wranglerEnvConfig = wranglerConfig.env[env]
  if (!wranglerEnvConfig) {
    throw new Error(`missing wrangler configuration for env: ${env}`)
  }
  console.log(`🧩 using wrangler config: ${wranglerConfigPath}`)

  const cfAccountId = wranglerEnvConfig.account_id
  if (!cfAccountId) {
    throw new Error(`missing Cloudflare account_id in env: ${env}`)
  }
  console.log(`🏕 using env: ${env} (${cfAccountId})`)

  const kvNamespaces = wranglerEnvConfig.kv_namespaces || []
  const denyListKv = kvNamespaces.find((kv) => kv.binding === 'DENYLIST')
  if (!denyListKv) {
    throw new Error('missing binding in kv_namespaces: DENYLIST')
  }
  console.log(`🪢 using KV binding: DENYLIST (${denyListKv.id})`)

  return {
    cfAccountId,
    cfApiToken,
    denyListKv
  }
}

async function getDenyList (url) {
  const headers = new Headers()
  headers.append('cache-control', 'no-cache')
  headers.append('pragma', 'no-cache')

  const res = await fetch(url, {
    headers
  })
  if (!res.ok) {
    throw new Error(`unexpected status fetching denylist.json: ${res.status}`)
  }
  const list = await res.json()
  return list
}

async function getWranglerToml (url) {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`unexpected status fetching wrangler.toml: ${res.status}`)
  }
  return toml.parse(await res.text())
}

/**
 * @param {string} key
 * @returns {string}
 */
function mustGetEnv (key) {
  const value = process.env[key]
  if (value) {
    return value
  }
  throw new Error(`missing environment variable: ${key}`)
}
