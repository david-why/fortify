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

// https://stackoverflow.com/a/61226119/13951118
export function blobToBase64URL(blob: Blob) {
  const reader = new FileReader()
  reader.readAsDataURL(blob)
  return new Promise<string>((resolve) => {
    reader.onloadend = () => {
      const dataURL = reader.result as string
      resolve(dataURL)
    }
  })
}
