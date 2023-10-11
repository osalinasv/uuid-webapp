import { v4 as uuidV4 } from 'uuid'
import { flipNetworkByteOrder } from './common'

export const GENERATE_COUNT_MIN = 1
export const GENERATE_COUNT_MAX = 50

export const IdType = {
  UUID: 'uuid',
  ORACLE: 'oracle',
} as const

type IdType = (typeof IdType)[keyof typeof IdType]

export type GenerateOptions = {
  count: number
  type: IdType
}

export function generateIds(options: GenerateOptions) {}
