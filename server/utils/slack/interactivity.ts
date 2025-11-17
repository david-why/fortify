import type { BlockAction, BlockButtonAction } from '@slack/bolt'
import type { H3Event } from 'h3'
import { generateProjectEditBlocks } from './blocks'
import { EditProjectSchema } from '~~/shared/schemas'
import { FetchError } from 'ofetch'

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
      text: 'This project has no repo URL!',
      replace_original: false,
    })
  } else if (action.action_id === 'armory-no-demo') {
    await respondSlackEvent(payload, {
      text: 'This project has no demo URL!',
      replace_original: false,
    })
  } else if (action.action_id === 'armory-details-back') {
    await armoryDetailsBack(event, payload)
  } else if (action.action_id === 'armory-details-edit') {
    await armoryDetailsEdit(event, payload)
  } else if (action.action_id === 'armory-edit-confirm') {
    await armoryEditConfirm(event, payload)
  } else if (action.action_id === 'armory-edit-cancel') {
    await armoryEditCancel(event, payload)
  } else if (action.action_id === 'armory-create') {
    await respondSlackEvent(payload, {
      text: 'WIP, please check back later!',
      replace_original: false,
    })
  } else if (
    action.action_id.startsWith('ignore') ||
    action.action_id === 'value'
  ) {
    // ignore :)
  } else {
    console.warn('Unknown interaction')
    console.log(JSON.stringify(payload, null, 2))
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
      text: ':discord_loader: Fetching your project...',
    }),
  ])

  await respondSlackEvent(payload, {
    text: 'Here is your project!',
    blocks,
  })
}

async function armoryDetailsBack(event: H3Event, payload: BlockAction) {
  const cookie = await getSlackCookie(event, payload.user.id)
  if (!cookie) {
    return respondNeedLogin(payload)
  }

  const [blocks] = await Promise.all([
    generateArmoryBlocks(cookie),
    respondSlackEvent(payload, {
      text: ':discord_loader: Fetching your projects from the armory...',
    }),
  ])

  await respondSlackEvent(payload, {
    text: 'Here is a list of your Siege projects!',
    blocks,
  })
}

async function armoryDetailsEdit(event: H3Event, payload: BlockAction) {
  const action = payload as BlockButtonAction
  const projectID = parseInt(action.actions[0]!.value!)

  const cookie = await getSlackCookie(event, payload.user.id)
  if (!cookie) {
    return respondNeedLogin(payload)
  }

  const [blocks] = await Promise.all([
    generateProjectEditBlocks(cookie, projectID),
    respondSlackEvent(payload, {
      text: ':discord_loader: Fetching your project to edit...',
    }),
  ])

  await respondSlackEvent(payload, {
    text: 'Edit your project with this form!',
    blocks,
  })
}

async function armoryEditConfirm(event: H3Event, payload: BlockAction) {
  const action = payload as BlockButtonAction
  const projectID = parseInt(action.actions[0]!.value!)

  const cookie = await getSlackCookie(event, payload.user.id)
  if (!cookie) {
    return respondNeedLogin(payload)
  }

  if (Object.keys(payload.state?.values || {}).length === 0) {
    return respondSlackEvent(payload, {
      replace_original: false,
      text: `you haven't changed anything lol`,
    })
  }

  const [project] = await Promise.all([
    $fetch(`/api/projects/${projectID}`, {
      headers: {
        Cookie: `_siege_session=${cookie}`,
      },
    }),
    respondSlackEvent(payload, {
      text: ':discord_loader: Saving your project...',
    }),
  ])

  const body: EditProjectSchema = {
    title: project.title,
    description: project.description,
    repo: project.repo || '',
    demo: project.demo || '',
    hackatime_projects: project.hackatime_projects,
    screenshot: null,
  }

  if (payload.state?.values?.title?.value?.value) {
    body.title = payload.state.values.title.value.value
  }
  if (payload.state?.values?.description?.value?.value) {
    body.description = payload.state.values.description.value.value
  }
  if (payload.state?.values?.repo?.value?.value) {
    body.repo = payload.state.values.repo.value.value
  }
  if (payload.state?.values?.demo?.value?.value) {
    body.demo = payload.state.values.demo.value.value
  }
  if (payload.state?.values?.hackatime_projects?.value?.selected_options) {
    body.hackatime_projects =
      payload.state.values.hackatime_projects.value.selected_options.map(
        (opt) => opt.value
      )
  }

  try {
    await $fetch(`/api/projects/${projectID}`, {
      method: 'PUT',
      body,
      headers: {
        Cookie: `_siege_session=${cookie}`,
      },
    })
  } catch (e) {
    const message =
      e instanceof FetchError ? e.data.message ?? e.message : String(e)
    return respondSlackEvent(payload, {
      replace_original: false,
      text: `An error occurred while updating your project:\n\`\`\`\n${message}\n\`\`\``,
    })
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
      text: ':discord_loader: Fetching your edited project...',
    }),
  ])

  await respondSlackEvent(payload, {
    text: 'Here is your project!',
    blocks,
  })
}

async function armoryEditCancel(event: H3Event, payload: BlockAction) {
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
      text: ':discord_loader: Alright, fetching your project...',
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
