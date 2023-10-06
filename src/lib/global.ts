export function sanitize(value: string | undefined) {
  return !value ? '' : value.replace(/\s/g, '')
}

export function formatTitle(id: string) {
  let title = 'UUID Tools by osalinasv.dev'
  if (id) title += ` | ${id}`

  return title
}
