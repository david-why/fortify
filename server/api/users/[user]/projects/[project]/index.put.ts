import { load } from 'cheerio'
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

  // get a csrf token
  const pageRes = await fetch(
    `https://siege.hackclub.com/armory/${projectID}/edit`,
    {
      headers: {
        Cookie: `_siege_session=${getSessionCookie(event)}`,
      },
      redirect: 'manual',
    }
  )
  if (pageRes.status !== 200) {
    throw new Error('Failed to get project edit page')
  }
  const pageHtml = await pageRes.text()

  const $ = load(pageHtml)
  const csrfToken = $('meta[name="csrf-token"]').attr('content')
  const authenticityToken = $('input[name="authenticity_token"]').attr('value')
  if (!csrfToken || !authenticityToken) {
    throw new Error('Failed to get CSRF tokens for editing project')
  }

  const body = new FormData()
  body.append('_method', 'patch')
  body.append('authenticity_token', authenticityToken)
  body.append('remove_screenshot', 'false')
  body.append('project[name]', payload.title)
  body.append('project[description]', 'updated by fortify') // TODO
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
