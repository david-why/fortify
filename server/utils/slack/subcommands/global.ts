import type { H3Event } from 'h3'

export async function globalCommand(
  h3Event: H3Event,
  args: string[],
  event: SlackSlashCommandRequest
) {
  h3Event.waitUntil(globalCommandInner(h3Event, args, event))
  return ':discord_loader: Fetching all projects to calculate hours...'
}
async function globalCommandInner(
  h3Event: H3Event,
  args: string[],
  event: SlackSlashCommandRequest
) {
  const { projects } = await $fetch<{ projects: APIProject[] }>(
    'https://siege.hackclub.com/api/public-beta/projects'
  )
  const week = getCurrentWeek()

  const sumHours = (projects: APIProject[]) =>
    Math.round(projects.map((p) => p.hours).reduce((a, b) => a + b, 0) * 10) /
    10

  const totalHours = sumHours(projects)
  const totalSubmittedHours = sumHours(
    projects.filter((p) => p.status !== 'building')
  )

  const lastWeekProjects = projects.filter(
    (p) => p.week_badge_text === `Week ${week - 1}`
  )
  const lastHours = sumHours(lastWeekProjects)
  const lastSubmittedHours = sumHours(
    lastWeekProjects.filter((p) => p.status !== 'building')
  )

  const weekProjects = projects.filter(
    (p) => p.week_badge_text === `Week ${week}`
  )
  const weekHours = sumHours(weekProjects)
  const submittedHours = sumHours(
    weekProjects.filter((p) => p.status !== 'building')
  )

  await respondSlackEvent(event, {
    text: `\
:clock1: Total hours tracked this week: ${weekHours}
:clock3: Total submitted hours this week: ${submittedHours}
:clock5: Total hours tracked last week: ${lastHours}
:clock7: Total submitted hours last week: ${lastSubmittedHours}
:clock9: Total hours tracked across all weeks: ${totalHours}
:clock11: Total submitted hours across all weeks: ${totalSubmittedHours}`,
  })
}
