import { v4 as uuidV4 } from "uuid";
import { flipNetworkByteOrder } from "./shared";

export const GENERATE_COUNT_MIN = 1;
export const GENERATE_COUNT_MAX = 50;

export const ID_TYPE = {
  UUID: "uuid",
  ORACLE: "oracle",
} as const;

export type IdType = (typeof ID_TYPE)[keyof typeof ID_TYPE];

type FormatFlag = {
  name: string;
  label: string;
  checked: boolean;
};

type FormatOptions = {
  type: IdType;
  label: string;
  flags: Readonly<FormatFlag[]>;
};

const UUID_FORMAT_OPTIONS = {
  type: ID_TYPE.UUID,
  label: "UUID v4",
  flags: [
    { name: "uppercase", label: "UPPERCASE", checked: false },
    { name: "useHyphens", label: "Use hyphens", checked: true },
    { name: "encodeBase64", label: "As Base64", checked: false },
  ],
} as const;

const ORACLE_FORMAT_OPTIONS = {
  type: ID_TYPE.ORACLE,
  label: "Oracle RAW(16)",
  flags: [
    { name: "wrapHexToRaw", label: "Use HEXTORAW", checked: false },
    { name: "encodeBase64", label: "As Base64", checked: false },
  ],
} as const;

// prettier-ignore
export const OPTIONS_BY_TYPE = [
  UUID_FORMAT_OPTIONS,
  ORACLE_FORMAT_OPTIONS
]

type TypeOptionsHelper<T extends Readonly<FormatOptions>> = {
  type: T["type"];
} & {
  [K in T["flags"][number]["name"]]: boolean;
};

type UuidGenerateOptions = TypeOptionsHelper<typeof UUID_FORMAT_OPTIONS>;
type OracleGenerateOptions = TypeOptionsHelper<typeof ORACLE_FORMAT_OPTIONS>;
export type GenerateOptions = { count: number } & (UuidGenerateOptions | OracleGenerateOptions);

export function generateIds(parameters: URLSearchParams) {
  const options = parseOptions(parameters);
  return generateIdsFromOptions(options);
}

function parseOptions(parameters: URLSearchParams) {
  const rawType = parameters.get("type");
  const type = rawType && Object.hasOwn(ID_TYPE, rawType.toUpperCase()) ? rawType : ID_TYPE.UUID;

  const rawCount = Number.parseInt(parameters.get("count") as string) || GENERATE_COUNT_MIN;
  const count = Math.min(Math.max(GENERATE_COUNT_MIN, rawCount), GENERATE_COUNT_MAX);

  parameters.delete("type");
  parameters.delete("count");

  const options = {
    type: type as IdType,
    count: count,
  };

  parameters.forEach((val, key) => {
    if (val === "true") {
      // Any parameter key at this point shoul be pre-validated to be an option flag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (options as any)[key] = true;
    }
  });

  return options as GenerateOptions;
}

function generateIdsFromOptions(options: GenerateOptions) {
  const rawGeneratedIds = new Array<string>(options.count);

  for (let i = 0; i < options.count; i++) {
    rawGeneratedIds[i] = uuidV4();
  }

  return options.type === "uuid"
    ? formatUuidStrings(options, rawGeneratedIds)
    : formatOracleStrings(options, rawGeneratedIds);
}

export type GeneratedId = {
  value: string;
  formatted: string;
};

function formatUuidStrings(options: UuidGenerateOptions, ids: string[]) {
  const generatedIds = new Array<GeneratedId>(ids.length);

  for (let i = 0; i < ids.length; i++) {
    const originalId = ids[i];
    let formattedId = originalId;

    if (!options.useHyphens) formattedId = formattedId.replaceAll("-", "");
    if (options.uppercase) formattedId = formattedId.toUpperCase();
    if (options.encodeBase64) formattedId = btoa(formattedId);

    generatedIds[i] = {
      value: originalId,
      formatted: formattedId,
    };
  }

  return generatedIds;
}

function formatOracleStrings(options: OracleGenerateOptions, ids: string[]) {
  const generatedIds = new Array<GeneratedId>(ids.length);

  for (let i = 0; i < ids.length; i++) {
    const generatedBytes = explodeStringIntoBytes(ids[i]);
    const flippedBytes = flipNetworkByteOrder(generatedBytes);

    const originalId = flippedBytes.join("");
    let formattedId = originalId;

    if (options.wrapHexToRaw) formattedId = `HEXTORAW('${formattedId}')`;
    if (options.encodeBase64) formattedId = btoa(formattedId);

    generatedIds[i] = {
      value: originalId,
      formatted: formattedId,
    };
  }

  return generatedIds;
}

function explodeStringIntoBytes(id: string) {
  const uppercased = id.replaceAll("-", "").toUpperCase();
  const bytes: string[] = [];

  for (let index = 0; index < uppercased.length; index += 2) {
    bytes.push(uppercased[index] + uppercased[index + 1]);
  }

  return bytes;
}
