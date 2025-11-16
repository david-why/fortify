import type { BlockAction, BlockButtonAction } from '@slack/bolt'
import type { H3Event } from 'h3'

export async function handleSlackBlockAction(
  event: H3Event,
  payload: BlockAction
) {
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
  const projectID = parseInt(action.actions[0]!.value!)

  const cookie = await getSlackCookie(event, payload.user.id)
  if (!cookie) {
    return respondNeedLogin(payload)
  }

  const [blocks] = await Promise.all([
    generateProjectBlocks(cookie, projectID, [
      {
        type: 'button',
        text: { type: 'plain_text', text: ':arrow_backward: Back' },
        action_id: 'armory-details-back',
      },
    ]),
    respondSlackEvent(payload, {
      text: ':discord_loader: Retrieving your project...',
    }),
  ])

  await respondSlackEvent(payload, {
    text: 'Here is your project!',
    blocks,
  })
}

// helpers

async function respondNeedLogin(payload: { response_url: string }) {
  return await respondSlackEvent(payload, {
    text: SLACK_NOT_LOGGED_IN_TEXT,
    replace_original: false,
  })
}
