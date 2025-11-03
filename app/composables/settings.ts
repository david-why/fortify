export const HIDE_JUMPSCARES_KEY = 'fortify-hide-jumpscares'

export function useFortifySettings() {
  const value = ref({ hideJumpscares: false })

  if (import.meta.client) {
    value.value.hideJumpscares = JSON.parse(
      localStorage.getItem(HIDE_JUMPSCARES_KEY) || 'false'
    )

    watchEffect(() => {
      localStorage.setItem(
        HIDE_JUMPSCARES_KEY,
        JSON.stringify(value.value.hideJumpscares)
      )
    })
  }

  return value
}
