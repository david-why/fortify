// events

interface SlackVerificationRequest {
  type: 'url_verification'
  token: string
  challenge: string
}

interface SlackEventCallbackRequest {
  type: 'event_callback'
  token: string
  team_id: string
  api_app_id: string
  event: SlackEvent
  event_context: string
  event_id: string
  event_time: number
  authorizations: unknown[]
  is_ext_shared_channel: boolean
  context_team_id: string
  context_enterprise_id: string | null
}

type SlackEventsRequest = SlackVerificationRequest | SlackEventCallbackRequest

// commands

interface SlackSlashCommandRequest {
  token: string
  team_id: string
  team_domain: string
  enterprise_id?: string
  enterprise_name?: string
  channel_id: string
  channel_name: string
  user_id: string
  user_name: string
  command: `/${string}`
  text: string
  response_url: string
  trigger_id: string
  api_app_id: string
}
