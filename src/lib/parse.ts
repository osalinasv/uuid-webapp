import { parse as uuidParse } from 'uuid'
import { version as uuidVersion } from 'uuid'
import { validate as uuidValidate } from 'uuid'
import { stringify as uuidStringify } from 'uuid'

export type RawId = {
  type: 'uuid' | 'oracle'
  value: string
}

type ParseErrorType = 'invalid' | 'empty'

type ParseError = { valid: false; error: ParseErrorType }
type ParsedRawId = { valid: true } & RawId

type ParseResult = ParsedRawId | ParseError

export function parseId(rawValue: string): ParseResult {
  if (!rawValue) return { valid: false, error: 'empty' }
  const uppercased = rawValue.toUpperCase()

  if (uuidValidate(uppercased) && uuidVersion(uppercased) === 4) {
    return { valid: true, type: 'uuid', value: uppercased.toLowerCase() }
  }

  if (/^[0-9A-F]{32}$/gs.test(uppercased)) {
    return { valid: true, type: 'oracle', value: uppercased }
  }

  return { valid: false, error: 'invalid' }
}

type IdLayout = {
  stringified: string
  timeLow: number[]
  timeMid: number[]
  timeHiVersion: number[]
  clockSeqHiReserved: number[]
  clockSeqLow: number[]
  node: number[]
}

type ConvertedId = {
  rawIdValue: string
  uuidFormat: IdLayout
  oracleFormat: IdLayout
  bytes: number[]
  bytesAsHex: string[]
}

export function convertId(rawId: RawId): ConvertedId {
  return rawId.type === 'uuid' ? convertFromUuid(rawId) : convertFromOracle(rawId)
}

function convertFromUuid(rawId: RawId): ConvertedId {
  const uuidBytes = Array.from(uuidParse(rawId.value))
  const oracleBytes = flipByteOrder(uuidBytes)

  const uuidFormat = buildIdLayout(rawId.value, uuidBytes)
  const oracleString = oracleBytes.map(stringifyAsHex).join('').toUpperCase()
  const oracleFormat = buildIdLayout(oracleString, oracleBytes)

  return {
    rawIdValue: rawId.value,
    uuidFormat,
    oracleFormat,
    bytes: uuidBytes,
    bytesAsHex: uuidBytes.map(stringifyAsHex),
  }
}

function convertFromOracle(rawId: RawId): ConvertedId {
  const oracleBytes = getBytesFromOracle(rawId.value)
  const uuidBytes = flipByteOrder(oracleBytes)

  const uuidString = uuidStringify(uuidBytes)
  const uuidFormat = buildIdLayout(uuidString, uuidBytes)
  const oracleFormat = buildIdLayout(rawId.value, oracleBytes)

  return {
    rawIdValue: rawId.value,
    uuidFormat,
    oracleFormat,
    bytes: uuidBytes,
    bytesAsHex: uuidBytes.map(stringifyAsHex),
  }
}

function stringifyAsHex(byte: number) {
  return byte.toString(16).padStart(2, '0')
}

function buildIdLayout(rawIdValue: string, bytes: number[]): IdLayout {
  return {
    stringified: rawIdValue,
    timeLow: bytes.slice(0, 4),
    timeMid: bytes.slice(4, 6),
    timeHiVersion: bytes.slice(6, 8),
    clockSeqHiReserved: bytes.slice(8, 9),
    clockSeqLow: bytes.slice(9, 10),
    node: bytes.slice(10),
  }
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

// 12 41 CB 00 70 0A AA 4B 82 CD E0 6D 61 66 DD FA
// 12 41 CB  0 70  A AA 4B 82 CD E0 6D 61 66 DD FA
