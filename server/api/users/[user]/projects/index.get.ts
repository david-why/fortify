import { getSessionCookie } from '~~/server/utils/user'
import { load } from 'cheerio'

export default defineEventHandler(async (event) => {
  const userID = getRouterParam(event, 'user')!

  if (userID === 'me') {
    // fetch from armory
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

    const projects: UserProject[] = []

    const $ = load(htmlText)
    for (const project of $('.projects-grid').find('article')) {
      const id = parseInt(project.attribs.id.split('_')[1])
      const title = $(project).find('.project-title').text().trim()
      const week = parseInt(
        $(project).find('.project-badge').text().trim().split(' ')[1]
      )
      const description = $(project).find('.project-description').text().trim()
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
      } else if (statusText.includes('waiting for')) {
        status = 'waiting_for_review'
      } else if (statusText.includes('vote')) {
        status = 'pending_voting'
      } else {
        status = 'building' // uhhh??
      }
      projects.push({ id, title, week, description, repo, demo, status, value })
    }

    return projects
  } else {
    // fetch from api
  }
})
