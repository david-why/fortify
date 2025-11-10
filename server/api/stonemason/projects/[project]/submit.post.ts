import { stonemasonReviewSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const projectID = getRouterParam(event, 'project')!
  const payload = await readValidatedBody(
    event,
    stonemasonReviewSchema.parseAsync
  )

  const { csrfToken } = await getCsrfTokens(
    event,
    `https://siege.hackclub.com/review/projects/${projectID}`
  )

  const data = new FormData()
  data.append('review_status', payload.review_status)
  data.append('private_notes', payload.private_notes)
  data.append('stonemason_feedback', payload.stonemason_feedback)
  data.append(
    'include_reviewer_handle',
    payload.include_reviewer_handle ? 'true' : 'false'
  )
  if (payload.reviewer_video) {
    const blob = await fetch(payload.reviewer_video).then((r) => r.blob())
    data.append('reviewer_video', blob, 'video')
  }
  const res = await fetch(
    `https://siege.hackclub.com/review/projects/${projectID}/submit_review`,
    {
      method: 'POST',
      headers: {
        Cookie: `_siege_session=${getSessionCookie(event)}`,
        'x-csrf-token': csrfToken,
      },
      body: data,
    }
  ).then((r) => r.json())

  if (!res.success) {
    throw createError({
      status: 500,
      message: 'Failed to submit project review',
      data: res,
    })
  }

  return res as { success: true; message: string }
})
