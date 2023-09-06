import { number } from 'astro/zod'
import { parse as uuidParse } from 'uuid'
import { version as uuidVersion } from 'uuid'
import { validate as uuidValidate } from 'uuid'

type IdType = 'uuid' | 'oracle'

export type RawId = {
  type: IdType
  value: string
}

export function parseId(rawValue: string): RawId | undefined {
  const uppercased = rawValue.toUpperCase()

  if (uuidValidate(uppercased) && uuidVersion(uppercased) === 4) {
    return { type: 'uuid', value: uppercased.toLowerCase() }
  }

  if (/^[0-9A-F]{32}$/gs.test(uppercased)) {
    return { type: 'oracle', value: uppercased }
  }

  return undefined
}

export type IdFormat = {
  type: IdType
  value: string
  segments: string[]
}

export function convertId(rawId: RawId) {
  return rawId.type === 'uuid' ? convertFromUuid(rawId) : convertFromOracle(rawId)
}

function convertFromUuid(rawId: RawId) {
  console.log('convertFromUuid', rawId.value)
  const bytes = uuidParse(rawId.value)
  const hex = Array.from(bytes.values(), (b) => b.toString(16).padStart(2, '0'))

  console.log(hex)
}

function convertFromOracle(rawId: RawId) {
  console.log('convertFromOracle', rawId.value)

  const oracleBytes = getBytesFromOracle(rawId.value)
  const uuidBytes = flipByteOrder(oracleBytes)

  const bytes = new Uint8Array(uuidBytes)
  const hex = Array.from(bytes.values(), (b) => b.toString(16).padStart(2, '0'))

  console.log(hex)
}

function getBytesFromOracle(id: string) {
  const octets = new Array<number>()
  for (var i = 0; i < id.length; i += 2) {
    octets.push(parseInt(id.substring(i, i + 2), 16))
  }

  return octets
}

function flipByteOrder(bytes: number[]) {
  const newBytes = new Array<number>(16)

  assignFlippedBytesInRange(newBytes, bytes, 0, 4)
  assignFlippedBytesInRange(newBytes, bytes, 4, 6)
  assignFlippedBytesInRange(newBytes, bytes, 6, 8)

  for (let index = 8; index < bytes.length; index++) {
    newBytes[index] = bytes[index]
  }

  return newBytes
}

function assignFlippedBytesInRange(target: number[], source: number[], start: number, end: number) {
  for (let index = start; index < end; index++) {
    target[index] = source[start + end - 1 - index]
  }
}

// 00cb4112-0a70-4baa-82cd-e06d6166ddfa
// 1241CB00700AAA4B82CDE06D6166DDFA

// const bytes = uuidParse(rawValue)
// const hex = Array.from(bytes.values(), (b) => b.toString(16).padStart(2, '0'))

// const oracle = []
// oracle.push(hex.slice(0, 4).reverse())
// oracle.push(hex.slice(4, 6).reverse())
// oracle.push(hex.slice(6, 8).reverse())
// oracle.push(hex.slice(8))

// export function getFormats(id: IdLike) {}

// function getUuid(id: IdLike): IdFormat {
//   return id.type === 'uuid' ? id.value : convertOracleToUuid(id)
// }
