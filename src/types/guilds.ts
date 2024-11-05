export interface Guild {
  id: number
  name: string
  leader: Name
  members: Name[]
  totalStaked: Asset
  rank: number
}