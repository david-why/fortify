declare type ProjectStatus =
  | 'building'
  | 'submitted'
  | 'pending_voting'
  | 'waiting_for_review'
  | 'finished'

declare interface APIProject {
  id: number
  name: string
  description: string
  status: ProjectStatus
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

declare interface APIShopData {
  cosmetics: APIShopCosmeticsItem[]
  physical_items: APIShopPhysicalItem[]
}

declare interface APIShopItem {
  id: number
  name: string
  description: string
  cost: number
}

declare interface APIShopCosmeticsItem extends APIShopItem {
  type: string
}

declare interface APIShopPhysicalItem extends APIShopItem {
  digital: boolean
}

declare interface SiegeTechTree {
  laptop: SiegeTreeBase
  laptop_grant: SiegeTreeBase
  tablet: SiegeTreeBase
}

declare interface SiegeTreeBase {
  type: string
  initialNode: SiegeTreeInitialNode
  branches: Record<string, Record<string, SiegeTreeNode>>
}

declare interface SiegeTreeNode {
  id: string
  title: string
  price: number
  description: string
  maxPurchases?: number
  currentPurchases?: number
  purchased: boolean
}

declare interface SiegeTreeInitialNode extends SiegeTreeNode {
  shape: 'pill' | 'circle'
  size: 'large'
  options: { id: string; title: string; description: string }[]
  purchased?: true
}

declare interface SiegeUserPurchases {
  purchases: SiegeUserPurchase[]
}

declare interface SiegeUserPurchase {
  item_name: string
  quantity: number
  total_coins_spent: number
}

declare interface SiegeMercenaryData {
  price: number
  count: number
}

declare interface SiegeTravelMercData {
  quantity: number
  inventory_count: number
}

declare interface Project {
  id: number
  title: string
  week: number
  description: string
  repo: string | null
  demo: string | null
  screenshot: string | null
  status: ProjectStatus
  value: number // 0 when status !== 'finished'
  hours: number
  is_self: boolean
  hackatime_projects: string[]
}

declare type UserProject = Omit<
  Project,
  'screenshot' | 'hours' | 'is_self' | 'hackatime_projects'
>

declare type SiegeVoteUser = Pick<APIUser, 'id' | 'name'> & {
  meeple: { color: string }
}

declare type SiegeVoteProject = Pick<
  APIProject,
  | 'id'
  | 'name'
  | 'description'
  | 'status'
  | 'repo_url'
  | 'demo_url'
  | 'created_at'
  | 'week_badge_text'
> & { user: SiegeVoteUser }

declare interface SiegeVote {
  id: number
  week: number
  voted: boolean
  star_count: number // 1 - 5
  project: SiegeVoteProject
}

declare interface SiegeBallot {
  id: number
  votingState: string
  meepleMessage: string
  votes: SiegeVote[]
  allowRevote: boolean
}

declare type Vote = Omit<SiegeVote, 'project'> & { project: UserProject }

declare type Ballot = Omit<SiegeBallot, 'votes'> & { votes: Vote[] }

declare type ShopItem = {
  id: number
  name: string
  description: string
  cost: number
  purchased: number
  stock?: number
} & (
  | { kind: 'cosmetics'; type: string }
  | { kind: 'physical'; digital: boolean }
  | { kind: 'special' }
)
