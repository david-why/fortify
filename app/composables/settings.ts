export const HIDE_JUMPSCARES_KEY = 'fortify-hide-jumpscares'
export const SHOW_STONEMASON_KEY = 'fortify-show-stonemason'
export const SHOW_REVIEW_KEY = 'fortify-show-review'

export function useFortifySettings() {
  const value = ref({
    hideJumpscares: false,
    showStonemason: false,
    showReview: false,
  })

  if (import.meta.client) {
    value.value.hideJumpscares = JSON.parse(
      localStorage.getItem(HIDE_JUMPSCARES_KEY) || 'false'
    )
    value.value.showStonemason = JSON.parse(
      localStorage.getItem(SHOW_STONEMASON_KEY) || 'false'
    )
    value.value.showReview = JSON.parse(
      localStorage.getItem(SHOW_REVIEW_KEY) || 'false'
    )

    watchEffect(() => {
      localStorage.setItem(
        HIDE_JUMPSCARES_KEY,
        JSON.stringify(value.value.hideJumpscares)
      )
    })
    watchEffect(() => {
      localStorage.setItem(
        SHOW_STONEMASON_KEY,
        JSON.stringify(value.value.showStonemason)
      )
    })
    watchEffect(() => {
      localStorage.setItem(
        SHOW_REVIEW_KEY,
        JSON.stringify(value.value.showReview)
      )
    })
  }

  return value
}
