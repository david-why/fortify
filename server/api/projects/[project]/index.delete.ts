export default defineEventHandler(async (event) => {
  const projectID = getRouterParam(event, 'project')!

  const { csrfToken } = await getCsrfTokens(
    event,
    `https://siege.hackclub.com/armory/${projectID}`
  )

  const res = await fetch(`https://siege.hackclub.com/armory/${projectID}`, {
    method: 'DELETE',
    headers: {
      Cookie: `_siege_session=${getSessionCookie(event)}`,
      Accept: 'application/json',
      'x-csrf-token': csrfToken,
    },
    redirect: 'manual',
  })
  console.log(res)
  if (res.status !== 204) {
    throw createError({
      status: 500,
      message: 'Siege API returned error deleting project',
    })
  }

  setResponseStatus(event, 204)
})
