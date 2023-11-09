import { parse as uuidParse, validate as uuidValidate } from 'uuid'
import { flipNetworkByteOrder } from './shared'

type UuidLayout<TOctet = string> = {
  timeLow: TOctet[]
  timeMid: TOctet[]
  timeHi: TOctet[]
  clockHi: TOctet[]
  clockLow: TOctet[]
  node: TOctet[]
}

export type ConvertResult = {
  uuidFormat: UuidLayout
  oracleFormat: UuidLayout
  bytes: UuidLayout<number>
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

    return { ok: false }
  } catch (e: any) {
    return { ok: false, error: e }
  }
}

function convertFromUuid(id: string): ConvertResult {
  const uuidBytes = Array.from(uuidParse(id))
  const oracleBytes = flipNetworkByteOrder(uuidBytes)

  const uuidFormat = buildHexLayout(uuidBytes)
  const oracleFormat = buildHexLayout(oracleBytes, true)

  return {
    uuidFormat,
    oracleFormat,
    bytes: buildLayout(uuidBytes),
  }
}

function convertFromOracle(id: string): ConvertResult {
  const oracleBytes = getBytesFromOracle(id)
  const uuidBytes = flipNetworkByteOrder(oracleBytes)

  const uuidFormat = buildHexLayout(uuidBytes)
  const oracleFormat = buildHexLayout(oracleBytes, true)

  return {
    uuidFormat,
    oracleFormat,
    bytes: buildLayout(uuidBytes),
  }
}
function buildLayout<TOctet>(bytes: TOctet[]): UuidLayout<TOctet> {
  return {
    timeLow: bytes.slice(0, 4),
    timeMid: bytes.slice(4, 6),
    timeHi: bytes.slice(6, 8),
    clockHi: bytes.slice(8, 9),
    clockLow: bytes.slice(9, 10),
    node: bytes.slice(10),
  }
}

function buildHexLayout(bytes: number[], uppercase = false) {
  const hex = bytes.map((b) => stringifyAsHex(b, uppercase))
  return buildLayout(hex)
}

function stringifyAsHex(byte: number, uppercase = false) {
  const hex = byte.toString(16).padStart(2, '0')
  return uppercase ? hex.toUpperCase() : hex
}

function getBytesFromOracle(id: string) {
  const bytes = new Array<number>(16)

  for (var i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(id.substring(i + i, i + i + 2), 16)
  }

  return bytes
}
