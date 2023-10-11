import { parse as uuidParse } from 'uuid'
import { validate as uuidValidate } from 'uuid'

type UuidLayout<TOctet = string> = {
  timeLow: TOctet[]
  timeMid: TOctet[]
  timeHi: TOctet[]
  clockHi: TOctet[]
  clockLow: TOctet[]
  node: TOctet[]
}

export type ConvertResult = {
  valid: true
  uuidFormat: UuidLayout
  oracleFormat: UuidLayout
  bytes: UuidLayout<number>
}

export type ConvertError = {
  valid: false
  message?: string
}

export function convertId(rawValue: string): ConvertResult | ConvertError {
  try {
    if (uuidValidate(rawValue)) {
      return convertFromUuid(rawValue.toLowerCase())
    }

    const uppercased = rawValue.toUpperCase()
    if (/^[0-9A-F]{32}$/gs.test(uppercased)) {
      return convertFromOracle(uppercased)
    }

    return { valid: false }
  } catch (e: any) {
    return { valid: false, message: e.message }
  }
}

function convertFromUuid(id: string): ConvertResult {
  const uuidBytes = Array.from(uuidParse(id))
  const oracleBytes = flipByteOrder(uuidBytes)

  const uuidFormat = buildHexLayout(uuidBytes)
  const oracleFormat = buildHexLayout(oracleBytes, true)

  return {
    valid: true,
    uuidFormat,
    oracleFormat,
    bytes: buildLayout(uuidBytes),
  }
}

function convertFromOracle(id: string): ConvertResult {
  const oracleBytes = getBytesFromOracle(id)
  const uuidBytes = flipByteOrder(oracleBytes)

  const uuidFormat = buildHexLayout(uuidBytes)
  const oracleFormat = buildHexLayout(oracleBytes, true)

  return {
    valid: true,
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

function flipByteOrder(bytes: number[]) {
  return [
    bytes[3],
    bytes[2],
    bytes[1],
    bytes[0],

    bytes[5],
    bytes[4],

    bytes[7],
    bytes[6],

    bytes[8],
    bytes[9],

    bytes[10],
    bytes[11],
    bytes[12],
    bytes[13],
    bytes[14],
    bytes[15],
  ]
}
