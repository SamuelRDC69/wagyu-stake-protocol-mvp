export interface Challenge {
  id: number
  name: string
  description: string
  reward: Asset
  startTime: TimePoint
  endTime: TimePoint
  progress: number
  completed: boolean
}