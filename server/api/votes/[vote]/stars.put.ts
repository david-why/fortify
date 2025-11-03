import { updateStarsSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const voteID = getRouterParam(event, 'vote')!
  const { stars } = await readValidatedBody(event, updateStarsSchema.parseAsync)

  const { csrfToken } = await getCsrfTokens(
    event,
    `https://siege.hackclub.com/great-hall`
  )

  const res = await fetch(
    `https://siege.hackclub.com/votes/${voteID}/update_stars`,
    {
      method: 'PATCH',
      headers: {
        Cookie: `_siege_session=${getSessionCookie(event)}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'x-csrf-token': csrfToken,
      },
      body: JSON.stringify({ star_count: stars }),
      redirect: 'manual',
    }
  ).then((r) => r.json())

  if (!res.success) {
    throw createError({
      status: 500,
      message: 'Siege API returned error',
      data: res,
    })
  }

  setResponseStatus(event, 204)
})
