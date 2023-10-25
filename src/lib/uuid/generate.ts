import { v4 as uuidV4 } from 'uuid'
import { flipNetworkByteOrder } from './shared'

export const GENERATE_COUNT_MIN = 1
export const GENERATE_COUNT_MAX = 50

export const ID_TYPE = {
  UUID: 'uuid',
  ORACLE: 'oracle',
} as const

export type IdType = (typeof ID_TYPE)[keyof typeof ID_TYPE]

export type GenerateOptions = {
  count: number
  type: IdType
}

export function generateIds(options: GenerateOptions) {}
