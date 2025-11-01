import { submitBallotSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const { reasoning } = await readValidatedBody(
    event,
    submitBallotSchema.parseAsync
  )

  const { id: currentBallotId, votingState } = await getCurrentBallotData(event)
  if (votingState !== 'voting') {
    throw createError({
      status: 422,
      message: 'No ballot is currently open',
    })
  }

  const { csrfToken } = await getCsrfTokens(
    event,
    `https://siege.hackclub.com/great-hall`
  )

  const res = await fetch(
    `https://siege.hackclub.com/ballots/${currentBallotId}/submit`,
    {
      method: 'PATCH',
      headers: {
        Cookie: `_siege_session=${getSessionCookie(event)}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'x-csrf-token': csrfToken,
      },
      body: JSON.stringify({ reasoning }),
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
