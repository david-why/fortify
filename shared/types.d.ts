declare interface APIProject {
  id: number
  name: string
  description: string
  status: string
  repo_url: string
  demo_url: string
  created_at: string
  updated_at: string
  user: Pick<APIUser, 'id' | 'name' | 'display_name'>
  week_badge_text: string
  coin_value: string
  is_update: boolean
  hours: number
}

declare interface APIUser {
  id: number
  slack_id: string
  name: string
  display_name: string
  coins: number
  rank: string
  status: string
  created_at: string
  projects: Pick<
    APIProject,
    'id' | 'name' | 'status' | 'created_at' | 'week_badge_text'
  >[]
}

declare interface Project {
  id: number
  title: string
  week: number
  description: string
  repo: string | null
  demo: string | null
  screenshot: string | null
}

declare type UserProject = Omit<Project, 'screenshot'>
