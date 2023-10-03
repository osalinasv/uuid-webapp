export function sanitize(value: string) {
  return !value ? '' : value.replace(/\s/g, '')
}
