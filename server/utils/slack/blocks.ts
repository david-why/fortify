// generate blocks to send as messages

import { canEditProject } from '~~/shared/validation'

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

  const specialActions: ActionsBlockElement[] = canEditProject(project)
    ? [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: ':pencil: Edit project',
          },
          value: String(project.id),
          action_id: 'armory-details-edit',
        },
      ]
    : []

  const actionsBlocks: KnownBlock[] =
    extraActions.length || specialActions.length
      ? [{ type: 'actions', elements: [...specialActions, ...extraActions] }]
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

export async function generateProjectEditBlocks(
  cookie: string,
  projectID: number,
  extraActions: ActionsBlockElement[] = []
): Promise<KnownBlock[]> {
  const [project, hackatimeProjects] = await Promise.all([
    $fetch(`/api/projects/${projectID}`, {
      headers: {
        Cookie: `_siege_session=${cookie}`,
      },
    }),
    $fetch(`/api/projects/${projectID}/hackatime-projects`, {
      headers: {
        Cookie: `_siege_session=${cookie}`,
      },
    }),
  ])

  const hackatimeOptions = hackatimeProjects.map((p) => ({
    text: {
      type: 'plain_text' as const,
      text: `${p.label} - ${p.description}`,
    },
    value: p.value,
  }))
  const initialOptions = hackatimeOptions.filter((o) =>
    project.hackatime_projects.includes(o.value)
  )

  return [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: ':pencil: Edit your project',
        emoji: true,
      },
    },
    {
      type: 'input',
      block_id: 'title',
      element: {
        type: 'plain_text_input',
        initial_value: project.title,
        action_id: 'value',
      },
      label: {
        type: 'plain_text',
        text: 'Project name',
      },
      optional: false,
    },
    {
      type: 'input',
      block_id: 'description',
      element: {
        type: 'plain_text_input',
        multiline: true,
        initial_value: project.description,
        action_id: 'value',
      },
      label: {
        type: 'plain_text',
        text: 'Description (markdown allowed)',
      },
      optional: false,
    },
    {
      type: 'input',
      block_id: 'repo',
      element: {
        type: 'url_text_input',
        initial_value: project.repo || undefined,
        placeholder: {
          type: 'plain_text',
          text: 'Enter a GitHub, Hack Club Git, etc. URL',
        },
        action_id: 'value',
      },
      label: {
        type: 'plain_text',
        text: 'Repository URL (optional)',
      },
    },
    {
      type: 'input',
      block_id: 'demo',
      element: {
        type: 'url_text_input',
        initial_value: project.demo || undefined,
        placeholder: {
          type: 'plain_text',
          text: 'Enter your demo URL',
        },
        action_id: 'value',
      },
      label: {
        type: 'plain_text',
        text: 'Demo URL (optional)',
      },
    },
    {
      type: 'input',
      block_id: 'hackatime_projects',
      element: {
        type: 'multi_static_select',
        placeholder: {
          type: 'plain_text',
          text: 'Select your hackatime projects',
        },
        initial_options: initialOptions,
        options: hackatimeOptions,
        action_id: 'value',
      },
      label: {
        type: 'plain_text',
        text: 'Hackatime projects (optional but recommended)',
      },
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: '_Editing the screenshot is not supported yet, sorry!_',
        },
      ],
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Edit',
          },
          value: String(project.id),
          action_id: 'armory-edit-confirm',
          style: 'primary',
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Cancel',
          },
          value: String(project.id),
          action_id: 'armory-edit-cancel',
        },
        ...extraActions,
      ],
    },
  ]
}
