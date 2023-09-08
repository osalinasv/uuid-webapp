import { parse as uuidParse } from 'uuid'
import { version as uuidVersion } from 'uuid'
import { validate as uuidValidate } from 'uuid'
import { stringify as uuidStringify } from 'uuid'

type ParsedId = {
  type: 'uuid' | 'oracle'
  value: string
}

type ConvertError = {
  valid: false
  error: 'invalid' | 'empty'
  message?: string
}

type UuidLayout = {
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
  uuidFormat: UuidLayout
  oracleFormat: UuidLayout
  bytes: number[]
  bytesAsHex: string[]
}

type ConvertResult = { valid: true } & ConvertedId
export function convertId(rawValue: string): ConvertResult | ConvertError {
  try {
    const parseResult = parseId(rawValue)
    if (!parseResult.valid) return parseResult

    // prettier-ignore
    const convertedId = parseResult.type === 'uuid'
      ? convertFromUuid(parseResult.value)
      : convertFromOracle(parseResult.value)

    const convertResult = convertedId as ConvertResult
    convertResult.valid = true

    return convertResult
  } catch (e: any) {
    return { valid: false, error: 'invalid', message: e.message }
  }
}

type ParsedResult = { valid: true } & ParsedId
function parseId(rawValue: string): ParsedResult | ConvertError {
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

function convertFromUuid(rawValue: string): ConvertedId {
  const uuidBytes = Array.from(uuidParse(rawValue))
  const oracleBytes = flipByteOrder(uuidBytes)

  const uuidFormat = buildUuidLayout(rawValue, uuidBytes)
  const oracleString = oracleBytes.map(stringifyAsHex).join('').toUpperCase()
  const oracleFormat = buildUuidLayout(oracleString, oracleBytes)

  return {
    rawIdValue: rawValue,
    uuidFormat,
    oracleFormat,
    bytes: uuidBytes,
    bytesAsHex: uuidBytes.map(stringifyAsHex),
  }
}

function convertFromOracle(rawValue: string): ConvertedId {
  const oracleBytes = getBytesFromOracle(rawValue)
  const uuidBytes = flipByteOrder(oracleBytes)

  const uuidString = uuidStringify(uuidBytes)
  const uuidFormat = buildUuidLayout(uuidString, uuidBytes)
  const oracleFormat = buildUuidLayout(rawValue, oracleBytes)

  return {
    rawIdValue: rawValue,
    uuidFormat,
    oracleFormat,
    bytes: uuidBytes,
    bytesAsHex: uuidBytes.map(stringifyAsHex),
  }
}

function stringifyAsHex(byte: number) {
  return byte.toString(16).padStart(2, '0')
}

function buildUuidLayout(rawIdValue: string, bytes: number[]): UuidLayout {
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
  const bytes = new Array<number>()
  for (var i = 0; i < id.length; i += 2) {
    bytes.push(parseInt(id.substring(i, i + 2), 16))
  }

  return bytes
}

function flipByteOrder(bytes: number[]) {
  const newBytes = new Array<number>(16)

  flipBytesInRange(newBytes, bytes, 0, 4)
  flipBytesInRange(newBytes, bytes, 4, 6)
  flipBytesInRange(newBytes, bytes, 6, 8)

  for (let index = 8; index < bytes.length; index++) {
    newBytes[index] = bytes[index]
  }

  return newBytes
}

function flipBytesInRange(target: number[], source: number[], start: number, end: number) {
  for (let index = start; index < end; index++) {
    target[index] = source[start + end - 1 - index]
  }
}
