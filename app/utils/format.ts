export function getDomainName(url: string) {
  const hostname = new URL(url).hostname
  const parts = hostname.split('.')
  return parts.slice(parts.length - 2).join('.')
}

export function getIconLink(url: string) {
  const hostname = new URL(url).hostname
  if (hostname.endsWith('github.com')) {
    return 'i-mdi-github'
  } else if (hostname.endsWith('gitlab.com')) {
    return 'i-mdi-gitlab'
  } else {
    return 'i-material-symbols-open-in-new'
  }
}
