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
