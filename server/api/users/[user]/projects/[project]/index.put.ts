import { getCsrfTokens } from '~~/server/utils/csrf'
import { editProjectSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const userID = getRouterParam(event, 'user')!
  if (userID !== 'me') {
    throw createError({
      status: 403,
      message: 'Cannot edit projects that you do not own',
    })
  }
  const projectID = parseInt(getRouterParam(event, 'project')!)
  const payload = await readValidatedBody(event, editProjectSchema.parseAsync)

  const { csrfToken, authenticityToken } = await getCsrfTokens(
    event,
    `https://siege.hackclub.com/armory/${projectID}/edit`
  )

  const body = new FormData()
  body.append('_method', 'patch')
  body.append('authenticity_token', authenticityToken)
  body.append('remove_screenshot', 'false')
  body.append('project[name]', payload.title)
  body.append('project[description]', payload.description)
  body.append('project[repo_url]', payload.repo)
  body.append('project[demo_url]', payload.demo)
  // body.append(
  //   'project[screenshot]',
  //   new Blob([], { type: 'application/octet-stream' }),
  //   ''
  // )
  body.append('project[hackatime_projects][]', '')
  const res = await fetch(`https://siege.hackclub.com/armory/${projectID}`, {
    method: 'POST',
    headers: {
      Cookie: `_siege_session=${getSessionCookie(event)}`,
      'x-csrf-token': csrfToken,
    },
    body,
    redirect: 'manual',
  })
  console.log(res)
  if (
    res.status !== 302 ||
    res.headers.get('Location') !==
      `https://siege.hackclub.com/armory/${projectID}`
  ) {
    throw new Error('Failed to edit project')
  }

  setResponseStatus(event, 204)
  return {}
})
