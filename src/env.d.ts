/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

type Nullable<T> = T | undefined | null

type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error?: E }
