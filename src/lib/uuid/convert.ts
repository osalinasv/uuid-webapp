import * as uuid from "uuid";
import { flipNetworkByteOrder } from "./shared";

export type ConvertResult = {
  version: number;
  uuidFormat: string;
  oracleFormat: string;
  bytes: number[];
};

export function convertId(rawValue: string): Result<ConvertResult> {
  try {
    if (uuid.validate(rawValue)) {
      return { ok: true, value: convertFromUuid(rawValue.toLowerCase()) };
    }

    const uppercased = rawValue.toUpperCase();

    if (/^[0-9A-F]{32}$/gs.test(uppercased)) {
      return { ok: true, value: convertFromOracle(uppercased) };
    }
  } catch (e: unknown) {
    if (e instanceof Error) {
      return { ok: false, error: e };
    }
  }

  return { ok: false };
}

function convertFromUuid(originalId: string): ConvertResult {
  const uuidBytes = Array.from(uuid.parse(originalId));
  const oracleBytes = flipNetworkByteOrder(uuidBytes);

  const uuidFormat = originalId;
  const oracleFormat = stringifySegment(oracleBytes, true);

  return {
    uuidFormat,
    oracleFormat,
    bytes: uuidBytes,
    version: getVersion(originalId),
  };
}

function convertFromOracle(originalId: string): ConvertResult {
  const oracleBytes = getBytesFromOracle(originalId);
  const uuidBytes = flipNetworkByteOrder(oracleBytes);

  const uuidFormat = uuid.stringify(new Uint8Array(uuidBytes));
  const oracleFormat = originalId;

  return {
    uuidFormat,
    oracleFormat,
    bytes: uuidBytes,
    version: getVersion(uuidFormat),
  };
}

function getVersion(id: string) {
  const version = uuid.version(id);
  return version === 0 ? 4 : version;
}

function stringifySegment(bytes: number[], uppercase = false) {
  return bytes.map((b) => stringifyAsHex(b, uppercase)).join("");
}

function stringifyAsHex(byte: number, uppercase = false) {
  const hex = byte.toString(16).padStart(2, "0");
  return uppercase ? hex.toUpperCase() : hex;
}

function getBytesFromOracle(id: string) {
  const bytes = new Array<number>(16);

  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = Number.parseInt(id.substring(i + i, i + i + 2), 16);
  }

  return bytes;
}
