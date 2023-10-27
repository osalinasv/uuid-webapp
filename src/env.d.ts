/// <reference types="astro/client" />

// prettier-ignore
type Nullable<T> = T | undefined | null

// prettier-ignore
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error?: E };
