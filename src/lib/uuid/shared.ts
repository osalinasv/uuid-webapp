export function sanitizeIdInput(value: string) {
  return value.replace(/\s/g, '')
}

export function flipNetworkByteOrder<TByte>(bytes: TByte[]) {
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
