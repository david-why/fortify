import { load } from 'cheerio'
import type { H3Event } from 'h3'
import { getSessionCookie } from '~~/server/utils/user'

export default defineEventHandler(async (event) => {
  const userID = getRouterParam(event, 'user')!

  if (userID === 'me') {
    // fetch from armory
    const htmlText = await fetchArmoryProjects(event)

    const armoryProjects: Omit<
      UserProject,
      'description' | 'user' | 'hours'
    >[] = []

    const $ = load(htmlText)
    for (const project of $('.projects-grid').find('article')) {
      const id = parseInt(project.attribs.id.split('_')[1])
      const title = $(project).find('.project-title').text().trim()
      const week = parseInt(
        $(project).find('.project-badge').text().trim().split(' ')[1]
      )
      const [repo, demo] = $(project)
        .find('.project-links a')
        .map(function () {
          const url = this.attribs['href']
          return url === '#' ? null : url
        })
      const statusText = $(project)
        .find('.project-status-indicator')
        .text()
        .trim()
        .toLowerCase()
      let status: ProjectStatus
      let value: number = 0.0
      if (statusText.includes('value: ')) {
        status = 'finished'
        const parts = statusText.split(': ')
        value = parseFloat(parts[parts.length - 1])
      } else if (statusText.includes('building')) {
        status = 'building'
      } else if (statusText.includes('submitted')) {
        status = 'submitted'
      } else if (statusText.includes('vote')) {
        status = 'pending_voting'
      } else if (statusText.includes('waiting for')) {
        status = 'waiting_for_review'
      } else {
        status = 'building' // uhhh??
      }
      armoryProjects.push({ id, title, week, repo, demo, status, value })
    }

    const apiProjects = await Promise.all(
      armoryProjects.map((p) => fetchAPIProject(p.id))
    )
    const projects: UserProject[] = armoryProjects.map((p, i) => ({
      ...p,
      description: apiProjects[i]!.description,
      user: apiProjects[i]!.user,
      hours: apiProjects[i]!.hours,
    }))

    const canCreate = !$('.projects-actions a').hasClass('is-disabled')

    return { projects, canCreate }
  } else {
    // fetch from api
    const data = await fetch(
      `https://siege.hackclub.com/api/public-beta/user/${userID}`
    ).then((r) => r.json<APIUser>())

    const projects = data.projects
    const apiProjects = await Promise.all(
      projects.map((p) => fetchAPIProject(p.id))
    )

    const userProjects: UserProject[] = apiProjects.map((p) => ({
      id: p.id,
      title: p.name,
      week: parseInt(p.week_badge_text.split(' ')[1]),
      description: p.description,
      repo: p.repo_url || null,
      demo: p.demo_url || null,
      status: p.status,
      value: Number(p.coin_value),
      user: p.user,
      hours: p.hours,
    }))

    const week = getCurrentWeek()
    const canCreate = !userProjects.find((p) => p.week === week)

    return { projects: userProjects, canCreate }
  }
})

async function fetchArmoryProjects(event: H3Event) {
  const res = await fetch('https://siege.hackclub.com/armory', {
    headers: {
      Cookie: `_siege_session=${getSessionCookie(event)}`,
    },
    redirect: 'manual',
  })
  if (res.status !== 200) {
    throw new Error('Failed to get armory data')
  }
  const htmlText = await res.text()
  return htmlText
}

async function fetchAPIProject(id: number) {
  const data = await fetch(
    `https://siege.hackclub.com/api/public-beta/project/${id}`
  ).then((r) => r.json())

  return data as APIProject
}
