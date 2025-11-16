// generate blocks to send as messages

import type { ActionsBlockElement, KnownBlock } from '@slack/types'
import { markdownToSlack } from 'md-to-slack'

export async function generateArmoryBlocks(
  cookie: string,
  extraActions: ActionsBlockElement[] = []
): Promise<KnownBlock[]> {
  const projects = (await $fetch(`/api/users/me/projects`, {
    headers: {
      Cookie: `_siege_session=${cookie}`,
    },
  }))!

  const projectBlocks: KnownBlock[] = projects.projects
    .toSorted((a, b) => a.week - b.week)
    .map((p) => ({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${p.title}* - Week ${p.week}, ${formatProjectStatusSlack(p)}`,
      },
      accessory: {
        type: 'button',
        text: {
          type: 'plain_text',
          text: 'View',
          emoji: true,
        },
        value: String(p.id),
        action_id: 'armory-project-details',
      },
    }))
  if (!projectBlocks.length) {
    projectBlocks.push({
      type: 'section',
      text: {
        type: 'plain_text',
        text: 'No projects yet. Create one with the button below!',
      },
    })
  }

  const createProjectBlocks: KnownBlock[] = projects.canCreate
    ? [
        {
          type: 'divider',
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: ':heavy_plus_sign: Create project',
                emoji: true,
              },
              action_id: 'armory-create',
            },
            ...extraActions,
          ],
        },
      ]
    : []

  const actionBlocks: KnownBlock[] =
    projects.canCreate || !extraActions.length
      ? []
      : [{ type: 'actions', elements: extraActions }]

  return [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: ':siege-castle: Your projects',
        emoji: true,
      },
    },
    {
      type: 'divider',
    },
    ...projectBlocks,
    ...createProjectBlocks,
    ...actionBlocks,
  ]
}

export async function generateProjectBlocks(
  cookie: string,
  projectID: number,
  extraActions: ActionsBlockElement[] = []
) {
  const project = await $fetch(`/api/projects/${projectID}`, {
    headers: {
      Cookie: `_siege_session=${cookie}`,
    },
  })

  const actionsBlocks: KnownBlock[] = extraActions.length
    ? [{ type: 'actions', elements: extraActions }]
    : []

  return [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: project.title,
        emoji: true,
      },
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `by *${project.user.display_name}*`,
        },
        {
          type: 'plain_text',
          text: `Week ${project.week}`,
        },
        {
          type: 'plain_text',
          text: `${project.hours} hours`,
        },
      ],
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: markdownToSlack(project.description),
      },
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: project.repo
              ? `:github: Repo (${getDomainName(project.repo)})`
              : 'No repo URL',
            emoji: true,
          },
          url: project.repo || undefined,
          action_id: project.repo ? 'ignore-1' : 'armory-no-repo',
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: project.demo
              ? `:link: Demo (${getDomainName(project.demo)})`
              : 'No demo URL',
            emoji: true,
          },
          url: project.demo || undefined,
          action_id: project.demo ? 'ignore-2' : 'armory-no-demo',
        },
      ],
    },
    ...actionsBlocks,
  ] satisfies KnownBlock[]
}
