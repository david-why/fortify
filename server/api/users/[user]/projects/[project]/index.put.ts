import { load } from 'cheerio'
import z from 'zod'
import { ALLOWED_REPO_HOSTS } from '~~/shared/consts'

// TODO: merge with code in frontend

function checkRepoHost(u: string) {
  try {
    return ALLOWED_REPO_HOSTS.includes(new URL(u).hostname)
  } catch {
    return true
  }
}

const schema = z.object({
  title: z.string().min(1),
  repo: z.union([
    z.url().refine(checkRepoHost, {
      error:
        'Repo url must be a repository URL from a supported Git hosting service (GitHub, GitLab, Bitbucket, Codeberg, SourceForge, Azure DevOps, or Hack Club Git)',
    }),
    z.literal(''),
  ]),
  demo: z.union([z.url(), z.literal('')]),
})

export default defineEventHandler(async (event) => {
  const userID = getRouterParam(event, 'user')!
  if (userID !== 'me') {
    throw createError({
      status: 403,
      message: 'Cannot edit projects that you do not own'
    })
  }
  const projectID = parseInt(getRouterParam(event, 'project')!)
  const payload = await readValidatedBody(event, schema.parseAsync)

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
  body.append('project[screenshot]', new Blob([]), '')
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
