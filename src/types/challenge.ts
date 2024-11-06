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

export interface GameEvent {
  id: number
  name: string
  description: string
  startTime: TimePoint
  endTime: TimePoint
  reward: Asset
  participants: number
}