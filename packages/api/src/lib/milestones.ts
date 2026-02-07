export interface Milestone {
  id: string
  name: string
  description: string
  icon: string
  type: 'score' | 'taps' | 'level' | 'upgrades'
  threshold: number
}

export const MILESTONES: Milestone[] = [
  // Score milestones
  {
    id: 'score_100',
    name: 'First Steps',
    description: 'Reach 100 points',
    icon: 'star-outline',
    type: 'score',
    threshold: 100,
  },
  {
    id: 'score_1k',
    name: 'Getting Started',
    description: 'Reach 1,000 points',
    icon: 'star-half',
    type: 'score',
    threshold: 1_000,
  },
  {
    id: 'score_10k',
    name: 'On Fire',
    description: 'Reach 10,000 points',
    icon: 'star',
    type: 'score',
    threshold: 10_000,
  },
  {
    id: 'score_100k',
    name: 'Stack Master',
    description: 'Reach 100,000 points',
    icon: 'flame',
    type: 'score',
    threshold: 100_000,
  },
  {
    id: 'score_1m',
    name: 'Millionaire',
    description: 'Reach 1,000,000 points',
    icon: 'diamond',
    type: 'score',
    threshold: 1_000_000,
  },
  // Tap milestones
  {
    id: 'taps_100',
    name: 'Tapper',
    description: 'Tap 100 times',
    icon: 'finger-print',
    type: 'taps',
    threshold: 100,
  },
  {
    id: 'taps_1k',
    name: 'Dedicated',
    description: 'Tap 1,000 times',
    icon: 'hand-left',
    type: 'taps',
    threshold: 1_000,
  },
  {
    id: 'taps_10k',
    name: 'Unstoppable',
    description: 'Tap 10,000 times',
    icon: 'flash',
    type: 'taps',
    threshold: 10_000,
  },
  // Upgrade milestones
  {
    id: 'first_upgrade',
    name: 'Investor',
    description: 'Buy your first upgrade',
    icon: 'cart',
    type: 'upgrades',
    threshold: 1,
  },
  {
    id: 'upgrades_5',
    name: 'Collector',
    description: 'Own 5 upgrades',
    icon: 'grid',
    type: 'upgrades',
    threshold: 5,
  },
  {
    id: 'upgrades_10',
    name: 'Tycoon',
    description: 'Own 10 upgrades',
    icon: 'trophy',
    type: 'upgrades',
    threshold: 10,
  },
]
