import { validate as uuidValidate, parse as uuidParse, stringify as uuidStringify } from 'uuid'
import { flipNetworkByteOrder } from './shared'

export type ConvertResult = {
  uuidFormat: string
  oracleFormat: string
  bytes: number[]
}

export function convertId(rawValue: string): Result<ConvertResult> {
  try {
    if (uuidValidate(rawValue)) {
      return { ok: true, value: convertFromUuid(rawValue.toLowerCase()) }
    }

    const uppercased = rawValue.toUpperCase()
    if (/^[0-9A-F]{32}$/gs.test(uppercased)) {
      return { ok: true, value: convertFromOracle(uppercased) }
    }
  } catch (e: unknown) {
    if (e instanceof Error) {
      return { ok: false, error: e }
    }
  }

  return { ok: false }
}

function convertFromUuid(id: string): ConvertResult {
  const uuidBytes = Array.from(uuidParse(id))
  const oracleBytes = flipNetworkByteOrder(uuidBytes)

  const uuidFormat = id
  const oracleFormat = stringifySegment(oracleBytes, true)

  return {
    uuidFormat,
    oracleFormat,
    bytes: uuidBytes,
  }
}

function convertFromOracle(id: string): ConvertResult {
  const oracleBytes = getBytesFromOracle(id)
  const uuidBytes = flipNetworkByteOrder(oracleBytes)

  const uuidFormat = uuidStringify(uuidBytes)
  const oracleFormat = id

  return {
    uuidFormat,
    oracleFormat,
    bytes: uuidBytes,
  }
}

function stringifySegment(bytes: number[], uppercase = false) {
  return bytes.map((b) => stringifyAsHex(b, uppercase)).join('')
}

function stringifyAsHex(byte: number, uppercase = false) {
  const hex = byte.toString(16).padStart(2, '0')
  return uppercase ? hex.toUpperCase() : hex
}

function getBytesFromOracle(id: string) {
  const bytes = new Array<number>(16)

  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = Number.parseInt(id.substring(i + i, i + i + 2), 16)
  }

  return bytes
}
