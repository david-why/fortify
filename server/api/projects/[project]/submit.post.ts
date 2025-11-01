import { submitProjectSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const projectID = getRouterParam(event, 'project')!
  const { is_update } = await readValidatedBody(
    event,
    submitProjectSchema.parseAsync
  )

  const { csrfToken } = await getCsrfTokens(
    event,
    `https://siege.hackclub.com/armory/${projectID}`
  )

  const res = await fetch(
    `https://siege.hackclub.com/armory/${projectID}/submit`,
    {
      method: 'POST',
      body: JSON.stringify({ is_update }),
      headers: {
        Cookie: `_siege_session=${getSessionCookie(event)}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'x-csrf-token': csrfToken,
      },
      redirect: 'manual',
    }
  )
  if (!res.ok) {
    throw createError({
      status: res.status,
      message: 'Failed to submit project',
    })
  }
  return {}
})
