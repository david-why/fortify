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
