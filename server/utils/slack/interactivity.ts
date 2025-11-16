import type { BlockAction, BlockButtonAction } from '@slack/bolt'
import type { KnownBlock } from '@slack/types'
import type { H3Event } from 'h3'
import { markdownToSlack } from 'md-to-slack'

export async function handleSlackBlockAction(
  event: H3Event,
  payload: BlockAction
) {
  console.log(payload)
  const action = payload.actions[0]
  if (!action) {
    return ''
  }

  if (action.action_id === 'armory-project-details') {
    await armoryProjectDetails(event, payload)
  } else if (action.action_id === 'armory-no-repo') {
    await respondSlackEvent(payload, {
      text: 'No repo URL set for this project!',
      replace_original: false,
    })
  } else if (action.action_id === 'armory-no-demo') {
    await respondSlackEvent(payload, {
      text: 'No demo URL set for this project!',
      replace_original: false,
    })
  } else if (action.action_id === 'armory-create') {
    await respondSlackEvent(payload, {
      text: 'WIP, please check back later!',
      replace_original: false,
    })
  } else if (action.action_id.startsWith('ignore')) {
    // ignore :)
  } else {
    await respondSlackEvent(payload, {
      text: 'Unknown interaction, maybe the message is outdated?',
      replace_original: false,
    })
  }
}

async function armoryProjectDetails(event: H3Event, payload: BlockAction) {
  const action = payload as BlockButtonAction
  const projectID = action.actions[0]!.value!

  const cookie = await getSlackCookie(event, payload.user.id)
  if (!cookie) {
    return respondNeedLogin(payload)
  }

  const [project] = await Promise.all([
    $fetch(`/api/projects/${projectID}`, {
      headers: {
        Cookie: `_siege_session=${cookie}`,
      },
    }),
    respondSlackEvent(payload, {
      text: ':discord_loader: Retrieving your project...',
    }),
  ])

  await respondSlackEvent(payload, {
    blocks: [
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
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: ':arrow_backward: Back' },
            action_id: 'armory-details-back',
          },
        ],
      },
    ] satisfies KnownBlock[],
  })
}

// helpers

async function respondNeedLogin(payload: { response_url: string }) {
  return await respondSlackEvent(payload, {
    text: SLACK_NOT_LOGGED_IN_TEXT,
    replace_original: false,
  })
}
